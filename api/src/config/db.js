const mongoose = require('mongoose');
require('dotenv').config();

let cached = global._mongooseCached || {};

async function connect() {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then((mongoose) => {
            console.log('MongoDB connected!');
            return mongoose;
        }).catch((error) => {
            console.error('MongoDB connection error:', error);
            throw error;
        });
    }
    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.conn = null;
        throw err;
    }
    return cached.conn;
}

global._mongooseCached = cached;

module.exports = { connect };