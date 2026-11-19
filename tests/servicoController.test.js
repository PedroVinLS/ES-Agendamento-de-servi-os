
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const controller = require('../controllers/servicoController');

function criarRespostaSimulada() {
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

const servicoValido = {
    name: 'Corte masculino',
    description: 'Corte de cabelo tradicional.',
    minimumPrice: 25.50,
    phone: null,
    availability: [
        { dayIndex: 0, start: 9, end: 10 }
    ]
};

test('Recusa cadastro sem autenticação', async () => {
    const req = { body: servicoValido };
    const res = criarRespostaSimulada();

    await controller.create(req, res);

    assert.equal(res.statusCode, 401);
});

test('Recusa serviço com preço inválido', async () => {
    const req = {
        usuarioAutenticado: { id: 1, tipo: 'prestador' },
        body: { ...servicoValido, minimumPrice: 0 }
    };

    const res = criarRespostaSimulada();

    await controller.create(req, res);

    assert.equal(res.statusCode, 400);
});

test('Recusa serviço sem nome', async () => {
    const req = {
        usuarioAutenticado: { id: 1, tipo: 'prestador' },
        body: { ...servicoValido, name: '' }
    };

    const res = criarRespostaSimulada();

    await controller.create(req, res);

    assert.equal(res.statusCode, 400);
});

test('Mantém cadastro bloqueado até a integração', async () => {
    const req = {
        usuarioAutenticado: { id: 1, tipo: 'prestador' },
        body: servicoValido
    };

    const res = criarRespostaSimulada();

    await controller.create(req, res);

    assert.equal(res.statusCode, 503);
});
