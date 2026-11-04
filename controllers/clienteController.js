'use strict';

const { Cliente } = require('../models');

class clienteController {
    async index (req, res) {
        try {
            const clientes = await Cliente.findAll();

            return res.json(clientes);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.cpf);
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado.'});
            }

            return res.json(cliente);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Cliente.create(req.body);

            return res.status(201).json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.cpf);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado.'});
            }

            await cliente.update(req.body);
            
            return res.json(cliente);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.cpf);

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado.'});
            }

            await cliente.destroy();
            
            return res.json({ message: 'Cliente excluído com sucesso.' });
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new clienteController();