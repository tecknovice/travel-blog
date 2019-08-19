const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true
    },
    image:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'Image'
    }
})
const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag