const debug = require('debug')('travel-blog:tagController')
const { param, query, sanitizeQuery, sanitizeParam, validationResult } = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;
const Tag = require('../models/Tag')
const Post = require('../models/Post')

exports.load = [
    query('skip', 'skip must be an integer greater or equal 12').isInt({ min: 12 }),
    sanitizeQuery('skip').trim(),
    async function (req, res, next) {
        debug('load:req', req.query)
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.errors })
            return
        }
        try {
            const tags = await Tag
                .find()
                .populate('image')
                .populate({
                    path: 'postCount',
                    options: {
                        sort: { 'postCount': 'asc' }
                    }
                })
                .skip(Number(req.query.skip))
                .limit(6)
                .exec()
            res.send(tags)
        } catch (error) {
            res.status(500).send(error)
        }
    }
]

exports.tag = [
    param('slug', 'Slug is invalid').custom(async slug => {
        const array = slug.split('-').filter(Boolean)
        if (array.length < 2) return Promise.reject()
        const _id = array[array.length - 1]
        const objectId = new ObjectId(_id)
        const isValid = ObjectId.isValid(objectId)
        if (isValid) return Promise.resolve()
        else return Promise.reject()
    }),
    sanitizeParam('slug').escape(),
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
            //get tag
            const tag = await Tag.findById(id).populate('image')
            if (!tag) {
                error = new Error('Tag not found!')
                error.status = 404
                return next(error)
            }
            if (tag.slug !== slug) {
                res.redirect('/tag/' + tag.slug)
                return
            }
            //get posts
            const posts = await Post
                .find({ status: 'published', 'tags': tag._id })
                .sort({ createdAt: 'desc' })
                .limit(6)
                .populate('image')
                .populate('tags')
                .exec()
            //render tag            
            res.render('tag', { title: tag.name, tag, posts })
        } catch (error) {
            next(error)
        }
    }]

exports.list = async function (req, res, next) {
    try {
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
    } catch (error) {
        next(error)
    }
}