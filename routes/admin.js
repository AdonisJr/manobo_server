const express = require('express');
const router = express.Router();

router.use('/user', require('../controller/user/index'));
router.use('/person', require('../controller/personOfConcern/index'));
router.use('/crime', require('../controller/crime/index'));
router.use('/fileUpload', require('../controller/fileUpload/index'));
router.use('/history', require('../controller/history/index'));
router.use('/otherInfo', require('../controller/otherInfo/index'));
router.use('/schoolarship', require('../controller/schoolarship/index'));
router.use('/burial', require('../controller/burials/index'));
router.use('/medical', require('../controller/medical/index'));
router.use('/assistance', require('../controller/assistance/index'));
router.use('/announcement', require('../controller/announcement/index'));
router.use('/upload', require('../controller/upload_image/index'));
router.use('/relationship', require('../controller/relationship/index'));
router.use('/certificate', require('../controller/certification/index'));
router.use('/recommendation', require('../controller/recommendation/index'));


module.exports = router;