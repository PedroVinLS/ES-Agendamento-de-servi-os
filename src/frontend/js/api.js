"use strict";

// HU-01.2 ” Pedro Henrique
const API_BASE_URL = "http://127.0.0.1:3000";
const PERFIL_URL = `${API_BASE_URL}/usuario/me/perfil`;

export async function cadastrarPerfil(dados) {
    const controller = new AbortController();
    const temporizador = setTimeout(() => controller.abort(), 15000);

    let resposta;
    try {
        resposta = await fetch(PERFIL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            credentials: "include", // Sessão autenticada por cookie, quando implementada.
            body: JSON.stringify(dados),
            signal: controller.signal
        });
    } catch (erro) {
        if (erro.name === "AbortError") {
            throw new Error("O servidor demorou para responder. Tente novamente.");
        }
        throw new Error("Não foi possível conectar à API. Confira se o servidor está funcionando.");
    } finally {
        clearTimeout(temporizador);
    }

    const ehJSON = (resposta.headers.get("content-type") || "").includes("application/json");
    let corpo = null;
    if (ehJSON) {
        try {
            corpo = await resposta.json();
        } catch {
            throw new Error("A API retornou uma resposta inválida.");
        }
    }

    if (!resposta.ok) {
        const mensagens = {
            400: "Não foi possível processar os dados enviados.",
            401: "Você precisa entrar na sua conta antes de escolher o perfil.",
            403: "Você não tem permissão para realizar esse cadastro.",
            404: "A função de cadastro de perfil ainda não estão disponível na API.",
            409: "Essa conta já possui um perfil ou os dados informados já estão cadastrados.",
            422: "Alguns dados não foram aceitos. Revise o formulário.",
            500: "O servidor encontrou um problema ao salvar o perfil.",
            503: "O servidor está temporariamente indisponível"
        };

        // Mensagens internas do banco nÃ£o sÃ£o exibidas ao usuÃ¡rio.
        const mensagem = mensagens[resposta.status] || "NÃ£o foi possÃ­vel concluir o cadastro.";
        const erro = new Error(mensagem);
        erro.status = resposta.status;
        erro.campos = resposta.status === 422 && Array.isArray(corpo?.campos)
            ? corpo.campos
            : [];
        throw erro;
    }

    if (!ehJSON || !corpo || typeof corpo !== "object") {
        throw new Error("O servidor não retornou uma confirmação válida do cadastro.");
    }

    return corpo;
}