
'use strict';

/**
 * Valida o preço de um serviço.
 * RN-04: preço mínimo de R$ 0,01.
 *
 * Aceita números ou strings com ponto decimal.
 * Não aceita valores negativos, zero ou mais de
 * duas casas decimais.
 */
function validarPreco(preco) {
    if (preco === null || preco === undefined || preco === '') {
        return false;
    }

    if (typeof preco !== 'number' && typeof preco !== 'string') {
        return false;
    }

    const valorTexto = String(preco);

    if (!/^\d+(\.\d{1,2})?$/.test(valorTexto)) {
        return false;
    }

    const valor = Number(valorTexto);

    return Number.isFinite(valor) && valor >= 0.01;
}


/**
 * Valida o nome do serviço.
 * Obrigatório, com até 100 caracteres.
 */
function validarNome(nome) {
    return (
        typeof nome === 'string' &&
        nome.trim().length >= 1 &&
        nome.trim().length <= 100 &&
        /^[\p{L}\p{N} ]+$/u.test(nome.trim())
    );
}

/**
 * Valida a descrição do serviço.
 * Obrigatória, com até 300 caracteres.
 */
function validarDescricao(descricao) {
    return (
        typeof descricao === 'string' &&
        descricao.trim().length >= 1 &&
        descricao.trim().length <= 300 &&
        /^[\p{L}\p{N}\s.,;:!?()'"\-/]+$/u.test(descricao.trim())
    );
}

/**
 * Valida o telefone.
 * Opcional, mas deve estar completo quando informado.
 */
function validarTelefone(telefone) {
    if (telefone === null || telefone === undefined) {
        return true;
    }

    if (
        typeof telefone !== 'object' ||
        Array.isArray(telefone)
    ) {
        return false;
    }

    const { areaCode, number } = telefone;

    return (
        typeof areaCode === 'string' &&
        /^\d{2}$/.test(areaCode) &&
        typeof number === 'string' &&
        /^\d{8,9}$/.test(number)
    );
}

/**
 * Valida os horários de disponibilidade.
 * Pelo menos um horário deve ser informado.
 */

function validarDisponibilidade(disponibilidade) {
    if (
        !Array.isArray(disponibilidade) ||
        disponibilidade.length === 0 ||
        disponibilidade.length > 84
    ) {
        return false;
    }

    const horariosRegistrados = new Set();

    return disponibilidade.every(horario => {
        if (
            horario === null ||
            typeof horario !== 'object' ||
            Array.isArray(horario)
        ) {
            return false;
        }

        const { dayIndex, start, end } = horario;

        const horarioValido =
            Number.isInteger(dayIndex) &&
            dayIndex >= 0 &&
            dayIndex <= 6 &&
            Number.isInteger(start) &&
            Number.isInteger(end) &&
            start >= 6 &&
            end <= 18 &&
            end === start + 1;

        if (!horarioValido) {
            return false;
        }

        const chave = `${dayIndex}-${start}-${end}`;

        if (horariosRegistrados.has(chave)) {
            return false;
        }

        horariosRegistrados.add(chave);

        return true;
    });
}



/**
 * Valida os dados completos do cadastro de serviço.
 * Retorna se os dados são válidos e os erros encontrados.
 *
 * A autorização do prestador será verificada
 * separadamente no backend.
 */
function validarCadastroServico(dados) {
    const erros = [];

    if (
        dados === null ||
        typeof dados !== 'object' ||
        Array.isArray(dados)
    ) {
        return {
            valido: false,
            erros: ['Os dados do serviço são inválidos.']
        };
    }

    if (!validarNome(dados.name)) {
        erros.push(
            'O nome deve conter de 1 a 100 caracteres válidos.'
        );
    }

    if (!validarDescricao(dados.description)) {
        erros.push(
            'A descrição deve conter de 1 a 300 caracteres válidos.'
        );
    }

    if (!validarPreco(dados.minimumPrice)) {
        erros.push(
            'O preço deve ser de no mínimo R$ 0,01, com até duas casas decimais.'
        );
    }

    if (!validarTelefone(dados.phone)) {
        erros.push(
            'O telefone informado é inválido.'
        );
    }

    if (!validarDisponibilidade(dados.availability)) {
        erros.push(
            'Informe pelo menos um horário válido.'
        );
    }

    return {
        valido: erros.length === 0,
        erros
    };
}

module.exports = {
    validarPreco,
    validarNome,
    validarDescricao,
    validarTelefone,
    validarDisponibilidade,
    validarCadastroServico
};