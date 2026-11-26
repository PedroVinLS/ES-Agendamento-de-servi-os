'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { randomInt, randomUUID } = require('node:crypto');

function numeroAleatorio(tamanho) {
    return String(randomInt(0, 10 ** tamanho)).padStart(tamanho, '0');
}

test(
    'Integridade referencial e restrições do MariaDB',
    { skip: process.env.ENV_FILE !== '.env.test' },
    async (t) => {
        const {
            sequelize,
            Usuario,
            Cliente,
            Prestador,
            Agenda,
        } = require('../models');

        const queryInterface = sequelize.getQueryInterface();
        let transaction;

        t.after(async () => {
            try {
                if (transaction && !transaction.finished) {
                    await transaction.rollback();
                }
            } finally {
                await sequelize.close();
            }
        });

        assert.equal(sequelize.config.database, 'sistema_servicos_test');
        assert.equal(sequelize.config.username, 'sistema_test');
        assert.equal(sequelize.config.host, '127.0.0.1');

        await sequelize.authenticate();
        transaction = await sequelize.transaction();

        const criarUsuario = (nome) =>
            Usuario.create(
                {
                    nome,
                    email: `${randomUUID()}@teste.invalid`,
                    senha: 'senha-ficticia',
                },
                { transaction },
            );

        const usuarioCliente = await criarUsuario('Cliente de teste');
        const usuarioPrestador = await criarUsuario('Prestador de teste');
        const usuarioPreco = await criarUsuario('Teste de preço');
        const usuarioAvaliacao = await criarUsuario('Teste de avaliação');

        const cpf = numeroAleatorio(11);
        const cnpj = numeroAleatorio(14);

        const cliente = await Cliente.create(
            {
                id_usuario: usuarioCliente.id,
                cpf,
                observacoes: 'Teste',
            },
            { transaction },
        );

        const prestador = await Prestador.create(
            {
                id_usuario: usuarioPrestador.id,
                cnpj,
                servicoPrestado: 'Serviço de teste',
                preco: 75,
                avaliacao: 5,
            },
            { transaction },
        );

        const agenda = await Agenda.create(
            {
                horario: new Date('2030-01-10T12:00:00-03:00'),
                local: 'Local de teste',
            },
            { transaction },
        );

        // Gera um ID que não existe na tabela USUARIO.
        const [usuarios] = await sequelize.query(
            'SELECT COALESCE(MAX(id), 0) + 1000 AS id FROM USUARIO',
            { transaction },
        );

        const usuarioInexistente = Number(usuarios[0].id);

        // Confirma que o ID realmente não existe.
        assert.equal(
            await Usuario.findByPk(usuarioInexistente, { transaction }),
            null,
        );

        await t.test('Rejeita prestador com usuário inexistente', async () => {
            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'PRESTADOR',
                        [
                            {
                                id_usuario: usuarioInexistente,
                                cnpj: numeroAleatorio(14),
                                servicoPrestado: 'Teste',
                                preco: 50,
                                avaliacao: 0,
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });

        await t.test('Rejeita preço abaixo de R$ 0,01', async () => {
            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'PRESTADOR',
                        [
                            {
                                id_usuario: usuarioPreco.id,
                                cnpj: numeroAleatorio(14),
                                servicoPrestado: 'Teste',
                                preco: '0.00',
                                avaliacao: 0,
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });

        await t.test('Rejeita avaliação superior a 5', async () => {
            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'PRESTADOR',
                        [
                            {
                                id_usuario: usuarioAvaliacao.id,
                                cnpj: numeroAleatorio(14),
                                servicoPrestado: 'Teste',
                                preco: '50.00',
                                avaliacao: 6,
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });

        await t.test('Rejeita serviço com cliente inexistente', async () => {
            const cpfInexistente = numeroAleatorio(11);

            assert.equal(
                await Cliente.findByPk(cpfInexistente, { transaction }),
                null,
            );

            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'SERVICO',
                        [
                            {
                                id_cliente: cpfInexistente,
                                id_prestador: prestador.cnpj,
                                id_agenda: agenda.id,
                                tag: 'Teste',
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });

        await t.test('Rejeita serviço com prestador inexistente', async () => {
            const cnpjInexistente = numeroAleatorio(14);

            assert.equal(
                await Prestador.findByPk(cnpjInexistente, { transaction }),
                null,
            );

            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'SERVICO',
                        [
                            {
                                id_cliente: cliente.cpf,
                                id_prestador: cnpjInexistente,
                                id_agenda: agenda.id,
                                tag: 'Teste',
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });

        await t.test('Rejeita serviço com agenda inexistente', async () => {
            const [agendas] = await sequelize.query(
                'SELECT COALESCE(MAX(id), 0) + 1000 AS id FROM AGENDA',
                { transaction },
            );

            const agendaInexistente = Number(agendas[0].id);

            assert.equal(
                await Agenda.findByPk(agendaInexistente, { transaction }),
                null,
            );

            await assert.rejects(
                () =>
                    queryInterface.bulkInsert(
                        'SERVICO',
                        [
                            {
                                id_cliente: cliente.cpf,
                                id_prestador: prestador.cnpj,
                                id_agenda: agendaInexistente,
                                tag: 'Teste',
                            },
                        ],
                        { transaction },
                    ),
                (error) => Boolean(error.parent || error.original),
            );
        });
    },
);
