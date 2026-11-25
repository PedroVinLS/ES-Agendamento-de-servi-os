"use strict";

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";


async function apiRequest(endpoint, method, data, token) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
        const detalhes = Array.isArray(responseData?.detalhes)
            ? ` (${responseData.detalhes.join(" ")})`
            : "";

        throw new Error(
            (responseData?.error ||
                responseData?.mensagem ||
                responseData?.message ||
                "Não foi possível realizar a operação no servidor.") +
            detalhes
        );
    }

    return responseData;
}


// ==========================================
// CONFIGURAÇÕES DO PROTÓTIPO
// ==========================================

const DAYS = [
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
    "DOMINGO"
];

const HOURS = Array.from(
    { length: 12 },
    (_, i) => ({
        start: i + 6,
        end: i + 7
    })
);

const STORAGE_KEY = "servicosCriados";


// Nome, descrição, preço e ao menos um horário são obrigatórios.
// O preço mínimo é R$ 0,01, com até duas casas decimais.
// O telefone permanece opcional.

// ==========================================
// ELEMENTOS HTML
// ==========================================

const serviceForm = document.getElementById("service-form");

const serviceName = document.getElementById("service-name");

const servicePrice = document.getElementById("service-price");

const phoneArea = document.getElementById("phone-area");

const phoneNumber = document.getElementById("phone-number");

const serviceDescription =
    document.getElementById("service-description");

const descriptionCounter =
    document.getElementById("description-counter");


const createButton = document.getElementById("create-service");

const openScheduleButton =
    document.getElementById("open-schedule");

const selectionSummary =
    document.getElementById("selection-summary");


// MODAL DA AGENDA

const scheduleDialog =
    document.getElementById("schedule-dialog");

const availabilityGrid =
    document.getElementById("availability-grid");

const modalSelectionCount =
    document.getElementById("modal-selection-count");

const saveScheduleButton =
    document.getElementById("save-schedule");


// MODAL DA SENHA

const passwordDialog =
    document.getElementById("password-dialog");

const passwordForm =
    document.getElementById("password-form");

const confirmationPassword =
    document.getElementById("confirmation-password");

const passwordError =
    document.getElementById("password-error");


// MODAL DE RESULTADO

const resultDialog =
    document.getElementById("result-dialog");

const resultTitle =
    document.getElementById("result-title");

const resultMessage =
    document.getElementById("result-message");

const resultClose =
    document.getElementById("result-close");


// ==========================================
// ESTADO DA AGENDA E DO PRESTADOR
// ==========================================

// A seleção é identificada por pares dia-horário.
//
// Exemplo:
// "0-0" = segunda-feira, das 6h às 7h.

const selectedAvailability = new Set();

const temporaryAvailability = new Set();

const availabilityButtons = new Map();

// Guarda os dados do prestador já cadastrado (modo edição).
let prestadorExistente = null;


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function slotKey(dayIndex, hourIndex) {

    return `${dayIndex}-${hourIndex}`;

}


function parseSlotKey(key) {

    const [dayIndex, hourIndex] =
        key.split("-").map(Number);

    return {
        dayIndex,
        hourIndex
    };

}


function formatTime(hour) {

    return `${hour}h`;

}


function openDialog(dialog) {

    if (
        typeof dialog.showModal === "function" &&
        !dialog.open
    ) {

        dialog.showModal();

    }

}


function closeDialog(dialog) {

    if (dialog.open) {

        dialog.close();

    }

}


function setFieldError(id, message) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = message;

    }

}


function setInvalid(field, invalid) {

    if (invalid) {

        field.setAttribute("aria-invalid", "true");

    } else {

        field.removeAttribute("aria-invalid");

    }

}


function onlyDigits(value) {

    return value.replace(/\D/g, "");

}


function normalizePrice(value) {

    if (value === "") {

        return null;

    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : null;

}


// ==========================================
// CONSTRUÇÃO DA AGENDA DE DISPONIBILIDADE
// ==========================================

function createAvailabilityGrid() {

    availabilityGrid.replaceChildren();

    availabilityButtons.clear();


    // CÉLULA VAZIA DO CANTO SUPERIOR ESQUERDO

    const corner = document.createElement("div");

    corner.className = "grid-corner";

    corner.style.gridRow = "1";

    corner.style.gridColumn = "1";

    availabilityGrid.appendChild(corner);


    // CABEÇALHOS DOS SETE DIAS

    DAYS.forEach((day, dayIndex) => {

        const heading = document.createElement("div");

        heading.className = "grid-day";

        heading.textContent = day;

        heading.style.gridRow = "1";

        heading.style.gridColumn =
            String(dayIndex + 2);

        heading.setAttribute(
            "role",
            "columnheader"
        );

        availabilityGrid.appendChild(heading);

    });


    // HORÁRIOS DAS 6H ATÉ 18H

    HOURS.forEach((hour, hourIndex) => {

        const row = hourIndex + 2;


        // ETIQUETA DO HORÁRIO

        const time = document.createElement("div");

        time.className = "grid-time";

        time.style.gridRow = String(row);

        time.style.gridColumn = "1";


        const start = document.createElement("span");

        start.textContent = formatTime(hour.start);


        const end = document.createElement("span");

        end.textContent = `até ${formatTime(hour.end)}`;


        time.append(start, end);

        availabilityGrid.appendChild(time);


        // CÉLULAS DOS DIAS

        DAYS.forEach((day, dayIndex) => {

            const key = slotKey(dayIndex, hourIndex);

            const button = document.createElement("button");

            button.type = "button";

            button.className = "availability-slot";

            button.style.gridRow = String(row);

            button.style.gridColumn =
                String(dayIndex + 2);


            button.dataset.slotKey = key;


            button.setAttribute(
                "role",
                "gridcell"
            );

            button.setAttribute(
                "aria-pressed",
                "false"
            );

            button.setAttribute(
                "aria-label",
                `${day}, ${formatTime(hour.start)} até ${formatTime(hour.end)}, não selecionado`
            );


            button.title =
                `${day} — ${formatTime(hour.start)} até ${formatTime(hour.end)}`;


            // CLIQUE NA CÉLULA

            button.addEventListener("click", () => {

                toggleAvailability(key);

            });


            availabilityButtons.set(key, button);

            availabilityGrid.appendChild(button);

        });

    });


    updateAvailabilityGrid();

}


// ==========================================
// SELEÇÃO MÚLTIPLA DE HORÁRIOS
// ==========================================

function toggleAvailability(key) {

    if (temporaryAvailability.has(key)) {

        temporaryAvailability.delete(key);

    } else {

        temporaryAvailability.add(key);

    }


    updateAvailabilityGrid();

}


// ==========================================
// ATUALIZAÇÃO VISUAL DA AGENDA
// ==========================================

function updateAvailabilityGrid() {

    for (
        const [key, button]
        of availabilityButtons.entries()
    ) {

        const selected =
            temporaryAvailability.has(key);


        button.classList.toggle(
            "is-selected",
            selected
        );


        button.setAttribute(
            "aria-pressed",
            String(selected)
        );


        const {
            dayIndex,
            hourIndex
        } = parseSlotKey(key);


        const hour = HOURS[hourIndex];


        button.setAttribute(
            "aria-label",
            `${DAYS[dayIndex]}, ${formatTime(hour.start)} até ${formatTime(hour.end)}, ${selected ? "selecionado" : "não selecionado"}`
        );

    }


    // CONTADOR DE CÉLULAS SELECIONADAS

    const count = temporaryAvailability.size;


    modalSelectionCount.textContent = count === 1

        ? "1 horário selecionado"

        : `${count} horários selecionados`;

}


// ==========================================
// RESUMO DOS HORÁRIOS
// ==========================================

function updateSelectionSummary() {

    const count = selectedAvailability.size;


    if (count === 0) {

        selectionSummary.textContent =
            "Nenhum horário selecionado.";

    }

    else if (count === 1) {

        selectionSummary.textContent =
            "1 horário de atendimento selecionado.";

    }

    else {

        selectionSummary.textContent =
            `${count} horários de atendimento selecionados.`;

    }

}


// ==========================================
// ABRIR AGENDA
// ==========================================

openScheduleButton.addEventListener("click", () => {

    // Copia a seleção atual para a seleção temporária.

    temporaryAvailability.clear();

    selectedAvailability.forEach(key => {

        temporaryAvailability.add(key);

    });


    updateAvailabilityGrid();

    openDialog(scheduleDialog);

});


// ==========================================
// CONFIRMAR SELEÇÃO DA AGENDA
// ==========================================

saveScheduleButton.addEventListener("click", () => {

    // Transfere a seleção temporária para a definitiva.

    selectedAvailability.clear();

    temporaryAvailability.forEach(key => {

        selectedAvailability.add(key);

    });


    updateSelectionSummary();

    updateCreateButton();

    closeDialog(scheduleDialog);

});


// ==========================================
// VALIDAÇÃO DO NOME DO SERVIÇO
// ==========================================

function validateServiceName() {

    const value = serviceName.value.trim();


    const valid =
        value.length >= 1 &&
        value.length <= 100 &&
        /^[\p{L}\p{N} ]+$/u.test(value);


    setInvalid(serviceName, !valid);


    setFieldError(
        "service-name-error",

        valid
            ? ""
            : "Informe um nome de até 100 caracteres, usando letras, números e espaços."
    );


    return valid;

}


// ==========================================
// VALIDAÇÃO DA DESCRIÇÃO
// ==========================================

function validateDescription() {

    const value = serviceDescription.value.trim();


    const valid =
        value.length >= 1 &&
        value.length <= 300 &&
        /^[\p{L}\p{N}\s.,;:!?()'"\-\/]+$/u.test(value);


    setInvalid(serviceDescription, !valid);


    setFieldError(
        "service-description-error",

        valid
            ? ""
            : "Informe uma descrição de até 300 caracteres."
    );


    return valid;

}


// ==========================================
// VALIDAÇÃO DO PREÇO
// ==========================================

function validatePrice() {

    const value = servicePrice.value.trim();


    // O preço é obrigatório.

    if (value === "") {

        setInvalid(servicePrice, true);

        setFieldError(
            "service-price-error",
            "Informe o preço do serviço. O valor mínimo é R$ 0,01."
        );

        return false;

    }


    const parsed = Number(value);

    const valid =
        Number.isFinite(parsed) &&
        parsed >= 0.01 &&
        /^\d+(\.\d{1,2})?$/.test(value);


    setInvalid(servicePrice, !valid);


    setFieldError(
        "service-price-error",

        valid
            ? ""
            : "Informe um preço a partir de R$ 0,01, com no máximo duas casas decimais."
    );


    return valid;

}


// ==========================================
// VALIDAÇÃO DO TELEFONE
// ==========================================

function validatePhone() {

    const area = onlyDigits(phoneArea.value);

    const number = onlyDigits(phoneNumber.value);


    const bothEmpty =
        area.length === 0 &&
        number.length === 0;


    // O telefone é opcional.
    // Caso o usuário comece a preenchê-lo,
    // DDD e número precisam estar completos.

    const valid =
        bothEmpty ||
        (
            area.length === 2 &&
            (number.length === 8 || number.length === 9)
        );


    setInvalid(phoneArea, !valid);

    setInvalid(phoneNumber, !valid);


    setFieldError(
        "phone-error",

        valid
            ? ""
            : "Preencha o DDD e o telefone completo (8 ou 9 números), ou deixe ambos vazios."
    );


    return valid;

}


// ==========================================
// VERIFICAÇÃO DA DISPONIBILIDADE
// ==========================================

function validateAvailability() {

    return selectedAvailability.size > 0;

}


// ==========================================
// VALIDAÇÃO COMPLETA
// ==========================================

function isFormReady() {

    return validateServiceName() &&
        validateDescription() &&
        validatePrice() &&
        validatePhone() &&
        validateAvailability();

}


// ==========================================
// LIBERAR OU BLOQUEAR BOTÃO DE CRIAÇÃO
// ==========================================

function updateCreateButton() {

    // Valida os campos obrigatórios, incluindo
    // o preço mínimo de R$ 0,01.
    // O telefone permanece opcional.
    const ready =

        serviceName.value.trim().length > 0 &&

        validateServiceName() &&

        serviceDescription.value.trim().length > 0 &&

        validateDescription() &&

        validatePrice() &&

        validatePhone() &&

        selectedAvailability.size > 0;


    createButton.disabled = !ready;

}


// ==========================================
// ATUALIZAÇÃO DOS CAMPOS EM TEMPO REAL
// ==========================================

serviceName.addEventListener(
    "input",
    updateCreateButton
);


serviceDescription.addEventListener("input", () => {

    descriptionCounter.textContent =
        `${serviceDescription.value.length}/300`;

    updateCreateButton();

});


servicePrice.addEventListener(
    "input",
    updateCreateButton
);


phoneArea.addEventListener("input", () => {

    phoneArea.value =
        onlyDigits(phoneArea.value).slice(0, 2);

    updateCreateButton();

});


phoneNumber.addEventListener("input", () => {

    phoneNumber.value =
        onlyDigits(phoneNumber.value).slice(0, 11);

    updateCreateButton();

});


// ==========================================
// CARREGAMENTO DO CONTEXTO DO PRESTADOR
// ==========================================

async function carregarContextoPrestador() {
    let usuario = null;
    let dadosPrestador = null;

    try {
        usuario = JSON.parse(
            sessionStorage.getItem("es_usuario") || "null"
        );
        dadosPrestador = JSON.parse(
            sessionStorage.getItem("es_dados_prestador") || "null"
        );
    } catch {
        return;
    }

    if (dadosPrestador?.servicoPrestado && !serviceName.value.trim()) {
        serviceName.value = dadosPrestador.servicoPrestado;
        updateCreateButton();
    }

    if (!usuario?.id) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/prestador`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) {
            return;
        }

        const lista = await res.json();

        if (!Array.isArray(lista)) {
            return;
        }

        const encontrado = lista.find(
            p => Number(p.id_usuario) === Number(usuario.id)
        );

        if (encontrado) {
            prestadorExistente = encontrado;

            if (!serviceName.value.trim() && encontrado.servicoPrestado) {
                serviceName.value = encontrado.servicoPrestado;
            }

            if (!servicePrice.value.trim() && encontrado.preco) {
                servicePrice.value = String(encontrado.preco);
            }

            createButton.textContent = "SALVAR SERVIÇO";
            updateCreateButton();
        }
    } catch (error) {
        console.warn("Não foi possível consultar dados existentes do prestador:", error);
    }
}


// ==========================================
// ENVIAR CADASTRO OU ATUALIZAÇÃO DO PRESTADOR
// ==========================================

serviceForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!isFormReady()) {
        if (selectedAvailability.size === 0) {
            selectionSummary.textContent =
                "Selecione pelo menos um horário para continuar.";
        }

        updateCreateButton();
        return;
    }

    const token = sessionStorage.getItem("es_token");

    let dadosPrestador;
    let usuario;

    try {
        dadosPrestador = JSON.parse(
            sessionStorage.getItem("es_dados_prestador") || "null"
        );

        usuario = JSON.parse(
            sessionStorage.getItem("es_usuario") || "null"
        );
    } catch {
        showError("Os dados da sessão estão inválidos. Faça login novamente.");
        return;
    }

    if (!token || !usuario?.id) {
        showError("Sua sessão expirou. Faça login novamente.");
        return;
    }

    const servicoPrestado =
        serviceName.value.trim() ||
        dadosPrestador?.servicoPrestado?.trim() ||
        "";

    const preco = normalizePrice(servicePrice.value);

    if (!servicoPrestado || servicoPrestado.length > 150 || preco === null) {
        showError("Informe um nome de serviço válido (até 150 caracteres) e um preço mínimo de R$ 0,01.");
        return;
    }

    createButton.disabled = true;
    createButton.textContent = "Enviando...";

    try {
        // Caso 1: Prestador já cadastrado atualizando serviço/preço.
        if (prestadorExistente?.cnpj) {
            await apiRequest(
                `/prestador/${encodeURIComponent(prestadorExistente.cnpj)}`,
                "PUT",
                {
                    servicoPrestado,
                    preco
                },
                token
            );

            sessionStorage.setItem("app:activeRole", "prestador");
            showSuccess(servicoPrestado, true);
            return;
        }

        // Caso 2: Primeiro cadastro de prestador vindo de selecao-papel.html.
        if (!dadosPrestador) {
            showError("Os dados de CNPJ não foram encontrados. Retorne à seleção de perfil para informar seu CNPJ.");
            return;
        }

        const cnpj = onlyDigits(dadosPrestador.cnpj);

        if (
            String(dadosPrestador.id_usuario) !== String(usuario.id) ||
            cnpj.length !== 14
        ) {
            showError("Os dados do cadastro do prestador estão incompletos ou inválidos. Revise a etapa anterior.");
            return;
        }

        const dados = {
            id_usuario: usuario.id,
            cnpj,
            servicoPrestado,
            preco
        };

        await apiRequest(
            "/prestador",
            "POST",
            dados,
            token
        );

        sessionStorage.removeItem("es_dados_prestador");
        sessionStorage.setItem("app:activeRole", "prestador");

        showSuccess(servicoPrestado, false);

    } catch (error) {
        console.error("Erro ao salvar prestador:", error);
        showError(error.message);

    } finally {
        createButton.textContent = prestadorExistente
            ? "SALVAR SERVIÇO"
            : "CRIAR SERVIÇO";
        updateCreateButton();
    }
});


// ==========================================
// MODAL DE RESULTADO
// ==========================================

let prestadorCadastrado = false;


// ==========================================
// EXIBIR SUCESSO
// ==========================================

function showSuccess(serviceNameValue, isUpdate = false) {

    prestadorCadastrado = true;

    resultTitle.textContent = isUpdate
        ? "SERVIÇO ATUALIZADO!"
        : "CADASTRO REALIZADO!";

    resultMessage.textContent = isUpdate
        ? `O serviço "${serviceNameValue}" foi atualizado com sucesso no servidor.`
        : `O prestador "${serviceNameValue}" foi cadastrado com sucesso no servidor.`;

    openDialog(resultDialog);

}


// ==========================================
// EXIBIR ERRO
// ==========================================

function showError(message) {

    prestadorCadastrado = false;

    resultTitle.textContent =
        "NÃO FOI POSSÍVEL SALVAR";

    resultMessage.textContent = message;

    openDialog(resultDialog);

}


// ==========================================
// FECHAR MODAL DE RESULTADO
// ==========================================

resultClose.addEventListener("click", () => {

    closeDialog(resultDialog);

    if (prestadorCadastrado) {

        window.location.href = "tela-principal.html";

    }

});


// ==========================================
// FECHAMENTO DOS MODAIS
// ==========================================

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {

        const dialog = document.getElementById(
            button.dataset.close
        );


        if (dialog) {

            closeDialog(dialog);

        }

    });

});


// Clicar no fundo escurecido fecha os modais
// de seleção e senha.

[scheduleDialog, passwordDialog].forEach(dialog => {

    dialog.addEventListener("click", event => {

        if (event.target === dialog) {

            closeDialog(dialog);

        }

    });

});


// ==========================================
// INICIALIZAÇÃO
// ==========================================

createAvailabilityGrid();

updateSelectionSummary();

updateCreateButton();

carregarContextoPrestador();