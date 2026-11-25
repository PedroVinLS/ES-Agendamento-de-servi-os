'use strict';

const express = require('express');
const router = express.Router();

const servicoController = require('../controllers/servicoController');
const autenticarUsuario = require('../middlewares/autenticarUsuario');

// Todas as rotas exigem autenticação.
router.use(autenticarUsuario);

// Consultas
router.get('/', servicoController.index);
router.get('/:id', servicoController.show);
router.get('/:id/more', servicoController.showMore);

// Operações de escrita
router.post('/', servicoController.create);
router.put('/:id', servicoController.update);
router.delete('/:id', servicoController.destroy);

module.exports = router;
