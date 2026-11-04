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
              unique: true,
              references: {
                model: 'AGENDA',
                key: 'id'
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE'
            },

            preco: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
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

        await queryInterface.addConstraint('SERVICO', {
          fields: ['preco'],
          type: 'check',
          name: 'chk_servico_preco_servico',
          where: {
            preco: {
              [Sequelize.Op.gte]: 0
            }
          }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('SERVICO');
    }
};