const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoURI = process.env.MONGO_URI
const store = new MongoDBSession({
    uri: mongoURI,
    collection: "mySessions",
  })
  module.exports = store;