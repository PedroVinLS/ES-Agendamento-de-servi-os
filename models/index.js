
'use strict';

const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Usuario = require('./usuario')(sequelize, DataTypes);
const Cliente = require('./cliente')(sequelize, DataTypes);
const Prestador = require('./prestador')(sequelize, DataTypes);
const Agenda = require('./agenda')(sequelize, DataTypes);
const Servico = require('./servico')(sequelize, DataTypes);

const models = {
    Usuario,
    Cliente,
    Prestador,
    Agenda,
    Servico
};

// Inicializa as associações de todos os Models
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = {
    sequelize,
    Usuario,
    Cliente,
    Prestador,
    Agenda,
    Servico
};
