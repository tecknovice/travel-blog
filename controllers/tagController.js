const debug = require('debug')('travel-blog:tagController')
const { body, param, validationResult } = require('express-validator');
const Tag = require('../models/Tag')

exports.list = async function (req, res, next) {
    const tags = await Tag.find().populate({
        path: 'image',
    }).exec()
    res.render('tag-list', { title: 'Tags list', tags })
}