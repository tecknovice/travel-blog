const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')

/* GET load more */
router.get('/load', postController.load);
/* GET post */
router.get('/:slug', function(req, res, next) {
  res.send('NOT IMPLEMENTED: get post')
});

module.exports = router;