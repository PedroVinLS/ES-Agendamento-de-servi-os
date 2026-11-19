
'use strict';

const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

async function autenticarUsuario(req, res, next) {
    const autorizacao = req.headers?.authorization;

    if (
        typeof autorizacao !== 'string' ||
        !/^Bearer \S+$/i.test(autorizacao)
    ) {
        return res.status(401).json({
            error: 'Token de autenticação necessário.'
        });
    }

    if (
        !process.env.JWT_SECRET ||
        process.env.JWT_SECRET.length < 32
    ) {
        return res.status(503).json({
            error: 'Autenticação indisponível.'
        });
    }

    const token = autorizacao.replace(/^Bearer /i, '');

    let payload;

    try {
        payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256']
        });
    } catch (erro) {
        return res.status(401).json({
            error: 'Token inválido ou expirado.'
        });
    }

    const id = Number(payload.sub);

    if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        String(id) !== payload.sub
    ) {
        return res.status(401).json({
            error: 'Identidade inválida.'
        });
    }

    try {
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(401).json({
                error: 'Usuário não encontrado ou sessão inválida.'
            });
        }

        req.usuarioAutenticado = {
            id: usuario.id
        };

        return next();
    } catch (erro) {
        console.error('Erro ao verificar autenticação:', erro.message);

        return res.status(500).json({
            error: 'Erro interno de autenticação.'
        });
    }
}

module.exports = autenticarUsuario;
