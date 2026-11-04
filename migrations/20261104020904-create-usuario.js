'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('USUARIO', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },

            nome: {
                type: Sequelize.STRING(150),
                allowNull: false
            },

            dataCriacao: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('(CURRENT_DATE)')
            },

            email: {
                type: Sequelize.STRING(150),
                allowNull: false,
                unique: true
            },

            senha: {
                type: Sequelize.STRING(255),
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('USUARIO');
    }
};