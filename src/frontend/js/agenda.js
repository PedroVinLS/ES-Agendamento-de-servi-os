
"use strict";

// ==========================================
// 1. CONFIGURAÇÃO DA API
// ==========================================

// Ajuste para a porta e o endereço usados pela equipe da API.
const API_BASE_URL = "http://localhost:3000/api";

// Substitua pelo ID real do prestador.
const PRESTADOR_ID = "1";

// Informe a segunda-feira da semana que será exibida.
// Substitua pela data escolhida no sistema.
const WEEK_START_DATE = "2026-10-26";

// Rotas ilustrativas: confirmar com a equipe da API.
const ROTAS = {
  consultarAgenda: "/agenda",
  cadastrarDisponibilidade: "/agenda"
};

// ==========================================
// 2. ESTRUTURA DA AGENDA
// ==========================================

const days = [
  "SEGUNDA-FEIRA",
  "TERÇA-FEIRA",
  "QUARTA-FEIRA",
  "QUINTA-FEIRA",
  "SEXTA-FEIRA",
  "SÁBADO"
];

const hours = Array.from({ length: 12 }, (_, index) => ({
  start: index + 6,
  end: index + 7
}));

const board = document.getElementById("schedule-board");
const confirmButton = document.getElementById("confirm-button");
const cancelButton = document.getElementById("cancel-button");
const resultDialog = document.getElementById("result-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogMessage = document.getElementById("dialog-message");
const dialogClose = document.getElementById("dialog-close");

// Estado da interface
const selectedSlots = new Set();
const bookedSlots = new Set();
const slotButtons = new Map();

let isLoading = false;
let isSaving = false;

// ==========================================
// 3. FUNÇÕES AUXILIARES
// ==========================================

function formatHour(hour) {
  return `${hour}h`;
}

function formatTime(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

function getDateForDay(dayIndex) {
  const date = new Date(`${WEEK_START_DATE}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + dayIndex);
  return date.toISOString().slice(0, 10);
}

function slotKey(dayIndex, hourIndex) {
  return `${dayIndex}-${hourIndex}`;
}

function getSlotData(key) {
  const [dayIndex, hourIndex] = key.split("-").map(Number);
  const hour = hours[hourIndex];

  return {
    prestadorId: PRESTADOR_ID,
    data: getDateForDay(dayIndex),
    diaSemana: days[dayIndex],
    inicio: formatTime(hour.start),
    fim: formatTime(hour.end)
  };
}

async function requestAPI(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const texto = await response.text();
  let resultado = {};

  if (texto) {
    try {
      resultado = JSON.parse(texto);
    } catch {
      resultado = { mensagem: texto };
    }
  }

  if (!response.ok) {
    throw new Error(
      resultado.erro ||
      resultado.message ||
      resultado.mensagem ||
      `Erro na API: ${response.status}`
    );
  }

  return resultado;
}

// ==========================================
// 4. MONTAGEM DA AGENDA NA TELA
// ==========================================

function createCell(className, text, row, col) {
  const element = document.createElement("div");
  element.className = className;

  if (text) element.textContent = text;
  if (row !== undefined) element.style.gridRow = String(row);
  if (col !== undefined) element.style.gridColumn = String(col);

  return element;
}

function createSchedule() {
  board.replaceChildren();
  slotButtons.clear();

  board.appendChild(createCell("corner-cell", "", 1, 1));

  days.forEach((day, dayIndex) => {
    const heading = createCell("day-heading", day, 1, dayIndex + 2);
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
      button.dataset.date = getDateForDay(dayIndex);
      button.dataset.start = String(hour.start);
      button.dataset.end = String(hour.end);

      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-pressed", "false");
      button.title =
        `${day} — ${formatHour(hour.start)} até ${formatHour(hour.end)}`;

      button.addEventListener("click", () => toggleSlot(key));
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
// 5. SELEÇÃO DOS HORÁRIOS
// ==========================================

function toggleSlot(key) {
  if (isLoading || isSaving || bookedSlots.has(key)) return;

  if (selectedSlots.has(key)) {
    selectedSlots.delete(key);
  } else {
    selectedSlots.add(key);
  }

  updateInterface();
}

function updateInterface() {
  for (const [key, button] of slotButtons.entries()) {
    const isSelected = selectedSlots.has(key);
    const isBooked = bookedSlots.has(key);

    button.classList.toggle("is-selected", isSelected && !isBooked);
    button.classList.toggle("is-booked", isBooked);

    button.setAttribute("aria-pressed", String(isSelected));

    if (isBooked) {
      button.disabled = true;
      button.innerHTML = '<span class="booked-label">Agendado!</span>';

      button.setAttribute(
        "aria-label",
        `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} ` +
        `até ${formatHour(Number(button.dataset.end))}, agendado`
      );

      button.title = "Este horário já foi agendado";
    } else {
      button.disabled = isLoading || isSaving;
      button.textContent = "";

      const status = isSelected ? "selecionado" : "disponível";

      button.setAttribute(
        "aria-label",
        `${button.dataset.day}, ${formatHour(Number(button.dataset.start))} ` +
        `até ${formatHour(Number(button.dataset.end))}, ${status}`
      );

      button.title =
        `${button.dataset.day} — ` +
        `${formatHour(Number(button.dataset.start))} até ` +
        `${formatHour(Number(button.dataset.end))}`;
    }
  }

  const hasSelection = selectedSlots.size > 0;

  confirmButton.disabled = !hasSelection || isLoading || isSaving;
  cancelButton.disabled = !hasSelection || isLoading || isSaving;

  confirmButton.setAttribute(
    "aria-disabled",
    String(confirmButton.disabled)
  );

  cancelButton.setAttribute(
    "aria-disabled",
    String(cancelButton.disabled)
  );
}

// ==========================================
// 6. MENSAGENS AO USUÁRIO
// ==========================================

function openMessage(title, message) {
  dialogTitle.textContent = title;
  dialogMessage.textContent = message;

  if (typeof resultDialog.showModal === "function") {
    resultDialog.showModal();
  } else {
    window.alert(`${title}\n\n${message}`);
  }
}

// ==========================================
// 7. BUSCAR OS DADOS DA API
// ==========================================

async function carregarAgenda() {
  isLoading = true;
  updateInterface();

  try {
    const inicio = getDateForDay(0);
    const fim = getDateForDay(5);

    const query = new URLSearchParams({
      prestadorId: PRESTADOR_ID,
      dataInicio: inicio,
      dataFim: fim
    });

    const resultado = await requestAPI(
      `${ROTAS.consultarAgenda}?${query.toString()}`
    );

    // Contrato esperado:
    // { horarios: [{ data, inicio, fim, status }] }
    const horarios =
      Array.isArray(resultado) ? resultado :
      resultado.horarios || resultado.disponibilidades || [];

    bookedSlots.clear();

    for (const horario of horarios) {
      const status = String(horario.status || "").toUpperCase();

      if (!["AGENDADO", "BOOKED", "OCUPADO"].includes(status)) {
        continue;
      }

      const dayIndex = Array.from(
        { length: 6 },
        (_, index) => getDateForDay(index)
      ).indexOf(String(horario.data).slice(0, 10));

      const inicioHorario = String(horario.inicio).slice(0, 5);
      const hourIndex = hours.findIndex(
        hour => formatTime(hour.start) === inicioHorario
      );

      if (
        dayIndex >= 0 &&
        dayIndex < 6 &&
        hourIndex >= 0
      ) {
        bookedSlots.add(slotKey(dayIndex, hourIndex));
      }
    }

    updateInterface();
  } catch (erro) {
    console.error("Erro ao carregar a agenda:", erro);

    openMessage(
      "Erro ao carregar a agenda",
      "Não foi possível consultar os horários na API. " +
      "Verifique se o servidor está funcionando e se a rota está correta."
    );
  } finally {
    isLoading = false;
    updateInterface();
  }
}

// ==========================================
// 8. ENVIAR OS HORÁRIOS PARA A API
// ==========================================

async function confirmarHorarios() {
  if (selectedSlots.size === 0 || isSaving || isLoading) return;

  const selecionados = Array.from(selectedSlots);
  let confirmados = 0;
  const erros = [];

  isSaving = true;
  updateInterface();

  try {
    // Envia cada horário separadamente.
    for (const key of selecionados) {
      const dados = getSlotData(key);

      try {
        await requestAPI(ROTAS.cadastrarDisponibilidade, {
          method: "POST",
          body: JSON.stringify(dados)
        });

        // Só marca como agendado após sucesso da API.
        bookedSlots.add(key);
        selectedSlots.delete(key);
        confirmados++;
      } catch (erro) {
        erros.push(`${dados.data}, ${dados.inicio}: ${erro.message}`);
      }

      updateInterface();
    }

    if (confirmados > 0) {
      const palavra = confirmados === 1 ? "horário" : "horários";

      openMessage(
        erros.length ? "Agendamento parcial" : "Agendamento realizado!",
        `${confirmados} ${palavra} confirmado(s) com sucesso.` +
        (erros.length
          ? `\n\nNão foi possível confirmar ${erros.length} horário(s).`
          : "")
      );
    } else {
      openMessage(
        "Não foi possível agendar",
        erros[0] || "A API não confirmou nenhum horário."
      );
    }

    // Atualiza os dados a partir do servidor.
    await carregarAgenda();
  } catch (erro) {
    console.error("Erro ao confirmar horários:", erro);

    openMessage(
      "Erro",
      "Ocorreu um problema ao enviar os horários para a API."
    );
  } finally {
    isSaving = false;
    updateInterface();
  }
}

// ==========================================
// 9. EVENTOS DOS BOTÕES
// ==========================================

confirmButton.addEventListener("click", confirmarHorarios);

cancelButton.addEventListener("click", () => {
  if (isSaving || isLoading) return;

  selectedSlots.clear();
  updateInterface();
});

dialogClose.addEventListener("click", () => {
  resultDialog.close();
});

resultDialog.addEventListener("click", event => {
  if (event.target === resultDialog) {
    resultDialog.close();
  }
});

// ==========================================
// 10. INICIALIZAÇÃO
// ==========================================

createSchedule();
carregarAgenda();
