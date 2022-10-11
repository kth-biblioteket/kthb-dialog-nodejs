
'use strict';

require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require('path');

const database = require('./db');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(process.env.APP_PATH, express.static(path.join(__dirname, "public")));

const apiRoutes = express.Router();

apiRoutes.get("/init", async function (req, res, next) {
    try {
        const sqlQuery =  `CREATE TABLE IF NOT EXISTS emails(id int AUTO_INCREMENT,
                                    firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50), PRIMARY KEY(id))`;

        database.db.query(sqlQuery, (err) => {
            if (err) {
                res.send('Error! ' + err.message)        
            } else {
                res.send('Table created!')
            }
        });
    } catch(err) {
        res.send('Error! ' + err.message)
    }
});

apiRoutes.get("/events", async function (req, res, next) {
    try {
        let events = await readEvents()
        res.send(events)
    } catch(err) {
        res.send(err.message)
    }
});

app.use(process.env.APP_PATH, apiRoutes);

const server = app.listen(process.env.PORT || 3002, function () {
    const port = server.address().port;
    console.log("App now running on port", port);
});

//Hämta alla Events
const readEvents = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM emails`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

