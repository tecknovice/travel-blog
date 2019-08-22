const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController')

/* GET load */
router.get('/load', tagController.load);
/* GET tag */
router.get('/:slug', tagController.tag);
/* GET tags */
router.get('/', tagController.list);


module.exports = router;