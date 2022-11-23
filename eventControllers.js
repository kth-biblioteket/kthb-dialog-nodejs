require('dotenv').config()

const eventModel = require('./eventModels');

const axios = require('axios')
const cheerio = require('cheerio');
const fs = require("fs");
const path = require('path');


// Funktion som genererar ett 
// admingränssnitt
async function generateEventsAdminApp(req, res, next) {

    let event
    let events 
    let actions
    let actionchoices
    let subactionchoices
    
    //Läs in event
    try {
        event = await eventModel.readEventId(req.params.event_id)
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in event
    try {
        events = await eventModel.readEvents()
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in actions
    try {
        actions = await eventModel.readAllActions()
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in choices
    try {
        actionchoices = await eventModel.readAllActionChoices()
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in subchoices
    try {
        subactionchoices = await eventModel.readAllSubActionChoices()
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in actionchoicetypes
    try {
        actionchoicetypes = await eventModel.readActionChoiceTypes()
    } catch(err) {
        res.send("error: " + err.message)
    }

    //Läs in images
    try {
        images = await eventModel.readImages()
    } catch(err) {
        res.send("error: " + err.message)
    }

    try {
        admindata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "event": event,
            "events": events,
            "actions": actions,
            "actionchoices": actionchoices,
            "subactionchoices": subactionchoices,
            "actionchoicetypes": actionchoicetypes,
            "images": images
        }
        res.render('pages/admin', admindata);

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

    //Hämta config/data från JSON-fil
    let choicedata_json = await axios.get('https://apps-ref.lib.kth.se/kthbdialog/config/config.json')

    //Hämta config/data från DB
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
        //let kthschools = await axios.get('https://www.kth.se/api/kopps/v2/schools')
        //let kthschools_en = await axios.get('https://www.kth.se/api/kopps/v2/schools?l=en')

        let kthschools = await eventModel.readKthschools()

        let breakuplines_en = [
            "Let’s just be friends",
            "I am not ready for a relationship",
            "I want to take it slow",
            "It’s not you, it’s me"
        ]
        let breakuplines_sv = [
            "Hej men nej"
        ]

        let labels = {
            "submitActionButtonText_en": "Continue",
            "submitActionButtonText_sv": "Fortsätt",
            "submitEmailButtonText_en": "Submit",
            "submitEmailButtonText_sv": "Skicka",
            "thanksText_en": "Thanks!",
            "thanksText_sv": "Tack!",
            "instruction1_sv": "Beskriv ditt behov av stöd samt inom vilket område",
            "instruction1_en": "Describe support needs and in which area",
            "instruction2_sv": "Gör dina val och tryck på ”fortsätt”",
            "instruction2_en": "Make your selections and select ”continue”",
            "userinfo_sv": "",
            "userinfo_en": "",
            "emailinstruction_sv": "Skriv in din mailadress och tryck på ”Skicka!”",
            "emailinstruction_en": "Enter your emailadress and press ”Submit!”",
            "confirmationEmailTextboxPlaceholder_sv": "Skriv din epost",
            "confirmationEmailTextboxPlaceholder_en": "Write your email",
            "confirmationSubtitle_sv": "Du valde att...",
            "confirmationSubtitle_en": "You chose to...",
            "confirmationEmailQuestion_sv" : "Valen du gör",
            "confirmationEmailQuestion_en" : "Your choices...",
            "emailPrompt_sv": "Jag vill matchad med någon på biblioteket",
            "emailPrompt_en": "I want to be matched with someone at the library",
            "confirmationEmailQuestionNoButton_sv": "Hej men nej",
            "breakuplines_sv" : breakuplines_sv,
            "breakuplines_en" : breakuplines_en,
            "confirmationEmailQuestionNoButton_en": "Let’s just be friends.",
            "confirmationEmailQuestionYesButton_sv": ["Matcha mig"],
            "confirmationEmailQuestionYesButton_en": ["Match me"],
            "confirmationEmailPrivacyStatement_sv": "",
            "confirmationEmailPrivacyStatement_en": ""
        }
        let confirmationSynonyms_sv = [
            "Tack"
        ]
        let confirmationSynonyms_en = [
            "Thank you"
        ]
        //Skapa dataobjekt att skicka till webbapp
        
        choicedata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "query": req.query,
            "language": language,
            "event": data.event,
            "labels": labels,
            "kthschools": kthschools,
            //"kthschools": kthschools.data,
            //"kthschools_en": kthschools_en.data,
            "confirmationSynonyms_sv": confirmationSynonyms_sv,
            "confirmationSynonyms_en": confirmationSynonyms_en,
            "usertypes": usertypes
        }
        

        //choicedata = choicedata_json.data;

        res.render('pages/choice', choicedata);

    } catch(err) {
        res.send("error: " + err.message)
    }
    
}

// Funktion som genererar en resultatapp för ipad/skärm/webb
async function generateChoiceResultsApp(req, res, next) {

    let event
    let data = []
    let language

    try {
        
        language = req.query.language || 'en';
        //Hämta event
        event = await eventModel.readEventId(req.params.event_id)
        for (let event_ of event) { 
            data.event = event_
        }

        //Skapa dataobjekt att skicka till webbapp
        choiceresultsdata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "language": language,
            "event": data.event
        }
        res.render('pages/results', choiceresultsdata);

    } catch(err) {
        res.send("error: " + err.message)
    }
}

//App för att visa statistik
async function generateStatsApp(req, res, next) {

    let events
    let language

    try {
        
        language = req.query.language || 'en';
        //Hämta events
        events = await eventModel.readEvents()

        //Skapa dataobjekt att skicka till webbapp
        statsdata = {
            "url": req.protocol + '://' + req.get('host') + req.originalUrl,
            "language": language,
            "events": events
        }
        res.render('pages/stats', statsdata);

    } catch(err) {
        res.send("error: " + err.message)
    }
}

//Logga in via aKTH LDAP
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

//Logga ut
async function logout(req, res) {
    res
    .clearCookie("jwt")
    .status(200)
    .json({ message: "Success" });
}

//Hämta alla KTH-skolor via KOPPS API
async function getkthschools(req, res) {
    try {
        const response = await axios.get('https://www.kth.se/api/kopps/v2/schools')
        res
        .status(200)
        .send(response.data);
    } catch(err) {
        console.log(err)
        res.status(400).send(err);
    }
}

//Hämta ett event via id
async function readEvent(req, res) {
    try {
        let response = await eventModel.readEventId(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

//Hämta alla events
async function readAllEvents(req, res) {
    try {
        let response = await eventModel.readEvents()
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readAllEventActions(req, res) {
    try {
        let response = await eventModel.readAllEventActions(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
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

async function createEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en) {
    try {
        let result = await eventModel.createEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function updateEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en, event_id) {
    try {
        let result = eventModel.updateEvent(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en, event_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function deleteEvent(req, res) {
    try {
        let response = await eventModel.deleteEvent(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readActions(event_id) {
    try {
        let result = await eventModel.readActions(event_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readAllActions(req, res) {
    try {
        let response = await eventModel.readAllActions()
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readAction(req, res) {
    try {
        let response = await eventModel.readAction(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function createAction(event_id, name, name_en, description, description_en, image_id, rgbacolor) {
    try {
        let result = await eventModel.createAction(event_id, name, name_en, description, description_en, image_id, rgbacolor)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function updateAction(event_id, name, name_en, description, description_en, image_id, rgbacolor, action_id) {
    try {
        let result = await eventModel.updateAction(event_id, name, name_en, description, description_en, image_id, rgbacolor, action_id)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function deleteAction(req, res) {
    try {
        let response = await eventModel.deleteAction(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readAllActionChoices(req, res) {
    try {
        let response = await eventModel.readAllActionChoices(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readActionChoice(req, res) {
    try {
        let response = await eventModel.readActionChoice(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function createActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder) {
    try {
        let result = await eventModel.createActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function updateActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, actionchoice_id) {
    try {
        let result = await eventModel.updateActionChoice(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, actionchoice_id)
        return result
    } catch (err) {
        return {"status": 0, "message": err }
    }
}

async function deleteActionChoice(req, res) {
    try {
        let response = await eventModel.deleteActionChoice(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readAllSubActionChoices(req, res) {
    try {
        let response = await eventModel.readAllSubActionChoices(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function readSubActionChoice(req, res) {
    try {
        let response = await eventModel.readSubActionChoice(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function createSubActionChoice(req, res) {
    try {
        let actionchoice_id = req.body.actionchoice_id
        let actionchoicetype_id = req.body.actionchoicetype_id
        let name = req.body.name
        let name_en = req.body.name_en
        let description = req.body.description
        let description_en = req.body.description_en
        let image_id = req.body.image_id
        let sortorder = req.body.sortorder
        let response = await eventModel.createSubActionChoice(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder)
        res.status(200)
        .json({ message: response });
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

async function updateSubActionChoice(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id) {
    try {
        let result = await eventModel.updateSubActionChoice(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id)
        return result
    } catch (err) {
        return {"status": 0, "message": err.message }
    }
}

async function deleteSubActionChoice(req,res) {
    try {
        let response = await eventModel.deleteSubActionChoice(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
}

//Hämta via action_id
async function readActionChoices(action_id) {
    try {
        let result = await eventModel.readActionChoices(action_id)
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

async function readActionChoicesSession(uuid) {
    try {
        let result = await eventModel.readActionChoicesSession(events_id)
        return result
    } catch (err) {
        console.log(err.message)
        return "error: " + err.message
    }
}

async function readStatsUserActions(req, res, next) {
    try {
        let result = await eventModel.readStatsUserActions(req.params.event_id)
        if(!result) {
            res.status(400).send("error")
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err.message)
        res.status(400).send(err.message)
    }
}

async function readStatsUserActionChoices(req, res, next) {
    try {
        let result = await eventModel.readStatsUserActionChoices(req.params.event_id)
        if(!result) {
            res.status(400).send("error")
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err.message)
        res.status(400).send(err.message)
    }
}

async function readStatsUserSubActionChoices(req, res, next) {
    try {
        let result = await eventModel.readStatsUserSubActionChoices(req.params.event_id)
        if(!result) {
            res.status(400).send("error")
        } else {
            res.status(200).send(result);
        }
    } catch (err) {
        console.log(err.message)
        res.status(400).send(err.message)
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

async function readKthschools(req, res) {
    try {
        let response = await eventModel.readKthschools(req.params.id)
        res
        .status(200)
        .send(response);
    } catch (err) {
        console.log(err)
        res.status(401)
        res.json({ message: err });
    }
}

async function getkthschool(code) {
    try {
        let response = await eventModel.getkthschool(code)
        return response;
    } catch (err) {
        return err.message;
    }
}

async function getusertype(code) {
    try {
        let response = await eventModel.getusertype(code)
        return response;
    } catch (err) {
        return err.message;
    }
}

async function getAction(action_id) {
    try {
        let response = await eventModel.readAction(action_id)
        return response;
    } catch (err) {
        return err.message;
    }
}

async function readsessionuseractionchoices(uuid) {
    try {
        let response = await eventModel.readsessionuseractionchoices(uuid)
        return response;
    } catch (err) {
        return err.message;
    }
}

async function readsessionuseractionmessage(uuid, actionchoice_id) {
    try {
        let response = await eventModel.readsessionuseractionmessage(uuid, actionchoice_id)
        return response;
    } catch (err) {
        return err.message;
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
    generateEventsAdminApp,
    generateChoiceApp,
    generateChoiceResultsApp,
    generateStatsApp,
    login,
    logout,
    getkthschools,
    readEvent,
    readAllEvents,
    readAllEventActions,
    readEventsByDate,
    createEvent,
    updateEvent,
    deleteEvent,
    readActions,
    readAllActions,
    readAction,
    createAction,
    updateAction,
    deleteAction,
    readAllActionChoices,
    readActionChoice,
    createActionChoice,
    updateActionChoice,
    deleteActionChoice,
    readAllSubActionChoices,
    readSubActionChoice,
    createSubActionChoice,
    updateSubActionChoice,
    deleteSubActionChoice,
    readActionChoices,
    createUserActionChoices,
    createUserSubActionChoices,
    createUserActionMessages,
    createUserActionData,
    readStatsUserActions,
    readActionChoicesResult,
    readStatsUserActionChoices,
    readStatsUserSubActionChoices,
    readEventImage,
    createEventImage,
    deleteEventImage,
    readImages,
    readImage,
    createImage,
    updateImage,
    deleteImage,
    readKthschools,
    getkthschool,
    getusertype,
    getAction,
    readsessionuseractionchoices,
    readsessionuseractionmessage,
    substrInBetween,
    truncate
};
