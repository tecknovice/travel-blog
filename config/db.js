const mongoose = require('mongoose')
const connectURL = process.env.MONGODB_URL
mongoose.connect(connectURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));