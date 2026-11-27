"use strict";

// ==========================================
// 1. CONFIGURAÇÃO DA API
// ==========================================

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";


// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

// TELAS
const loginScreen = document.getElementById("login-screen");
const registerScreen = document.getElementById("register-screen");

// BOTÕES DE NAVEGAÇÃO
const goToRegisterButton = document.getElementById("go-to-register");
const backToLoginButton = document.getElementById("back-to-login");

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
// 3. CONTROLE DAS TELAS
// ==========================================

function showScreen(screenToShow) {
    const screens = [loginScreen, registerScreen];

    screens.forEach(screen => {
        const shouldShow = screen === screenToShow;

        screen.hidden = !shouldShow;
        screen.classList.toggle("is-active", shouldShow);
    });

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}


// ==========================================
// 4. NAVEGAÇÃO ENTRE LOGIN E CADASTRO
// ==========================================

goToRegisterButton.addEventListener("click", () => {
    showScreen(registerScreen);

    registerName.focus({
        preventScroll: true
    });
});

backToLoginButton.addEventListener("click", () => {
    showScreen(loginScreen);

    loginEmail.focus({
        preventScroll: true
    });
});


// ==========================================
// 5. VALIDAÇÕES
// ==========================================

function validateEmail(email) {
    const normalizedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
        normalizedEmail.length <= 150 &&
        emailPattern.test(normalizedEmail)
    );
}

function validatePassword(password) {
    const passwordPattern = /^[A-Za-z0-9]{1,250}$/;

    return passwordPattern.test(password);
}

function validateName(name) {
    const normalizedName = name.trim();
    const characterCount = [...normalizedName].length;

    return (
        characterCount >= 1 &&
        characterCount <= 150
    );
}


// ==========================================
// 6. ESTADO VISUAL DOS CAMPOS
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
// 7. CONTROLE DE ENVIO DOS FORMULÁRIOS
// ==========================================

function setFormLoading(form, isLoading) {
    const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = isLoading;
    }
}


// ==========================================
// 8. COMUNICAÇÃO COM A API
// ==========================================

async function apiRequest(endpoint, method, data) {
    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );

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


// ==========================================
// 9. POP-UP DE ERRO E SUCESSO
// ==========================================

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
    const isSuccess = type === "success";

    feedbackDialog.classList.toggle(
        "is-success",
        isSuccess
    );

    feedbackIcon.textContent = isSuccess ? "✓" : "!";

    feedbackTitle.textContent = title;
    feedbackMessage.textContent = message;
    feedbackButton.textContent = buttonText;

    feedbackAction = action;
    focusAfterFeedback = focusTarget;

    if (typeof feedbackDialog.showModal === "function") {
        feedbackDialog.showModal();
    } else {
        window.alert(`${title}\n\n${message}`);

        if (typeof feedbackAction === "function") {
            feedbackAction();
        }
    }
}


// ==========================================
// 10. BOTÃO DO POP-UP
// ==========================================

feedbackButton.addEventListener("click", () => {
    const action = feedbackAction;
    const focusTarget = focusAfterFeedback;

    feedbackDialog.close();

    feedbackAction = null;
    focusAfterFeedback = null;

    if (typeof action === "function") {
        action();
    }

    if (focusTarget) {
        window.setTimeout(() => {
            focusTarget.focus();
        }, 0);
    }
});


// ==========================================
// 10A. IDENTIFICAÇÃO DO PERFIL DO USUÁRIO
// ==========================================

async function identificarPerfilUsuario(usuarioId) {
    const [resPrestadores, resClientes] = await Promise.all([
        fetch(`${API_BASE_URL}/prestador`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        }),
        fetch(`${API_BASE_URL}/cliente`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        })
    ]);

    if (!resPrestadores.ok || !resClientes.ok) {
        throw new Error(
            "Não foi possível verificar o perfil cadastrado do usuário."
        );
    }

    const [prestadores, clientes] = await Promise.all([
        resPrestadores.json(),
        resClientes.json()
    ]);

    const ehPrestador = Array.isArray(prestadores) &&
        prestadores.some(p => Number(p.id_usuario) === Number(usuarioId));

    if (ehPrestador) {
        return "prestador";
    }

    const ehCliente = Array.isArray(clientes) &&
        clientes.some(c => Number(c.id_usuario) === Number(usuarioId));

    if (ehCliente) {
        return "cliente";
    }

    return null;
}


// ==========================================
// 11. LOGIN INTEGRADO À API
// ==========================================

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    const emailIsValid = validateEmail(email);
    const passwordIsValid = validatePassword(password);

    markValidity(loginEmail, emailIsValid);
    markValidity(loginPassword, passwordIsValid);

    // Validação dos campos
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
            action: () => showScreen(loginScreen),
            focusTarget: firstInvalidField
        });

        return;
    }

    setFormLoading(loginForm, true);

    try {
        // Envia as credenciais para a API
        const resultado = await apiRequest(
            "/usuario/login",
            "POST",
            {
                email,
                senha: password
            }
        );

        if (!resultado.token) {
            throw new Error(
                "A API não retornou o token de autenticação."
            );
        }

        // Guarda os dados da sessão nesta aba
        sessionStorage.setItem(
            "es_token",
            resultado.token
        );

        sessionStorage.setItem(
            "es_usuario",
            JSON.stringify(resultado.usuario || {})
        );

        // Identifica se o usuário possui perfil de prestador ou cliente
        const papel = await identificarPerfilUsuario(resultado.usuario?.id);

        if (papel) {
            sessionStorage.setItem("app:activeRole", papel);
            window.location.replace("tela-principal.html");
        } else {
            sessionStorage.removeItem("app:activeRole");
            window.location.replace("selecao-papel.html");
        }

    } catch (erro) {
        console.error(
            "Falha na autenticação:",
            erro.message
        );

        let mensagem = erro.message;

        if (!erro.status) {
            mensagem =
                "Não foi possível conectar à API. Verifique se ela está em execução e se a porta 3000 está acessível.";
        }

        openFeedback({
            type: "error",
            title: "NÃO FOI POSSÍVEL ENTRAR",
            message: mensagem,
            buttonText: "VOLTAR",
            action: () => showScreen(loginScreen)
        });

    } finally {
        setFormLoading(loginForm, false);
    }
});


// ==========================================
// 12. CADASTRO INTEGRADO À API
// ==========================================

registerForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    const nameIsValid = validateName(name);
    const emailIsValid = validateEmail(email);
    const passwordIsValid = validatePassword(password);

    markValidity(registerName, nameIsValid);
    markValidity(registerEmail, emailIsValid);
    markValidity(registerPassword, passwordIsValid);

    if (!nameIsValid || !emailIsValid || !passwordIsValid) {
        const errors = [];

        if (!nameIsValid) {
            errors.push(
                "O nome deve ser preenchido e possuir no máximo 150 caracteres."
            );
        }

        if (!emailIsValid) {
            errors.push(
                "O e-mail está em formato inválido. Insira um endereço válido com até 150 caracteres."
            );
        }

        if (!passwordIsValid) {
            errors.push(
                "A senha deve conter entre 1 e 250 caracteres alfanuméricos, sem espaços ou símbolos."
            );
        }

        const firstInvalidField = !nameIsValid
            ? registerName
            : !emailIsValid
                ? registerEmail
                : registerPassword;

        openFeedback({
            type: "error",
            title: "DADOS INCORRETOS",
            message: errors.join(" "),
            buttonText: "VOLTAR E CORRIGIR",
            action: () => showScreen(registerScreen),
            focusTarget: firstInvalidField
        });

        return;
    }

    setFormLoading(registerForm, true);

    try {
        // 1. Cadastra a conta
        await apiRequest(
            "/usuario",
            "POST",
            {
                nome: name,
                email,
                senha: password
            }
        );

        // 2. Realiza login automaticamente
        const resultado = await apiRequest(
            "/usuario/login",
            "POST",
            {
                email,
                senha: password
            }
        );

        if (!resultado.token || !resultado.usuario?.id) {
            throw new Error(
                "A API não retornou os dados necessários para iniciar a sessão."
            );
        }

        // 3. Armazena a sessão
        sessionStorage.setItem(
            "es_token",
            resultado.token
        );

        sessionStorage.setItem(
            "es_usuario",
            JSON.stringify(resultado.usuario)
        );

        sessionStorage.removeItem("app:activeRole");

        // 4. Encaminha para a escolha do perfil
        openFeedback({
            type: "success",
            title: "CADASTRO CONCLUÍDO!",
            message:
                "Sua conta foi cadastrada e autenticada com sucesso. Agora escolha se deseja utilizar a aplicação como cliente ou prestador de serviços.",
            buttonText: "CONTINUAR",
            action: () => {
                window.location.href = "selecao-papel.html";
            }
        });

    } catch (erro) {
        console.error(
            "Falha no cadastro ou autenticação:",
            erro.message
        );

        let mensagem = erro.message;

        if (!erro.status) {
            mensagem =
                "Não foi possível conectar à API. Verifique se ela está em execução e se a porta 3000 está acessível.";
        }

        openFeedback({
            type: "error",
            title: "NÃO FOI POSSÍVEL CONCLUIR O CADASTRO",
            message: mensagem,
            buttonText: "VOLTAR",
            action: () => showScreen(registerScreen)
        });

    } finally {
        setFormLoading(registerForm, false);
    }
});


// ==========================================
// 13. VALIDAÇÃO EM TEMPO REAL
// ==========================================

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
// 14. INICIALIZAÇÃO
// ==========================================

showScreen(loginScreen);