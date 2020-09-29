const debug = require('debug')('travel-blog:postController')
const { body, param, query, validationResult, sanitizeBody, sanitizeQuery, sanitizeParam } = require('express-validator')
const ObjectId = require('mongoose').Types.ObjectId;
const Reply = require('../models/Reply')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const Tag = require('../models/Tag')
const User = require('../models/User')
const parallel = require('async/parallel')

exports.load = [
    query('skip', 'skip must be an integer greater or equal 6').isInt({ min: 6 }),
    query('tag', 'tag must be a MongoId').optional().isMongoId(),
    sanitizeQuery('*').escape(),
    async function (req, res, next) {
        debug('load:req', req.query)
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.errors })
            return
        }
        try {
            let posts
            if (req.query.tag)
                posts = await Post
                    .find({ status: 'published', 'tags': req.query.tag })
                    .sort({ createdAt: 'desc' })
                    .skip(Number(req.query.skip))
                    .limit(6)
                    .populate('image')
                    .populate('tags')
                    .exec()
            else if (req.query.keyword)
                posts = await Post
                    .find({ status: 'published', title: { $regex: req.query.keyword, $options: 'i' } })
                    .sort({ views: 'desc' })
                    .skip(Number(req.query.skip))
                    .limit(6)
                    .populate('image')
                    .populate('tags')
                    .exec()
            else
                posts = await Post
                    .find({ status: 'published' })
                    .sort({ createdAt: 'desc' })
                    .skip(Number(req.query.skip))
                    .limit(6)
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
    sanitizeParam('slug').escape(),
    async function (req, res, next) {
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
            //increase view count by 1
            await Post.findByIdAndUpdate(id, { views: post.views+1 })
            //get related posts
            const activeTagIds =  post.tags.map(tag => tag._id)
            const allPosts = await Post
                .find({ status: 'published', _id: { $ne: post._id } })
                .sort({ createdAt: 'desc' })
                .exec();
            const postsMap = new Map()
            allPosts.forEach(currentPost =>{
                let currentTagIds = currentPost.tags.map(tag => tag._id)
                let totalMatchingTag = activeTagIds.filter(tagId => currentTagIds.includes(tagId)).length;
                postsMap.set(currentPost, totalMatchingTag);
            })
            const sortedPostsMap = new Map([...postsMap.entries()].sort((a, b) => b[1] - a[1]));
            const sortedPosts = [...sortedPostsMap.keys()]
            const relatedPosts = sortedPosts.slice(0, 2)
            relatedPosts.forEach(async currentPost => {
                await currentPost.populate('tags').populate('image').execPopulate();
            })
            //get comments
            const comments = await Comment
                .find({ status: 'approved', post: post._id })
                .sort({ createdAt: 'desc' })
                .populate({
                    path: 'replies',
                    match: { status: 'approved' }
                })
            debug('post:comments', comments)
            //get aside data
            const [asideError, asideResults] = await aside()
            if (asideError) return next(asideError)
            //render post            
            res.render('post', { title: post.title, post, relatedPosts, comments, topPosts: asideResults.topPosts, tags: asideResults.tags, latestPosts: asideResults.latestPosts })
        } catch (error) {
            next(error)
        }
    }]

exports.about = async function (req, res, next) {
    try {
        const me = await User
            .findOne({ email: 'vanhung2210@gmail.com' })
            .populate({ path: 'avatar' })
            .exec()
        //get aside data
        const [asideError, asideResults] = await aside()
        if (asideError) return next(asideError)
        res.render('about', { title: 'About Thesologuy', me, topPosts: asideResults.topPosts, tags: asideResults.tags, latestPosts: asideResults.latestPosts })
    } catch (error) {
        next(error)
    }
}

exports.comment = [
    body('post', 'post is not MongoId').isMongoId(),
    body('comment', 'Comment not exceeds 10000 characters').isLength({ max: 10000 }),
    body('name', 'Name is required').isLength({ min: 1 }),
    body('email', 'Email is invalid').isEmail(),
    body('website', 'Website is invalid').optional().isURL(),
    sanitizeBody('*').escape(),
    async function (req, res, next) {
        debug('comment:req.body', req.body)
        const result = await validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.errors })
            return
        }
        try {
            const comment = new Comment({
                post: req.body.post,
                comment: req.body.comment,
                visitor: {
                    name: req.body.name,
                    email: req.body.email,
                    website: req.body.website
                }
            })
            await comment.save()
            res.send(comment)
        } catch (error) {
            res.status(500).send(error)
        }
    }
]

exports.reply = [
    body('comment', 'comment is not MongoId').isMongoId(),
    body('reply', 'Reply can not exceed 10000 characters').isLength({ max: 10000 }),
    body('name', 'Name is required').isLength({ min: 1 }),
    body('email', 'Email is invalid').isEmail(),
    body('website', 'Website is invalid').optional().isURL(),
    sanitizeBody('*').escape(),
    async function (req, res, next) {
        debug('reply:req.body', req.body)
        const result = await validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).send({ errors: result.errors })
            return
        }
        try {
            const reply = new Reply({
                comment: req.body.comment,
                reply: req.body.reply,
                visitor: {
                    name: req.body.name,
                    email: req.body.email,
                    website: req.body.website
                }
            })
            await reply.save()
            res.send(reply)
        } catch (error) {
            res.status(500).send(error)
        }
    }
]

async function aside() {
    //get top posts, latest posts, tags
    try {
        const results = await parallel({
            topPosts: async function () {
                const result = await Post
                    .find({ status: 'published' }, 'title publishedTime image views')
                    .sort({ views: 'desc' })
                    .limit(6)
                    .populate('image')
                    .exec()
                return result
            },
            tags: async function () {
                const result = await Tag.find(null, 'name').populate('postCount')
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
                    .find({ status: 'published' }, 'title publishedTime image createdAt')
                    .sort({ createdAt: 'desc' })
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

