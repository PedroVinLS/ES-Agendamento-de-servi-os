"use strict";


// ==========================================
// 1. CONFIGURAÇÕES
// ==========================================

const SELECTED_SERVICE_KEY = "app:selectedService";
const ACTIVE_ROLE_KEY = "app:activeRole";
const AGENDA_CONTEXT_KEY = "app:agendaContext";


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

    // O papel fornecido pela sessão autenticada
    // tem prioridade sobre o contexto temporário.

    const authenticatedRole = window.APP_USER?.role;

    if (authenticatedRole) {

        return normalizeRole(authenticatedRole);

    }


    try {

        return normalizeRole(
            sessionStorage.getItem(ACTIVE_ROLE_KEY)
        );

    }

    catch (error) {

        console.warn(
            "Não foi possível recuperar o papel do usuário.",
            error
        );

        return "desconhecido";

    }

}


const currentRole = getCurrentRole();


// ==========================================
// 4. DEFINIR A VISIBILIDADE DO AGENDAMENTO
// ==========================================

function updateRoleVisibility() {

    const isClient = currentRole === "cliente";

    bookServiceButton.hidden = !isClient;

    providerNotice.hidden = isClient;


    if (currentRole === "prestador") {

        providerNotice.textContent =
            "Você está visualizando este serviço como prestador. O agendamento é exclusivo para clientes.";

    }

    else if (currentRole === "desconhecido") {

        providerNotice.textContent =
            "Não foi possível identificar seu perfil. Entre novamente para utilizar as funcionalidades da aplicação.";

    }

}


updateRoleVisibility();


// ==========================================
// 5. RECUPERAR O SERVIÇO SELECIONADO
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

    }

    catch (error) {

        console.error(
            "Erro ao recuperar os dados do serviço:",
            error
        );

        return null;

    }

}


// ==========================================
// 6. NORMALIZAR OS DADOS DO SERVIÇO
// ==========================================

function normalizeService(service) {

    return {

        id:
            service.id ??
            service.serviceId ??
            service.service_id ??
            null,


        name:
            service.name ??
            service.serviceName ??
            service.nome ??
            "Serviço sem nome",


        type:
            service.type ??
            service.serviceType ??
            service.category ??
            service.tipoServico ??
            "Tipo de serviço não informado",


        description:
            service.description ??
            service.serviceDescription ??
            service.descricao ??
            "Descrição não disponível.",


        rating:
            service.rating ??
            service.averageRating ??
            service.average_rating ??
            service.avaliacao ??
            null,


        providerName:
            service.providerName ??
            service.provider ??
            null

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


    // Exibe cinco estrelas.
    // Valores fracionários são representados
    // usando meia estrela quando necessário.

    for (let index = 0; index < 5; index++) {

        const star = document.createElement("span");

        star.className = "rating-star";

        star.textContent = "★";


        const remaining = rating - index;


        if (remaining >= 0.75) {

            star.classList.add("is-full");

        }

        else if (remaining >= 0.25) {

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
// 9. APRESENTAR OS DADOS DO SERVIÇO
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


    // NOME

    serviceName.textContent =
        currentService.name;


    // TIPO

    serviceType.textContent =
        currentService.type;


    // DESCRIÇÃO

    serviceDescription.textContent =
        currentService.description;


    // AVALIAÇÃO

    renderRating(currentService.rating);


    // EXIBE A PÁGINA.

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
// 11. SOLICITAR DADOS À INTEGRAÇÃO
// ==========================================

function requestServiceFromBackend(serviceId) {

    // Permite que o JavaScript já integrado ao backend
    // busque os detalhes completos do serviço.

    document.dispatchEvent(
        new CustomEvent(
            "service-presentation:load",
            {
                detail: {
                    serviceId,
                    role: currentRole
                }
            }
        )
    );

}


// ==========================================
// 12. RECEBER SERVIÇO DO BACKEND
// ==========================================

// A camada de integração pode chamar:
//
// ServicePresentation.setService(dadosDoServico);

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

function initializeServicePage() {

    const selectedService = getSelectedService();


    if (selectedService) {

        setService(selectedService);

    }

    else {

        const parameters = new URLSearchParams(
            window.location.search
        );

        const serviceId =
            parameters.get("serviceId");


        if (serviceId) {

            // O backend pode buscar os dados completos
            // utilizando o identificador recebido.

            serviceName.textContent =
                "Carregando serviço...";

            serviceType.textContent = "--";

            serviceDescription.textContent =
                "Buscando informações do serviço.";

            serviceContent.hidden = false;

            serviceError.hidden = true;

            requestServiceFromBackend(serviceId);

        }

        else {

            showError(
                "Nenhum serviço foi selecionado. Volte à página principal e escolha um serviço."
            );

        }

    }


    // Se a integração carregar os dados posteriormente,
    // o evento acima permite concluir a apresentação.

    document.dispatchEvent(
        new CustomEvent(
            "service-presentation:ready",
            {
                detail: {
                    serviceId:
                        currentService?.id ??
                        new URLSearchParams(window.location.search)
                            .get("serviceId"),

                    role: currentRole
                }
            }
        )
    );

}


// ==========================================
// 14. BOTÃO AGENDAR SERVIÇO
// ==========================================

bookServiceButton.addEventListener("click", () => {

    // Impede que prestadores ou usuários sem
    // papel identificado iniciem agendamentos.

    if (currentRole !== "cliente") {

        return;

    }


    if (!currentService) {

        showError(
            "Não foi possível recuperar as informações deste serviço."
        );

        return;

    }


    // Guarda somente os dados necessários
    // para identificar o serviço na agenda.

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

    }

    catch (error) {

        console.error(
            "Não foi possível preparar o agendamento:",
            error
        );

        showError(
            "Não foi possível preparar os dados para o agendamento. Tente novamente."
        );

        return;

    }


    // A tela agenda.html carrega seus próprios arquivos:
    // agenda.css e agenda.js.

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


    // Navega para a agenda já existente.

    window.location.href = agendaUrl.href;

});


// ==========================================
// 15. INICIALIZAÇÃO
// ==========================================

initializeServicePage();