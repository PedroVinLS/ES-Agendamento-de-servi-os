
'use strict';

/**
 * Verifica se existe uma identidade autenticada
 * associada a um prestador.
 *
 * Esta função não autentica o usuário.
 * A identidade deverá ser fornecida por uma
 * camada de autenticação confiável.
 */
function verificarPermissaoCadastro(usuarioAutenticado) {
    if (
        !usuarioAutenticado ||
        typeof usuarioAutenticado !== 'object' ||
        Array.isArray(usuarioAutenticado)
    ) {
        return false;
    }

    return (
        usuarioAutenticado.tipo === 'prestador' &&
        Number.isInteger(usuarioAutenticado.id) &&
        usuarioAutenticado.id > 0
    );
}

module.exports = {
    verificarPermissaoCadastro
};
