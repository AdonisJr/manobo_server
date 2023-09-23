const express = require('express');
const router = express.Router();

router.use('/officer', require('../controller/officer/index'));

module.exports = router;