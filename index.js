'use strict';

require('dotenv').config()

const jwt = require("jsonwebtoken");
const VerifyToken = require('./VerifyToken');
const VerifyAdmin = require('./VerifyAdmin');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const fs = require("fs");
const path = require('path');
const eventController = require('./eventControllers');
const fileUpload = require('express-fileupload');
const { randomUUID } = require('crypto');
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true
}));

app.use(cookieParser());

const socketIo = require("socket.io");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: '*' }));

const apiRoutes = express.Router();

apiRoutes.get("/", async function (req, res, next) {
    try {
        let verify = await VerifyAdmin(req, res, next)
        res.redirect(process.env.APP_PATH + "/admin")
    } catch(err) {
        res.render('login', {logindata: {"status":"ok", "message":"login"}})
    }
});

apiRoutes.get('/public/images/:name', function(req, res) {
    res.sendFile(__dirname + "/public/images/" + req.params.name);
});

apiRoutes.get('/public/style.css', function(req, res) {
    res.sendFile(__dirname + "/public/css/" + "styles.css");
});

apiRoutes.get('/public/results.css', function(req, res) {
    res.sendFile(__dirname + "/public/css/" + "results.css");
});

apiRoutes.get('/public/chartjs-plugin-doughnutlabel-rebourne.js', function(req, res) {
    res.sendFile(__dirname + "/public/js/" + "chartjs-plugin-doughnutlabel-rebourne.js");
});



apiRoutes.get('/public/styles_pdf.css', function(req, res) {
    res.sendFile(__dirname + "/public/css/" + "styles_pdf.css");
});

apiRoutes.get('/public/TheSans-Plain-kthb.ttf', function(req, res) {
    fs.readFile(__dirname + "/public/fonts/" + "TheSans-Plain-kthb.ttf", function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("error", 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('Font saknas: '+error.code+' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/font-ttf' });
            res.end(content, 'utf-8');
        }
    });  
});

apiRoutes.get('/public/FarnhamDisplay-RegularOSF.ttf', function(req, res) {
    fs.readFile(__dirname + "/public/fonts/" + "FarnhamDisplay-RegularOSF.ttf", function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("error", 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('Font saknas: '+error.code+' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/font-ttf' });
            res.end(content, 'utf-8');
        }
    });
});

apiRoutes.post("/login", eventController.login)

apiRoutes.post("/logout", VerifyToken, eventController.logout)

// AdmininstrationsApp
apiRoutes.get("/admin", VerifyToken, eventController.readEventsPaginated)

//DialogChoicesApp
apiRoutes.get("/choice/:event_id", eventController.generateChoiceApp)

//DialogResultsApp
apiRoutes.get("/results/:event_id", VerifyToken, eventController.generateChoiceResultsApp)

apiRoutes.post(process.env.API_PATH + "/event", VerifyToken, async function (req, res, next) {
    try {
        let name = req.body.name
        let description = req.body.description
        let startdate = req.body.startdate
        let enddate = req.body.enddate
        let create = await eventController.createEvent(name, description, startdate, enddate)
        if(create.status == 0) {
            res.status(400).send(create.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.status(400).send(err)
    }
});

apiRoutes.put(process.env.API_PATH + "/event", VerifyToken, async function (req, res, next) {
    try {
        let guid = req.query.guid || req.body.guid
        let eventtime = req.query.eventtime || req.body.eventtime
        res.send(eventController.updateEvent(guid, eventtime))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete(process.env.API_PATH + "/event", VerifyToken, async function (req, res, next) {
    try {
        let guid = req.query.guid || req.body.guid
        res.send(eventController.deleteEvent(guid))   
    } catch(err) {
        res.send(err.message)
    } 
});

apiRoutes.post(process.env.API_PATH + "/event/field", VerifyToken, async function (req, res, next) {
    try {
        let fields_id = req.body.fields_id
        let events_id = req.body.events_id
        res.send(eventController.createEventField(events_id, fields_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete(process.env.API_PATH + "/event/field", VerifyToken, async function (req, res, next) {
    try {
        let fields_id = req.body.fields_id
        let events_id = req.body.events_id
        res.send(eventController.deleteEventField(events_id, fields_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post(process.env.API_PATH + "/event/image", VerifyToken, async function (req, res, next) {
    try {
        let images_id = req.body.images_id
        let events_id = req.body.events_id
        res.send(eventController.createEventImage(events_id, images_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete(process.env.API_PATH + "/event/image", VerifyToken, async function (req, res, next) {
    try {
        let images_id = req.body.images_id
        let events_id = req.body.events_id
        res.send(eventController.deleteEventImage(events_id, images_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get(process.env.API_PATH + "/event/:id", async function (req, res, next) {
    try {
        let html_template = req.query.template || 'templates/smartsign_template.html'
        if (req.params.id) {
            let page = await eventController.generateCalendarPage(req.params.id, html_template);
            res.send(page)
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get(process.env.API_PATH + "/images", async function (req, res) {
    try {
        res.write(`<div style="display:flex;flex-direction:column;flex-wrap:wrap" id="images">`)

        //Hämta alla bilder
        let imagebank = await eventController.readImages()

        imagebank.forEach(image => {
            const content = fs.readFileSync(image.fullpath)
            res.write(`<div style="margin-bottom:10px" class="card">
                            <div class="card-body">
                                <div style="display:flex;flex-direction:row;padding-bottom:10px">
                                    <div style="flex:1;display:flex;flex-direction:column">
                                        <label for="imageName_${image.id}">Namn</label>
                                        <input id="imageName_${image.id}" style="margin-bottom:10px" class="form-control" type="text" value="${image.name}"">
                                        <label for="image_${image.id}">Bild</label>
                                        <img id="image_${image.id}" style="flex:2;width:100%" src="data:image/jpeg;base64,`)
                                        res.write(Buffer.from(content).toString('base64'));
                                        res.write('"/>');
                        res.write(`</div>
                                    <div style="flex:1;display:flex;flex-direction:column;justify-content: flex-end;">
                                        <div style="display:flex;justify-content: flex-end;">
                                            <button id="updateImage_${image.id}" onclick="updateImage('${image.id}', 'imageName_${image.id}');" type="button" class="btn btn-primary" style="margin-right:10px">
                                                Spara
                                            </button>
                                            <button id="deleteImage_${image.id}" onclick="deleteImage('${image.id}');" type="button" class="btn btn-primary">
                                                Ta bort
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`)
        });
        res.write(`</div>`)
        res.end();
    } catch(err) {
        res.write(err.message + `</div>`)
        res.end();
    }
});

apiRoutes.put(process.env.API_PATH + "/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.updateImage(req.params.id, req.body.name ))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete(process.env.API_PATH + "/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.deleteImage(req.params.id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post(process.env.API_PATH + "/uploadfile", async function (req, res) {
    try {
        let targetFile = req.files.imgFile;
        let imagename = req.body.imagename

        var allowedMimes = ['image/jpeg', 'image/png'];
        if (allowedMimes.includes(targetFile.mimetype)) {
        } else {
            return res.status(400).send('File type not allowed');
        }

        let imagePath = path.join(__dirname, 'imagebank/' + randomUUID() + path.extname(targetFile.name))
        targetFile.mv(imagePath, async (err) => {
            if (err)
                return res.status(500).send(err);
            let create = await eventController.createImage(imagePath, imagename, targetFile.size, targetFile.mimetype)
            return res.send({ status: "success", path: imagePath });
        });
    } catch(err) {
        res.send(err.message)
    }
});

//Hämta resultat för event(att visa på Skärm/Webb)
apiRoutes.get(process.env.API_PATH + "/choice/:event_id", async function (req, res, next) {
    //var clientIp = requestIp.getClientIp(req);
    //console.log("clientip: " + clientIp);
    //Se till att votes initieras med en rad med votes=0 för varje votetypeid för respektive event

    let currentVotes = {};
    let currentNewVotes = {};
    try {
        if (req.params.event_id) {
            let results = await eventController.readActionChoicesResult(req.params.event_id);
            results.forEach(function (row) {
                currentVotes[row.id] = row.choices;
                currentNewVotes[row.id] = {
                  "description_sv": row.description_sv,
                  "description_en": row.description_en,
                  "rgbacolor": row.rgbacolor,
                  "choices": row.choices
                }
            });
            let response = {};
            response["iotProperties"] = {
                "region": process.env.REGION,
                "accessKey": process.env.ACCESSKEY,
                "secretKey": process.env.SECRETKEY,
                "endpoint": process.env.ENDPOINT,
                "topic": process.env.TOPIC
            }
            response["currentVotes"] = currentVotes;
            response["currentNewVotes"] = currentNewVotes;
            res.json(response)
        } else {
            res.status(400).send("please provide event_id")
        }
    } catch(err) {
        res.send(err.message)
    }
  
});
 
//Spara resultat från en dialog(med användare via ipad/ståskärm/webb)
apiRoutes.post(process.env.API_PATH + "/choice/", async function (req, res) {
    let error = false;
    //Gå igenom resultat och spara
    for(let i;i<req.body.session_choices.length;i++) {
            let create = await eventController.createActionChoices(req.body.session_choices[i])
            if(create.status == 0) {
                error = true;
                res.status(400).send(create.message)
            }

            if (typeof create !== 'object' && create.indexOf('error') !== -1) {
                error = true;
                res.status(400).send(create.message)
            }
    }

    if (!error) {
        //Skicka socketmeddelande om att en dialog utförts(fångas upp av ResultatApp)
        io.emit("FromAPI", '{"category" : "' + req.body.category + '", "computerLocation" : "' + req.body.computerLocation + '" }')
        res.sendStatus(200);
    }
});
  
//Skicka mail till användaren
apiRoutes.post(process.env.API_PATH + "/reminder", async function (req, res) {

    /*
    require.extensions['.html'] = function (module, filename) {
        module.exports = fs.readFileSync(filename, 'utf8');
    };

    */
    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./templates/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./templates/'),
    };

    const transporter = nodemailer.createTransport({
        port: 25,
        host: process.env.SMTP_HOST,
        tls: {
            rejectUnauthorized: false
        }
        //requireTLS: true
        //secure: true
    });

    transporter.use('compile', hbs(handlebarOptions))

    //let htmlbody = require('templates/confirmEmailGeneral_' + req.body.lang + '.html');
    let mailOptions;
    if (req.body.lang.toUpperCase() == "SV") {
        mailOptions = {
        from: {
            name: process.env.MAILFROM_NAME_SV,
            address: process.env.MAILFROM_ADDRESS
        },
        to: req.body.email,
        subject: process.env.MAILFROM_SUBJECT_SV,
        template: 'email_' + req.body.lang,
        //html: htmlbody,
        generateTextFromHTML: true
        };
    } else {
        mailOptions = {
        from: {
            name: process.env.MAILFROM_NAME_SV,
            address: process.env.MAILFROM_ADDRESS
        },
        to: req.body.email,
        subject: process.env.MAILFROM_SUBJECT_EN,
        template: 'email_' + req.body.lang,
        //html: htmlbody,
        generateTextFromHTML: true
        };
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error is " + error);
            res.json({ 'error': error });
        }
        else {
            console.log('Email sent: ' + info.response);
            res.json({ 'result': 'mail sent to ' + req.body.email });
        }
    });

});

app.use(process.env.APP_PATH, apiRoutes);

const server = app.listen(process.env.PORT || 3002, function () {
    const port = server.address().port;
    console.log("App now running on port", port);
});

const io = socketIo(server, {path: process.env.APP_PATH + "/socket.io"})

const sockets = {}

io.on("connection", (socket) => {
    socket.on("connectInit", (sessionId) => {
        sockets[sessionId] = socket.id
        app.set("sockets", sockets)
    })
})

app.set("io", io)

