/** @format */

const mongoose = require("mongoose");

const uri = "127.0.0.1:27017";
const dbName = "QuizApp";


class Database {
    constructor() {
        this._connect();
    }
    _connect() {
        mongoose.connect(`mongodb://${uri}/${dbName}`)
        .then(()=> console.log('Database connected successfully'))
        .catch((err)=> console.log('Error setting establishment between node and mongodb', err))
    }
}

module.exports = new Database();