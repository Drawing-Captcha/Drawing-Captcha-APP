const path = require("path");
const { promises: fsPromises } = require('fs');
const fs = require("fs");
const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware")

let pool
let deletedBin
initializePool()
initializeBin()

router.get('/getElements', authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    initializePool();
    if (pool) {
        res.json({ pool });
    }
    else console.error("pool not defined");

});

router.put("/crud", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {
    initializePool();
    initializeBin();
    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let index
    console.log(tmpPool)
    if (Array.isArray(tmpPool)) {
        tmpPool.map(x => {
            index = pool.findIndex(b => b.ID === x.ID);
        });

        if (req.body.isDelete) {
            deletedObject = pool.splice(index, 1)[0];
            console.log("deleted object: ", deletedObject)
            console.log("current pool: ", pool)
            deletedBin.push(deletedObject)

            fs.writeFile('./src/deletedBin.txt', JSON.stringify(deletedBin, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to deletedBin.txt.');
                }
            });

            fs.writeFile('./src/pool.txt', JSON.stringify(pool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });
            initializePool();
            initializeBin();

        } else {
            pool[index].Name = tmpPool[0].Name
            pool[index].ValidateF = tmpPool[0].ValidateF
            pool[index].validateMinCubes = tmpPool[0].validateMinCubes
            pool[index].validateMaxCubes = tmpPool[0].validateMaxCubes
            pool[index].MaxTolerance = (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length;
            pool[index].MinTolerance = (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length;
            pool[index].todoTitle = tmpPool[0].todoTitle
            pool[index].backgroundSize = tmpPool[0].backgroundSize

            fs.writeFile('./src/pool.txt', JSON.stringify(pool, null, 2), 'utf-8', (err) => {
                if (err) {
                    console.error('Error saving JSON file:', err);
                } else {
                    console.log('Data added to pool.txt.');
                }
            });

            initializePool();


        }

        initializePool();


        isGood = true;
    } else {
        console.error("Problem with the array")
    }




    res.json({ isGood })


})

router.get("/apiKeySection", authMiddleware, csrfMiddleware.validateCSRFToken, (req, res) => {

    res.render("apiKeys", { username: req.session.user.username, email: req.session.user.email });

})

module.exports = router

async function initializePool() {
    try {
        const poolFilePath = path.join(__dirname, '../src/pool.txt');
        const contents = await fsPromises.readFile(poolFilePath, 'utf-8');
        if (contents.trim() === "") {
            console.log("The file pool.txt is empty");
            pool = [];
        } else {
            pool = JSON.parse(contents);
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        pool = [];
    }
}

async function initializeBin() {
    try {
        const binFilePath = path.join(__dirname, '../src/deletedBin.txt');
        const contents = await fsPromises.readFile(binFilePath, 'utf-8');
        if (contents.trim() === "") {
            console.log("The file 'deletedBin.txt' is empty.");
            deletedBin = [];
        } else {
            deletedBin = JSON.parse(contents);
        }
    } catch (err) {
        console.log("Error parsing JSON data:", err);
        deletedBin = [];
    }
}
