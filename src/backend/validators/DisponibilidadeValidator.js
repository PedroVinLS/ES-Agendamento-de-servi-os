
/**
 * HU-01.1 — Regras para intervalos de disponibilidade de um prestador.
 *
 * Contrato de entrada:
 * { prestadorId, data: 'AAAA-MM-DD', inicio: 'HH:MM', fim: 'HH:MM' }
 * Dias aceitos: segunda a sabado. Horarios: de 06:00 a 18:00,
 * em limites de hora cheia. Intervalos adjacentes sao permitidos.
 */
class DisponibilidadeValidator {
  static validarPrestadorId(prestadorId) {
    const valido =
      (typeof prestadorId === 'string' && prestadorId.trim().length > 0) ||
      (typeof prestadorId === 'number' && Number.isSafeInteger(prestadorId) && prestadorId > 0);

    if (!valido) {
      throw new Error('prestadorId deve ser uma string nao vazia ou um inteiro positivo.');
    }
    return prestadorId;
  }

  static validarData(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      throw new Error('A data deve estar no formato AAAA-MM-DD.');
    }

    const objetoData = new Date(`${data}T00:00:00.000Z`);
    if (Number.isNaN(objetoData.getTime()) || objetoData.toISOString().slice(0, 10) !== data) {
      throw new Error('A data informada nao existe no calendario.');
    }

    return objetoData;
  }

  static converterHorarioEmMinutos(horario) {
    if (typeof horario !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
      throw new Error('Horario invalido. Use HH:MM no formato de 24 horas.');
    }

    const [hora, minutos] = horario.split(':').map(Number);
    return hora * 60 + minutos;
  }

  static validarPeriodo(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw new Error('Informe os dados da disponibilidade em um objeto.');
    }

    const { prestadorId, data, inicio, fim } = dados;
    this.validarPrestadorId(prestadorId);
    const dia = this.validarData(data);

    if (dia.getUTCDay() === 0) {
      throw new Error('O calendario desta fatia atende de segunda-feira a sabado.');
    }

    const minutoInicio = this.converterHorarioEmMinutos(inicio);
    const minutoFim = this.converterHorarioEmMinutos(fim);

    if (minutoInicio < 6 * 60 || minutoFim > 18 * 60 || minutoInicio >= minutoFim) {
      throw new Error('O periodo deve comecar antes de terminar e estar entre 06:00 e 18:00.');
    }

    if (minutoInicio % 60 !== 0 || minutoFim % 60 !== 0) {
      throw new Error('Os horarios devem comecar e terminar em hora cheia.');
    }

    return { prestadorId, data, inicio, fim };
  }

  static existeSobreposicao(novoPeriodo, periodosExistentes) {
    if (!Array.isArray(periodosExistentes)) {
      throw new Error('A lista de disponibilidades existentes deve ser um array.');
    }

    return periodosExistentes.some(periodo => {
      if (
        String(periodo.prestadorId) !== String(novoPeriodo.prestadorId) ||
        periodo.data !== novoPeriodo.data
      ) {
        return false;
      }

      const novoInicio = this.converterHorarioEmMinutos(novoPeriodo.inicio);
      const novoFim = this.converterHorarioEmMinutos(novoPeriodo.fim);
      const existenteInicio = this.converterHorarioEmMinutos(periodo.inicio);
      const existenteFim = this.converterHorarioEmMinutos(periodo.fim);

      // 08-10 e 10-12 nao se sobrepoem.
      return novoInicio < existenteFim && novoFim > existenteInicio;
    });
  }

  static validarCadastro(dados, periodosExistentes = []) {
    const periodo = this.validarPeriodo(dados);

    if (this.existeSobreposicao(periodo, periodosExistentes)) {
      const erro = new Error('Ja existe uma disponibilidade sobreposta para esse prestador e data.');
      erro.code = 'CONFLITO_DISPONIBILIDADE';
      throw erro;
    }

    return periodo;
  }
}

module.exports = DisponibilidadeValidator;
