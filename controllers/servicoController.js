'use strict';

const { Servico, Cliente, Prestador, Agenda } = require('../models');
const { Op } = require('sequelize');

class servicoController {
    async index (req, res) {
        try {
            const servicos = await Servico.findAll();

            return res.json(servicos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);
            
            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            return res.json(servico);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const agenda = await Agenda.findByPk(req.body.id_agenda);

            const prestadorServico = await Servico.findOne({
                where: {
                    id_prestador: req.body.id_prestador
                },
                include: [{
                    model: Agenda,
                    as: 'agenda',
                    where: {
                        horario: agenda.horario
                    },
                    attributes: []
                }]
            });

            const clienteServico = await Servico.findOne({
                where: {
                    id_cliente: req.body.id_cliente
                },
                include: [{
                    model: Agenda,
                    as: 'agenda',
                    where: {
                        horario: agenda.horario
                    },
                    attributes: []
                }]
            });

            if (prestadorServico || clienteServico) {
                return res.status(409).json({ error: 'Este prestador/cliente já está possui um serviço registrado neste horário.'});
            }

            const novo = await Servico.create(req.body);

            return res.status(201).json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            if(!req.body.horario && !req.body.local) {
                return res.status(400).json({ error: 'Informe um horário/local novo.'});
            }

            const agenda = await Agenda.findByPk(servico.id_agenda);

            const newData = {};

            if (req.body.horario !== undefined) {
                newData.horario = req.body.horario;

                const prestadorServico = await Servico.findOne({
                    where: {
                        id: {[Op.ne] : servico.id},
                        id_prestador: servico.id_prestador
                    },
                    include: [{
                        model: Agenda,
                        as: 'agenda',
                        where: {
                            horario: req.body.horario
                        },
                        attributes: []
                    }]
                });

                const clienteServico = await Servico.findOne({
                    where: {
                        id: {[Op.ne] : servico.id},
                        id_cliente: servico.id_cliente
                    },
                    include: [{
                        model: Agenda,
                        as: 'agenda',
                        where: {
                            horario: req.body.horario
                        },
                        attributes: []
                    }]
                });

                if (prestadorServico || clienteServico) {
                    return res.status(409).json({ error: 'Este prestador/cliente já está possui um serviço registrado neste horário.'});
                }
            }

            if (req.body.local !== undefined) {
                newData.local = req.body.local;
            }

            await agenda.update(newData);
            
            const retorno = await Servico.findByPk(servico.id, {
                include: [{
                    model: Agenda,
                    as: 'agenda'
                }]
            });

            return res.json(retorno);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id);

            if (!servico) {
                return res.status(404).json({ error: 'Serviço não encontrado.'});
            }

            await servico.destroy();
            
            return res.json({ message: 'Serviço excluído com sucesso.' });
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async showMore (req, res) {
        try {
            const servico = await Servico.findByPk(req.params.id, {
                include: [
                    {model: Cliente, as: 'cliente'},
                    {model: Prestador, as: 'prestador'},
                    {model: Agenda, as: 'agenda'}
                ]
            });

            if (!servico) {
                return res.status(404).json({ erro: 'Serviço não encontrado'});
            }

            return res.json(servico);
        } catch (erro) {
            return res.status(400).json({erro: erro.message});
        }
    }
}

module.exports = new servicoController();