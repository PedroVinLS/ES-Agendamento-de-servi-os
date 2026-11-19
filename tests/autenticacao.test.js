
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const { Usuario } = require('../models');
const { login } = require('../controllers/autenticacaoController');
const autenticarUsuario = require('../middlewares/autenticarUsuario');

function respostaSimulada() {
    return {
        statusCode: 200,
        dados: null,

        status(codigo) {
            this.statusCode = codigo;
            return this;
        },

        json(dados) {
            this.dados = dados;
            return this;
        }
    };
}

function usuarioSimulado(senhaHash) {
    return {
        id: 1,
        nome: 'Usuario Teste',
        email: 'teste@exemplo.com',
        senha: senhaHash
    };
}

test('Login aceita credenciais corretas', async (t) => {
    const hash = await bcrypt.hash('SenhaSegura123', 4);

    t.mock.method(Usuario, 'findOne', async () =>
        usuarioSimulado(hash)
    );

    const req = {
        body: {
            email: 'teste@exemplo.com',
            senha: 'SenhaSegura123'
        }
    };

    const res = respostaSimulada();

    await login(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(typeof res.dados.token, 'string');
    assert.equal(res.dados.usuario.id, 1);
    assert.equal(res.dados.usuario.senha, undefined);

    const payload = jwt.verify(
        res.dados.token,
        process.env.JWT_SECRET,
        { algorithms: ['HS256'] }
    );

    assert.equal(payload.sub, '1');
});

test('Login recusa senha incorreta', async (t) => {
    const hash = await bcrypt.hash('SenhaCorreta123', 4);

    t.mock.method(Usuario, 'findOne', async () =>
        usuarioSimulado(hash)
    );

    const req = {
        body: {
            email: 'teste@exemplo.com',
            senha: 'SenhaErrada123'
        }
    };

    const res = respostaSimulada();

    await login(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.dados.token, undefined);
});

test('Login recusa campos ausentes', async () => {
    const req = { body: {} };
    const res = respostaSimulada();

    await login(req, res);

    assert.equal(res.statusCode, 400);
});

test('Middleware recusa requisição sem token', async () => {
    const req = { headers: {} };
    const res = respostaSimulada();
    let proximo = false;

    await autenticarUsuario(req, res, () => {
        proximo = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(proximo, false);
});

test('Middleware recusa token inválido', async () => {
    const req = {
        headers: {
            authorization: 'Bearer token-invalido'
        }
    };

    const res = respostaSimulada();
    let proximo = false;

    await autenticarUsuario(req, res, () => {
        proximo = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(proximo, false);
});

test('Middleware recusa token expirado', async () => {
    const token = jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            subject: '1',
            expiresIn: -1
        }
    );

    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    const res = respostaSimulada();

    await autenticarUsuario(req, res, () => {
        assert.fail('Token expirado não pode ser aceito.');
    });

    assert.equal(res.statusCode, 401);
});

test('Middleware aceita token válido e identifica usuário', async (t) => {
    const token = jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            subject: '1',
            expiresIn: '1h'
        }
    );

    t.mock.method(Usuario, 'findByPk', async () => ({
        id: 1
    }));

    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    const res = respostaSimulada();
    let proximo = false;

    await autenticarUsuario(req, res, () => {
        proximo = true;
    });

    assert.equal(proximo, true);
    assert.deepEqual(req.usuarioAutenticado, { id: 1 });
});
