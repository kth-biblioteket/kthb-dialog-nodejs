require('dotenv').config()

const eventModel = require('./eventModels');

const axios = require('axios')
const cheerio = require('cheerio');
const fs = require("fs");
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");


// Funktion som genererar ett 
// admingränssnitt med alla events
async function readEventsPaginated(req, res, next) {
    
    let data = []
    let eventsarray = []
    let events
    let eventsbydate
    let imagebank
    let page = 1
    let size = 10

    if (req.query.page) {
        page = req.query.page;
    } 

    if (req.query.size) {
        size = req.query.size;
    }

    try {
        imagebank = await eventModel.readImages()
        data.imagebank = imagebank
    } catch(err) {
        res.send("error: " + err.message)
    }
    
    //Läs in alla events
    try {
        events = await readEvents()
    } catch(err) {
        res.send("error: " + err.message)
    }

    data.pagination = {
        "page": page,
        "size": size,
        "total": events.length
    }

    let contentid = ""
    try {
        //Hämta paginerade events
        events = await eventModel.readEventsPaginated(page, size)
        data.events = events;
        admindata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "pagination": data.pagination,
            "imagebank":  data.imagebank,
            "events": data.events
        }
        res.render('admin', admindata);

    } catch(err) {
        res.send("error: " + err.message)
    }
    
}

// Funktion som genererar en dialogapp för ipad/skärm/webb
async function generateChoiceApp(req, res, next) {
    
    let data = []
    let event
    let actions
    let subactions
    let choices
    let imagebank
    let language

    language = req.query.language || 'en';

    try {
        imagebank = await eventModel.readImages()
        data.imagebank = imagebank
    } catch(err) {
        res.send("error: " + err.message)
    }

    try {
        //Hämta event
        event = await eventModel.readEventId(req.params.event_id)
        for (let event_ of event) { 
            data.event = event_
        }
        
        //Hämta actions
        actions = await eventModel.readActions(req.params.event_id)
        data.event.actions = actions;

        //Hämta choices
        for(let i = 0; i <  data.event.actions.length; i++){ 
             data.event.actions[i].choices = await eventModel.readActionChoices(actions[i].id)
             //Hämta subactionchoices
            for(let j = 0; j <  data.event.actions[i].choices.length; j++){ 
                data.event.actions[i].choices[j].subchoices = await eventModel.readSubActionChoices(data.event.actions[i].choices[j].id)
            } 
        } 

        //Hämta usertypes
        usertypes = await eventModel.readAllUserTypes()
        data.usertypes = usertypes;

        
        // Hämta KTH-skolor
        let kthschools = await axios.get('https://www.kth.se/api/kopps/v2/schools')
        let kthschools_en = await axios.get('https://www.kth.se/api/kopps/v2/schools?l=en')

        let labels = {
            "submitActionButtonText_en": "Submit",
            "submitActionButtonText_sv": "Skicka",
            "submitEmailButtonText_en": "Submit",
            "submitEmailButtonText_sv": "Skicka",
            "thanksText_en": "Thanks!",
            "thanksText_sv": "Tack!",
            "instruction_sv": "Välj dina alternativ och tryck på ”Skicka!”",
            "instruction_en": "Select your alternatives and press ”Submit!”",
            "emailinstruction_sv": "Skriv in din mailadress och tryck på ”Skicka!”",
            "emailinstruction_en": "Enter your emailadress and press ”Submit!”",
            "confirmationSubtitle_sv": "Du valde att...",
            "confirmationSubtitle_en": "You chose to...",
            "confirmationEmailQuestion_sv" : "Valen du gör",
            "confirmationEmailQuestion_en" : "Your choices...",
            "emailPrompt_sv": "Vill du att vi skickar ett uppföljningsmail med ytterligare information?",
            "emailPrompt_en": "Do you want us to send you a confirmation mail...",
            "confirmationEmailQuestionNoButton_sv": "Nej",
            "confirmationEmailQuestionNoButton_en": "No",
            "confirmationEmailQuestionYesButton_sv": "Ja",
            "confirmationEmailQuestionYesButton_en": "Yes",
            "confirmationEmailPrivacyStatement_sv": "Vi sparar inte din epostadress och kommer bara att använda den till att skicka ett uppföljningsmail med ytterligare information.<br />Vi kommer inte att använda den till att skicka skräppost.",
            "confirmationEmailPrivacyStatement_en": "We do not save your email and will only use it..."
        }
        let confirmationSynonyms_sv = [
            "Toppen!",
            "Bra!"
        ]
        let confirmationSynonyms_en = [
            "Super!",
            "Good!"
        ]
        //Skapa dataobjekt att skicka till webbapp
        choicedata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "language": language,
            "event": data.event,
            "labels": labels,
            "kthschools": kthschools.data,
            "kthschools_en": kthschools_en.data,
            "confirmationSynonyms_sv": confirmationSynonyms_sv,
            "confirmationSynonyms_en": confirmationSynonyms_en,
            "usertypes": usertypes
        }
        res.render('choice', choicedata);

    } catch(err) {
        res.send("error: " + err.message)
    }
    
}

// Funktion som genererar en resultatapp för ipad/skärm/webb
async function generateChoiceResultsApp(req, res, next) {

    let event
    let data = []

    try {
        //Hämta event
        event = await eventModel.readEventId(req.params.event_id)
        for (let event_ of event) { 
            data.event = event_
        }

        //Skapa dataobjekt att skicka till webbapp
        choiceresultsdata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "event": data.event
        }
        res.render('results', choiceresultsdata);

    } catch(err) {
        res.send("error: " + err.message)
    }
}

async function login(req, res) {
    try {
        const response = await axios.post(process.env.LDAPAPIPATH + '/login', req.body)
        res
        .cookie("jwt", response.data.token, {
            maxAge: 60 * 60 * 24 * 7 * 1000,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
        })
        .status(200)
        .json({ message: "Success" });
    } catch(err) {
        res.status(401)
        res.json({ message: "Error" });
    }
}

async function logout(req, res) {
    res
    .clearCookie("jwt")
    .status(200)
    .json({ message: "Success" });
}

async function getkthschools(req, res) {
    try {
        const response = await axios.get('https://www.kth.se/api/kopps/v2/schools')
        res
        .status(200)
        .send(response.data);
    } catch(err) {
        console.log(err)
        res.status(401)
        res.json({ message: err });
    }
}

async function readEvents() {
    try {
        let result = await eventModel.readEvents()
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readEventsByDate(eventtime) {
    try {
        let result = await eventModel.readEventsByDate(eventtime)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readEventId(id) {
    try {
        let result = await eventModel.readEventId(id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function createEvent(name, description, startdate, enddate) {
    try {
        let result = await eventModel.createEvent(name, description, startdate, enddate)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function updateEvent(id, name, description, startdate, enddate) {
    try {
        let result = eventModel.updateEvent(name, description, startdate, enddate, id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function deleteEvent(id) {
    try {
        let result = await eventModel.deleteEvent(id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function createUserActionChoices(actionchoice_id, uuid) {
    try {
        let result = await eventModel.createUserActionChoices(actionchoice_id, uuid)
        return result
    } catch (err) {
        console.log("error in controller createUserActionChoices")
        return "error: " + err.message
    }
}

async function createUserSubActionChoices(subactionchoice_id, uuid) {
    try {
        let result = await eventModel.createUserSubActionChoices(subactionchoice_id, uuid)
        return result
    } catch (err) {
        console.log("error in controller createUserSubActionChoices")
        return "error: " + err.message
    }
}

async function createUserActionMessages(subactionchoice_id, message, uuid) {
    try {
        let result = await eventModel.createUserActionMessages(subactionchoice_id, message, uuid)
        return result
    } catch (err) {
        console.log("error in controller createUserActionMessages")
        return "error: " + err.message
    }
}

async function createUserActionData(usertype_code, schoolcode, uuid) {
    try {
        let result = await eventModel.createUserActionData(usertype_code, schoolcode, uuid)
        return result
    } catch (err) {
        console.log("error in controller createUserActionData")
        return "error: " + err.message
    }
}

async function readActionChoicesResult(events_id) {
    try {
        let result = await eventModel.readActionChoicesResult(events_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readEventFields(events_id) {
    try {
        let result = await eventModel.readEventFields(events_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function createEventField(event_id, field_id) {
    try {
        let result = await eventModel.createEventField(event_id, field_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function deleteEventField(event_id, field_id) {
    try {
        let result = await eventModel.deleteEventField(event_id, field_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readEventImage(events_id) {
    try {
        let result = await eventModel.readEventImage(events_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function createEventImage(event_id, image_id) {
    try {
        let result = await eventModel.deleteEventImage(event_id)
        result = await eventModel.createEventImage(event_id, image_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function deleteEventImage(event_id) {
    try {
        let result = await eventModel.deleteEventImage(event_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readImages() {
    try {
        result = await eventModel.readImages()
        return result;
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readImage(id) {
    try {
        result = await eventModel.readImage(id)
        return result;
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function createImage(fullpath, name, size, type) {
    try {
        let result = await eventModel.createImage(fullpath, name, size, type)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function updateImage(id, name) {
    try {
        let result = await eventModel.updateImage(id, name)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function deleteImage(id) {
    try {
        let image = await eventModel.readImage(id)
        let result = await eventModel.deleteImage(id)
        //Ta bort bildfilen
        fs.unlinkSync(image[0].fullpath);
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

function substrInBetween(whole_str, str1, str2) {
    if (whole_str.indexOf(str1) === -1 || whole_str.indexOf(str2) === -1) {
        return undefined;
    }
    return whole_str.substring(
        whole_str.indexOf(str1) + str1.length,
        whole_str.indexOf(str2)
    );
}

function truncate(str, max, suffix) {
    return str.length < max ? str : `${str.substr(0, str.substr(0, max - suffix.length).lastIndexOf(' '))}${suffix}`;
}

module.exports = {
    readEventsPaginated,
    generateChoiceApp,
    generateChoiceResultsApp,
    login,
    logout,
    getkthschools,
    readEvents,
    readEventsByDate,
    readEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    createUserActionChoices,
    createUserSubActionChoices,
    createUserActionMessages,
    createUserActionData,
    readActionChoicesResult, 
    createEventField,
    deleteEventField,
    readEventImage,
    createEventImage,
    deleteEventImage,
    readImages,
    readImage,
    createImage,
    updateImage,
    deleteImage,
    substrInBetween,
    truncate
};
