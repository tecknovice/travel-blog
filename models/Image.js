const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true
    },
    size: {
        type: Number,
        required: true
    },
    dimensions: {
        type: [Number],
        required: true
    }
})
const Image = mongoose.model('Image', imageSchema)

module.exports = Image