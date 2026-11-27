
'use strict';

require('dotenv').config({
    path: process.env.ENV_FILE || '.env',
    override: true
});

const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5501',
        "https://studious-space-umbrella-r7g44j57475fpv75-5501.app.github.dev"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

app.use(routes);

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API funcionando'
    });
});

app.get('/health', async (req, res) => {
    const { sequelize } = require('./models');

    try {
        await sequelize.authenticate();

        res.status(200).json({
            api: 'online',
            banco: 'conectado'
        });
    } catch (error) {
        console.error('Erro ao acessar o MySQL:', error.message);

        res.status(503).json({
            api: 'online',
            banco: 'indisponivel'
        });
    }
});

module.exports = app;
