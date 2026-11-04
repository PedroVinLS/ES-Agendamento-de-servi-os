'use strict';

const { Prestador } = require('../models');

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

    async create (req, res) {
        try {
            const novo = await Prestador.create(req.body);

            return res.status(201).json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
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
}

module.exports = new prestadorController();