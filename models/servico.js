'use strict'

const {
    Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

    class Servico extends Model {

        static associate(models) {
            this.belongsTo(models.Cliente, {
                foreignKey: 'id_cliente',
                targetKey: 'cpf',
                as: 'cliente',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            
            this.belongsTo(models.Prestador, {
                foreignKey: 'id_prestador',
                targetKey: 'cnpj',
                as: 'prestador',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });

            this.belongsTo(models.Agenda, {
                foreignKey: 'id_agenda',
                as: 'agenda',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    }
    Servico.init({
        id:  {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id_cliente:  {
            type: DataTypes.CHAR(14),
            allowNull: false,
        },
        id_prestador:  {
            type: DataTypes.CHAR(14),
            allowNull: false,
        },
        id_agenda:  {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        }, 
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        tag: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Servico',
        tableName: 'SERVICO',
        timestamps: false, 
    });
    return Servico;
};