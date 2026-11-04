'use strict';

const express = require('express');
const router = express.Router();

const servicoController = require('../controllers/servicoController');

router.get('/', servicoController.index);
router.get('/:id', servicoController.show);
router.get('/:id/more', servicoController.showMore);
router.post('/', servicoController.create);
router.put('/:id', servicoController.update);
router.delete('/:id', servicoController.destroy);

module.exports = router;