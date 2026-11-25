"use strict";


// ==========================================
// 1. CONFIGURAÇÕES
// ==========================================

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";

const WEEK_DAYS = [
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
    "DOMINGO"
];


// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

// ABAS

const scheduleTab = document.getElementById("schedule-tab");
const searchTab = document.getElementById("search-tab");

const schedulePanel = document.getElementById("schedule-panel");
const searchPanel = document.getElementById("search-panel");


// AGENDA

const scheduleHeading = document.getElementById("schedule-heading");

const scheduleDescription =
    document.getElementById("schedule-description");

const weekGrid = document.getElementById("week-grid");

const weekLabel = document.getElementById("week-label");

const previousWeek = document.getElementById("previous-week");
const nextWeek = document.getElementById("next-week");

const providerLegend = document.getElementById("provider-legend");


// PESQUISA

const searchForm = document.getElementById("search-form");

const searchInput = document.getElementById("service-search");

const clearSearchButton = document.getElementById("clear-search");

const serviceSort = document.getElementById("service-sort");

const serviceResults = document.getElementById("service-results");

const emptyState = document.getElementById("empty-state");

const loadingState = document.getElementById("loading-state");

const resultsCount = document.getElementById("results-count");

const resultsScroll = document.getElementById("results-scroll");

const roleIndicator = document.getElementById("role-indicator");

// Ação disponível exclusivamente para prestadores.
const createServiceButton = document.getElementById("create-service-button");


// ==========================================
// 3. ESTADO DA APLICAÇÃO
// ==========================================

const state = {

    role: "cliente",

    activeTab: "schedule",

    schedule: [],

    services: [],

    searchQuery: "",

    isLoadingServices: false,

    servicesError: null,

    weekStart: getMonday(new Date())

};


// ==========================================
// 4. FUNÇÕES DE DATA
// ==========================================

function getMonday(date) {

    const result = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const day = result.getDay();

    const difference = day === 0
        ? -6
        : 1 - day;

    result.setDate(result.getDate() + difference);

    return result;

}


function addDays(date, amount) {

    const result = new Date(date);

    result.setDate(result.getDate() + amount);

    return result;

}


function formatDate(date) {

    return date.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );

}


function formatWeek(date) {

    const monday = new Date(date);

    const sunday = addDays(monday, 6);

    const start = monday.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "short"
        }
    );

    const end = sunday.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

    return `${start} até ${end}`;

}


function getTodayKey(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ==========================================
// 5. NORMALIZAÇÃO DO PAPEL DO USUÁRIO
// ==========================================

function normalizeRole(role) {

    const value = String(role || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[_-]+/g, " ");

    if (
        value === "prestador" ||
        value === "provedor" ||
        value === "provider" ||
        value.includes("prestador de servico") ||
        value.includes("provedor de servico") ||
        value.includes("service provider")
    ) {
        return "prestador";
    }

    if (
        value === "cliente" ||
        value === "client" ||
        value.includes("usuario cliente")
    ) {
        return "cliente";
    }

    return null;
}


// ==========================================
// 6. ATUALIZAR A APRESENTAÇÃO POR PAPEL
// ==========================================

function updateRoleInterface() {

    const isProvider = state.role === "prestador";

    document.body.dataset.userRole = state.role;

    roleIndicator.textContent = isProvider
        ? "PRESTADOR"
        : "CLIENTE";

    scheduleHeading.textContent = isProvider
        ? "MINHA AGENDA DE TRABALHO"
        : "MEUS AGENDAMENTOS";

    scheduleDescription.textContent = isProvider
        ? "Consulte os horários em que você ou sua equipe deverão trabalhar nesta semana."
        : "Consulte os serviços que você agendou nesta semana.";

    providerLegend.hidden = !isProvider;

    if (createServiceButton) {
        createServiceButton.hidden = !isProvider;
    }

    searchPanel.dataset.userRole = state.role;

}


// ==========================================
// 7. TROCAR ENTRE AS ABAS
// ==========================================

function changeTab(tabName) {

    const showSchedule = tabName === "schedule";

    state.activeTab = tabName;

    scheduleTab.classList.toggle(
        "is-active",
        showSchedule
    );

    searchTab.classList.toggle(
        "is-active",
        !showSchedule
    );

    scheduleTab.setAttribute(
        "aria-selected",
        String(showSchedule)
    );

    searchTab.setAttribute(
        "aria-selected",
        String(!showSchedule)
    );

    schedulePanel.hidden = !showSchedule;

    searchPanel.hidden = showSchedule;

    dispatchAppEvent(
        "main:tab-change",
        {
            tab: tabName
        }
    );

}


scheduleTab.addEventListener("click", () => {

    changeTab("schedule");

});


searchTab.addEventListener("click", () => {

    changeTab("search");

});


// ==========================================
// 7A. CRIAR SERVIÇO (EXCLUSIVO DO PRESTADOR)
// ==========================================

if (createServiceButton) {

    createServiceButton.addEventListener("click", () => {

        if (state.role !== "prestador") {
            return;
        }

        dispatchAppEvent("main:create-service", {
            role: state.role
        });

        const destination = createServiceButton.dataset.target;

        if (destination) {
            window.location.assign(destination);
        } else {
            console.error("Destino de criação de serviços não configurado.");
        }
    });

}


// ==========================================
// 8. CRIAR EVENTOS PARA A INTEGRAÇÃO
// ==========================================

function dispatchAppEvent(name, detail) {

    document.dispatchEvent(
        new CustomEvent(name, {
            detail
        })
    );

}


// ==========================================
// 9. RENDERIZAR A SEMANA
// ==========================================

function renderWeekGrid() {

    weekGrid.replaceChildren();

    weekLabel.textContent =
        formatWeek(state.weekStart);

    const todayKey =
        getTodayKey(new Date());

    WEEK_DAYS.forEach((day, dayIndex) => {

        const date = addDays(
            state.weekStart,
            dayIndex
        );

        const dateKey = getTodayKey(date);

        const column = document.createElement("article");

        column.className = "day-column";

        if (dateKey === todayKey) {
            column.classList.add("is-today");
        }

        const heading = document.createElement("header");

        heading.className = "day-heading";

        const dayName = document.createElement("span");

        dayName.className = "day-name";

        dayName.textContent = day;

        const dayDate = document.createElement("span");

        dayDate.className = "day-date";

        dayDate.textContent = formatDate(date);

        heading.append(
            dayName,
            dayDate
        );

        const eventsContainer = document.createElement("div");

        eventsContainer.className = "day-events";

        const events = state.schedule.filter(
            item => getEventDate(item, date) === dateKey
        );

        if (events.length === 0) {

            const empty = document.createElement("p");

            empty.className = "no-events";

            empty.textContent =
                "Nenhum horário registrado.";

            eventsContainer.appendChild(empty);

        }

        events
            .sort((a, b) => {

                return getTimeValue(a.startTime ?? a.start) -
                    getTimeValue(b.startTime ?? b.start);

            })
            .forEach(event => {

                const card = createScheduleEvent(event);

                eventsContainer.appendChild(card);

            });

        column.append(
            heading,
            eventsContainer
        );

        weekGrid.appendChild(column);

    });

}


// ==========================================
// 10. IDENTIFICAR A DATA DE UM EVENTO
// ==========================================

function getEventDate(event, fallbackDate) {

    if (event.date) {
        return String(event.date).slice(0, 10);
    }

    if (
        Number.isInteger(event.dayIndex) &&
        event.dayIndex >= 0 &&
        event.dayIndex <= 6
    ) {

        return getTodayKey(
            addDays(state.weekStart, event.dayIndex)
        );

    }

    if (event.day) {

        const dayName = String(event.day)
            .toUpperCase()
            .trim();

        const dayIndex = WEEK_DAYS.indexOf(dayName);

        if (dayIndex >= 0) {

            return getTodayKey(
                addDays(state.weekStart, dayIndex)
            );

        }

    }

    return getTodayKey(fallbackDate);

}


// ==========================================
// 11. CONVERTER HORÁRIOS PARA NÚMEROS
// ==========================================

function getTimeValue(value) {

    if (typeof value === "number") {
        return value;
    }

    const parts = String(value || "00:00").split(":");

    const hours = Number(parts[0]);

    const minutes = Number(parts[1] || 0);

    return hours * 60 + minutes;

}


// ==========================================
// 12. FORMATAR HORÁRIOS
// ==========================================

function displayTime(value) {

    if (typeof value === "number") {
        return `${String(value).padStart(2, "0")}:00`;
    }

    return String(value || "--:--");

}


// ==========================================
// 13. CRIAR CARTÃO DA AGENDA
// ==========================================

function createScheduleEvent(event) {

    const card = document.createElement("article");

    card.className = "schedule-event";

    if (state.role === "prestador") {
        card.classList.add("provider-event");
    }

    const time = document.createElement("span");

    time.className = "event-time";

    const start = displayTime(
        event.startTime ?? event.start
    );

    const end = displayTime(
        event.endTime ?? event.end
    );

    time.textContent = `${start} até ${end}`;

    const name = document.createElement("h3");

    name.className = "event-name";

    name.textContent =
        event.serviceName ||
        event.name ||
        event.title ||
        "Serviço sem identificação";

    card.append(
        time,
        name
    );

    const personName = state.role === "prestador"
        ? event.clientName
        : event.providerName;

    if (personName) {

        const person = document.createElement("span");

        person.className = "event-person";

        person.textContent = personName;

        card.appendChild(person);

    }

    if (event.local) {

        const location = document.createElement("span");

        location.className = "event-person";

        location.textContent = `Local: ${event.local}`;

        card.appendChild(location);

    }

    return card;

}


// ==========================================
// 14. MUDAR DE SEMANA
// ==========================================

function changeWeek(direction) {

    state.weekStart = addDays(
        state.weekStart,
        direction * 7
    );

    renderWeekGrid();

    dispatchAppEvent(
        "main:week-change",
        {
            direction,

            weekStart: getTodayKey(state.weekStart),

            weekEnd: getTodayKey(
                addDays(state.weekStart, 6)
            )

        }
    );

}


previousWeek.addEventListener("click", () => {

    changeWeek(-1);

});


nextWeek.addEventListener("click", () => {

    changeWeek(1);

});


// ==========================================
// 15. PESQUISA DE SERVIÇOS
// ==========================================

searchForm.addEventListener("submit", event => {

    event.preventDefault();

    state.searchQuery =
        searchInput.value.trim();

    renderServices();

    dispatchAppEvent(
        "main:search",
        {
            query: state.searchQuery,

            role: state.role
        }
    );

});


// ==========================================
// 16. LIMPAR A PESQUISA
// ==========================================

searchInput.addEventListener("input", () => {

    clearSearchButton.hidden =
        searchInput.value.length === 0;

});


clearSearchButton.addEventListener("click", () => {

    searchInput.value = "";

    state.searchQuery = "";

    clearSearchButton.hidden = true;

    renderServices();

    dispatchAppEvent(
        "main:search",
        {
            query: "",
            role: state.role
        }
    );

    searchInput.focus();

});


// ==========================================
// 17. FILTRAR SERVIÇOS LOCALMENTE
// ==========================================

function getFilteredServices() {

    const query = state.searchQuery
        .trim()
        .toLocaleLowerCase("pt-BR");

    if (!query) {
        return [...state.services];
    }

    return state.services.filter(service => {

        const searchableText = [

            service.name,

            service.description,

            service.category,

            service.providerName

        ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("pt-BR");

        return searchableText.includes(query);

    });

}


// ==========================================
// 18. ORDENAR SERVIÇOS
// ==========================================

function sortServices(services) {

    const ordered = [...services];

    switch (serviceSort.value) {

        case "name":

            ordered.sort((a, b) => {

                return String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        "pt-BR"
                    );

            });

            break;

        case "price":

            ordered.sort((a, b) => {

                return getPrice(a) - getPrice(b);

            });

            break;

        case "rating":

            ordered.sort((a, b) => {

                return Number(b.rating || 0) -
                    Number(a.rating || 0);

            });

            break;

        default:

            ordered.sort((a, b) => {

                return Number(b.relevance || 0) -
                    Number(a.relevance || 0);

            });

    }

    return ordered;

}


function getPrice(service) {

    const value =
        service.minimumPrice ?? service.price;

    return Number(value) || 0;

}


serviceSort.addEventListener("change", () => {

    renderServices();

});


// ==========================================
// 19. CRIAR CARTÃO DE SERVIÇO
// ==========================================

function createServiceCard(service) {

    const card = document.createElement("button");

    card.type = "button";

    card.className = "service-card";

    const image = document.createElement("div");

    image.className = "service-image";

    if (service.imageUrl) {

        const imageElement = document.createElement("img");

        imageElement.src = service.imageUrl;

        imageElement.alt = "";

        imageElement.loading = "lazy";

        image.appendChild(imageElement);

    }

    else {

        image.textContent =
            String(service.name || "S").charAt(0).toUpperCase();

    }

    const information = document.createElement("div");

    information.className = "service-info";

    const title = document.createElement("h3");

    title.className = "service-title";

    title.textContent =
        service.name || "Serviço sem nome";

    const description = document.createElement("p");

    description.className = "service-description";

    description.textContent =
        service.description || "Sem descrição disponível.";

    information.append(
        title,
        description
    );

    const metadata = document.createElement("div");

    metadata.className = "service-metadata";

    if (service.providerName) {

        const provider = document.createElement("span");

        provider.textContent =
            `Prestador: ${service.providerName}`;

        metadata.appendChild(provider);

    }

    if (service.rating !== undefined && service.rating !== null) {

        const rating = document.createElement("span");

        rating.className = "service-rating";

        rating.textContent =
            `★ ${Number(service.rating).toFixed(1)}`;

        metadata.appendChild(rating);

    }

    if (service.category) {

        const category = document.createElement("span");

        category.textContent = service.category;

        metadata.appendChild(category);

    }

    information.appendChild(metadata);

    const price = document.createElement("div");

    price.className = "service-price";

    const priceValue = getPrice(service);

    price.textContent = priceValue > 0
        ? priceValue.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )
        : "Consultar";

    const priceHint = document.createElement("small");

    priceHint.textContent = priceValue > 0
        ? "Preço mínimo"
        : "Preço";

    price.appendChild(priceHint);

    card.append(
        image,
        information,
        price
    );

    card.addEventListener("click", () => {
        const serviceData = {
            ...service,
            id: service.id,
            cnpj: service.cnpj || service.id,
            name: service.name || service.servicoPrestado,
            servicoPrestado: service.servicoPrestado || service.name,
            role: state.role
        };

        sessionStorage.setItem(
            "app:selectedService",
            JSON.stringify(serviceData)
        );

        sessionStorage.setItem(
            "app:activeRole",
            state.role
        );

        const params = new URLSearchParams({
            serviceId: serviceData.cnpj
        });

        window.location.href =
            `apresentação-servico.html?${params.toString()}`;
    });

    return card;

}


// ==========================================
// 20. RENDERIZAR RESULTADOS
// ==========================================

function renderServices() {

    serviceResults.replaceChildren();

    const filtered = sortServices(
        getFilteredServices()
    );

    const count = filtered.length;

    resultsCount.textContent = count === 1
        ? "1 serviço encontrado."
        : `${count} serviços encontrados.`;

    if (state.isLoadingServices) {

        emptyState.hidden = true;

        loadingState.hidden = false;

        serviceResults.setAttribute(
            "aria-busy",
            "true"
        );

        return;

    }

    loadingState.hidden = true;

    serviceResults.setAttribute(
        "aria-busy",
        "false"
    );

    if (count === 0) {

        emptyState.hidden = false;

        const title =
            emptyState.querySelector("h3");

        const description =
            emptyState.querySelector("p");

        if (state.servicesError) {

            title.textContent =
                "NÃO FOI POSSÍVEL CARREGAR OS SERVIÇOS";

            description.textContent =
                state.servicesError;

        }

        else if (state.searchQuery) {

            title.textContent =
                "NENHUM SERVIÇO ENCONTRADO";

            description.textContent =
                "Não encontramos serviços com esse nome. Tente outra pesquisa.";

        }

        else {

            title.textContent =
                "NENHUM SERVIÇO DISPONÍVEL";

            description.textContent =
                "Ainda não existem serviços cadastrados na plataforma.";

        }

        return;

    }

    emptyState.hidden = true;

    filtered.forEach(service => {

        const card = createServiceCard(service);

        serviceResults.appendChild(card);

    });

}


// ==========================================
// 21. CONTROLE DE CARREGAMENTO
// ==========================================

function setServicesLoading(isLoading) {

    state.isLoadingServices = Boolean(isLoading);

    renderServices();

}


// ==========================================
// 22. CONTROLE PÚBLICO DA TELA
// ==========================================

window.MainScreen = Object.freeze({

    setUserRole(role) {

        const normalizedRole = normalizeRole(role);

        if (!normalizedRole) {
            console.error("Papel de usuário desconhecido:", role);
            return false;
        }

        state.role = normalizedRole;

        try {
            sessionStorage.setItem("app:activeRole", normalizedRole);
        } catch (error) {
            console.error("Não foi possível atualizar o papel na sessão:", error);
        }

        updateRoleInterface();

        renderWeekGrid();

        renderServices();

        return true;

    },

    renderSchedule(entries) {

        state.schedule = Array.isArray(entries)
            ? entries
            : [];

        renderWeekGrid();

    },

    renderServices(services) {

        state.services = Array.isArray(services)
            ? services
            : [];

        renderServices();

    },

    setServicesLoading,

    changeTab,

    setWeekStart(date) {

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return;
        }

        state.weekStart = getMonday(parsed);

        renderWeekGrid();

    },

    getState() {

        return {

            role: state.role,

            activeTab: state.activeTab,

            serviceCount: state.services.length,

            scheduleCount: state.schedule.length,

            weekStart: getTodayKey(state.weekStart)

        };

    }

});


// ==========================================
// 22A. CARREGAR PRESTADORES DA API
// ==========================================

async function carregarPrestadores() {

    state.servicesError = null;

    setServicesLoading(true);

    try {

        const [resPrestadores, resUsuarios] = await Promise.all([
            fetch(`${API_BASE_URL}/prestador`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }),
            fetch(`${API_BASE_URL}/usuario`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }).catch(() => null)
        ]);

        const data = await resPrestadores.json().catch(() => null);

        if (!resPrestadores.ok) {

            throw new Error(
                data?.error ||
                "Não foi possível consultar os prestadores."
            );

        }

        if (!Array.isArray(data)) {

            throw new Error(
                "A resposta da API possui um formato inesperado."
            );

        }

        const usuarios = (resUsuarios && resUsuarios.ok)
            ? await resUsuarios.json().catch(() => [])
            : [];

        const usuarioPorId = new Map(
            (Array.isArray(usuarios) ? usuarios : []).map(u => [
                Number(u.id),
                u.nome
            ])
        );

        const services = data.map(prestador => ({

            ...prestador,

            id: prestador.cnpj,

            name: prestador.servicoPrestado,

            providerName: usuarioPorId.get(Number(prestador.id_usuario)) || null,

            price: Number(prestador.preco),

            rating: Number(prestador.avaliacao)

        }));

        state.servicesError = null;

        window.MainScreen.renderServices(services);

    } catch (error) {

        console.error(
            "Erro ao carregar prestadores:",
            error
        );

        state.servicesError =
            error.message ||
            "Erro de comunicação com o servidor.";

        window.MainScreen.renderServices([]);

    } finally {

        setServicesLoading(false);

    }

}


// ==========================================
// 22B. CARREGAR AGENDAMENTOS DO USUÁRIO
// ==========================================

async function carregarAgendamentos() {

    const token = sessionStorage.getItem("es_token");

    if (!token) {
        return;
    }

    try {

        const [resServicos, resAgendas, resPrestadores, resClientes, resUsuarios] = await Promise.all([
            fetch(`${API_BASE_URL}/servico`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }),
            fetch(`${API_BASE_URL}/agenda`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }),
            fetch(`${API_BASE_URL}/prestador`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }),
            fetch(`${API_BASE_URL}/cliente`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }).catch(() => null),
            fetch(`${API_BASE_URL}/usuario`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            }).catch(() => null)
        ]);

        if (!resServicos.ok || !resAgendas.ok) {
            return;
        }

        const [servicos, agendas, prestadores] = await Promise.all([
            resServicos.json(),
            resAgendas.json(),
            resPrestadores.ok ? resPrestadores.json() : []
        ]);

        const clientes = (resClientes && resClientes.ok)
            ? await resClientes.json().catch(() => [])
            : [];

        const usuarios = (resUsuarios && resUsuarios.ok)
            ? await resUsuarios.json().catch(() => [])
            : [];

        if (!Array.isArray(servicos) || !Array.isArray(agendas)) {
            return;
        }

        const agendaPorId = new Map(
            agendas.map(a => [String(a.id), a])
        );

        const usuarioPorId = new Map(
            (Array.isArray(usuarios) ? usuarios : []).map(u => [
                Number(u.id),
                u.nome
            ])
        );

        const prestadorPorCnpj = new Map(
            (Array.isArray(prestadores) ? prestadores : []).map(p => [
                String(p.cnpj),
                p
            ])
        );

        const clientePorCpf = new Map(
            (Array.isArray(clientes) ? clientes : []).map(c => [
                String(c.cpf),
                c
            ])
        );

        const entradasAgenda = servicos
            .map(servico => {
                const agenda = agendaPorId.get(String(servico.id_agenda));

                if (!agenda || !agenda.horario) {
                    return null;
                }

                const dataInicio = new Date(agenda.horario);

                if (Number.isNaN(dataInicio.getTime())) {
                    return null;
                }

                const horaInicio = dataInicio.getHours();
                const horaFim = horaInicio + 1;

                const prestador = prestadorPorCnpj.get(String(servico.id_prestador));
                const cliente = clientePorCpf.get(String(servico.id_cliente));

                const providerName = prestador
                    ? usuarioPorId.get(Number(prestador.id_usuario)) || null
                    : null;

                const clientName = cliente
                    ? usuarioPorId.get(Number(cliente.id_usuario)) || null
                    : null;

                return {
                    id: servico.id,
                    date: getTodayKey(dataInicio),
                    start: horaInicio,
                    end: horaFim,
                    serviceName:
                        prestador?.servicoPrestado ||
                        servico.descricao ||
                        "Serviço agendado",
                    providerName,
                    clientName,
                    local: agenda.local || ""
                };
            })
            .filter(Boolean);

        window.MainScreen.renderSchedule(entradasAgenda);

    } catch (error) {

        console.error(
            "Erro ao carregar agendamentos:",
            error
        );

    }

}


// ==========================================
// 23. INICIALIZAÇÃO
// ==========================================

function readInitialUserRole() {

    const backendRole =
        window.APP_USER?.role ??
        window.APP_USER?.papel ??
        window.APP_USER?.user?.role ??
        window.APP_USER?.data?.role;

    const storedRole = (() => {
        try {
            return sessionStorage.getItem("app:activeRole");
        } catch (error) {
            console.warn("Não foi possível ler o papel da sessão:", error);
            return null;
        }
    })();

    const htmlRole = document.body.dataset.userRole;

    return (
        normalizeRole(backendRole) ||
        normalizeRole(storedRole) ||
        normalizeRole(htmlRole) ||
        "cliente"
    );

}


state.role = readInitialUserRole();

try {
    sessionStorage.setItem("app:activeRole", state.role);
} catch (error) {
    console.warn("Não foi possível guardar o papel inicial:", error);
}

updateRoleInterface();

renderWeekGrid();

renderServices();

dispatchAppEvent(
    "main:ready",
    {
        role: state.role
    }
);

// Carrega os prestadores e os agendamentos cadastrados no backend.
carregarPrestadores();
carregarAgendamentos();