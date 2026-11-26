'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

test(
    'Integração real: cadastro, consulta, atualização e exclusão no MariaDB',
    { skip: process.env.ENV_FILE !== '.env.test' },
    async (t) => {
        const {
            sequelize,
            Usuario,
            Cliente,
            Prestador,
            Agenda,
            Servico,
        } = require('../models');

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

        // Proteção: impede executar o teste em outro banco.
        assert.equal(sequelize.config.database, 'sistema_servicos_test');
        assert.equal(sequelize.config.username, 'sistema_test');
        assert.equal(sequelize.config.host, '127.0.0.1');

        await sequelize.authenticate();

        transaction = await sequelize.transaction();

        const sufixo = String(Date.now()).slice(-10);
        const cpf = sufixo.padStart(11, '0');
        const cnpj = `9${sufixo.padStart(13, '0')}`;

        // Criar usuário cliente.
        const usuarioCliente = await Usuario.create(
            {
                nome: 'Cliente de teste',
                email: `cliente-${randomUUID()}@teste.local`,
                senha: 'senha-ficticia-de-teste',
            },
            { transaction },
        );

        // Criar usuário prestador.
        const usuarioPrestador = await Usuario.create(
            {
                nome: 'Prestador de teste',
                email: `prestador-${randomUUID()}@teste.local`,
                senha: 'senha-ficticia-de-teste',
            },
            { transaction },
        );

        // Criar cliente.
        const cliente = await Cliente.create(
            {
                id_usuario: usuarioCliente.id,
                cpf,
                observacoes: 'Registro de teste',
            },
            { transaction },
        );

        // Criar prestador.
        const prestador = await Prestador.create(
            {
                id_usuario: usuarioPrestador.id,
                cnpj,
                servicoPrestado: 'Serviço de teste',
                preco: 75.00,
                avaliacao: 5,
            },
            { transaction },
        );

        // Criar horário.
        const agenda = await Agenda.create(
            {
                horario: new Date('2030-01-10T12:00:00-03:00'),
                local: 'Local de teste',
            },
            { transaction },
        );

        // Registrar serviço.
        const servico = await Servico.create(
            {
                id_cliente: cliente.cpf,
                id_prestador: prestador.cnpj,
                id_agenda: agenda.id,
                tag: 'Teste de integração',
                descricao: 'Primeira descrição',
            },
            { transaction },
        );

        assert.ok(servico.id);

        // Consultar o serviço e seus relacionamentos.
        const encontrado = await Servico.findByPk(servico.id, {
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Prestador, as: 'prestador' },
                { model: Agenda, as: 'agenda' },
            ],
            transaction,
        });

        assert.ok(encontrado);
        assert.equal(encontrado.cliente.cpf, cpf);
        assert.equal(encontrado.prestador.cnpj, cnpj);
        assert.equal(encontrado.agenda.id, agenda.id);

        // Atualizar descrição.
        await servico.update(
            { descricao: 'Descrição atualizada' },
            { transaction },
        );

        const atualizado = await Servico.findByPk(servico.id, {
            transaction,
        });

        assert.equal(atualizado.descricao, 'Descrição atualizada');

        // Excluir serviço.
        await servico.destroy({ transaction });

        const removido = await Servico.findByPk(servico.id, {
            transaction,
        });

        assert.equal(removido, null);
    },
);
