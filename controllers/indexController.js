const debug = require('debug')('travel-blog:indexController')
const { body, param, validationResult } = require('express-validator');
const parallel = require('async/parallel')
const Image = require('../models/Image')
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const User = require('../models/User')

exports.homepage = async function (req, res, next) {
    try {
        const result = await parallel({
            me: async function () {
                const result = await User
                    .findOne({ email: 'vanhung2210@gmail.com' })
                    .populate({ path: 'image' })
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
                    .sort({ updatedAt: 'desc' })
                    .limit(6)
                    .populate('image')
                    .populate('tags')
                    .exec()
                return result
            },
        })
        res.render('index', { title: 'The solo guy', me: result.me, topPosts: result.topPosts, latestPosts: result.latestPosts })
    } catch (error) {
        next(error)
    }
}