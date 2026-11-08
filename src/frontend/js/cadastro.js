"use strict";


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
// 8. VALIDAÇÃO DO CLIENTE
// ==========================================

clientForm.addEventListener("submit", event => {

    // Impede o envio tradicional do formulário.

    event.preventDefault();


    // Verifica se o CPF possui exatamente
    // onze números de 0 a 9.

    const cpfIsValid =
        /^[0-9]{11}$/.test(clientCpf.value);


    // Verifica se o usuário aceitou os termos.

    const acceptedTerms = clientTerms.checked;


    markValidity(clientCpf, cpfIsValid);


    // --------------------------------------
    // CASO 1: INFORMAÇÕES INCORRETAS
    // --------------------------------------

    if (!cpfIsValid || !acceptedTerms) {

        let message;


        if (!cpfIsValid && !acceptedTerms) {

            message =
                "O CPF deve conter exatamente 11 números, sem pontos, espaços ou hífen, e você precisa aceitar os termos de serviço. Confira os dados e tente novamente.";

        }

        else if (!cpfIsValid) {

            message =
                "O CPF informado está em formato incorreto. Insira exatamente 11 números de 0 a 9, sem pontos, espaços ou hífen.";

        }

        else {

            message =
                "Para continuar, é necessário aceitar os termos de serviço.";

        }


        // Exibe o pop-up de erro.

        openFeedback({

            type: "error",

            title: "DADOS INCORRETOS",

            message: message,

            buttonText: "VOLTAR E CORRIGIR",

            action: () => {

                // Permanece na tela de cadastro do cliente.

                showScreen(clientScreen);

            },

            focusTarget: !cpfIsValid
                ? clientCpf
                : clientTerms

        });


        return;

    }


    // --------------------------------------
    // CASO 2: INFORMAÇÕES CORRETAS
    // --------------------------------------

    // Nenhum CPF é enviado ou armazenado.
    // A validação é exclusivamente estrutural.

    openFeedback({

        type: "success",

        title: "CADASTRO CONCLUÍDO!",

        message:
            "Seu cadastro como cliente foi concluído nesta demonstração. Agora você já pode desfrutar dos serviços locais.",

        buttonText: "NAVEGAR SERVIÇOS",

        action: () => {

            // A página de navegação de serviços
            // ainda não existe.
            // Recarrega a aplicação e retorna
            // à tela inicial de escolha do papel.

            window.location.reload();

        }

    });

});


// ==========================================
// 9. VALIDAÇÃO DO PROVEDOR
// ==========================================

providerForm.addEventListener("submit", event => {

    event.preventDefault();


    // Verifica se o CNPJ possui exatamente
    // quatorze números de 0 a 9.

    const cnpjIsValid =
        /^[0-9]{14}$/.test(providerCnpj.value);


    // Verifica se o tipo de serviço foi preenchido
    // e se respeita o limite de 150 caracteres.

    const serviceText =
        providerService.value.trim();

    const serviceIsValid =
        serviceText.length >= 1 &&
        providerService.value.length <= 150;


    // Verifica o aceite dos termos.

    const acceptedTerms = providerTerms.checked;


    markValidity(providerCnpj, cnpjIsValid);

    markValidity(providerService, serviceIsValid);


    // --------------------------------------
    // CASO 1: INFORMAÇÕES INCORRETAS
    // --------------------------------------

    if (
        !cnpjIsValid ||
        !serviceIsValid ||
        !acceptedTerms
    ) {

        let message;


        if (
            !cnpjIsValid &&
            !serviceIsValid &&
            !acceptedTerms
        ) {

            message =
                "O CNPJ deve conter exatamente 14 números, o tipo de serviço deve ser preenchido com até 150 caracteres e você precisa aceitar os termos de serviço. Confira os dados e tente novamente.";

        }

        else if (!cnpjIsValid) {

            message =
                "O CNPJ informado está em formato incorreto. Insira exatamente 14 números de 0 a 9, sem pontos, espaços ou hífen.";

        }

        else if (!serviceIsValid) {

            message =
                "Informe o tipo de serviço que você presta. O campo deve conter entre 1 e 150 caracteres.";

        }

        else {

            message =
                "Para continuar, é necessário aceitar os termos de serviço.";

        }


        // Identifica qual campo precisa ser corrigido.

        const firstInvalidField = !cnpjIsValid

            ? providerCnpj

            : !serviceIsValid

                ? providerService

                : providerTerms;


        // Exibe o pop-up de erro.

        openFeedback({

            type: "error",

            title: "DADOS INCORRETOS",

            message: message,

            buttonText: "VOLTAR E CORRIGIR",

            action: () => {

                // Mantém o usuário na tela de cadastro
                // do provedor, preservando os dados digitados.

                showScreen(providerScreen);

            },

            focusTarget: firstInvalidField

        });


        return;

    }


    // --------------------------------------
    // CASO 2: INFORMAÇÕES CORRETAS
    // --------------------------------------

    // Nenhum CNPJ ou tipo de serviço
    // é enviado ou armazenado.

    openFeedback({

        type: "success",

        title: "CADASTRO CONCLUÍDO!",

        message:
            "Seu cadastro como prestador foi concluído nesta demonstração. Agora você já pode cadastrar seu serviço.",

        buttonText: "CADASTRAR SERVIÇO",

        action: () => {

            // A página de cadastro de serviços
            // ainda não existe.
            // Retorna à tela inicial.

            window.location.reload();

        }

    });

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