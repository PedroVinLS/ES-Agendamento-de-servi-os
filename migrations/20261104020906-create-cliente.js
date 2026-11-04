'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('CLIENTE', {
            id_usuario: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'USUARIO',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },

            cpf: {
                type: Sequelize.CHAR(11),
                allowNull: false,
                primaryKey: true
            },

            observacoes: {
                type: Sequelize.TEXT,
                allowNull: true
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('CLIENTE');
    }
};