'use strict'

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    
    class Usuario extends Model {

        static associate(models) {
            this.hasOne(models.Cliente, {
                foreignKey: 'id_usuario',
                as: 'cliente'
            });

            this.hasOne(models.Prestador, {
                foreignKey: 'id_usuario',
                as: 'prestador'
            });
        }
    }
    Usuario.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        dataCriacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        senha: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Usuario',
        tableName: 'USUARIO',
        timestamps: false, 
    });
    return Usuario;
};