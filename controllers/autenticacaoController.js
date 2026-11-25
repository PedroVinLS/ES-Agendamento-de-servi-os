
'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function login(req, res) {
    try {
        const { email, senha } = req.body || {};

        if (
            typeof email !== 'string' ||
            typeof senha !== 'string' ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                error: 'Informe e-mail e senha.'
            });
        }

        console.log('JWT carregada:', Boolean(process.env.JWT_SECRET));
        console.log('Tamanho da JWT:', process.env.JWT_SECRET?.length ?? 0);

        if (!process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32) {
            console.error('JWT_SECRET não configurada corretamente.');
            return res.status(503).json({
                error: 'Autenticação indisponível.'
            });
        }

        const usuario = await Usuario.findOne({
            where: { email: email.trim() }
        });

        const senhaCorreta = usuario
            ? await bcrypt.compare(senha, usuario.senha)
            : false;

        if (!senhaCorreta) {
            return res.status(401).json({
                error: 'E-mail ou senha inválidos.'
            });
        }

        const token = jwt.sign(
            {},
            process.env.JWT_SECRET,
            {
                algorithm: 'HS256',
                subject: String(usuario.id),
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            token,
            tipo: 'Bearer',
            expiraEm: 3600,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (erro) {
        console.error('Erro interno no login:', erro.message);

        return res.status(500).json({
            error: 'Erro interno ao realizar login.'
        });
    }
}

module.exports = { login };
