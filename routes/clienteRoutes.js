'use strict';

const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');

router.get('/', clienteController.index);
router.get('/:cpf', clienteController.show);
router.get('/:cpf/more', clienteController.showMore);
router.post('/', clienteController.create);
router.put('/:cpf', clienteController.update);
router.delete('/:cpf', clienteController.destroy);

module.exports = router;