const mongoose = require('mongoose')
const moment = require('moment')
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    content: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    discussable:{
        type: Boolean,
        required: true,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
},
    {
        timestamps: true,
        toObject: {
            // virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    })

// Virtual for description
postSchema
    .virtual('description')
    .get(function () {
        let desc = this.content.replace(/<[^>]+>/g, '')
        if (desc.length > 150) desc = desc.substring(0, 150)
        return desc
    });
// Virtual for slug
postSchema
    .virtual('slug')
    .get(function () {
        return this.title.toLowerCase().split(' ').filter(item => item.length > 0).join('-') + '-' + this._id;
    });
// Virtual for published time
postSchema
    .virtual('publishedTime')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });
const Post = mongoose.model('Post', postSchema)

module.exports = Post