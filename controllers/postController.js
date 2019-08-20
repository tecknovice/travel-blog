const debug = require('debug')('travel-blog:postController')
const {  query, validationResult } = require('express-validator');
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const Image = require('../models/Image')
const async = require('async')

exports.load=[
    query('skip', 'skip must be an integer greater or equal 6').isInt({ min: 6 }),
    async function (req, res, next) {
        debug('load:req',req.query)
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).send({errors: result.errors})
            return
        }
        try {
            const posts = await Post
            .find({ status: 'published' })
            .sort({ updatedAt: 'desc' })
            .skip(Number(req.query.skip))
            .limit(3)
            .populate('image')
            .populate('tags')
            .exec()
            res.send(posts)
        } catch (error) {
            res.status(500).send(error)
        }
    }
]
