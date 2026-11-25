'use strict';

require('dotenv').config({
    path: process.env.ENV_FILE || '.env',
    override: true
});

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS_DEV,
    {
        host: process.env.DB_HOST_DEV,
        port: process.env.DB_PORT || 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        timezone: '-03:00',
        logging: false
    }
);

module.exports = sequelize;