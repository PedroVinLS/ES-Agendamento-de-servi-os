"use strict";

// ==========================================
// 1. CONFIGURAÇÕES DA API E DA AGENDA
// ==========================================

const API_BASE_URL =
    "https://studious-space-umbrella-r7g44j57475fpv75-3000.app.github.dev";

const days = [
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO"
];

const hours = Array.from(
    { length: 12 },
    (_, index) => ({
        start: index + 6,
        end: index + 7
    })
);

// ==========================================
// 2. ELEMENTOS HTML
// ==========================================

const board = document.getElementById("schedule-board");
const pageTitle = document.getElementById("page-title");

const bookingLocalInput = document.getElementById("booking-local");
const confirmButton = document.getElementById("confirm-button");
const cancelButton = document.getElementById("cancel-button");

const tutorialDialog = document.getElementById("tutorial-dialog");
const tutorialButton = document.getElementById("tutorial-button");

const cancelDialog = document.getElementById("cancel-dialog");

const cancelDialogMessage =
    document.getElementById("cancel-dialog-message");

const cancelDialogBack =
    document.getElementById("cancel-dialog-back");

const cancelDialogConfirm =
    document.getElementById("cancel-dialog-confirm");

const resultDialog = document.getElementById("result-dialog");

const resultDialogMessage =
    document.getElementById("result-dialog-message");

const resultDialogClose =
    document.getElementById("result-dialog-close");

// ==========================================
// 3. DADOS DA SESSÃO
// ==========================================

const token = sessionStorage.getItem("es_token");

let selectedService = null;

try {
    selectedService = JSON.parse(
        sessionStorage.getItem("app:selectedService") || "null"
    );
} catch (error) {
    console.error("Não foi possível recuperar o serviço selecionado.", error);
}

const urlParams = new URLSearchParams(window.location.search);
const currentProviderCnpj =
    urlParams.get("serviceId") ||
    selectedService?.cnpj ||
    selectedService?.id ||
    null;

const activeRole = sessionStorage.getItem("app:activeRole");

// ==========================================
// 4. ESTADOS
// ==========================================

const selectedSlots = new Set();
const bookedSlots = new Set();

const slotButtons = new Map();

// Reservas pertencentes ao usuário autenticado para este prestador.
let userBookings = [];

// Agendas retornadas pela API.
let agendas = [];

// Segunda-feira da semana atual.
function getMondayOfCurrentWeek() {
    const date = new Date();
    const day = date.getDay();

    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    date.setHours(0, 0, 0, 0);

    return date;
}

const weekStart = getMondayOfCurrentWeek();

// ==========================================
// 5. REQUISIÇÕES HTTP
// ==========================================

async function apiRequest(endpoint, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    if (options.body) {
        headers["Content-Type"] = "application/json";
    }

    if (token && options.auth !== false) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    const responseText = await response.text();

    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    if (!response.ok) {
        const message =
            typeof data === "object" && data !== null
                ? data.message || data.error
                : data;

        throw new Error(
            message || `Erro na requisição: HTTP ${response.status}`
        );
    }

    return data;
}

// ==========================================
// 6. FUNÇÕES AUXILIARES
// ==========================================

function formatHour(hour) {
    return `${hour}h`;
}

function slotKey(dayIndex, hourIndex) {
    return `${dayIndex}-${hourIndex}`;
}

function getSlotDate(dayIndex, hourIndex) {
    const date = new Date(weekStart);

    date.setDate(date.getDate() + dayIndex);
    date.setHours(hours[hourIndex].start, 0, 0, 0);

    return date;
}

function formatDateForApi(date) {
    return date.toISOString();
}

function createCell(className, text, row, col) {
    const element = document.createElement("div");

    element.className = className;

    if (text) {
        element.textContent = text;
    }

    element.style.gridRow = String(row);
    element.style.gridColumn = String(col);

    return element;
}

function getServiceId(service) {
    return service.id;
}

function showApiError(error, prefix = "Não foi possível concluir a operação.") {
    console.error(prefix, error);

    showSuccess(`${prefix}\n${error.message || "Verifique sua conexão e tente novamente."}`);
}

// ==========================================
// 7. NAVEGAÇÃO DO CABEÇALHO
// ==========================================

pageTitle.addEventListener("click", event => {
    event.preventDefault();
});

// ==========================================
// 8. CRIAÇÃO DA GRADE
// ==========================================

function createSchedule() {
    board.replaceChildren();
    slotButtons.clear();

    board.appendChild(
        createCell("corner-cell", "", 1, 1)
    );

    days.forEach((day, dayIndex) => {
        const heading = createCell(
            "day-heading",
            day,
            1,
            dayIndex + 2
        );

        heading.setAttribute("role", "columnheader");

        board.appendChild(heading);
    });

    hours.forEach((hour, hourIndex) => {
        const row = hourIndex + 2;

        const label = document.createElement("div");

        label.className = "time-heading";
        label.style.gridRow = String(row);
        label.style.gridColumn = "1";

        label.setAttribute("role", "rowheader");

        const start = document.createElement("span");
        start.textContent = formatHour(hour.start);

        const end = document.createElement("span");
        end.textContent = `até ${formatHour(hour.end)}`;

        label.append(start, end);
        board.appendChild(label);

        days.forEach((day, dayIndex) => {
            const key = slotKey(dayIndex, hourIndex);

            const button = document.createElement("button");

            button.type = "button";
            button.className = "slot";

            button.style.gridRow = String(row);
            button.style.gridColumn = String(dayIndex + 2);

            button.dataset.slotKey = key;
            button.dataset.day = day;
            button.dataset.start = String(hour.start);
            button.dataset.end = String(hour.end);
            button.dataset.date = formatDateForApi(
                getSlotDate(dayIndex, hourIndex)
            );

            button.setAttribute("role", "gridcell");
            button.setAttribute("aria-pressed", "false");

            button.title =
                `${day} — ${formatHour(hour.start)} até ${formatHour(hour.end)}`;

            button.addEventListener("click", () => {
                toggleSlot(key);
            });

            button.addEventListener("contextmenu", event => {
                event.preventDefault();
            });

            slotButtons.set(key, button);
            board.appendChild(button);
        });
    });

    updateInterface();
}

// ==========================================
// 9. CARREGAMENTO DAS RESERVAS
// ==========================================

async function loadBookings() {
    if (!token) {
        throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    const [agendaData, serviceData] = await Promise.all([
        apiRequest("/agenda", {
            method: "GET",
            auth: false
        }),

        apiRequest("/servico", {
            method: "GET"
        })
    ]);

    if (!Array.isArray(agendaData) || !Array.isArray(serviceData)) {
        throw new Error("A API retornou um formato de dados inesperado.");
    }

    agendas = agendaData;

    userBookings = currentProviderCnpj
        ? serviceData.filter(
            service => String(service.id_prestador) === String(currentProviderCnpj)
        )
        : serviceData;

    bookedSlots.clear();

    const agendaById = new Map(
        agendas.map(agenda => [
            String(agenda.id),
            agenda
        ])
    );

    userBookings.forEach(service => {
        const agenda = agendaById.get(String(service.id_agenda));

        if (!agenda || !agenda.horario) {
            return;
        }

        const appointmentDate = new Date(agenda.horario);

        if (Number.isNaN(appointmentDate.getTime())) {
            return;
        }

        const dayIndex =
            (appointmentDate.getDay() + 6) % 7;

        const hourIndex =
            appointmentDate.getHours() - 6;

        if (
            dayIndex < 0 ||
            dayIndex > 5 ||
            hourIndex < 0 ||
            hourIndex >= hours.length
        ) {
            return;
        }

        const appointmentWeek = new Date(appointmentDate);

        appointmentWeek.setHours(0, 0, 0, 0);

        const expectedDate = new Date(weekStart);
        expectedDate.setDate(expectedDate.getDate() + dayIndex);

        if (
            appointmentWeek.getTime() === expectedDate.getTime()
        ) {
            bookedSlots.add(slotKey(dayIndex, hourIndex));
        }
    });

    updateInterface();
}

// ==========================================
// 10. SELEÇÃO DOS HORÁRIOS
// ==========================================

function toggleSlot(key) {
    const button = slotButtons.get(key);

    if (!button || button.disabled || bookedSlots.has(key)) {
        return;
    }

    if (selectedSlots.has(key)) {
        selectedSlots.delete(key);
    } else {
        selectedSlots.add(key);
    }

    updateInterface();
}

// ==========================================
// 11. ATUALIZAÇÃO VISUAL
// ==========================================

function updateInterface() {
    const now = new Date();

    for (const [key, button] of slotButtons.entries()) {
        const isSelected = selectedSlots.has(key);
        const isBooked = bookedSlots.has(key);

        const slotDate = new Date(button.dataset.date);
        const isPast = slotDate <= now;

        button.classList.toggle(
            "is-selected",
            isSelected && !isBooked
        );

        button.classList.toggle("is-booked", isBooked);

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );

        if (isBooked) {
            button.disabled = true;

            button.innerHTML =
                '<span class="booked-label">Agendado!</span>';

            button.setAttribute(
                "aria-label",
                `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}, agendado`
            );

            button.title = "Você já possui um agendamento neste horário.";
        } else {
            button.disabled = isPast;

            button.textContent = "";

            const status = isPast
                ? "horário passado"
                : isSelected
                    ? "selecionado"
                    : "disponível para seleção";

            button.setAttribute(
                "aria-label",
                `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}, ${status}`
            );

            button.title =
                `${button.dataset.day} — ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}`;
        }
    }

    const hasSelection = selectedSlots.size > 0;
    const hasBookings = userBookings.length > 0;

    confirmButton.disabled = !hasSelection;

    cancelButton.disabled =
        !hasSelection && !hasBookings;

    confirmButton.setAttribute(
        "aria-disabled",
        String(!hasSelection)
    );

    cancelButton.setAttribute(
        "aria-disabled",
        String(cancelButton.disabled)
    );
}

// ==========================================
// 12. JANELAS MODAIS
// ==========================================

function openDialog(dialog) {
    if (typeof dialog.showModal === "function") {
        if (!dialog.open) {
            dialog.showModal();
        }
    } else {
        console.error(
            "Este navegador não oferece suporte a janelas modais HTML."
        );
    }
}

function showSuccess(message) {
    resultDialogMessage.textContent = message;
    openDialog(resultDialog);
}

// ==========================================
// 13. TUTORIAL INICIAL
// ==========================================

openDialog(tutorialDialog);

tutorialDialog.addEventListener("cancel", event => {
    event.preventDefault();
});

tutorialButton.addEventListener("click", () => {
    tutorialDialog.close();
});

// ==========================================
// 14. BOTÃO DE SUCESSO
// ==========================================

resultDialogClose.addEventListener("click", () => {
    resultDialog.close();
});

// ==========================================
// 15. CRIAÇÃO DA RESERVA NA API
// ==========================================

async function createBooking(key) {
    const button = slotButtons.get(key);

    if (!button) {
        throw new Error("Horário selecionado não encontrado.");
    }

    if (!token) {
        throw new Error("Faça login para realizar um agendamento.");
    }

    if (activeRole !== "cliente") {
        throw new Error("Somente clientes podem realizar agendamentos.");
    }

    if (!currentProviderCnpj) {
        throw new Error("Não foi possível identificar o prestador selecionado.");
    }

    const serviceLocal =
        bookingLocalInput?.value.trim() ||
        selectedService?.local?.trim() ||
        "";

    if (!serviceLocal) {
        if (bookingLocalInput) {
            bookingLocalInput.focus();
        }
        throw new Error(
            "Informe o local do atendimento antes de confirmar o agendamento."
        );
    }

    const horario = button.dataset.date;

    // Primeiro cria a agenda.
    const agendaCreated = await apiRequest("/agenda", {
        method: "POST",
        body: JSON.stringify({
            horario,
            local: serviceLocal
        })
    });

    if (!agendaCreated || !agendaCreated.id) {
        throw new Error("A API não retornou o identificador da agenda criada.");
    }

    try {
        // Depois vincula a agenda ao serviço reservado.
        await apiRequest("/servico", {
            method: "POST",
            body: JSON.stringify({
                id_prestador: currentProviderCnpj,
                id_agenda: agendaCreated.id
            })
        });
    } catch (error) {
        // Tenta remover somente a agenda criada nesta operação.
        try {
            await apiRequest(`/agenda/${agendaCreated.id}`, {
                method: "DELETE",
                auth: false
            });
        } catch (cleanupError) {
            console.error(
                "Não foi possível remover a agenda criada após a falha da reserva.",
                cleanupError
            );
        }

        throw error;
    }
}

// ==========================================
// 16. CONFIRMAR AGENDAMENTOS
// ==========================================

confirmButton.addEventListener("click", async () => {
    if (selectedSlots.size === 0) {
        return;
    }

    if (confirmButton.disabled) {
        return;
    }

    const localInformado =
        bookingLocalInput?.value.trim() ||
        selectedService?.local?.trim() ||
        "";

    if (!localInformado) {
        showSuccess("Informe o local do atendimento antes de confirmar o agendamento.");
        if (bookingLocalInput) {
            bookingLocalInput.focus();
        }
        return;
    }

    const slotsToBook = [...selectedSlots];

    confirmButton.disabled = true;
    cancelButton.disabled = true;

    let successCount = 0;
    const errors = [];

    for (const key of slotsToBook) {
        try {
            await createBooking(key);
            successCount++;
            selectedSlots.delete(key);
        } catch (error) {
            console.error("Falha ao reservar horário:", error);
            errors.push(error.message);
        }
    }

    try {
        await loadBookings();
    } catch (error) {
        console.error("Falha ao atualizar as reservas:", error);
    }

    updateInterface();

    if (successCount > 0 && errors.length === 0) {
        showSuccess(
            successCount === 1
                ? "Seu horário foi agendado com sucesso!"
                : `Seus ${successCount} horários foram agendados com sucesso!`
        );
    } else if (successCount > 0) {
        showSuccess(
            `${successCount} horário(s) agendado(s). Alguns horários não puderam ser reservados: ${errors.join(" | ")}`
        );
    } else {
        showSuccess(
            `Não foi possível realizar o agendamento: ${errors.join(" | ")}`
        );
    }
});

// ==========================================
// 17. BOTÃO CANCELAR
// ==========================================

cancelButton.addEventListener("click", () => {
    if (userBookings.length > 0) {
        const count = userBookings.length;

        const timeDescription = count === 1
            ? "1 agendamento"
            : `${count} agendamentos`;

        cancelDialogMessage.textContent =
            `Você tem certeza que deseja cancelar todos os ${timeDescription} deste serviço?`;

        openDialog(cancelDialog);
        return;
    }

    if (selectedSlots.size > 0) {
        selectedSlots.clear();
        updateInterface();
    }
});

// ==========================================
// 18. VOLTAR DO POP-UP DE CANCELAMENTO
// ==========================================

cancelDialogBack.addEventListener("click", () => {
    cancelDialog.close();
});

// ==========================================
// 19. CANCELAR RESERVAS NA API
// ==========================================

async function cancelAllBookings() {
    if (!token) {
        showSuccess("Sua sessão expirou. Faça login novamente.");
        cancelDialog.close();
        return;
    }

    const bookingsToCancel = [...userBookings];

    cancelDialogConfirm.disabled = true;

    let successCount = 0;
    const errors = [];

    for (const service of bookingsToCancel) {
        try {
            await apiRequest(
                `/servico/${encodeURIComponent(getServiceId(service))}`,
                {
                    method: "DELETE"
                }
            );

            successCount++;
        } catch (error) {
            console.error("Falha ao cancelar reserva:", error);
            errors.push(error.message);
        }
    }

    selectedSlots.clear();

    try {
        await loadBookings();
    } catch (error) {
        console.error("Falha ao atualizar as reservas:", error);
    }

    cancelDialog.close();
    cancelDialogConfirm.disabled = false;

    updateInterface();

    if (successCount > 0 && errors.length === 0) {
        showSuccess(
            successCount === 1
                ? "Agendamento cancelado com sucesso!"
                : `${successCount} agendamentos cancelados com sucesso!`
        );
    } else if (successCount > 0) {
        showSuccess(
            `${successCount} agendamento(s) cancelado(s). Alguns não puderam ser cancelados: ${errors.join(" | ")}`
        );
    } else {
        showSuccess(
            `Não foi possível cancelar os agendamentos: ${errors.join(" | ")}`
        );
    }
}

// ==========================================
// 20. CONFIRMAR CANCELAMENTO
// ==========================================

cancelDialogConfirm.addEventListener("click", () => {
    cancelAllBookings();
});

// ==========================================
// 21. INICIALIZAÇÃO
// ==========================================

async function initializeSchedule() {
    createSchedule();

    if (!token) {
        showSuccess(
            "Você precisa estar autenticado para consultar seus agendamentos."
        );
        return;
    }

    try {
        await loadBookings();
    } catch (error) {
        showApiError(
            error,
            "Não foi possível carregar seus agendamentos."
        );
    }
}

initializeSchedule();