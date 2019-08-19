const express = require('express');
const router = express.Router();

/* GET tag */
router.get('/:slug', function(req, res, next) {
  res.send('NOT IMPLEMENTED: get tag')
});
/* GET all tags */
router.get('/', function(req, res, next) {
    res.send('NOT IMPLEMENTED: get all tag')
  });

module.exports = router;