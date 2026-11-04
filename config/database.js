'use strict';

require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS_DEV,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST_DEV,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
};