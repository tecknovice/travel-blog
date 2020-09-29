const debug = require('debug')('travel-blog:indexController')
const { query, sanitizeQuery, validationResult } = require('express-validator');
const parallel = require('async/parallel')
const Image = require('../models/Image')
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const User = require('../models/User')

exports.homePage = async function (req, res, next) {
    try {
        const result = await parallel({
            me: async function () {
                const result = await User
                    .findOne({ email: 'vanhung2210@gmail.com' })
                    .populate({ path: 'avatar' })
                    .exec()
                return result
            },
            totalPost: async function () {
                const result = await Post
                    .count({ status: 'published' })
                    .exec()
                return result
            },
            totalImage: async function () {
                const result = await Image
                    .count()
                    .exec()
                return result
            },
            topPosts: async function () {
                const result = await Post
                    .find({ status: 'published' })
                    .sort({ views: 'desc' })
                    .limit(6)
                    .populate('image')
                    .populate('tags')
                    .exec()
                return result
            },
            latestPosts: async function () {
                const result = await Post
                    .find({ status: 'published' })
                    .sort({ createdAt: 'desc' })
                    .limit(6)
                    .populate('image')
                    .populate('tags')
                    .exec()
                return result
            },
        })
        debug('me', result.me)
        res.render('index', { title: 'The solo guy', me: result.me, totalPost: result.totalPost, totalImage: result.totalImage, topPosts: result.topPosts, latestPosts: result.latestPosts })
    } catch (error) {
        next(error)
    }
}

exports.search = [
    query('keyword', 'keyword is required').isLength({ min: 1 }),
    sanitizeQuery('*').escape(),
    async function (req, res, next) {
        debug('load:req', req.query)
        const result = validationResult(req);
        if (!result.isEmpty()) {
            error = new Error(result.errors.map(item => item.msg).reduce((totalMsg, curMsg) => totalMsg + curMsg))
            error.status = 404
            return next(error)
        }
        try {
            let posts = await Post
                .find({ status: 'published', title: { $regex: req.query.keyword, $options: 'i' } })
                .sort({ views: 'desc' })
                .limit(6)
                .populate('image')
                .populate('tags')
                .exec()
            debug('search:posts', posts)
            if (posts.length > 0)
                res.render('search', { title: `Search results for "${req.query.keyword}"`, keyword: req.query.keyword, posts })
            else
                res.render('search', { title: `No post found for "${req.query.keyword}"`, keyword: req.query.keyword })
        } catch (error) {
            next(error)
        }
    }
]