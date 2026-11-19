
'use strict';

const { validarPreco } = require('./servicoValidator');

function validarServicoPrestador(dados) {
    const erros = [];

    if (
        !dados ||
        typeof dados !== 'object' ||
        Array.isArray(dados)
    ) {
        return {
            valido: false,
            erros: ['Dados inválidos.']
        };
    }

    if (
        typeof dados.servicoPrestado !== 'string' ||
        dados.servicoPrestado.trim().length === 0 ||
        dados.servicoPrestado.trim().length > 150
    ) {
        erros.push(
            'O serviço prestado deve conter de 1 a 150 caracteres.'
        );
    }

    if (
        !validarPreco(dados.preco) ||
        Number(dados.preco) > 99999999.99
    ) {
        erros.push(
            'O preço deve estar entre R$ 0,01 e R$ 99.999.999,99, com até duas casas decimais.'
        );
    }

    return {
        valido: erros.length === 0,
        erros
    };
}

module.exports = {
    validarServicoPrestador
};
