
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Op } = require('sequelize');

const controller = require('../controllers/servicoController');

const {
    Servico,
    Agenda,
    Cliente,
    Prestador
} = require('../models');

const CLIENTE = {
    id_usuario: 1,
    cpf: '12345678901'
};

const PRESTADOR = {
    id_usuario: 2,
    cnpj: '12345678000190'
};

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

function criarRequisicao({
    usuarioId = 1,
    params = {},
    body = {}
} = {}) {
    return {
        usuarioAutenticado: {
            id: usuarioId
        },
        params,
        body
    };
}

function dadosValidos() {
    return {
        id_prestador: PRESTADOR.cnpj,
        id_agenda: 1,
        descricao: 'Corte masculino'
    };
}

/**
 * Simula um usuário que possui somente perfil de cliente.
 */
function configurarPerfilCliente(t) {
    t.mock.method(Cliente, 'findOne', async ({ where }) => {
        return where.id_usuario === CLIENTE.id_usuario
            ? CLIENTE
            : null;
    });

    t.mock.method(Prestador, 'findOne', async () => null);
}

/**
 * Simula um usuário que possui somente perfil de prestador.
 */
function configurarPerfilPrestador(t) {
    t.mock.method(Cliente, 'findOne', async () => null);

    t.mock.method(Prestador, 'findOne', async ({ where }) => {
        return where.id_usuario === PRESTADOR.id_usuario
            ? PRESTADOR
            : null;
    });
}

/**
 * Simula uma agenda válida.
 */
function criarAgenda(t, horario = new Date('2026-12-01T14:00:00Z')) {
    const agenda = {
        id: 1,
        horario,
        local: 'Endereço original',
        update: t.mock.fn(async function (dados) {
            Object.assign(this, dados);
            return this;
        })
    };

    t.mock.method(Agenda, 'findByPk', async () => agenda);

    return agenda;
}

test('Recusa horário ocupado pelo prestador', async (t) => {
    configurarPerfilCliente(t);

    t.mock.method(Prestador, 'findByPk', async () => PRESTADOR);

    criarAgenda(t);

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

    await controller.create(
        criarRequisicao({ body: dadosValidos() }),
        res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(criar.mock.callCount(), 0);
});

test('Recusa horário ocupado pelo cliente', async (t) => {
    configurarPerfilCliente(t);

    t.mock.method(Prestador, 'findByPk', async () => PRESTADOR);

    criarAgenda(t);

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

    await controller.create(
        criarRequisicao({ body: dadosValidos() }),
        res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(criar.mock.callCount(), 0);
});

test('Registra atendimento quando o horário está livre', async (t) => {
    configurarPerfilCliente(t);

    t.mock.method(Prestador, 'findByPk', async () => PRESTADOR);

    criarAgenda(t);

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

    await controller.create(
        criarRequisicao({ body: dadosValidos() }),
        res
    );

    assert.equal(res.statusCode, 201);
    assert.equal(criar.mock.callCount(), 1);

    const dadosCriados = criar.mock.calls[0].arguments[0];

    assert.deepEqual(dadosCriados, {
        id_cliente: CLIENTE.cpf,
        id_prestador: PRESTADOR.cnpj,
        id_agenda: 1,
        descricao: 'Corte masculino'
    });

    assert.equal(res.dados.id, 20);
});

test('Retorna 404 quando a agenda não existe', async (t) => {
    configurarPerfilCliente(t);

    t.mock.method(Prestador, 'findByPk', async () => PRESTADOR);

    t.mock.method(Agenda, 'findByPk', async () => null);

    const buscarServico = t.mock.method(
        Servico,
        'findOne',
        async () => null
    );

    const criar = t.mock.method(
        Servico,
        'create',
        async () => ({ id: 1 })
    );

    const res = criarResposta();

    await controller.create(
        criarRequisicao({ body: dadosValidos() }),
        res
    );

    assert.equal(res.statusCode, 404);
    assert.equal(buscarServico.mock.callCount(), 0);
    assert.equal(criar.mock.callCount(), 0);
});

test('Retorna 404 ao atualizar serviço com agenda inexistente', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 20,
        id_agenda: 1,
        id_prestador: PRESTADOR.cnpj,
        id_cliente: CLIENTE.cpf
    };

    t.mock.method(Servico, 'findByPk', async () => servico);

    const buscarAgenda = t.mock.method(
        Agenda,
        'findByPk',
        async () => null
    );

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 20 },
            body: { horario: '2026-12-02T14:00:00Z' }
        }),
        res
    );

    assert.equal(res.statusCode, 404);
    assert.equal(buscarAgenda.mock.callCount(), 1);
});

test('Recusa atualização quando o prestador já possui atendimento no horário', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 20,
        id_agenda: 1,
        id_prestador: PRESTADOR.cnpj,
        id_cliente: CLIENTE.cpf
    };

    const agenda = criarAgenda(t);

    t.mock.method(Servico, 'findByPk', async () => servico);

    t.mock.method(Servico, 'findOne', async (consulta) => {
        if (consulta.where.id_prestador) {
            return { id: 30 };
        }

        return null;
    });

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 20 },
            body: { horario: '2026-12-02T14:00:00Z' }
        }),
        res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(agenda.update.mock.callCount(), 0);
});

test('Recusa atualização quando o cliente já possui atendimento no horário', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 20,
        id_agenda: 1,
        id_prestador: PRESTADOR.cnpj,
        id_cliente: CLIENTE.cpf
    };

    const agenda = criarAgenda(t);

    t.mock.method(Servico, 'findByPk', async () => servico);

    t.mock.method(Servico, 'findOne', async (consulta) => {
        if (consulta.where.id_cliente) {
            return { id: 30 };
        }

        return null;
    });

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 20 },
            body: { horario: '2026-12-02T14:00:00Z' }
        }),
        res
    );

    assert.equal(res.statusCode, 409);
    assert.equal(agenda.update.mock.callCount(), 0);
});

test('Permite atualizar somente o endereço do atendimento', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 20,
        id_agenda: 1,
        id_prestador: PRESTADOR.cnpj,
        id_cliente: CLIENTE.cpf
    };

    const agenda = criarAgenda(t);

    t.mock.method(Servico, 'findByPk', async () => servico);

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 20 },
            body: { local: 'Novo endereço, 123' }
        }),
        res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(agenda.update.mock.callCount(), 1);

    assert.equal(
        agenda.update.mock.calls[0].arguments[0].local,
        'Novo endereço, 123'
    );
});

test('Permite agendamentos no mesmo horário quando não há conflito para o cliente e o prestador autenticados', async (t) => {
    configurarPerfilCliente(t);

    t.mock.method(Prestador, 'findByPk', async () => PRESTADOR);

    criarAgenda(t);

    const consultas = [];

    t.mock.method(Servico, 'findOne', async (consulta) => {
        consultas.push(consulta);
        return null;
    });

    const criar = t.mock.method(
        Servico,
        'create',
        async (entrada) => ({
            id: 21,
            ...entrada
        })
    );

    const dados = {
        ...dadosValidos(),

        // Estes dados não devem substituir os dados do cadastro.
        id_cliente: '98765432100'
    };

    const res = criarResposta();

    await controller.create(
        criarRequisicao({ body: dados }),
        res
    );

    assert.equal(res.statusCode, 201);
    assert.equal(criar.mock.callCount(), 1);

    assert.equal(
        consultas[0].where.id_prestador,
        PRESTADOR.cnpj
    );

    assert.equal(
        consultas[1].where.id_cliente,
        CLIENTE.cpf
    );

    const dadosCriados = criar.mock.calls[0].arguments[0];

    assert.equal(dadosCriados.id_cliente, CLIENTE.cpf);
    assert.equal(dadosCriados.id_prestador, PRESTADOR.cnpj);
    assert.notEqual(dadosCriados.id_cliente, dados.id_cliente);
});

test('Permite atualizar o horário quando não existe outro conflito e exclui o próprio serviço da verificação', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 20,
        id_agenda: 1,
        id_prestador: PRESTADOR.cnpj,
        id_cliente: CLIENTE.cpf
    };

    const agenda = criarAgenda(t);

    const novoHorario = '2026-12-02T14:00:00Z';
    const consultas = [];

    t.mock.method(Servico, 'findByPk', async () => servico);

    t.mock.method(Servico, 'findOne', async (consulta) => {
        consultas.push(consulta);
        return null;
    });

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 20 },
            body: { horario: novoHorario }
        }),
        res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(agenda.update.mock.callCount(), 1);

    assert.equal(
        agenda.update.mock.calls[0].arguments[0].horario,
        novoHorario
    );

    assert.equal(
        consultas[0].where.id[Op.ne],
        servico.id
    );

    assert.equal(
        consultas[1].where.id[Op.ne],
        servico.id
    );
});


test('Impede que prestador crie agendamento', async (t) => {
    configurarPerfilPrestador(t);

    const buscarPrestador = t.mock.method(
        Prestador,
        'findByPk',
        async () => PRESTADOR
    );

    const criar = t.mock.method(
        Servico,
        'create',
        async () => ({ id: 1 })
    );

    const res = criarResposta();

    await controller.create(
        criarRequisicao({
            usuarioId: PRESTADOR.id_usuario,
            body: dadosValidos()
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(buscarPrestador.mock.callCount(), 0);
    assert.equal(criar.mock.callCount(), 0);
});

test('Impede cliente de consultar serviço de outro cliente', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 30,
        id_cliente: '99999999999',
        id_prestador: PRESTADOR.cnpj
    };

    const buscar = t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const res = criarResposta();

    await controller.show(
        criarRequisicao({
            params: { id: 30 }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(buscar.mock.callCount(), 1);
});

test('Impede prestador de consultar serviço de outro prestador', async (t) => {
    configurarPerfilPrestador(t);

    const servico = {
        id: 31,
        id_cliente: CLIENTE.cpf,
        id_prestador: '99999999000199'
    };

    const buscar = t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const res = criarResposta();

    await controller.show(
        criarRequisicao({
            usuarioId: PRESTADOR.id_usuario,
            params: { id: 31 }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(buscar.mock.callCount(), 1);
});

test('Impede cliente de atualizar serviço de outro cliente', async (t) => {
    configurarPerfilCliente(t);

    const servico = {
        id: 32,
        id_cliente: '99999999999',
        id_prestador: PRESTADOR.cnpj,
        id_agenda: 1
    };

    const buscar = t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const buscarAgenda = t.mock.method(
        Agenda,
        'findByPk',
        async () => ({
            update: t.mock.fn(async () => {})
        })
    );

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            params: { id: 32 },
            body: { local: 'Novo endereço' }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(buscar.mock.callCount(), 1);
    assert.equal(buscarAgenda.mock.callCount(), 0);
});

test('Impede prestador de atualizar serviço de outro prestador', async (t) => {
    configurarPerfilPrestador(t);

    const servico = {
        id: 33,
        id_cliente: CLIENTE.cpf,
        id_prestador: '99999999000199',
        id_agenda: 1
    };

    const buscar = t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const buscarAgenda = t.mock.method(
        Agenda,
        'findByPk',
        async () => ({
            update: t.mock.fn(async () => {})
        })
    );

    const res = criarResposta();

    await controller.update(
        criarRequisicao({
            usuarioId: PRESTADOR.id_usuario,
            params: { id: 33 },
            body: { local: 'Novo endereço' }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(buscar.mock.callCount(), 1);
    assert.equal(buscarAgenda.mock.callCount(), 0);
});

test('Impede cliente de excluir serviço de outro cliente', async (t) => {
    configurarPerfilCliente(t);

    const destruir = t.mock.fn(async () => {});

    const servico = {
        id: 34,
        id_cliente: '99999999999',
        id_prestador: PRESTADOR.cnpj,
        destroy: destruir
    };

    t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const res = criarResposta();

    await controller.destroy(
        criarRequisicao({
            params: { id: 34 }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(destruir.mock.callCount(), 0);
});

test('Impede prestador de excluir serviço de outro prestador', async (t) => {
    configurarPerfilPrestador(t);

    const destruir = t.mock.fn(async () => {});

    const servico = {
        id: 35,
        id_cliente: CLIENTE.cpf,
        id_prestador: '99999999000199',
        destroy: destruir
    };

    t.mock.method(
        Servico,
        'findByPk',
        async () => servico
    );

    const res = criarResposta();

    await controller.destroy(
        criarRequisicao({
            usuarioId: PRESTADOR.id_usuario,
            params: { id: 35 }
        }),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(destruir.mock.callCount(), 0);
});

test('Impede acesso de usuário sem perfil cadastrado', async (t) => {
    t.mock.method(Cliente, 'findOne', async () => null);
    t.mock.method(Prestador, 'findOne', async () => null);

    const listar = t.mock.method(
        Servico,
        'findAll',
        async () => []
    );

    const res = criarResposta();

    await controller.index(
        criarRequisicao(),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(listar.mock.callCount(), 0);
});

test('Impede acesso de usuário com perfis conflitantes', async (t) => {
    t.mock.method(Cliente, 'findOne', async () => CLIENTE);
    t.mock.method(Prestador, 'findOne', async () => PRESTADOR);

    const listar = t.mock.method(
        Servico,
        'findAll',
        async () => []
    );

    const res = criarResposta();

    await controller.index(
        criarRequisicao(),
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(listar.mock.callCount(), 0);
});
