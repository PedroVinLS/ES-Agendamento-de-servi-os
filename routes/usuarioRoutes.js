'use strict';

const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

router.get('/', usuarioController.index);
router.get('/:id', usuarioController.show);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.destroy);

module.exports = router;