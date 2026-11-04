'use strict';

const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

class usuarioController {
    async index (req, res) {
        try {
            const usuarios = await Usuario.findAll({
                attributes: { excludes: ['senha'] }
        });
            return res.json(usuarios);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id, {
                attributes: { exclude: ['senha'] }
            });

            if (!usuario) {
                return res.status(404).json({ error: "Usuário não encontrado."});
            }

            return res.json(usuario);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const dados = {...req.body};

            if (!dados.senha) {
                return res.status(400).json({ error: 'A senha é obrigatória.'});
            }

            dados.senha = await bcrypt.hash(dados.senha, 10);

            const novo = await Usuario.create(dados);

            const resposta = novo.toJSON();
            delete resposta.senha;

            return res.status(201).json(resposta);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);

            if(!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado'});
            }

            const dados = {...req.body};

            if (dados.senha) {
                dados.senha = await bcrypt.hash(dados.senha, 10);
            } else {
                delete dados.senha;
            }

            await usuario.update(dados);

            const resposta = usuario.toJSON();
            delete resposta.senha;

            return res.json(resposta);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const usuario = await Usuario.findByPk(req.params.id);

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.'});
            }

            await usuario.destroy();  

            return res.json({ message: 'Usuário excluído com sucesso.'});
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new usuarioController();