/** @format */

const mongoose = require("mongoose");
require('dotenv').config()


const MongoUserName = process.env.MONGODB_USERNAME;
const MongoPassword = process.env.MONGODB_PASSWORD;
const MongoDB_Name = process.env.MONGODB_DBNAME;

const uri = `mongodb+srv://${MongoUserName}:${MongoPassword}@cluster0.qxequet.mongodb.net/${MongoDB_Name}`


class Database {
    constructor() {
        this._connect();
    }
    _connect() {
        mongoose.connect(uri)
        .then(()=> console.log('Database connected successfully 😊😊😊😊'))
        .catch((err)=> console.log('Error setting establishment between node and mongodb 😔😔😭', err))
    }
}

module.exports = new Database();