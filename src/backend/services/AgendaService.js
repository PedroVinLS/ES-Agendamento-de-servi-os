
const DisponibilidadeValidator = require('../validators/DisponibilidadeValidator');

/**
 * HU-01.1 — Gera a grade semanal e combina com a disponibilidade do prestador.
 *
 * A agenda so indica se o prestador OFERTOU aquele periodo.
 * Verificar reservas/ocupacao e responsabilidade de outra fatia/integracao.
 */
class AgendaService {
  constructor(disponibilidadeService) {
    if (
      !disponibilidadeService ||
      typeof disponibilidadeService.listarDisponibilidades !== 'function'
    ) {
      throw new Error('Informe uma instancia de DisponibilidadeService.');
    }
    this.disponibilidadeService = disponibilidadeService;
  }

  static gerarHorarios() {
    const horarios = [];

    for (let hora = 6; hora < 18; hora++) {
      horarios.push({
        inicio: `${String(hora).padStart(2, '0')}:00`,
        fim: `${String(hora + 1).padStart(2, '0')}:00`
      });
    }

    return horarios;
  }

  static gerarAgendaSemanal(dataSegunda) {
    const diasSemana = [
      'segunda-feira',
      'terca-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sabado'
    ];

    const segunda = DisponibilidadeValidator.validarData(dataSegunda);
    if (segunda.getUTCDay() !== 1) {
      throw new Error('Informe uma segunda-feira para iniciar a agenda.');
    }

    return diasSemana.map((diaSemana, indice) => {
      const dataAtual = new Date(segunda.getTime());
      dataAtual.setUTCDate(dataAtual.getUTCDate() + indice);

      return {
        diaSemana,
        data: dataAtual.toISOString().slice(0, 10),
        horarios: this.gerarHorarios()
      };
    });
  }

  async obterAgendaSemanal(prestadorId, dataSegunda) {
    DisponibilidadeValidator.validarPrestadorId(prestadorId);
    const dias = AgendaService.gerarAgendaSemanal(dataSegunda);

    const disponibilidades = await this.disponibilidadeService.listarDisponibilidades(
      prestadorId,
      dias[0].data,
      dias[dias.length - 1].data
    );

    return {
      prestadorId,
      semanaInicio: dias[0].data,
      semanaFim: dias[dias.length - 1].data,
      dias: dias.map(dia => ({
        ...dia,
        horarios: dia.horarios.map(horario => ({
          ...horario,
          // Indica se o prestador ofereceu o horario, sem checar reservas.
          disponivel: disponibilidades.some(periodo =>
            periodo.data === dia.data &&
            horario.inicio >= periodo.inicio &&
            horario.fim <= periodo.fim
          )
        }))
      }))
    };
  }
}

module.exports = AgendaService;
