const debug = require('debug')('travel-blog:postController')
const { param, query, validationResult, sanitizeQuery, sanitizeBody } = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId;
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const Image = require('../models/Image')
const parallel = require('async/parallel')

exports.load = [
    query('skip', 'skip must be an integer greater or equal 6').isInt({ min: 6 }),
    sanitizeQuery('skip').trim(),
    async function (req, res, next) {
        debug('load:req', req.query)
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.errors })
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

exports.post = [
    param('slug', 'Slug is invalid').custom(async slug => {
        const array = slug.split('-').filter(Boolean)
        if (array.length < 2) return Promise.reject()
        const _id = array[array.length - 1]
        const objectId = new ObjectId(_id)
        const isValid = ObjectId.isValid(objectId)
        if (isValid) return Promise.resolve()
        else return Promise.reject()
    }),
    sanitizeBody('slug').trim(),
    async function (req, res, next) {

        debug('post:req', req.params)
        let error
        const result = await validationResult(req)
        if (!result.isEmpty()) {
            error = new Error(result.errors.map(item => item.msg).reduce((totalMsg, curMsg) => totalMsg + curMsg))
            error.status = 400
            return next(error)
        }
        //convert
        const slug = req.params.slug
        const array = slug.split('-').filter(Boolean)
        const id = array[array.length - 1]
        try {
            //get post
            const post = await Post.findById(id).populate('tags').populate('image')
            if (!post) {
                error = new Error('Post not found!')
                error.status = 404
                return next(error)
            }
            if (post.slug !== slug) {
                res.redirect('/post/' + post.slug)
                return
            }
            //get aside data
            const [asideError, asideResults] = await aside()
            if (asideError) return next(asideError)
            //render post            
            res.render('post', { title: post.title, post, topPosts: asideResults.topPosts, tags: asideResults.tags, latestPosts: asideResults.latestPosts })
        } catch (error) {
            next(error)
        }
    }]

async function aside() {
    //get top posts, latest posts, tags
    try {
        const results = await parallel({
            topPosts: async function () {
                const result = await Post
                    .find({ status: 'published' })
                    .sort({ views: 'desc' })
                    .limit(6)
                    .populate('image')
                    .exec()
                return result
            },
            tags: async function () {
                const result = await Tag.find().populate('postCount')
                // if (tags) {
                //     const promise = tags.map(async tag => {
                //         const postCount = await Post.countDocuments({ 'tags': tag._id })
                //         const added = {
                //             _id: tag._id,
                //             name: tag.name,
                //             image: tag.image,
                //             slug: tag.slug,
                //             postCount: postCount,
                //         }
                //         return added
                //     })
                //     const result = await Promise.all(promise)
                //     return result
                // }
                // else return []
                return result
            },
            latestPosts: async function () {
                const result = await Post
                    .find({ status: 'published' })
                    .sort({ updatedAt: 'desc' })
                    .limit(6)
                    .populate('image')
                    .exec()
                return result
            },
        })
        return [null, results]
    } catch (error) {
        return [error, {}]
    }
}

