const mongoose = require('mongoose')
const moment = require('moment')
const replySchema = new mongoose.Schema({
    reply: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Comment'
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
replySchema
    .virtual('repliedTime')
    .get(function () {
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss')
    });
const Reply = mongoose.model('Reply', replySchema)

module.exports = Reply