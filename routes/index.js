const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController')
const postController = require('../controllers/postController')

/* GET home page. */
router.get('/', indexController.homePage);

/* GET about */
router.get('/about', postController.about);

/* GET search */
router.get('/search', indexController.search);

module.exports = router;
