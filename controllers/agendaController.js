'use strict';

const { Agenda } = require('../models');

class agendaController {
    async index (req, res) {
        try {
            const agendas = await Agenda.findAll();

            return res.json(agendas);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const agenda = await Agenda.findByPk(req.params.id);
            
            if (!agenda) {
                return res.status(404).json({ error: 'Horário não encontrado.'});
            }

            return res.json(agenda);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Agenda.create(req.body);

            return res.status(201).json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const agenda = await Agenda.findByPk(req.params.id);

            if (!agenda) {
                return res.status(404).json({ error: 'Horário não encontrado.'});
            }

            await agenda.update(req.body);
            
            return res.json(agenda);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const agenda = await Agenda.findByPk(req.params.id);

            if (!agenda) {
                return res.status(404).json({ error: 'Horário não encontrado.'});
            }

            await agenda.destroy();
            
            return res.json({ message: 'Horário excluído com sucesso.' });
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new agendaController();