'use strict';

const express = require('express');
const router = express.Router();

const agendaController = require('../controllers/agendaController');

router.get('/', agendaController.index);
router.get('/:id', agendaController.show);
router.post('/', agendaController.create);
router.put('/:id', agendaController.update);
router.delete('/:id', agendaController.destroy);

module.exports = router;