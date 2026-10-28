
const DisponibilidadeValidator = require('../validators/DisponibilidadeValidator');

/**
 * HU-01.1 — Cadastro e consulta da disponibilidade do prestador.
 *
 * Sem repositorio: guarda os dados SOMENTE em memoria para testes locais.
 * Com repositorio: espera funcoes assincronas:
 *   repositorio.listar(prestadorId, dataInicio, dataFim)
 *   repositorio.criar({ prestadorId, data, inicio, fim })
 * O repositorio e sua conexao com o banco pertencem a outra equipe.
 */
class DisponibilidadeService {
  constructor(repositorio = null) {
    this.repositorio = repositorio;
    this.registrosTemporarios = [];
    this.proximoIdTemporario = 1;
  }

  async listarDisponibilidades(prestadorId, dataInicio = null, dataFim = null) {
    DisponibilidadeValidator.validarPrestadorId(prestadorId);

    if (dataInicio !== null) DisponibilidadeValidator.validarData(dataInicio);
    if (dataFim !== null) DisponibilidadeValidator.validarData(dataFim);
    if (dataInicio !== null && dataFim !== null && dataInicio > dataFim) {
      throw new Error('dataInicio nao pode ser posterior a dataFim.');
    }

    const registros = this.repositorio
      ? await this.repositorio.listar(prestadorId, dataInicio, dataFim)
      : this.registrosTemporarios;

    if (!Array.isArray(registros)) {
      throw new Error('O repositorio deve retornar uma lista de disponibilidades.');
    }

    return registros
      .filter(periodo =>
        String(periodo.prestadorId) === String(prestadorId) &&
        (dataInicio === null || periodo.data >= dataInicio) &&
        (dataFim === null || periodo.data <= dataFim)
      )
      .map(periodo => ({ ...periodo }))
      .sort((a, b) => a.data.localeCompare(b.data) || a.inicio.localeCompare(b.inicio));
  }

  async registrarDisponibilidade(dados) {
    const novoPeriodo = DisponibilidadeValidator.validarPeriodo(dados);
    const existentes = await this.listarDisponibilidades(
      novoPeriodo.prestadorId,
      novoPeriodo.data,
      novoPeriodo.data
    );
    DisponibilidadeValidator.validarCadastro(novoPeriodo, existentes);

    if (this.repositorio) {
      return this.repositorio.criar(novoPeriodo);
    }

    // Implementacao apenas para testes: nenhum dado e salvo em banco.
    const registro = { id: this.proximoIdTemporario++, ...novoPeriodo };
    this.registrosTemporarios.push(registro);
    return { ...registro };
  }
}

module.exports = DisponibilidadeService;
