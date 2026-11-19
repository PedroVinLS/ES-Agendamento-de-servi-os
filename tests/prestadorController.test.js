
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


test('Recusa atualização de outro prestador', async (t) => {
    let atualizou = false;

    t.mock.method(Prestador, 'findByPk', async () => ({
        id_usuario: 8,
        servicoPrestado: 'Corte masculino',
        preco: 25.50,
        update: async () => {
            atualizou = true;
        }
    }));

    const req = {
        usuarioAutenticado: { id: 1 },
        params: { cnpj: '12345678000190' },
        body: { preco: 30 }
    };

    const res = criarResposta();

    await controller.update(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(atualizou, false);
});

test('Permite atualização do próprio prestador', async (t) => {
    let dadosAtualizados = null;

    const prestador = {
        id_usuario: 1,
        servicoPrestado: 'Corte masculino',
        preco: 25.50,
        async update(dados) {
            dadosAtualizados = dados;
            Object.assign(this, dados);
        }
    };

    t.mock.method(Prestador, 'findByPk', async () => prestador);

    const req = {
        usuarioAutenticado: { id: 1 },
        params: { cnpj: '12345678000190' },
        body: { preco: 30 }
    };

    const res = criarResposta();

    await controller.update(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(dadosAtualizados, { preco: 30 });
});

test('Recusa exclusão de outro prestador', async (t) => {
    let excluiu = false;

    t.mock.method(Prestador, 'findByPk', async () => ({
        id_usuario: 8,
        destroy: async () => {
            excluiu = true;
        }
    }));

    const req = {
        usuarioAutenticado: { id: 1 },
        params: { cnpj: '12345678000190' }
    };

    const res = criarResposta();

    await controller.destroy(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(excluiu, false);
});

test('Permite exclusão do próprio prestador', async (t) => {
    let excluiu = false;

    t.mock.method(Prestador, 'findByPk', async () => ({
        id_usuario: 1,
        destroy: async () => {
            excluiu = true;
        }
    }));

    const req = {
        usuarioAutenticado: { id: 1 },
        params: { cnpj: '12345678000190' }
    };

    const res = criarResposta();

    await controller.destroy(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(excluiu, true);
});
