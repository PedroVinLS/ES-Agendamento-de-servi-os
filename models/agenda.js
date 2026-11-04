'use strict'

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Agenda extends Model {

        static associate(models) {
            this.hasOne(models.Servico, {
                foreignKey: 'id_agenda',
                as: 'servico'
            });
        }
    }
    Agenda.init({
        id:  {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        horario: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        local: {
            type: DataTypes.STRING(255),
            allowNull: false
        },  
    }, {
        sequelize,
        modelName: 'Agenda',
        tableName: 'AGENDA',
        timestamps: false, 
    });
    return Agenda;
};