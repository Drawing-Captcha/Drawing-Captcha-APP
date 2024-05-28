const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const AllowedOriginModel = require("../models/AllowedOrigins.js");
const { promises: fsPromises } = require('fs');

let pool = [];
let deletedBin = [];
let allowedOrigins = [];
const port = process.env.PORT;
let defaultOrigin = [`http://localhost:${port}`];

async function initializePool() {
    try {
        const poolFilePath = path.join(__dirname, '../src/pool.txt');
        const contents = await fsPromises.readFile(poolFilePath, 'utf-8');
        if (contents.trim() === "") {
            console.log("The file pool.txt is empty");
            pool = [];
            return pool;
        } else {
            pool = JSON.parse(contents);
            return pool;
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        pool = [];
    }
}

async function initializeAllowedOrigins() {
    try {
        allowedOrigins = await AllowedOriginModel.find({});
        if (allowedOrigins.length > 0) {
            allowedOrigins.forEach(origin => {
                defaultOrigin.push(origin.allowedOrigin);
            });
            return defaultOrigin;
            console.log("Allowed origins: ", defaultOrigin);
        } else {
            return defaultOrigin;
            console.log("Allowed origins are currently empty. Added localhost as default.");
        }
    } catch (err) {
        console.log("Error parsing JSON data while initializing allowedOrigins:", err);
    }
}

async function initializeBin() {
    try {
        const binFilePath = path.join(__dirname, '../src/deletedBin.txt');
        const contents = await fsPromises.readFile(binFilePath, 'utf-8');
        if (contents.trim() === "") {
            console.log("The file 'deletedBin.txt' is empty.");
            deletedBin = [];
            return deletedBin
        } else {
            deletedBin = JSON.parse(contents);
            return deletedBin
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        deletedBin = [];
    }
}



module.exports = {
    get pool() {
        return initializePool();
    },
    get deletedBin() {
        return initializeBin();
    },
    get defaultOrigin() {
        return initializeAllowedOrigins();
    },
    initializeAllowedOrigins,
    initializeBin,
    initializePool
};
