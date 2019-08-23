const mongoose = require('mongoose')
const moment = require('moment')
const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post'
    },
    visitor: {
        type: Map,
        of: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['approved', 'pending'],
        default: 'pending'
    }
},
    {
        timestamps: true,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    })
// Virtual for published time
commentSchema
    .virtual('commentedTime')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment