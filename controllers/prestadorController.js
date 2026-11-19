'use strict';

const { Prestador, Usuario, Cliente } = require('../models');

const {
    validarServicoPrestador
} = require('../validators/servicoPrestadorValidator');

const {
    verificarPermissaoCadastro
} = require('../validators/permissaoServico');

class prestadorController {
    async index (req, res) {
        try {
            const prestadores = await Prestador.findAll();

            return res.json(prestadores);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj);
            
            if (!prestador) {
                return res.status(404).json({ error: 'Prestador não encontrado.'});
            }

            return res.json(prestador);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
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
                where: { id_usuario: req.body.id_usuario }
            });

            if (cliente) {
                return res.status(409).json({
                    error: 'Este usuário já está registrado como cliente.'
                });
            }

            const novo = await Prestador.create(req.body);

            return res.status(201).json(novo);
            } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }
    
    async update (req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj);

            if (!prestador) {
                return res.status(404).json({ error: 'Prestador não encontrado.'});
            }

            await prestador.update(req.body);
            
            return res.json(prestador);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj);

            if (!prestador) {
                return res.status(404).json({ error: 'Prestador não encontrado.'});
            }

            await prestador.destroy();
            
            return res.json({ message: 'Prestador excluído com sucesso.' });
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async showMore (req, res) {
        try {
            const prestador = await Prestador.findByPk(req.params.cnpj, {
                include: [
                    {model: Usuario, as: 'usuario', attributes: ['nome', 'email']}
                ]
            });

            if (!prestador) {
                return res.status(404).json({ erro: 'Prestador não encontrado'});
            }

            return res.json(prestador);
        } catch (erro) {
            return res.status(400).json({erro: erro.message});
        }
    }
}

module.exports = new prestadorController();