
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const controller = require('../controllers/servicoController');
const { Servico, Agenda } = require('../models');

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
        id_cliente: '12345678901',
        id_prestador: '12345678000190',
        id_agenda: 1,
        descricao: 'Corte masculino'
    };
}

test('Recusa horário ocupado pelo prestador', async (t) => {
    t.mock.method(Agenda, 'findByPk', async () => ({
        id: 1,
        horario: new Date('2026-12-01T14:00:00Z')
    }));

    t.mock.method(Servico, 'findOne', async (consulta) => {
        if (consulta.where.id_prestador) {
            return { id: 10 };
        }

        return null;
    });

    const criar = t.mock.method(
        Servico,
        'create',
        async () => ({ id: 1 })
    );

    const res = criarResposta();

    await controller.create({ body: dadosValidos() }, res);

    assert.equal(res.statusCode, 409);
    assert.equal(criar.mock.callCount(), 0);
});

test('Recusa horário ocupado pelo cliente', async (t) => {
    t.mock.method(Agenda, 'findByPk', async () => ({
        id: 1,
        horario: new Date('2026-12-01T14:00:00Z')
    }));

    t.mock.method(Servico, 'findOne', async (consulta) => {
        if (consulta.where.id_cliente) {
            return { id: 11 };
        }

        return null;
    });

    const criar = t.mock.method(
        Servico,
        'create',
        async () => ({ id: 1 })
    );

    const res = criarResposta();

    await controller.create({ body: dadosValidos() }, res);

    assert.equal(res.statusCode, 409);
    assert.equal(criar.mock.callCount(), 0);
});

test('Registra atendimento quando o horário está livre', async (t) => {
    const dados = dadosValidos();

    t.mock.method(Agenda, 'findByPk', async () => ({
        id: 1,
        horario: new Date('2026-12-01T14:00:00Z')
    }));

    t.mock.method(Servico, 'findOne', async () => null);

    const criar = t.mock.method(
        Servico,
        'create',
        async (entrada) => ({
            id: 20,
            ...entrada
        })
    );

    const res = criarResposta();

    await controller.create({ body: dados }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(criar.mock.callCount(), 1);
    assert.deepEqual(criar.mock.calls[0].arguments[0], dados);
    assert.equal(res.dados.id, 20);
});
