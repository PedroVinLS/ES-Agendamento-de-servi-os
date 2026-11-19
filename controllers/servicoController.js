'use strict';

const { Servico, Cliente, Prestador, Agenda } = require('../models');

const {
    validarCadastroServico
} = require('../validators/servicoValidator');

class servicoController {
    async index (req, res) {
        try {
            const servicos = await Servico.findAll();

            return res.json(servicos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);
            
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            return res.json(servico);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create(req, res) {
        try {
            // A autenticação deverá fornecer a identidade
            // do usuário por um middleware confiável.
            if (!req.usuarioAutenticado) {
                return res.status(401).json({
                    error: 'Autenticação necessária para cadastrar serviços.'
                });
            }

            // Verifica os dados recebidos.
            const resultado = validarCadastroServico(req.body);

            if (!resultado.valido) {
                return res.status(400).json({
                    error: 'Dados inválidos.',
                    detalhes: resultado.erros
                });
            }

        // PENDENTE:
        // 1. Confirmar no banco que o usuário é prestador.
        // 2. Associar o serviço ao prestador autenticado.
        // 3. Adequar o modelo Servico à HU-02.1.
        // 4. Executar Servico.create() com campos permitidos.
        //
        // Não liberar a gravação antes dessas etapas.

            return res.status(503).json({
                error: 'Cadastro indisponível até a conclusão da autenticação e da modelagem.'
            });

        } catch (erro) {
            console.error('Erro ao cadastrar serviço:', erro);

            return res.status(500).json({
                error: 'Erro interno ao processar o cadastro.'
            });
        }
    }
    
    async update (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            await servico.update(req.body);
            
            return res.json(servico);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            await servico.destroy();
            
            return res.json({ message: 'Serviço excluído com sucesso.' });
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async showMore (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id, {
                include: [
                    {model: Cliente, as: 'cliente'},
                    {model: Prestador, as: 'prestador'},
                    {model: Agenda, as: 'agenda'}
                ]
            });

            if (!servico) {
                return res.status(404).json({ erro: 'Serviço não encontrado'});
            }

            return res.json(servico);
        } catch (erro) {
            return res.status(400).json({erro: erro.message});
        }
    }
}

module.exports = new servicoController();