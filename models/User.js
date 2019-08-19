const mongoose = require('mongoose')
const debug = require('debug')('travel-blog-admin:User')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    },
    about: {
        type: String
    },
    socials: {
        type: Map,
        of: String
    }
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    return userObject
}

const User = mongoose.model('User', userSchema)

module.exports = User