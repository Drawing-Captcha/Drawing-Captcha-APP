const express = require("express");
const initializeAppComposer = require("./controllers/initializeAppComposer.js")
const loadMiddleware = require('./config/middlewareLoader.js');
const configLoader = require("./config/configLoader.js");
const sessionLoader = require("./config/sessionLoader.js");
const routesLoader = require("./config/routesLoader.js");
const startApp = require("./config/startApp.js");
const app = express();

initializeAppComposer()

sessionLoader(app)

loadMiddleware(app)

configLoader(app)

routesLoader(app)

startApp(app)


