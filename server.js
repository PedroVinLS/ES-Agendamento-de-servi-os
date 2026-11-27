
'use strict';

require('dotenv').config({
    path: process.env.ENV_FILE || '.env',
    override: true
});

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await sequelize.authenticate();

        console.log('Conexão com MySQL estabelecida!');

        app.listen(PORT, () => {
            console.log(`API rodando em http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Não foi possível conectar ao MySQL.');
        console.error(error.message);

        process.exit(1);
    }
}

iniciarServidor();
