'use strict';

require('dotenv').config()
const bunyan = require('bunyan');

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
const axios = require('axios');

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

app.use(process.env.APP_PATH, express.static(path.join(__dirname, "public")));

app.use(cors({ origin: '*' }));

const apiRoutes = express.Router();

const logger = bunyan.createLogger({
    name: "kthbdialog",
    streams: [{
        type: 'rotating-file',
        path: 'kthbdialog.log',
        period: '1d',
        count: 3,
        level: process.env.LOG_LEVEL || 'info',
    }]
});

//Hänvisa root till admin
apiRoutes.get("/", async function (req, res, next) {
    try {
        let verify = await VerifyAdmin(req, res, next)
        res.redirect(process.env.APP_PATH + "/admin")
    } catch(err) {
        res.render('pages/login', {logindata: {"status":"ok", "message":"login"}})
    }
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

// AdmininstrationsApp
apiRoutes.get("/admin", VerifyToken, eventController.generateEventsAdminApp)

// DialogChoicesApp
apiRoutes.get("/choice/:event_id", eventController.generateChoiceApp)

// DialogResultsApp
apiRoutes.get("/results/:event_id", eventController.generateChoiceResultsApp)

// DialogStatsApp
apiRoutes.get("/stats", eventController.generateStatsApp)

/////////////
// 
// API
// 
/////////////
apiRoutes.post(process.env.API_PATH + "/login", eventController.login)

apiRoutes.post(process.env.API_PATH + "/logout", VerifyToken, eventController.logout)

// Hämta KTH-skolor
apiRoutes.get(process.env.API_PATH + "/kthschoolsapi",eventController.getkthschools)

// Hämta KTH-skolor
apiRoutes.get(process.env.API_PATH + "/kthschools",eventController.readKthschools)

//Hämta alla events
apiRoutes.get(process.env.API_PATH + "/events",eventController.readAllEvents)

//Hämta ett event
apiRoutes.get(process.env.API_PATH + "/event/:id",eventController.readEvent)

// Skapa ett event
apiRoutes.post(process.env.API_PATH + "/event", VerifyToken, async function (req, res, next) {
    try {
        console.log(req.body)
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let startdate = req.body.startdate
        let enddate = req.body.enddate
        let resultstitle = req.body.resultstitle
        let resultstitle_en = req.body.resultstitle_en
        let resultssubtitle = req.body.resultssubtitle
        let resultssubtitle_en =req.body.resultssubtitle_en

        let create = await eventController.createEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en)
        if(create.status == 0) {
            res.status(400).send(create.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.status(400).send(err)
    }
});

// Uppdatera ett event
apiRoutes.put(process.env.API_PATH + "/event/:id", VerifyToken, async function (req, res, next) {
    try {
        let event_id = req.params.id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let startdate = req.body.startdate
        let enddate = req.body.enddate
        let resultstitle = req.body.resultstitle
        let resultstitle_en = req.body.resultstitle_en
        let resultssubtitle = req.body.resultssubtitle
        let resultssubtitle_en =req.body.resultssubtitle_en

        let update = await eventController.updateEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en, event_id)
        if(update.status == 0) {
            res.status(400).send(update.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.status(400).send(err)
    }
});

// Ta bort ett event
apiRoutes.delete(process.env.API_PATH + "/event/:id", VerifyToken, eventController.deleteEvent);

//Hämta alla actions
apiRoutes.get(process.env.API_PATH + "/actions",eventController.readAllActions)

//Hämta alla actions för event
apiRoutes.get(process.env.API_PATH + "/event/:id/actions",eventController.readAllEventActions)

//Hämta action
apiRoutes.get(process.env.API_PATH + "/action/:id",eventController.readAction)

//Skapa action
apiRoutes.post(process.env.API_PATH + "/action", VerifyToken, async function (req, res, next) {
    try {
        let event_id = req.body.event_id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let rgbacolor = req.body.rgbacolor

        let create = await eventController.createAction(event_id, name, name_en, description, description_en, image_id, rgbacolor)
        console.log(create)
        if(create.status == 0) {
            res.status(400).send(create.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.status(400).send(err)
    }
});

// Uppdatera action
apiRoutes.put(process.env.API_PATH + "/action/:id", VerifyToken, async function (req, res, next) {
    try {
        let event_id = req.body.event_id
        let action_id = req.params.id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let rgbacolor = req.body.rgbacolor

        const update = await eventController.updateAction(event_id, name, name_en, description, description_en, image_id, rgbacolor, action_id)
        res.send(update)
    } catch(err) {
        res.send(err.message)
    }
});

// Ta bort action
apiRoutes.delete(process.env.API_PATH + "/action/:id", VerifyToken,eventController.deleteAction)

//Hämta alla actionchoices för action
apiRoutes.get(process.env.API_PATH + "/action/:id/actionchoices",eventController.readAllActionChoices)

//Hämta actionchoice
apiRoutes.get(process.env.API_PATH + "/actionchoice/:id",eventController.readActionChoice)

// Skapa actionchoice
apiRoutes.post(process.env.API_PATH + "/actionchoice", VerifyToken, async function (req, res, next) {
    try {
        let action_id = req.body.action_id
        let actionchoicetype_id = req.body.actionchoicetype_id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let sortorder = req.body.sortorder

        let create = await eventController.createActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder)
        if(create.status == 0) {
            res.status(400).send(create.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.status(400).send(err)
    }
});

// Uppdatera actionchoice
apiRoutes.put(process.env.API_PATH + "/actionchoice/:id", VerifyToken, async function (req, res, next) {
    try {
        let actionchoice_id = req.params.id
        let action_id = req.body.action_id
        let actionchoicetype_id = req.body.actionchoicetype_id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let sortorder = req.body.sortorder
 
        const update = await eventController.updateActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, actionchoice_id)
        res.send(update)
    } catch(err) {
        res.send(err.message)
    }
});

// Ta bort actionchoice
apiRoutes.delete(process.env.API_PATH + "/actionchoice/:id", VerifyToken, eventController.deleteActionChoice)

//Hämta alla subactionchoices för actionchoice
apiRoutes.get(process.env.API_PATH + "/actionchoice/:id/subactionchoices",eventController.readAllSubActionChoices)

//Hämta subactionchoice
apiRoutes.get(process.env.API_PATH + "/subactionchoice/:id",eventController.readSubActionChoice)

// Skapa subactionchoice
apiRoutes.post(process.env.API_PATH + "/subactionchoice", VerifyToken, eventController.createSubActionChoice)

// Uppdatera subactionchoice
apiRoutes.put(process.env.API_PATH + "/subactionchoice/:id", VerifyToken, async function (req, res, next) {
    try {
        let subactionchoice_id = req.params.id
        let actionchoice_id = req.body.actionchoice_id
        let actionchoicetype_id = req.body.actionchoicetype_id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let sortorder = req.body.sortorder

        console.log(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id)
        const update = await eventController.updateSubActionChoice(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id)
        if(update.status == 0) {
            res.status(400).send(update.message)
        } else {
            res.sendStatus(200);
        }
    } catch(err) {
        res.send(err.message)
    }
});

// Ta bort subactionchoice
apiRoutes.delete(process.env.API_PATH + "/subactionchoice/:id", VerifyToken, eventController.deleteSubActionChoice)

// Hämta actions för event
apiRoutes.get(process.env.API_PATH + "/event/actions/:event_id", async function (req, res) {
    try {
        res.write(`<div style="display:flex;flex-direction:column;flex-wrap:wrap" id="actions">`)

        //Hämta alla actions för event
        let actions = await eventController.readActions(req.params.event_id)
        actions.forEach(action => {
            
            const content = fs.readFileSync(__dirname + "/public/images/" + action.image)
            res.write(`<div style="margin-bottom:10px" class="card">
                            <div class="card-body">
                                <div id="updateActionPlaceholder"></div>
                                <div style="display:flex;flex-direction:row;padding-bottom:10px">
                                    <div style="flex:1;display:flex;flex-direction:column">
                                        <label for="description_sv${action.id}">Beskrivning</label>
                                        <input id="description_sv${action.id}" style="margin-bottom:10px" class="form-control" type="text" value="${action.description_sv}"">
                                        <label for="description_en${action.id}">Beskrivning engelska</label>
                                        <input id="description_en${action.id}" style="margin-bottom:10px" class="form-control" type="text" value="${action.description_en}"">
                                        <label for="rgbacolor${action.id}">Färg i resultatcirkel</label>
                                        <input id="rgbacolor${action.id}" style="margin-bottom:10px" class="form-control" type="text" value="${action.rgbacolor}"">
                                        <label for="image${action.id}">Bild</label>
                                        <input id="image${action.id}" style="margin-bottom:10px" class="form-control" type="text" value="${action.image}"">
                                        
                                        <img id="image_img${action.id}" style="flex:2;width:100%" src="data:image/jpeg;base64,`)
                                        res.write(Buffer.from(content).toString('base64'));
                                        res.write('"/>');
                        res.write(`</div>
                                    <div style="flex:1;display:flex;flex-direction:column;justify-content: flex-end;">
                                        <div style="display:flex;justify-content: flex-end;">
                                            <button id="updateAction_${action.id}" onclick="updateAction('${action.id}', '${req.params.event_id}');" type="button" class="btn btn-primary" style="margin-right:10px">
                                                Spara
                                            </button>
                                            <button id="deleteAction_${action.id}" onclick="deleteAction('${action.id}', '${req.params.event_id}');" type="button" class="btn btn-primary">
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

apiRoutes.get(process.env.API_PATH + "/event/subactions/:action_id", async function (req, res) {
    eventController.readSubActions(data.event.actions[i].choices[j].id)
});


// Hämta bilder från bildbank
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

// Uppdatera bilder från bildbank
apiRoutes.put(process.env.API_PATH + "/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.updateImage(req.params.id, req.body.name ))
    } catch(err) {
        res.send(err.message)
    }
});

// Ta bort bilder från bildbank
apiRoutes.delete(process.env.API_PATH + "/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.deleteImage(req.params.id))
    } catch(err) {
        res.send(err.message)
    }
});

// Skapa/Ladda upp bilder till bildbank
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
    if (!req.body.session_choices) {
        res.status(400).send("no choices given")
    } else {
        //Main action choices
        for(let i=0;i<req.body.session_choices.length;i++) {
            let create = await eventController.createUserActionChoices(req.body.session_choices[i], req.body.uuid)
            if(create.status == 0) {
                error = true;
                res.status(400).send(create.message)
            }

            if (typeof create !== 'object' && create.indexOf('error') !== -1) {
                error = true;
                res.status(400).send(create.message)
            }
        }

        //De subchoices som valts(hur presentera?)
        if (!error && req.body.session_subchoices) {
            for(let i=0;i<req.body.session_subchoices.length;i++) {
                let create = await eventController.createUserSubActionChoices(req.body.session_subchoices[i], req.body.uuid)
                if(create.status == 0) {
                    error = true;
                    res.status(400).send(create.message)
                }

                if (typeof create !== 'object' && create.indexOf('error') !== -1) {
                    error = true;
                    res.status(400).send(create.message)
                }
            }
        }

        //De val där det skrivits in fritext under en action
        if (!error && req.body.session_textareas) {
            for(let i=0;i<req.body.session_textareas.length;i++) {
                if(req.body.session_textareas[i].message !== "") {
                    let create = await eventController.createUserActionMessages(req.body.session_textareas[i].subchoice_id, req.body.session_textareas[i].message, req.body.uuid)
                    if(create.status == 0) {
                        error = true;
                        res.status(400).send(create.message)
                    }
        
                    if (typeof create !== 'object' && create.indexOf('error') !== -1) {
                        error = true;
                        res.status(400).send(create.message)
                    }
                }
            }
        }

        //Informationen om använderns skola och titel
        if (!error) {
            let create = await eventController.createUserActionData(req.body.usertype, req.body.school, req.body.uuid)
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
    }
});
  
//Skicka mail till edge med alla val som användaren gjort
apiRoutes.post(process.env.API_PATH + "/reminder", async function (req, res) {

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

    let kthschool;
    let usertype;
    let action;
    let sessionchoices = []
    try {
        kthschool = await eventController.getkthschool(req.body.session_user_choice.school)
    } catch(err) {
        console.log(err)
    }

    try {
        usertype = await eventController.getusertype(req.body.session_user_choice.usertype)
    } catch(err) {
        console.log(err)
    }

    try {
        action = await eventController.getAction(req.body.session_user_choice.action_id)
    } catch(err) {
        console.log(err)
    }

    try {
        let useractionchoices = await eventController.readsessionuseractionchoices(req.body.session_user_choice.uuid)
        for(let i=0 ; i<useractionchoices.length ; i++) {
            let usermessage = await eventController.readsessionuseractionmessage(req.body.session_user_choice.uuid, useractionchoices[i].actionchoice_id)
            sessionchoices.push({"name": useractionchoices[i].name, "message": usermessage[0].message})
        }
        
    } catch(err) {
        console.log(err)
    }
    
    

    const uuid = req.body.session_user_choice.uuid
    if (req.body.contactme) {
        let edgemailoptions = {}
        let template = 'edge_email_sv'
        if (req.body.lang.toUpperCase() == "EN") {
            template = 'edge_email_en'
        } else {

        }
        edgemailoptions = {
            from: {
                //name: req.body.name,
                address: req.body.email
            },
            to: process.env.EDGE_MAIL_ADDRESS,
            subject: "KTH Biblioteket matchmaking",
            template: 'edge_email_sv',
            context:{
                email: req.body.email,
                schoolname: kthschool[0].name,
                usertype: usertype[0].name,
                action: action[0].name,
                sessionchoices: sessionchoices,
                session_user_choice: req.body.session_user_choice
            },
            generateTextFromHTML: true
        };

        try {
            logger.debug(JSON.stringify(edgemailoptions))
            let contactmemailinfo = await transporter.sendMail(edgemailoptions);
        } catch (err) {
            //TODO
        }
        res.send("success")
    }

});

// Statistik
apiRoutes.get(process.env.API_PATH + "/stats/useractions/:event_id",eventController.readStatsUserActions)
apiRoutes.get(process.env.API_PATH + "/stats/useractionchoices/:event_id",eventController.readStatsUserActionChoices)
apiRoutes.get(process.env.API_PATH + "/stats/usersubactionchoices/:event_id",eventController.readStatsUserSubActionChoices)

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

