'use strict';

const { Servico, Cliente, Prestador, Agenda } = require('../models');

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

    async create (req, res) {
        try {
            const novo = await Servico.create(req.body);

            return res.status(201).json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
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