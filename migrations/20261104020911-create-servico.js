'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SERVICO', {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
            },

            id_cliente: {
              type: Sequelize.CHAR(11),
              allowNull: false,
              references: {
                model: 'CLIENTE',
                key: 'cpf'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },

            id_prestador: {
              type: Sequelize.CHAR(14),
              allowNull: false,
              references: {
                model: 'PRESTADOR',
                key: 'cnpj'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },

            id_agenda: {
              type: Sequelize.INTEGER,
              allowNull: false,
              references: {
                model: 'AGENDA',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },

            tag: {
              type: Sequelize.STRING(100),
              allowNull: true,
            },

            descricao: {
              type: Sequelize.TEXT,
              allowNull: true,
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('SERVICO');
    }
};