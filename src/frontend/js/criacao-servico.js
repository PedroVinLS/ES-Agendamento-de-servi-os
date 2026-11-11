"use strict";


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


// Senha exclusivamente demonstrativa enquanto não existe API.
// Altere este valor para testar outra senha.
// NÃO use uma senha fixa no código em produção.

const DEMO_PASSWORD = "123456";


// Nome, descrição e ao menos um horário são obrigatórios.
// Preço e telefone são opcionais, conforme o wireframe.


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


// LOGO

const logoButton =
    document.querySelector(".logo-button");


// ==========================================
// ESTADO DA AGENDA
// ==========================================

// A seleção é identificada por pares dia-horário.
//
// Exemplo:
// "0-0" = segunda-feira, das 6h às 7h.

const selectedAvailability = new Set();

const temporaryAvailability = new Set();

const availabilityButtons = new Map();


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


    // O preço é opcional.

    if (value === "") {

        setInvalid(servicePrice, false);

        setFieldError("service-price-error", "");

        return true;

    }


    const parsed = Number(value);

    const valid =
        Number.isFinite(parsed) &&
        parsed >= 0;


    setInvalid(servicePrice, !valid);


    setFieldError(
        "service-price-error",

        valid
            ? ""
            : "Informe um preço válido ou deixe o campo vazio."
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

    // Os campos opcionais só são validados
    // quando o usuário decide preenchê-los.

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
// ABRIR MODAL DE CONFIRMAÇÃO DA SENHA
// ==========================================

serviceForm.addEventListener("submit", event => {

    event.preventDefault();


    if (!isFormReady()) {

        if (selectedAvailability.size === 0) {

            selectionSummary.textContent =
                "Selecione pelo menos um horário para continuar.";

        }

        updateCreateButton();

        return;

    }


    confirmationPassword.value = "";

    passwordError.textContent = "";

    setInvalid(confirmationPassword, false);


    openDialog(passwordDialog);

    confirmationPassword.focus();

});


// ==========================================
// LEITURA DOS SERVIÇOS JÁ SALVOS
// ==========================================

function readSavedServices() {

    try {

        const raw =
            localStorage.getItem(STORAGE_KEY);


        if (!raw) {

            return [];

        }


        const parsed = JSON.parse(raw);


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.error(
            "Não foi possível ler os serviços salvos:",
            error
        );

        return null;

    }

}


// ==========================================
// CONSTRUIR REGISTRO DO SERVIÇO
// ==========================================

function buildServiceRecord() {

    const availability =
        [...selectedAvailability].map(key => {

            const {
                dayIndex,
                hourIndex
            } = parseSlotKey(key);


            const hour = HOURS[hourIndex];


            return {

                day: DAYS[dayIndex],

                dayIndex,

                start: hour.start,

                end: hour.end

            };

        }).sort((a, b) =>

            a.dayIndex - b.dayIndex ||
            a.start - b.start

        );


    const area = onlyDigits(phoneArea.value);

    const number = onlyDigits(phoneNumber.value);


    return {

        id: (
            typeof crypto !== "undefined" &&
            crypto.randomUUID
        )

            ? crypto.randomUUID()

            : `servico-${Date.now()}`,

        name: serviceName.value.trim(),

        minimumPrice: normalizePrice(
            servicePrice.value
        ),

        phone: area && number

            ? {
                areaCode: area,
                number
            }

            : null,

        description: serviceDescription.value.trim(),

        availability,

        createdAt: new Date().toISOString()

    };

}


// ==========================================
// SALVAR SERVIÇO LOCALMENTE
// ==========================================

function saveServiceLocally(service) {

    const services = readSavedServices();


    if (services === null) {

        throw new Error(
            "Os dados locais não puderam ser lidos. Verifique o armazenamento do navegador."
        );

    }


    services.push(service);


    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(services)
        );

    }

    catch (error) {

        console.error(
            "Erro ao salvar o serviço:",
            error
        );


        throw new Error(
            "Não foi possível salvar o serviço neste navegador. Verifique o espaço disponível e as permissões de armazenamento."
        );

    }

}


// ==========================================
// VERIFICAÇÃO DEMONSTRATIVA DA SENHA
// ==========================================

passwordForm.addEventListener("submit", event => {

    event.preventDefault();


    const typedPassword =
        confirmationPassword.value;


    if (!typedPassword) {

        passwordError.textContent =
            "Digite sua senha para continuar.";

        setInvalid(confirmationPassword, true);

        confirmationPassword.focus();

        return;

    }


    // A senha é comparada apenas à constante
    // de demonstração.
    //
    // Nenhuma senha é gravada no localStorage.

    if (typedPassword !== DEMO_PASSWORD) {

        passwordError.textContent =
            "Senha incorreta. Confira e tente novamente.";

        setInvalid(confirmationPassword, true);

        confirmationPassword.focus();

        return;

    }


    // Se a senha estiver correta, cria o serviço.

    try {

        const service = buildServiceRecord();

        saveServiceLocally(service);

        closeDialog(passwordDialog);

        showSuccess(service.name);

    }

    catch (error) {

        passwordError.textContent =
            error.message;

    }

});


confirmationPassword.addEventListener("input", () => {

    passwordError.textContent = "";

    setInvalid(confirmationPassword, false);

});


// ==========================================
// MODAL DE SUCESSO
// ==========================================

function showSuccess(serviceNameValue) {

    resultTitle.textContent =
        "SERVIÇO CRIADO!";


    resultMessage.textContent =

        `O serviço “${serviceNameValue}” foi salvo localmente neste navegador. A integração com o servidor será adicionada quando a API estiver pronta.`;


    openDialog(resultDialog);

}


resultClose.addEventListener("click", () => {

    closeDialog(resultDialog);

    // O serviço já está salvo.
    // Os dados permanecem na tela para revisão.

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
// LOGO
// ==========================================

// O menu principal ainda não foi implementado.

logoButton.addEventListener("click", event => {

    event.preventDefault();

});


// ==========================================
// INICIALIZAÇÃO
// ==========================================

createAvailabilityGrid();

updateSelectionSummary();

updateCreateButton();