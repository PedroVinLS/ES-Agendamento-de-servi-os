
'use strict';

// Define um segredo exclusivo para o processo de testes,
// caso JWT_SECRET ainda não esteja definido.
process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'segredo-exclusivo-para-testes-com-mais-de-32-caracteres';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const app = require('../app');

const {
    Usuario,
    Cliente,
    Prestador,
    Servico
} = require('../models');

const usuarioCliente = {
    id: 1
};

const cliente = {
    id: 1,
    id_usuario: 1,
    cpf: '12345678901'
};

const prestador = {
    id: 2,
    id_usuario: 2,
    cnpj: '12345678000190'
};

function gerarToken(idUsuario) {
    return jwt.sign(
        {},
        process.env.JWT_SECRET,
        {
            subject: String(idUsuario),
            expiresIn: '1h',
            algorithm: 'HS256'
        }
    );
}

test('Integração HTTP das rotas de serviço', async (t) => {
    let clienteAtual = cliente;
    let prestadorAtual = null;

    const servidor = app.listen(0);

    await new Promise((resolve, reject) => {
        servidor.once('listening', resolve);
        servidor.once('error', reject);
    });

    t.after(async () => {
        servidor.closeAllConnections();

        await new Promise((resolve, reject) => {
            servidor.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    });

    const endereco = servidor.address();
    const baseURL = `http://127.0.0.1:${endereco.port}`;

    // Mocks dos models utilizados pelas rotas e controllers.
    t.mock.method(
        Usuario,
        'findByPk',
        async (id) => ({
            id: Number(id)
        })
    );

    t.mock.method(
        Cliente,
        'findOne',
        async () => clienteAtual
    );

    t.mock.method(
        Prestador,
        'findOne',
        async () => prestadorAtual
    );

    t.mock.method(
        Servico,
        'findAll',
        async () => []
    );

    await t.test('Deve rejeitar requisição sem token', async () => {
        const resposta = await fetch(`${baseURL}/servico`);

        assert.equal(resposta.status, 401);
    });

    await t.test('Deve rejeitar token inválido', async () => {
        const resposta = await fetch(`${baseURL}/servico`, {
            headers: {
                Authorization: 'Bearer token-invalido'
            }
        });

        assert.equal(resposta.status, 401);
    });

    await t.test('Deve permitir consulta com token válido de cliente', async () => {
        clienteAtual = cliente;
        prestadorAtual = null;

        const token = gerarToken(usuarioCliente.id);

        const resposta = await fetch(`${baseURL}/servico`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        assert.equal(resposta.status, 200);

        const dados = await resposta.json();

        assert.ok(dados !== undefined);
    });

    await t.test('Deve impedir prestador de criar agendamento', async () => {
        clienteAtual = null;
        prestadorAtual = prestador;

        const token = gerarToken(prestador.id_usuario);

        const resposta = await fetch(`${baseURL}/servico`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        assert.equal(resposta.status, 403);
    });
});
