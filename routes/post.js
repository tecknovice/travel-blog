const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController')

/* GET load more */
router.get('/load', postController.load);
/* GET post */
router.get('/:slug', postController.post);
/* POST comment */
router.post('/comment', postController.comment);
/* POST reply */
router.post('/reply', postController.reply);

module.exports = router;