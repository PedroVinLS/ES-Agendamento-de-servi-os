
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
    verificarPermissaoCadastro
} = require('../validators/permissaoServico');

test('Permite cadastro pelo próprio usuário', () => {
    const usuario = { id: 5 };

    assert.equal(
        verificarPermissaoCadastro(usuario, 5),
        true
    );
});

test('Recusa cadastro em nome de outro usuário', () => {
    const usuario = { id: 5 };

    assert.equal(
        verificarPermissaoCadastro(usuario, 8),
        false
    );
});

test('Recusa usuário não autenticado', () => {
    assert.equal(
        verificarPermissaoCadastro(null, 5),
        false
    );
});

test('Recusa identidade inválida', () => {
    assert.equal(
        verificarPermissaoCadastro({ id: -1 }, 5),
        false
    );
});

test('Recusa identificador solicitado inválido', () => {
    assert.equal(
        verificarPermissaoCadastro({ id: 5 }, '5'),
        false
    );
});
