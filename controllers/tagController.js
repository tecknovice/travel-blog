const debug = require('debug')('travel-blog:tagController')
const { body, param, validationResult } = require('express-validator');
const Tag = require('../models/Tag')
const Post = require('../models/Post')

exports.list = async function (req, res, next) {
    const tags = await Tag
        .find()
        .populate('image')
        .populate({
            path: 'postCount',
            options: {
                sort: { 'postCount': 'asc' }
            }
        })
        .limit(12)
        .exec()
    if (tags) {
        // const promise = tags.map(async tag => {
        //     const postCount = await Post.countDocuments({ 'tags': tag._id })
        //     const added = {
        //         _id: tag._id,
        //         name: tag.name,
        //         image: tag.image,
        //         slug: tag.slug,
        //         postCount: postCount
        //     }
        //     return added
        // })
        // const result = await Promise.all(promise)
        res.render('tag-list', { title: 'Tags list', tags })
    }
    else
        res.render('tag-list', { title: 'Tags list' })
}