
'use strict';

const {
    Servico,
    Cliente,
    Prestador,
    Agenda
} = require('../models');

const { Op } = require('sequelize');

class servicoController {

    constructor() {
        this.index = this.index.bind(this);
        this.show = this.show.bind(this);
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.destroy = this.destroy.bind(this);
        this.showMore = this.showMore.bind(this);
    }

    /**
     * Identifica o perfil associado ao usuário autenticado.
     */
    async obterPerfilUsuario(idUsuario) {
        const cliente = await Cliente.findOne({
            where: { id_usuario: idUsuario }
        });

        const prestador = await Prestador.findOne({
            where: { id_usuario: idUsuario }
        });

        if (cliente && prestador) {
            return {
                erro: 'Usuário possui perfis conflitantes.'
            };
        }

        if (cliente) {
            return {
                tipo: 'cliente',
                dados: cliente
            };
        }

        if (prestador) {
            return {
                tipo: 'prestador',
                dados: prestador
            };
        }

        return null;
    }

    /**
     * Verifica se o serviço pertence ao usuário autenticado.
     */
    usuarioPodeAcessarServico(perfil, servico) {
        if (!perfil || !servico) {
            return false;
        }

        if (perfil.tipo === 'cliente') {
            return servico.id_cliente === perfil.dados.cpf;
        }

        if (perfil.tipo === 'prestador') {
            return servico.id_prestador === perfil.dados.cnpj;
        }

        return false;
    }

    /**
     * Verifica conflitos de horário conforme a RN-03.
     */
    async verificarConflito(
        idPrestador,
        idCliente,
        horario,
        idServicoIgnorado = null
    ) {
        const wherePrestador = {
            id_prestador: idPrestador
        };

        const whereCliente = {
            id_cliente: idCliente
        };

        if (idServicoIgnorado !== null) {
            wherePrestador.id = {
                [Op.ne]: idServicoIgnorado
            };

            whereCliente.id = {
                [Op.ne]: idServicoIgnorado
            };
        }

        const prestadorServico = await Servico.findOne({
            where: wherePrestador,
            include: [{
                model: Agenda,
                as: 'agenda',
                where: { horario },
                attributes: []
            }]
        });

        const clienteServico = await Servico.findOne({
            where: whereCliente,
            include: [{
                model: Agenda,
                as: 'agenda',
                where: { horario },
                attributes: []
            }]
        });

        return Boolean(prestadorServico || clienteServico);
    }

    /**
     * Lista somente os serviços do usuário autenticado.
     */
    async index(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            const where = perfil.tipo === 'cliente'
                ? { id_cliente: perfil.dados.cpf }
                : { id_prestador: perfil.dados.cnpj };

            const servicos = await Servico.findAll({ where });

            return res.json(servicos);

        } catch (erro) {
            console.error('Erro ao listar serviços:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao listar serviços.'
            });
        }
    }

    /**
     * Consulta um serviço verificando sua titularidade.
     */
    async show(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({
                    error: 'Serviço não encontrado.'
                });
            }

            if (!this.usuarioPodeAcessarServico(perfil, servico)) {
                return res.status(403).json({
                    error: 'Você não tem permissão para acessar este serviço.'
                });
            }

            return res.json(servico);

        } catch (erro) {
            console.error('Erro ao consultar serviço:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao consultar serviço.'
            });
        }
    }

    /**
     * Cria um serviço para o cliente autenticado.
     */
    async create(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            if (perfil.tipo !== 'cliente') {
                return res.status(403).json({
                    error: 'Somente clientes podem criar agendamentos.'
                });
            }

            const {
                id_prestador,
                id_agenda,
                tag,
                descricao
            } = req.body || {};

            if (
                typeof id_prestador !== 'string' ||
                !id_prestador.trim()
            ) {
                return res.status(400).json({
                    error: 'Informe um prestador válido.'
                });
            }

            if (
                !Number.isSafeInteger(id_agenda) ||
                id_agenda <= 0
            ) {
                return res.status(400).json({
                    error: 'Informe uma agenda válida.'
                });
            }

            const prestador = await Prestador.findByPk(
                id_prestador.trim()
            );

            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado.'
                });
            }

            const agenda = await Agenda.findByPk(id_agenda);

            if (!agenda) {
                return res.status(404).json({
                    error: 'Agenda não encontrada.'
                });
            }

            const existeConflito = await this.verificarConflito(
                prestador.cnpj,
                perfil.dados.cpf,
                agenda.horario
            );

            if (existeConflito) {
                return res.status(409).json({
                    error: 'Este prestador ou cliente já possui um serviço registrado neste horário.'
                });
            }

            // O CPF vem do cadastro do usuário autenticado.
            // Não utilizamos id_cliente enviado pelo frontend.
            const dadosServico = {
                id_cliente: perfil.dados.cpf,
                id_prestador: prestador.cnpj,
                id_agenda: agenda.id,
                descricao
            };

            if (tag !== undefined) {
                dadosServico.tag = tag;
            }

            const novo = await Servico.create(dadosServico);

            return res.status(201).json(novo);

        } catch (erro) {
            console.error('Erro ao criar serviço:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao criar serviço.'
            });
        }
    }

    /**
     * Atualiza horário ou local de um serviço próprio.
     */
    async update(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({
                    error: 'Serviço não encontrado.'
                });
            }

            if (!this.usuarioPodeAcessarServico(perfil, servico)) {
                return res.status(403).json({
                    error: 'Você não tem permissão para alterar este serviço.'
                });
            }

            const corpo = req.body || {};

            const informouHorario =
                Object.prototype.hasOwnProperty.call(
                    corpo,
                    'horario'
                );

            const informouLocal =
                Object.prototype.hasOwnProperty.call(
                    corpo,
                    'local'
                );

            if (!informouHorario && !informouLocal) {
                return res.status(400).json({
                    error: 'Informe um horário ou local novo.'
                });
            }

            const agenda = await Agenda.findByPk(servico.id_agenda);

            if (!agenda) {
                return res.status(404).json({
                    error: 'Agenda não encontrada.'
                });
            }

            const novosDados = {};

            if (informouHorario) {
                if (
                    typeof corpo.horario !== 'string' ||
                    !corpo.horario.trim() ||
                    Number.isNaN(Date.parse(corpo.horario))
                ) {
                    return res.status(400).json({
                        error: 'Informe um horário válido.'
                    });
                }

                const existeConflito = await this.verificarConflito(
                    servico.id_prestador,
                    servico.id_cliente,
                    corpo.horario,
                    servico.id
                );

                if (existeConflito) {
                    return res.status(409).json({
                        error: 'Este prestador ou cliente já possui um serviço registrado neste horário.'
                    });
                }

                novosDados.horario = corpo.horario;
            }

            if (informouLocal) {
                if (
                    typeof corpo.local !== 'string' ||
                    !corpo.local.trim()
                ) {
                    return res.status(400).json({
                        error: 'Informe um local válido.'
                    });
                }

                novosDados.local = corpo.local.trim();
            }

            await agenda.update(novosDados);

            const retorno = await Servico.findByPk(servico.id, {
                include: [{
                    model: Agenda,
                    as: 'agenda'
                }]
            });

            return res.json(retorno);

        } catch (erro) {
            console.error('Erro ao atualizar serviço:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao atualizar serviço.'
            });
        }
    }

    /**
     * Exclui somente um serviço pertencente ao usuário autenticado.
     */
    async destroy(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({
                    error: 'Serviço não encontrado.'
                });
            }

            if (!this.usuarioPodeAcessarServico(perfil, servico)) {
                return res.status(403).json({
                    error: 'Você não tem permissão para excluir este serviço.'
                });
            }

            await servico.destroy();

            return res.json({
                message: 'Serviço excluído com sucesso.'
            });

        } catch (erro) {
            console.error('Erro ao excluir serviço:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao excluir serviço.'
            });
        }
    }

    /**
     * Consulta detalhes de um serviço próprio.
     */
    async showMore(req, res) {
        try {
            const perfil = await this.obterPerfilUsuario(
                req.usuarioAutenticado.id
            );

            if (!perfil || perfil.erro) {
                return res.status(403).json({
                    error: perfil?.erro ||
                        'Usuário sem perfil cadastrado.'
                });
            }

            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({
                    error: 'Serviço não encontrado.'
                });
            }

            if (!this.usuarioPodeAcessarServico(perfil, servico)) {
                return res.status(403).json({
                    error: 'Você não tem permissão para acessar este serviço.'
                });
            }

            const detalhes = await Servico.findByPk(req.params.id, {
                include: [
                    {
                        model: Cliente,
                        as: 'cliente',
                        attributes: ['cpf']
                    },
                    {
                        model: Prestador,
                        as: 'prestador',
                        attributes: [
                            'cnpj',
                            'servicoPrestado',
                            'preco',
                            'avaliacao'
                        ]
                    },
                    {
                        model: Agenda,
                        as: 'agenda',
                        attributes: ['horario', 'local']
                    }
                ]
            });

            return res.json(detalhes);

        } catch (erro) {
            console.error('Erro ao consultar detalhes:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao consultar detalhes do serviço.'
            });
        }
    }
}

module.exports = new servicoController();
