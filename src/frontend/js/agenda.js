"use strict";


// ==========================================
// 1. CONFIGURAÇÕES DA AGENDA
// ==========================================

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

const logoButton = document.getElementById("logo-button");
const pageTitle = document.getElementById("page-title");

const confirmButton = document.getElementById("confirm-button");
const cancelButton = document.getElementById("cancel-button");


/* Tutorial inicial */

const tutorialDialog = document.getElementById("tutorial-dialog");

const tutorialButton = document.getElementById("tutorial-button");


/* Pop-up de cancelamento */

const cancelDialog = document.getElementById("cancel-dialog");

const cancelDialogMessage =
    document.getElementById("cancel-dialog-message");

const cancelDialogBack =
    document.getElementById("cancel-dialog-back");

const cancelDialogConfirm =
    document.getElementById("cancel-dialog-confirm");


/* Pop-up de sucesso */

const resultDialog = document.getElementById("result-dialog");

const resultDialogMessage =
    document.getElementById("result-dialog-message");

const resultDialogClose =
    document.getElementById("result-dialog-close");


// ==========================================
// 3. NAVEGAÇÃO DO CABEÇALHO
// ==========================================

// A logo ainda não possui uma página de destino.

logoButton.addEventListener("click", event => {

    event.preventDefault();

});


// O título também não possui uma página de destino.

pageTitle.addEventListener("click", event => {

    event.preventDefault();

});


// ==========================================
// 4. ESTADOS DOS AGENDAMENTOS
// ==========================================

// Horários que o usuário selecionou,
// mas ainda não confirmou.

const selectedSlots = new Set();


// Horários que já foram confirmados.

const bookedSlots = new Set();


// Guarda os elementos HTML de cada horário.

const slotButtons = new Map();


// ==========================================
// 5. FUNÇÕES AUXILIARES
// ==========================================

function formatHour(hour) {

    return `${hour}h`;

}


function slotKey(dayIndex, hourIndex) {

    return `${dayIndex}-${hourIndex}`;

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


// ==========================================
// 6. CRIAÇÃO DA GRADE
// ==========================================

function createSchedule() {

    board.replaceChildren();

    slotButtons.clear();


    // CÉLULA VAZIA DO CANTO SUPERIOR ESQUERDO

    board.appendChild(
        createCell("corner-cell", "", 1, 1)
    );


    // CABEÇALHOS DOS DIAS

    days.forEach((day, dayIndex) => {

        const heading = createCell(
            "day-heading",
            day,
            1,
            dayIndex + 2
        );

        heading.setAttribute(
            "role",
            "columnheader"
        );

        board.appendChild(heading);

    });


    // LINHAS DE HORÁRIOS

    hours.forEach((hour, hourIndex) => {

        const row = hourIndex + 2;


        // ETIQUETA DO HORÁRIO

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


        // CÉLULAS DOS DIAS

        days.forEach((day, dayIndex) => {

            const key = slotKey(dayIndex, hourIndex);

            const button = document.createElement("button");

            button.type = "button";

            button.className = "slot";


            button.style.gridRow = String(row);

            button.style.gridColumn = String(dayIndex + 2);


            // Informações associadas à célula.

            button.dataset.slotKey = key;

            button.dataset.day = day;

            button.dataset.start = String(hour.start);

            button.dataset.end = String(hour.end);


            button.setAttribute("role", "gridcell");

            button.setAttribute("aria-pressed", "false");

            button.setAttribute(
                "aria-label",
                `${day}, ${formatHour(hour.start)} até ${formatHour(hour.end)}, disponível`
            );


            button.title =
                `${day} — ${formatHour(hour.start)} até ${formatHour(hour.end)}`;


            // CLIQUE: seleciona ou desmarca o horário.

            button.addEventListener("click", () => {

                toggleSlot(key);

            });


            // Evita o menu de contexto do botão direito.

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
// 7. SELEÇÃO DOS HORÁRIOS
// ==========================================

function toggleSlot(key) {

    // Impede selecionar horários já confirmados.

    if (bookedSlots.has(key)) {

        return;

    }


    // Caso a célula já esteja selecionada,
    // remove a seleção.

    if (selectedSlots.has(key)) {

        selectedSlots.delete(key);

    }

    // Caso contrário, adiciona a seleção.

    else {

        selectedSlots.add(key);

    }


    updateInterface();

}


// ==========================================
// 8. ATUALIZAÇÃO VISUAL DA AGENDA
// ==========================================

function updateInterface() {

    for (const [key, button] of slotButtons.entries()) {

        const isSelected = selectedSlots.has(key);

        const isBooked = bookedSlots.has(key);


        // Atualiza o estado visual da célula.

        button.classList.toggle(
            "is-selected",
            isSelected && !isBooked
        );

        button.classList.toggle(
            "is-booked",
            isBooked
        );


        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );


        // ==================================
        // HORÁRIO JÁ AGENDADO
        // ==================================

        if (isBooked) {

            button.disabled = true;

            button.innerHTML =
                '<span class="booked-label">Agendado!</span>';


            button.setAttribute(
                "aria-label",
                `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}, agendado`
            );


            button.title = "Este horário já foi agendado";

        }


        // ==================================
        // HORÁRIO DISPONÍVEL
        // ==================================

        else {

            button.disabled = false;

            button.textContent = "";


            const status = isSelected
                ? "selecionado"
                : "disponível";


            button.setAttribute(
                "aria-label",
                `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}, ${status}`
            );


            button.title =
                `${button.dataset.day} — ${formatHour(Number(button.dataset.start))} até ${formatHour(Number(button.dataset.end))}`;

        }

    }


    // ======================================
    // ATUALIZAÇÃO DOS BOTÕES
    // ======================================

    const hasSelection = selectedSlots.size > 0;

    const hasBookings = bookedSlots.size > 0;


    // CONFIRMAR:
    // Só fica ativo quando existe seleção.

    confirmButton.disabled = !hasSelection;


    // CANCELAR:
    // Fica ativo quando há seleções temporárias
    // ou horários já confirmados.

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
// 9. ABRIR POP-UPS
// ==========================================

function openDialog(dialog) {

    if (typeof dialog.showModal === "function") {

        if (!dialog.open) {

            dialog.showModal();

        }

    }

    else {

        console.error(
            "Este navegador não oferece suporte a janelas modais HTML."
        );

    }

}


// ==========================================
// 10. TUTORIAL INICIAL
// ==========================================

// O tutorial aparece sempre que a página é carregada.

openDialog(tutorialDialog);


// Impede fechar o tutorial pressionando ESC.
// O usuário deverá clicar em ENTENDIDO.

tutorialDialog.addEventListener("cancel", event => {

    event.preventDefault();

});


// Botão ENTENDIDO.

tutorialButton.addEventListener("click", () => {

    tutorialDialog.close();

});


// ==========================================
// 11. POP-UP DE SUCESSO
// ==========================================

function showSuccess(message) {

    resultDialogMessage.textContent = message;

    openDialog(resultDialog);

}


// Botão ENTENDIDO do pop-up de sucesso.

resultDialogClose.addEventListener("click", () => {

    resultDialog.close();

});


// ==========================================
// 12. CONFIRMAR AGENDAMENTO
// ==========================================

confirmButton.addEventListener("click", () => {

    // Não executa nada caso nenhuma célula esteja selecionada.

    if (selectedSlots.size === 0) {

        return;

    }


    // Quantidade de horários escolhidos.

    const confirmedCount = selectedSlots.size;


    // Transfere os horários selecionados
    // para a lista de horários confirmados.

    for (const key of selectedSlots) {

        bookedSlots.add(key);

    }


    // Remove a seleção temporária.

    selectedSlots.clear();


    // Atualiza a aparência da agenda e dos botões.

    updateInterface();


    // Mensagem de sucesso.

    const message = confirmedCount === 1

        ? "Seu horário foi agendado com sucesso!"

        : `Seus ${confirmedCount} horários foram agendados com sucesso!`;


    showSuccess(message);

});


// ==========================================
// 13. BOTÃO CANCELAR AGENDAMENTO
// ==========================================

cancelButton.addEventListener("click", () => {


    // CASO 1:
    // EXISTEM HORÁRIOS JÁ CONFIRMADOS.

    if (bookedSlots.size > 0) {

        const count = bookedSlots.size;


        // Monta a mensagem dinamicamente.

        const timeDescription = count === 1

            ? "1 horário agendado"

            : `${count} horários agendados`;


        cancelDialogMessage.textContent =

            `Você tem certeza que deseja cancelar todos os ${timeDescription}?`;


        // Abre a janela de confirmação.

        openDialog(cancelDialog);

        return;

    }


    // CASO 2:
    // EXISTEM SOMENTE SELEÇÕES TEMPORÁRIAS.

    if (selectedSlots.size > 0) {

        // Remove todas as seleções.

        selectedSlots.clear();


        // Atualiza os botões e a agenda.

        updateInterface();

    }

});


// ==========================================
// 14. BOTÃO VOLTAR DO POP-UP
// ==========================================

// Fecha o pop-up sem modificar os agendamentos.

cancelDialogBack.addEventListener("click", () => {

    cancelDialog.close();

});


// ==========================================
// 15. CONFIRMAR CANCELAMENTO
// ==========================================

function cancelAllBookings() {

    // Remove todos os horários confirmados.

    bookedSlots.clear();


    // Também remove qualquer seleção temporária.

    selectedSlots.clear();


    // Atualiza a aparência da agenda.

    updateInterface();


    // Fecha a janela de confirmação.

    cancelDialog.close();

}


// ==========================================
// 16. BOTÃO CANCELAR DO POP-UP
// ==========================================

cancelDialogConfirm.addEventListener("click", () => {

    cancelAllBookings();

});


// Pressionar ESC ou fechar a janela pelo navegador
// não altera os agendamentos.
// O comportamento é equivalente ao botão VOLTAR.


// ==========================================
// 17. INICIALIZAÇÃO
// ==========================================

// Cria a agenda assim que o JavaScript é executado.

createSchedule();
