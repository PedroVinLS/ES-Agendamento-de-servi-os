
'use strict';

/**
 * Verifica se o usuário autenticado é o titular
 * do cadastro solicitado.
 *
 * ATENÇÃO:
 * A identidade deve ser fornecida por um
 * middleware de autenticação confiável.
 * Esta função não autentica usuários.
 */
function verificarPermissaoCadastro(usuarioAutenticado, idUsuarioSolicitado) {
    if (
        !usuarioAutenticado ||
        typeof usuarioAutenticado !== 'object' ||
        Array.isArray(usuarioAutenticado)
    ) {
        return false;
    }

    return (
        Number.isInteger(usuarioAutenticado.id) &&
        usuarioAutenticado.id > 0 &&
        Number.isInteger(idUsuarioSolicitado) &&
        idUsuarioSolicitado > 0 &&
        usuarioAutenticado.id === idUsuarioSolicitado
    );
}

module.exports = {
    verificarPermissaoCadastro
};
