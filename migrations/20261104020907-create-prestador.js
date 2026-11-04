'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('PRESTADOR', {
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

            cnpj: {
                type: Sequelize.CHAR(14),
                allowNull: false,
                primaryKey: true
            },

            avaliacao: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        });

        await queryInterface.addConstraint('PRESTADOR', {
            fields: ['avaliacao'],
            type: 'check',
            name: 'chk_avaliacao_prestador',
            where: {
                avaliacao: {
                    [Sequelize.Op.between]: [0, 5]
                }
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('PRESTADOR');
    }
};