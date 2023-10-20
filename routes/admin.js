const express = require('express');
const router = express.Router();

router.use('/officer', require('../controller/officer/index'));
router.use('/person', require('../controller/personOfConcern/index'));
router.use('/crime', require('../controller/crime/index'));

module.exports = router;