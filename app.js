const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require("crypto");
const path = require("path");
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db.js")
const deleteAndLog = require("./services/deleteAndLog.js")
const deleteAllFilesInDir = require("./services/deleteAllFilesInDir.js");
const { pool, deletedBin, allowedOrigins, defaultOrigin, initializeAllowedOrigins, initializeBin, initializePool } = require("./controllers/initializeController.js")
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const port = process.env.PORT;
let origins
connectDB()
setInterval(deleteAndLog, 1000 * 60 * 60 * 24);

async function initialize() {
    origins = await initializeAllowedOrigins()
    await pool
    await deletedBin
}

initialize().then(() => {
    console.log("src initialized")
})

const app = express();
deleteAllFilesInDir("./tmpimg").then(console.log("All files deleted in ./tmpimg"))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use('/tmpimg', express.static('tmpimg'));
app.use(bodyParser.json());
app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

const mongoURI = process.env.MONGO_URI
const store = new MongoDBSession({
    uri: mongoURI,
    collection: "mySessions",
})

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: crypto.randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: store,
}));

const indexRoutes = require("./routes/index.js")
const authRoutes = require("./routes/auth.js")
const captchaRoutes = require("./routes/captcha.js")
const dashboardRoutes = require("./routes/dashboard.js");

app.use('/', indexRoutes);
app.use('/auth', authRoutes)
app.use('/captcha', captchaRoutes)
app.use('/dashboard', dashboardRoutes)

app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
    store.collection.deleteMany({}, (err) => {
        if (err) {
            console.error('Error while trying to delete Sessions:', err);
        } else {
            console.log('All Sessions successfully.');
        }
    });
});
