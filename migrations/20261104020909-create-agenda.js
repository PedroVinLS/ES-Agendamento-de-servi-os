'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('AGENDA', {
            id: {
              type: Sequelize.INTEGER,
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
            },

            horario: {
                type: Sequelize.DATE,
                allowNull: false,
            },

            local: {
                type: Sequelize.STRING(255),
                allowNull: false,
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('AGENDA');
    }
};