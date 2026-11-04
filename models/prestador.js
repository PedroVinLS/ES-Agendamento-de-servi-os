'use strict'

const {
    Model
} = require('sequelize');
const { toDefaultValue } = require('sequelize/lib/utils');

module.exports = (sequelize, DataTypes) => {

    class Prestador extends Model {

        static associate(models) {
            this.belongsTo(models.Usuario, {
                foreignKey: 'id_usuario',
                as: 'usuario'
            });
            
            this.hasMany(models.Servico, {
                foreignKey: 'id_prestador',
                sourceKey: 'cnpj',
                as: 'servicos'
            });
        }
    }
    Prestador.init({
        id_usuario:  {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        cnpj: {
            type: DataTypes.CHAR(14),
            primaryKey: true,
            allowNull: false,
        },
        servicoPrestado: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        avaliacao: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 5
            }
        }
    }, {
        sequelize,
        modelName: 'Prestador',
        tableName: 'PRESTADOR',
        timestamps: false, 
    });
    return Prestador;
};