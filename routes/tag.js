const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController')

/* GET tag */
router.get('/:slug', function(req, res, next) {
  res.send('NOT IMPLEMENTED: get tag')
});
/* GET all tags */
router.get('/', tagController.list);

module.exports = router;