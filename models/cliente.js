'use strict'

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Cliente extends Model {

        static associate(models) {
            this.belongsTo(models.Usuario, {
                foreignKey: 'id_usuario',
                as: 'usuario'
            });
            
            this.hasMany(models.Servico, {
                foreignKey: 'id_cliente',
                sourceKey: 'cpf',
                as: 'servicos'
            });
        }
    }
    Cliente.init({
        id_usuario:  {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        cpf: {
            type: DataTypes.CHAR(11),
            primaryKey: true,
            allowNull: false,
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Cliente',
        tableName: 'CLIENTE',
        timestamps: false, 
    });
    return Cliente;
};