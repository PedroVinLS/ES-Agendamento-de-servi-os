'use strict';

const express = require('express');
const cors = require('cors'); 
const { sequelize } = require('./models');
const app = express();
const routes = require('./routes');
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://127.0.0.1:5501"
        ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));

app.use(express.json());
app.use(routes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API funcionando" 
    });
});

app.get("/health", async (req, res) => {
    try {
        await sequelize.authenticate();

        res.status(200).json({
            api: "online",
            banco: "conectado"
        });
    } catch (error) {
        console.error("Erro ao acessar o MySQL:", error.message);

        res.status(503).json({
            api: "online",
            banco: "indisponivel"
        });
    }
});

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log("Conexão com MySQL estabelecida!");

        app.listen(PORT, () => {
            console.log(`API rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Não foi possível conectar ao MySQL.");
        console.error(error.message);

        process.exit(1);
    }
}

iniciarServidor();