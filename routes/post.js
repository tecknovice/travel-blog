const express = require('express');
const router = express.Router();

/* GET post */
router.get('/:slug', function(req, res, next) {
  res.send('NOT IMPLEMENTED: get post')
});

module.exports = router;