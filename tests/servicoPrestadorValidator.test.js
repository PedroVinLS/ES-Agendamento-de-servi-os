
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    validarServicoPrestador
} = require('../validators/servicoPrestadorValidator');

function dadosValidos() {
    return {
        servicoPrestado: 'Corte masculino',
        preco: 25.50
    };
}

test('Aceita cadastro com dados válidos', () => {
    const resultado = validarServicoPrestador(dadosValidos());

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.erros, []);
});

test('Aceita preço mínimo de R$ 0,01', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        preco: 0.01
    });

    assert.equal(resultado.valido, true);
});

test('Recusa nome vazio', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        servicoPrestado: ''
    });

    assert.equal(resultado.valido, false);
});

test('Recusa nome com mais de 150 caracteres', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        servicoPrestado: 'A'.repeat(151)
    });

    assert.equal(resultado.valido, false);
});

test('Recusa preço igual a zero', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        preco: 0
    });

    assert.equal(resultado.valido, false);
});

test('Recusa preço negativo', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        preco: -10
    });

    assert.equal(resultado.valido, false);
});

test('Recusa preço com mais de duas casas decimais', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        preco: 25.555
    });

    assert.equal(resultado.valido, false);
});

test('Recusa preço acima do limite do banco', () => {
    const resultado = validarServicoPrestador({
        ...dadosValidos(),
        preco: 100000000
    });

    assert.equal(resultado.valido, false);
});

test('Recusa dados ausentes', () => {
    const resultado = validarServicoPrestador(null);

    assert.equal(resultado.valido, false);
});
