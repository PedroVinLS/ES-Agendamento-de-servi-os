const express = require('express');
const router = express.Router();

const usuarioRoutes = require('./usuarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const prestadorRoutes = require('./prestadorRoutes');
const agendaRoutes = require('./agendaRoutes');
const servicoRoutes = require('./servicoRoutes');

router.use('/usuario', usuarioRoutes);
router.use('/cliente', clienteRoutes);
router.use('/prestador', prestadorRoutes);
router.use('/agenda', agendaRoutes);
router.use('/servico', servicoRoutes);

module.exports = router;