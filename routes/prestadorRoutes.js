'use strict';

const express = require('express');
const router = express.Router();

const prestadorController = require('../controllers/prestadorController');
const autenticarUsuario = require('../middlewares/autenticarUsuario');

router.get('/', prestadorController.index);
router.get('/:cnpj', prestadorController.show);
router.get('/:cnpj/more', prestadorController.showMore);
router.post('/', autenticarUsuario, prestadorController.create);
router.put('/:cnpj', autenticarUsuario, prestadorController.update);
router.delete('/:cnpj', autenticarUsuario, prestadorController.destroy);

module.exports = router;