
'use strict';

const { Prestador, Usuario, Cliente } = require('../models');

const {
    validarServicoPrestador
} = require('../validators/servicoPrestadorValidator');

const {
    verificarPermissaoCadastro
} = require('../validators/permissaoServico');

class prestadorController {
    async index(req, res) {
        try {
            const prestadores = await Prestador.findAll();

            return res.json(prestadores);
        } catch (erro) {
            return res.status(400).json({
                error: erro.message
            });
        }
    }

    async show(req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj);

            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado.'
                });
            }

            return res.json(prestador);
        } catch (erro) {
            return res.status(400).json({
                error: erro.message
            });
        }
    }

    async create(req, res) {
        try {
            if (!req.usuarioAutenticado) {
                return res.status(401).json({
                    error: 'Autenticação necessária para cadastrar prestador.'
                });
            }

            if (!verificarPermissaoCadastro(
                req.usuarioAutenticado,
                req.body?.id_usuario
            )) {
                return res.status(403).json({
                    error: 'Você não tem permissão para realizar este cadastro.'
                });
            }

            const resultado = validarServicoPrestador(req.body);

            if (!resultado.valido) {
                return res.status(400).json({
                    error: 'Dados do serviço inválidos.',
                    detalhes: resultado.erros
                });
            }

            const cliente = await Cliente.findOne({
                where: {
                    id_usuario: req.body.id_usuario
                }
            });

            if (cliente) {
                return res.status(409).json({
                    error: 'Este usuário já está registrado como cliente.'
                });
            }

            // Permite apenas os campos necessários ao cadastro.
            const dadosCadastro = {
                id_usuario: req.usuarioAutenticado.id,
                cnpj: req.body.cnpj,
                servicoPrestado: req.body.servicoPrestado.trim(),
                preco: req.body.preco
            };

            const novo = await Prestador.create(dadosCadastro);

            return res.status(201).json(novo);
        } catch (erro) {
            console.error('Erro ao cadastrar prestador:', erro.message);

            return res.status(400).json({
                error: 'Não foi possível cadastrar o prestador.'
            });
        }
    }

    async update(req, res) {
        try {
            if (!req.usuarioAutenticado) {
                return res.status(401).json({
                    error: 'Autenticação necessária para atualizar prestador.'
                });
            }

            const prestador = await Prestador.findByPk(req.params.cnpj);

            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado.'
                });
            }

            if (prestador.id_usuario !== req.usuarioAutenticado.id) {
                return res.status(403).json({
                    error: 'Você não tem permissão para atualizar este prestador.'
                });
            }

            const camposPermitidos = ['servicoPrestado', 'preco'];
            const dadosAtualizacao = {};

            for (const campo of camposPermitidos) {
                if (req.body?.[campo] !== undefined) {
                    dadosAtualizacao[campo] = req.body[campo];
                }
            }

            if (Object.keys(dadosAtualizacao).length === 0) {
                return res.status(400).json({
                    error: 'Informe um serviço ou preço para atualizar.'
                });
            }

            const resultado = validarServicoPrestador({
                servicoPrestado:
                    dadosAtualizacao.servicoPrestado ??
                    prestador.servicoPrestado,
                preco:
                    dadosAtualizacao.preco ??
                    prestador.preco
            });

            if (!resultado.valido) {
                return res.status(400).json({
                    error: 'Dados inválidos.',
                    detalhes: resultado.erros
                });
            }

            if (dadosAtualizacao.servicoPrestado !== undefined) {
                dadosAtualizacao.servicoPrestado =
                    dadosAtualizacao.servicoPrestado.trim();
            }

            await prestador.update(dadosAtualizacao);

            return res.json(prestador);
        } catch (erro) {
            console.error('Erro ao atualizar prestador:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao atualizar prestador.'
            });
        }
    }

    async destroy(req, res) {
        try {
            if (!req.usuarioAutenticado) {
                return res.status(401).json({
                    error: 'Autenticação necessária para excluir prestador.'
                });
            }

            const prestador = await Prestador.findByPk(req.params.cnpj);

            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado.'
                });
            }

            if (prestador.id_usuario !== req.usuarioAutenticado.id) {
                return res.status(403).json({
                    error: 'Você não tem permissão para excluir este prestador.'
                });
            }

            await prestador.destroy();

            return res.json({
                message: 'Prestador excluído com sucesso.'
            });
        } catch (erro) {
            console.error('Erro ao excluir prestador:', erro.message);

            return res.status(500).json({
                error: 'Erro interno ao excluir prestador.'
            });
        }
    }

    async showMore(req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj, {
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['nome', 'email']
                    }
                ]
            });

            if (!prestador) {
                return res.status(404).json({
                    erro: 'Prestador não encontrado'
                });
            }

            return res.json(prestador);
        } catch (erro) {
            return res.status(400).json({
                erro: erro.message
            });
        }
    }
}

module.exports = new prestadorController();
