
"use strict";

// ==========================================
// 1. CONFIGURAÇÕES
// ==========================================

const SELECTED_SERVICE_KEY = "app:selectedService";
const ACTIVE_ROLE_KEY = "app:activeRole";
const AGENDA_CONTEXT_KEY = "app:agendaContext";

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";


// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

const serviceContent =
    document.getElementById("service-content");

const serviceError =
    document.getElementById("service-error");

const serviceErrorMessage =
    document.getElementById("service-error-message");

const serviceName =
    document.getElementById("service-name");

const serviceType =
    document.getElementById("service-type");

const serviceDescription =
    document.getElementById("service-description");

const ratingStars =
    document.getElementById("rating-stars");

const ratingValue =
    document.getElementById("rating-value");

const ratingDescription =
    document.getElementById("rating-description");

const bookServiceButton =
    document.getElementById("book-service-button");

const providerNotice =
    document.getElementById("provider-notice");


// ==========================================
// 3. IDENTIFICAÇÃO DO USUÁRIO
// ==========================================

function normalizeRole(role) {
    const normalized = String(role || "")
        .trim()
        .toLowerCase();

    if (
        normalized === "prestador" ||
        normalized === "provedor" ||
        normalized === "provider"
    ) {
        return "prestador";
    }

    if (
        normalized === "cliente" ||
        normalized === "client"
    ) {
        return "cliente";
    }

    return "desconhecido";
}


function getCurrentRole() {
    const authenticatedRole = window.APP_USER?.role;

    if (authenticatedRole) {
        return normalizeRole(authenticatedRole);
    }

    try {
        return normalizeRole(
            sessionStorage.getItem(ACTIVE_ROLE_KEY)
        );
    } catch (error) {
        console.warn(
            "Não foi possível recuperar o papel do usuário.",
            error
        );

        return "desconhecido";
    }
}


const currentRole = getCurrentRole();


// ==========================================
// 4. VISIBILIDADE DO AGENDAMENTO
// ==========================================

function updateRoleVisibility() {
    const isClient = currentRole === "cliente";

    bookServiceButton.hidden = !isClient;
    providerNotice.hidden = isClient;

    if (currentRole === "prestador") {
        providerNotice.textContent =
            "Você está visualizando este serviço como prestador. O agendamento é exclusivo para clientes.";
    } else if (currentRole === "desconhecido") {
        providerNotice.textContent =
            "Não foi possível identificar seu perfil. Entre novamente para utilizar as funcionalidades da aplicação.";
    }
}


updateRoleVisibility();


// ==========================================
// 5. RECUPERAR SERVIÇO SELECIONADO
// ==========================================

function getSelectedService() {
    try {
        const stored =
            sessionStorage.getItem(SELECTED_SERVICE_KEY);

        if (!stored) {
            return null;
        }

        const service = JSON.parse(stored);

        if (
            !service ||
            typeof service !== "object" ||
            Array.isArray(service)
        ) {
            return null;
        }

        return service;
    } catch (error) {
        console.error(
            "Erro ao recuperar os dados do serviço:",
            error
        );

        return null;
    }
}


// ==========================================
// 6. NORMALIZAR DADOS DO SERVIÇO
// ==========================================

function normalizeService(service) {
    const id =
        service.cnpj ??
        service.id ??
        service.serviceId ??
        service.service_id ??
        null;

    const name =
        service.servicoPrestado ??
        service.name ??
        service.serviceName ??
        service.nome ??
        "Serviço sem nome";

    const providerName =
        service.usuario?.nome ??
        service.providerName ??
        service.provider ??
        null;

    const price =
        service.preco ??
        service.price ??
        null;

    const rating =
        service.avaliacao ??
        service.rating ??
        service.averageRating ??
        service.average_rating ??
        null;

    const details = [];

    if (providerName) {
        details.push(`Prestador: ${providerName}`);
    }

    if (price !== null && price !== undefined) {
        const numericPrice = Number(price);

        if (Number.isFinite(numericPrice)) {
            const formattedPrice = numericPrice.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

            details.push(`Preço: R$ ${formattedPrice}`);
        }
    }

    return {
        ...service,
        id,
        cnpj: service.cnpj ?? id,
        name,
        type: "Serviço oferecido pelo prestador",
        description: details.length
            ? details.join(" | ")
            : "Não há informações complementares cadastradas.",
        rating,
        providerName,
        price
    };
}


// ==========================================
// 7. VALIDAR A AVALIAÇÃO
// ==========================================

function normalizeRating(value) {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const rating = Number(value);

    if (!Number.isFinite(rating)) {
        return null;
    }

    return Math.min(
        5,
        Math.max(0, rating)
    );
}


// ==========================================
// 8. DESENHAR AS ESTRELAS
// ==========================================

function renderRating(value) {
    ratingStars.replaceChildren();

    const rating = normalizeRating(value);

    if (rating === null) {
        ratingValue.textContent = "--";

        ratingDescription.textContent =
            "Ainda não existem avaliações disponíveis.";

        ratingStars.setAttribute(
            "aria-label",
            "Avaliação não disponível"
        );

        return;
    }

    for (let index = 0; index < 5; index++) {
        const star = document.createElement("span");

        star.className = "rating-star";
        star.textContent = "★";

        const remaining = rating - index;

        if (remaining >= 0.75) {
            star.classList.add("is-full");
        } else if (remaining >= 0.25) {
            star.classList.add("is-half");
        }

        ratingStars.appendChild(star);
    }

    ratingValue.textContent =
        rating.toFixed(1);

    ratingStars.setAttribute(
        "aria-label",
        `Avaliação de ${rating.toFixed(1)} de 5 estrelas`
    );

    ratingDescription.textContent =
        `Média de ${rating.toFixed(1)} de 5 estrelas.`;
}


// ==========================================
// 9. APRESENTAR DADOS DO SERVIÇO
// ==========================================

let currentService = null;


function setService(serviceData) {
    if (
        !serviceData ||
        typeof serviceData !== "object" ||
        Array.isArray(serviceData)
    ) {
        showError(
            "Os dados recebidos para este serviço são inválidos."
        );

        return;
    }

    currentService = normalizeService(serviceData);

    serviceName.textContent =
        currentService.name;

    serviceType.textContent =
        currentService.type;

    serviceDescription.textContent =
        currentService.description;

    renderRating(currentService.rating);

    serviceContent.hidden = false;
    serviceError.hidden = true;
}


// ==========================================
// 10. MOSTRAR ERROS
// ==========================================

function showError(message) {
    serviceContent.hidden = true;
    serviceError.hidden = false;

    serviceErrorMessage.textContent = message;
}


// ==========================================
// 11. CONSULTAR PRESTADOR NA API
// ==========================================

async function requestServiceFromBackend(serviceId) {
    if (!serviceId) {
        showError(
            "Identificador do prestador não informado."
        );

        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/prestador/${encodeURIComponent(serviceId)}/more`,
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.erro ||
                data.error ||
                data.mensagem ||
                "Não foi possível carregar os dados do serviço."
            );
        }

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            !data.cnpj
        ) {
            throw new Error(
                "A API retornou dados inválidos do prestador."
            );
        }

        sessionStorage.setItem(
            SELECTED_SERVICE_KEY,
            JSON.stringify(data)
        );

        setService(data);

    } catch (error) {
        console.error(
            "Erro ao consultar serviço:",
            error
        );

        showError(
            error.message ||
            "Não foi possível carregar os dados do serviço."
        );
    }
}


// ==========================================
// 12. DISPONIBILIZAR INTEGRAÇÃO
// ==========================================

window.ServicePresentation = Object.freeze({
    setService,

    showError,

    getRole() {
        return currentRole;
    },

    getService() {
        return currentService;
    }
});


// ==========================================
// 13. CARREGAMENTO INICIAL
// ==========================================

async function initializeServicePage() {
    updateRoleVisibility();

    const selectedService = getSelectedService();

    const params = new URLSearchParams(
        window.location.search
    );

    const serviceId =
        params.get("serviceId") ||
        selectedService?.cnpj ||
        selectedService?.id;

    if (!serviceId) {
        showError(
            "Nenhum serviço foi selecionado."
        );
    } else {
        await requestServiceFromBackend(serviceId);
    }

    document.dispatchEvent(
        new CustomEvent("service-presentation:ready")
    );
}


// ==========================================
// 14. BOTÃO AGENDAR SERVIÇO
// ==========================================

bookServiceButton.addEventListener("click", () => {
    if (currentRole !== "cliente") {
        return;
    }

    if (!currentService) {
        showError(
            "Não foi possível recuperar as informações deste serviço."
        );

        return;
    }

    const agendaContext = {
        serviceId: currentService.id,
        serviceName: currentService.name,
        serviceType: currentService.type,
        providerName: currentService.providerName,
        role: currentRole
    };

    try {
        sessionStorage.setItem(
            AGENDA_CONTEXT_KEY,
            JSON.stringify(agendaContext)
        );
    } catch (error) {
        console.error(
            "Não foi possível preparar o agendamento:",
            error
        );

        showError(
            "Não foi possível preparar os dados para o agendamento. Tente novamente."
        );

        return;
    }

    const agendaUrl = new URL(
        "agenda.html",
        window.location.href
    );

    if (currentService.id !== null) {
        agendaUrl.searchParams.set(
            "serviceId",
            String(currentService.id)
        );
    }

    window.location.href = agendaUrl.href;
});


// ==========================================
// 15. INICIALIZAÇÃO
// ==========================================

initializeServicePage();
