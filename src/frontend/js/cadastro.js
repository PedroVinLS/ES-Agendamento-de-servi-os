"use strict";

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";

async function apiRequest(endpoint, method, data, token = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: JSON.stringify(data)
    });

    let responseData = {};

    try {
        responseData = await response.json();
    } catch {
        responseData = {};
    }

    if (!response.ok) {
        const error = new Error(
            responseData.error ||
            `Erro na comunicação com a API (${response.status}).`
        );

        error.status = response.status;
        throw error;
    }

    return responseData;
}

function obterUsuarioAutenticado() {
    const usuarioSalvo = sessionStorage.getItem("es_usuario");

    if (!usuarioSalvo) {
        throw new Error("Usuário não encontrado. Faça login novamente.");
    }

    const usuario = JSON.parse(usuarioSalvo);

    if (!usuario.id) {
        throw new Error("Identificação do usuário não encontrada.");
    }

    return usuario;
}


// ==========================================
// 1. ELEMENTOS HTML
// ==========================================

// TELAS

const roleScreen = document.getElementById("role-screen");

const clientScreen = document.getElementById("client-screen");

const providerScreen = document.getElementById("provider-screen");


// BOTÕES DE ESCOLHA

const chooseClientButton =
    document.getElementById("choose-client");

const chooseProviderButton =
    document.getElementById("choose-provider");


// FORMULÁRIOS

const clientForm =
    document.getElementById("client-form");

const providerForm =
    document.getElementById("provider-form");


// CAMPOS DO CLIENTE

const clientCpf =
    document.getElementById("client-cpf");

const clientTerms =
    document.getElementById("client-terms");


// CAMPOS DO PROVEDOR

const providerCnpj =
    document.getElementById("provider-cnpj");

const providerService =
    document.getElementById("provider-service");

const providerTerms =
    document.getElementById("provider-terms");

const serviceCounter =
    document.getElementById("service-counter");


// POP-UP

const feedbackDialog =
    document.getElementById("feedback-dialog");

const feedbackIcon =
    document.getElementById("feedback-icon");

const feedbackTitle =
    document.getElementById("feedback-title");

const feedbackMessage =
    document.getElementById("feedback-message");

const feedbackButton =
    document.getElementById("feedback-button");


// ==========================================
// 2. CONTROLE DAS TELAS
// ==========================================

function showScreen(screenToShow) {

    const screens = [
        roleScreen,
        clientScreen,
        providerScreen
    ];


    // Esconde as telas que não foram selecionadas.

    for (const screen of screens) {

        const shouldShow = screen === screenToShow;

        screen.hidden = !shouldShow;

        screen.classList.toggle(
            "is-active",
            shouldShow
        );

    }


    // Retorna o usuário ao topo da página.

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });

}


// ==========================================
// 3. ESCOLHA DO PAPEL
// ==========================================

// CLIENTE

chooseClientButton.addEventListener("click", () => {

    showScreen(clientScreen);

    clientCpf.focus({
        preventScroll: true
    });

});


// PROVEDOR

chooseProviderButton.addEventListener("click", () => {

    showScreen(providerScreen);

    providerCnpj.focus({
        preventScroll: true
    });

});


// ==========================================
// 4. LINK DOS TERMOS DE SERVIÇO
// ==========================================

// A página de termos ainda não existe.
// Portanto, o link não realiza navegação.

document.querySelectorAll("[data-terms-link]").forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

    });

});


// ==========================================
// 5. CONTROLE DO POP-UP
// ==========================================

// Guarda a ação que será executada
// quando o usuário clicar no botão do pop-up.

let feedbackAction = null;


// Guarda o campo que deverá receber o foco
// após o fechamento de uma mensagem de erro.

let focusAfterError = null;


function openFeedback({
    type,
    title,
    message,
    buttonText,
    action,
    focusTarget = null
}) {

    // Define se o pop-up é de erro ou sucesso.

    feedbackDialog.classList.toggle(
        "is-success",
        type === "success"
    );


    // Altera o símbolo do pop-up.

    feedbackIcon.textContent =
        type === "success" ? "✓" : "!";


    // Atualiza o conteúdo.

    feedbackTitle.textContent = title;

    feedbackMessage.textContent = message;

    feedbackButton.textContent = buttonText;


    // Guarda a ação do botão.

    feedbackAction = action;

    focusAfterError = focusTarget;


    // Abre a janela modal.

    if (typeof feedbackDialog.showModal === "function") {

        feedbackDialog.showModal();

    }

    else {

        // Alternativa para navegadores antigos.

        window.alert(`${title}\n\n${message}`);

        if (typeof feedbackAction === "function") {

            feedbackAction();

        }

    }

}


// ==========================================
// 6. BOTÃO DO POP-UP
// ==========================================

feedbackButton.addEventListener("click", () => {

    const action = feedbackAction;

    const focusTarget = focusAfterError;


    // Fecha o pop-up.

    feedbackDialog.close();


    feedbackAction = null;

    focusAfterError = null;


    // Executa a ação correspondente.

    if (typeof action === "function") {

        action();

    }


    // Retorna o foco ao campo incorreto,
    // quando se tratar de uma mensagem de erro.

    if (focusTarget) {

        window.setTimeout(() => {

            focusTarget.focus();

        }, 0);

    }

});


// Impede o fechamento acidental do pop-up
// pelo botão ESC.

feedbackDialog.addEventListener("cancel", event => {

    event.preventDefault();

});


// ==========================================
// 7. MARCAÇÃO DOS CAMPOS INVÁLIDOS
// ==========================================

function markValidity(field, isValid) {

    field.setAttribute(
        "aria-invalid",
        String(!isValid)
    );

}


// ==========================================
// 8. CADASTRO DO CLIENTE INTEGRADO À API
// ==========================================

clientForm.addEventListener("submit", async event => {
    event.preventDefault();

    const cpf = clientCpf.value.trim();
    const cpfIsValid = /^[0-9]{11}$/.test(cpf);
    const acceptedTerms = clientTerms.checked;

    markValidity(clientCpf, cpfIsValid);

    if (!cpfIsValid || !acceptedTerms) {
        let message;

        if (!cpfIsValid && !acceptedTerms) {
            message =
                "O CPF deve conter exatamente 11 números e você precisa aceitar os termos de serviço.";
        } else if (!cpfIsValid) {
            message =
                "O CPF informado está em formato incorreto. Insira exatamente 11 números.";
        } else {
            message =
                "Para continuar, é necessário aceitar os termos de serviço.";
        }

        openFeedback({
            type: "error",
            title: "DADOS INCORRETOS",
            message,
            buttonText: "VOLTAR E CORRIGIR",
            action: () => showScreen(clientScreen),
            focusTarget: !cpfIsValid ? clientCpf : clientTerms
        });

        return;
    }

    const submitButton = clientForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) submitButton.disabled = true;

    try {
        const usuario = obterUsuarioAutenticado();

        await apiRequest(
            "/cliente",
            "POST",
            {
                id_usuario: usuario.id,
                cpf
            }
        );

        sessionStorage.setItem("app:activeRole", "cliente");

        openFeedback({
            type: "success",
            title: "CADASTRO CONCLUÍDO!",
            message:
                "Seu perfil de cliente foi cadastrado com sucesso.",
            buttonText: "NAVEGAR SERVIÇOS",
            action: () => {
                window.location.replace("tela-principal.html");
            }
        });

    } catch (erro) {
        console.error("Falha no cadastro do cliente:", erro.message);

        openFeedback({
            type: "error",
            title: "NÃO FOI POSSÍVEL CADASTRAR",
            message: erro.message,
            buttonText: "VOLTAR E CORRIGIR",
            action: () => showScreen(clientScreen)
        });

    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});


// ==========================================
// 9. PREPARAÇÃO DO CADASTRO DO PRESTADOR
// ==========================================

providerForm.addEventListener("submit", event => {
    event.preventDefault();

    const cnpj = providerCnpj.value.trim();

    const cnpjIsValid = /^[0-9]{14}$/.test(cnpj);

    const serviceText = providerService.value.trim();

    const serviceIsValid =
        serviceText.length >= 1 &&
        serviceText.length <= 150;

    const acceptedTerms = providerTerms.checked;

    markValidity(providerCnpj, cnpjIsValid);
    markValidity(providerService, serviceIsValid);

    if (!cnpjIsValid || !serviceIsValid || !acceptedTerms) {
        let message;

        if (!cnpjIsValid && !serviceIsValid && !acceptedTerms) {
            message =
                "O CNPJ deve conter 14 números, o serviço deve ser preenchido com até 150 caracteres e você precisa aceitar os termos.";
        } else if (!cnpjIsValid) {
            message =
                "O CNPJ informado está em formato incorreto. Insira exatamente 14 números.";
        } else if (!serviceIsValid) {
            message =
                "Informe o tipo de serviço que você presta, com até 150 caracteres.";
        } else {
            message =
                "Para continuar, é necessário aceitar os termos de serviço.";
        }

        const firstInvalidField = !cnpjIsValid
            ? providerCnpj
            : !serviceIsValid
                ? providerService
                : providerTerms;

        openFeedback({
            type: "error",
            title: "DADOS INCORRETOS",
            message,
            buttonText: "VOLTAR E CORRIGIR",
            action: () => showScreen(providerScreen),
            focusTarget: firstInvalidField
        });

        return;
    }

    try {
        const usuario = obterUsuarioAutenticado();

        // Guarda os dados necessários para concluir
        // o cadastro do prestador na próxima tela.
        sessionStorage.setItem(
            "es_dados_prestador",
            JSON.stringify({
                id_usuario: usuario.id,
                cnpj,
                servicoPrestado: serviceText
            })
        );

        sessionStorage.setItem("app:activeRole", "prestador");

        openFeedback({
            type: "success",
            title: "DADOS REGISTRADOS!",
            message:
                "Agora informe o preço do serviço para concluir o cadastro do prestador.",
            buttonText: "CONTINUAR",
            action: () => {
                window.location.href = "criacao-servicos.html";
            }
        });

    } catch (erro) {
        openFeedback({
            type: "error",
            title: "NÃO FOI POSSÍVEL CONTINUAR",
            message: erro.message,
            buttonText: "VOLTAR",
            action: () => showScreen(providerScreen)
        });
    }
});


// ==========================================
// 10. CONTADOR DE CARACTERES
// ==========================================

providerService.addEventListener("input", () => {

    const characterCount =
        providerService.value.length;


    serviceCounter.textContent =
        `${characterCount}/150 caracteres`;


    markValidity(
        providerService,
        providerService.value.trim().length > 0 &&
        characterCount <= 150
    );

});


// ==========================================
// 11. VALIDAÇÃO VISUAL DO CPF
// ==========================================

clientCpf.addEventListener("input", () => {

    const isValid =
        /^[0-9]{11}$/.test(clientCpf.value);


    markValidity(clientCpf, isValid);

});


// ==========================================
// 12. VALIDAÇÃO VISUAL DO CNPJ
// ==========================================

providerCnpj.addEventListener("input", () => {

    const isValid =
        /^[0-9]{14}$/.test(providerCnpj.value);


    markValidity(providerCnpj, isValid);

});


// ==========================================
// 13. INICIALIZAÇÃO
// ==========================================

// A aplicação sempre começa na tela de
// escolha entre Cliente e Provedor.

showScreen(roleScreen);
