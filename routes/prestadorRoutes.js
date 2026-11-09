'use strict';

const express = require('express');
const router = express.Router();

const prestadorController = require('../controllers/prestadorController');

router.get('/', prestadorController.index);
router.get('/:cnpj', prestadorController.show);
router.get('/:cnpj/more', prestadorController.showMore);
router.post('/', prestadorController.create);
router.put('/:cnpj', prestadorController.update);
router.delete('/:cnpj', prestadorController.destroy);

module.exports = router;