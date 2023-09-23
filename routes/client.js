const express = require('express');
const router = express.Router();

router.use('/auth', require('../controller/auth/index'));

module.exports = router;