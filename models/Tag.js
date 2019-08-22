const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Image'
    }
},
    {
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    })
// Virtual for slug
tagSchema
    .virtual('slug')
    .get(function () {
        return this.name.toLowerCase().split(' ').filter(item => item.length > 0).join('-')+'-'+this._id;
    });
//Virtual for post
tagSchema.virtual('postCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'tags',
    count: true
})
const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag