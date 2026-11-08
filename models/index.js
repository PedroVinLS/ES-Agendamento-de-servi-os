
'use strict';

const sequelize = require('../config/database');
const Sequelize = require('sequelize');

const Usuario = require('./usuario')(sequelize, Sequelize.DataTypes);
const Cliente = require('./cliente')(sequelize, Sequelize.DataTypes);
const Prestador = require('./prestador')(sequelize, Sequelize.DataTypes);
const Agenda = require('./agenda')(sequelize, Sequelize.DataTypes);
const Servico = require('./servico')(sequelize, Sequelize.DataTypes);

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
