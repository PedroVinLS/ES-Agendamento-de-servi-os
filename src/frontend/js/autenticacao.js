"use strict";


// ==========================================
// 1. ELEMENTOS HTML
// ==========================================


// TELAS

const loginScreen = document.getElementById("login-screen");

const registerScreen = document.getElementById("register-screen");


// BOTÕES DE NAVEGAÇÃO

const goToRegisterButton =
    document.getElementById("go-to-register");

const backToLoginButton =
    document.getElementById("back-to-login");


// FORMULÁRIO DE LOGIN

const loginForm = document.getElementById("login-form");

const loginEmail = document.getElementById("login-email");

const loginPassword = document.getElementById("login-password");


// FORMULÁRIO DE CADASTRO

const registerForm = document.getElementById("register-form");

const registerName = document.getElementById("register-name");

const registerEmail = document.getElementById("register-email");

const registerPassword = document.getElementById("register-password");


// POP-UP

const feedbackDialog = document.getElementById("feedback-dialog");

const feedbackIcon = document.getElementById("feedback-icon");

const feedbackTitle = document.getElementById("feedback-title");

const feedbackMessage = document.getElementById("feedback-message");

const feedbackButton = document.getElementById("feedback-button");



// ==========================================
// 2. CONTROLE DAS TELAS
// ==========================================

function showScreen(screenToShow) {

    const screens = [
        loginScreen,
        registerScreen
    ];


    // Esconde a tela que não foi selecionada.

    screens.forEach(screen => {

        const shouldShow = screen === screenToShow;

        screen.hidden = !shouldShow;

        screen.classList.toggle(
            "is-active",
            shouldShow
        );

    });


    // Retorna ao topo da página.

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });

}



// ==========================================
// 3. NAVEGAÇÃO ENTRE LOGIN E CADASTRO
// ==========================================


// LOGIN -> CADASTRO

goToRegisterButton.addEventListener("click", () => {

    showScreen(registerScreen);

    registerName.focus({
        preventScroll: true
    });

});


// CADASTRO -> LOGIN

backToLoginButton.addEventListener("click", () => {

    showScreen(loginScreen);

    loginEmail.focus({
        preventScroll: true
    });

});



// ==========================================
// 4. VALIDAÇÃO DO EMAIL
// ==========================================

function validateEmail(email) {

    const normalizedEmail = email.trim();


    // O e-mail deve possuir estrutura convencional:
    // usuário@domínio.extensão

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return (
        normalizedEmail.length <= 150 &&
        emailPattern.test(normalizedEmail)
    );

}



// ==========================================
// 5. VALIDAÇÃO DA SENHA
// ==========================================

function validatePassword(password) {

    // Aceita somente letras de A a Z e números de 0 a 9.
    // Tamanho máximo: 250 caracteres.

    const passwordPattern = /^[A-Za-z0-9]{1,250}$/;


    return passwordPattern.test(password);

}



// ==========================================
// 6. VALIDAÇÃO DO NOME
// ==========================================

function validateName(name) {

    const normalizedName = name.trim();

    const characterCount = [...normalizedName].length;


    return (
        characterCount >= 1 &&
        characterCount <= 150
    );

}



// ==========================================
// 7. ESTADO VISUAL DOS CAMPOS
// ==========================================

function markValidity(field, isValid) {

    field.setAttribute(
        "aria-invalid",
        String(!isValid)
    );

}


function clearValidity(field) {

    field.removeAttribute("aria-invalid");

}



// ==========================================
// 8. POP-UP DE ERRO E SUCESSO
// ==========================================

// Armazena temporariamente a ação do botão
// que aparece no pop-up.

let feedbackAction = null;

let focusAfterFeedback = null;


function openFeedback({

    type,
    title,
    message,
    buttonText,
    action = null,
    focusTarget = null

}) {

    // Define a aparência do pop-up.

    const isSuccess = type === "success";


    feedbackDialog.classList.toggle(
        "is-success",
        isSuccess
    );


    // Ícone correspondente ao resultado.

    feedbackIcon.textContent = isSuccess
        ? "✓"
        : "!";


    // Conteúdo textual.

    feedbackTitle.textContent = title;

    feedbackMessage.textContent = message;

    feedbackButton.textContent = buttonText;


    // Ação que será executada ao fechar.

    feedbackAction = action;

    focusAfterFeedback = focusTarget;


    // Abre o pop-up.

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
// 9. BOTÃO DO POP-UP
// ==========================================

feedbackButton.addEventListener("click", () => {

    const action = feedbackAction;

    const focusTarget = focusAfterFeedback;


    // Fecha o pop-up.

    feedbackDialog.close();


    // Limpa as ações temporárias.

    feedbackAction = null;

    focusAfterFeedback = null;


    // Executa a ação correspondente.

    if (typeof action === "function") {

        action();

    }


    // Retorna o foco ao campo que precisa
    // ser corrigido.

    if (focusTarget) {

        window.setTimeout(() => {

            focusTarget.focus();

        }, 0);

    }

});



// ==========================================
// 10. VALIDAÇÃO DO FORMULÁRIO DE LOGIN
// ==========================================

loginForm.addEventListener("submit", event => {

    // Impede o envio tradicional do formulário.

    event.preventDefault();


    // Captura os dados temporariamente.

    const email = loginEmail.value.trim();

    const password = loginPassword.value;


    // Verifica a estrutura.

    const emailIsValid = validateEmail(email);

    const passwordIsValid = validatePassword(password);


    markValidity(loginEmail, emailIsValid);

    markValidity(loginPassword, passwordIsValid);


    // --------------------------------------
    // CASO 1: DADOS INCORRETOS
    // --------------------------------------

    if (!emailIsValid || !passwordIsValid) {

        const errors = [];


        if (!emailIsValid) {

            errors.push(
                "O e-mail deve possuir um formato válido."
            );

        }


        if (!passwordIsValid) {

            errors.push(
                "A senha deve conter entre 1 e 250 caracteres alfanuméricos, sem espaços ou símbolos."
            );

        }


        const firstInvalidField = !emailIsValid
            ? loginEmail
            : loginPassword;


        openFeedback({

            type: "error",

            title: "DADOS INCORRETOS",

            message: errors.join(" "),

            buttonText: "VOLTAR E CORRIGIR",

            action: () => {

                showScreen(loginScreen);

            },

            focusTarget: firstInvalidField

        });


        return;

    }


    // --------------------------------------
    // CASO 2: FORMATO CORRETO
    // --------------------------------------

    /*
        IMPORTANTE:

        Ainda não existe uma API para verificar
        se a conta está cadastrada no banco de dados.

        Portanto, esta demonstração verifica somente
        a estrutura do e-mail e da senha.

        Nenhum dado é enviado ou armazenado.

        Como o menu principal ainda não está pronto,
        a página simplesmente é reiniciada.
    */


    window.location.reload();

});



// ==========================================
// 11. VALIDAÇÃO DO FORMULÁRIO DE CADASTRO
// ==========================================

registerForm.addEventListener("submit", event => {

    event.preventDefault();


    // Captura temporária dos dados.

    const name = registerName.value.trim();

    const email = registerEmail.value.trim();

    const password = registerPassword.value;


    // Valida os campos.

    const nameIsValid = validateName(name);

    const emailIsValid = validateEmail(email);

    const passwordIsValid = validatePassword(password);


    markValidity(registerName, nameIsValid);

    markValidity(registerEmail, emailIsValid);

    markValidity(registerPassword, passwordIsValid);


    // --------------------------------------
    // CASO 1: INFORMAÇÕES INCORRETAS
    // --------------------------------------

    if (
        !nameIsValid ||
        !emailIsValid ||
        !passwordIsValid
    ) {

        const errors = [];


        if (!nameIsValid) {

            errors.push(
                "O nome deve ser preenchido e possuir no máximo 150 caracteres."
            );

        }


        if (!emailIsValid) {

            errors.push(
                "O e-mail está em formato inválido. Insira um endereço de e-mail válido com até 150 caracteres."
            );

        }


        if (!passwordIsValid) {

            errors.push(
                "A senha deve conter entre 1 e 250 caracteres alfanuméricos, sem espaços ou símbolos."
            );

        }


        // Identifica o primeiro campo incorreto.

        let firstInvalidField;


        if (!nameIsValid) {

            firstInvalidField = registerName;

        }

        else if (!emailIsValid) {

            firstInvalidField = registerEmail;

        }

        else {

            firstInvalidField = registerPassword;

        }


        // Exibe o pop-up de erro.

        openFeedback({

            type: "error",

            title: "DADOS INCORRETOS",

            message: errors.join(" "),

            buttonText: "VOLTAR E CORRIGIR",

            action: () => {

                showScreen(registerScreen);

            },

            focusTarget: firstInvalidField

        });


        return;

    }


    // --------------------------------------
    // CASO 2: INFORMAÇÕES CORRETAS
    // --------------------------------------

    /*
        Os dados passaram na validação estrutural.

        Como ainda não existe backend, não vamos
        armazenar nome, e-mail ou senha.

        O usuário será direcionado para a tela
        de seleção de papel.
    */


    openFeedback({

        type: "success",

        title: "CADASTRO CONCLUÍDO!",

        message:
            "Seus dados foram preenchidos corretamente. Agora escolha se deseja utilizar a aplicação como cliente ou prestador de serviços.",

        buttonText: "CONTINUAR",

        action: () => {

            // Redireciona para a tela já desenvolvida
            // de seleção entre Cliente e Prestador.

            window.location.href = "selecao-papel.html";

        }

    });

});



// ==========================================
// 12. VALIDAÇÃO EM TEMPO REAL
// ==========================================

// Remove o destaque de erro quando o usuário
// começa a corrigir os campos.

loginEmail.addEventListener("input", () => {

    clearValidity(loginEmail);

});


loginPassword.addEventListener("input", () => {

    clearValidity(loginPassword);

});


registerName.addEventListener("input", () => {

    clearValidity(registerName);

});


registerEmail.addEventListener("input", () => {

    clearValidity(registerEmail);

});


registerPassword.addEventListener("input", () => {

    clearValidity(registerPassword);

});



// ==========================================
// 13. INICIALIZAÇÃO
// ==========================================

// A aplicação começa sempre na tela de Login.

showScreen(loginScreen);