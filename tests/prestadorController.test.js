
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const controller = require('../controllers/prestadorController');
const { Prestador, Cliente } = require('../models');

function criarResposta() {
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

function dadosValidos() {
    return {
        id_usuario: 1,
        cnpj: '12345678000190',
        servicoPrestado: 'Corte masculino',
        preco: 25.50
    };
}

test('Recusa preço inválido antes de consultar o banco', async (t) => {
    let consultouBanco = false;

    t.mock.method(Cliente, 'findOne', async () => {
        consultouBanco = true;
        return null;
    });

    const req = {
        usuarioAutenticado: { id: 1 },
        body: { ...dadosValidos(), preco: 0 }
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(consultouBanco, false);
    assert.match(res.dados.detalhes.join(' '), /preço/i);
});

test('Recusa serviço sem nome antes de consultar o banco', async (t) => {
    let consultouBanco = false;

    t.mock.method(Cliente, 'findOne', async () => {
        consultouBanco = true;
        return null;
    });

    const req = {
        usuarioAutenticado: { id: 1 },
        body: { ...dadosValidos(), servicoPrestado: '' }
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(consultouBanco, false);
    assert.match(res.dados.detalhes.join(' '), /serviço/i);
});

test('Recusa cadastro quando usuário já é cliente', async (t) => {
    t.mock.method(Cliente, 'findOne', async () => ({
        cpf: '12345678901'
    }));

    const req = {
        usuarioAutenticado: { id: 1 },
        body: dadosValidos()
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 409);
});

test('Cadastra prestador com dados válidos na lógica atual', async (t) => {
    const dados = dadosValidos();
    let dadosRecebidos = null;

    t.mock.method(Cliente, 'findOne', async () => null);

    t.mock.method(Prestador, 'create', async (entrada) => {
        dadosRecebidos = entrada;
        return { ...entrada };
    });

    const req = {
        usuarioAutenticado: { id: 1 },
        body: dados
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(dadosRecebidos, dados);
});

test('Recusa cadastro sem autenticação', async (t) => {
    let consultouBanco = false;

    t.mock.method(Cliente, 'findOne', async () => {
        consultouBanco = true;
        return null;
    });

    const req = {
        body: dadosValidos()
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(consultouBanco, false);
});

test('Recusa cadastro em nome de outro usuário', async (t) => {
    let consultouBanco = false;

    t.mock.method(Cliente, 'findOne', async () => {
        consultouBanco = true;
        return null;
    });

    const req = {
        usuarioAutenticado: { id: 1 },
        body: {
            ...dadosValidos(),
            id_usuario: 8
        }
    };

    const res = criarResposta();

    await controller.create(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(consultouBanco, false);
});
