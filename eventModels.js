const database = require('./db');

//Hämta alla Events
const readEvents = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events
                     ORDER BY startdate`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta alla Events efter angivet datum
const readEventsByDate = (startdate) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events
                     WHERE startdate > ?
                    ORDER BY startdate`;
        database.db.query(database.mysql.format(sql,[startdate]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta alla Events med paginering
const readEventsPaginated = (page, limit) => {
    return new Promise(function (resolve, reject) {
        limit = parseInt(limit)
        let offset = (limit * page) - limit;
        const sql = `SELECT * FROM events
                    ORDER BY startdate
                    LIMIT ? OFFSET ?`;
        database.db.query(database.mysql.format(sql,[limit, offset]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta ett event via ID
const readEventId = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events 
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Skapa ett event
const createEvent = (name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO events(name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The event was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

//Uppdatera ett event
const updateEvent = (name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en, event_id) => {
    return new Promise(function (resolve, reject) {

        const sql = `UPDATE events 
                SET name = ?, name_en = ?, description = ?, description_en = ?, startdate = ?, enddate = ?, 
                resultstitle = ?, resultstitle_en = ?, resultssubtitle = ?, resultssubtitle_en = ? 
                WHERE id = ?`;

        database.db.query(database.mysql.format(sql,[name, name_en, description, description_en, startdate, enddate, resultstitle, resultstitle_en, resultssubtitle, resultssubtitle_en, event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }

            if(result.affectedRows > 0) {
                const successMessage = "The event was successfully updated."
                resolve(successMessage);
            } else {
                reject("Inget uppdaterades , kontakta KTH Bibliotekets IT-grupp")
            }
        });
    })
};

//Radera ett event.
const deleteEvent = (id) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM events 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta alla usertypes
const readAllUserTypes = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM usertypes`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta all actions
const readAllActions = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actions`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta actions via Eventid
const readAllEventActions = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT actions.*, images.fullpath FROM actions
                    JOIN images on images.id = actions.image_id      
                    WHERE event_id = ?`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta actions via Eventid
const readActions = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT actions.*, images.fullpath FROM actions
                    JOIN images on images.id = actions.image_id      
                    WHERE event_id = ?`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta action
const readAction = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actions     
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Skapa en action
const createAction = (event_id, name, name_en, description, description_en, image_id, rgbacolor) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO actions(event_id, name, name_en, description, description_en, image_id, rgbacolor)
                VALUES(?, ?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[event_id, name, name_en, description, description_en, image_id, rgbacolor]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The action was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

const updateAction = (event_id, name, name_en, description, description_en, image_id, rgbacolor, action_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE actions 
                    set event_id = ?, name= ?, name_en = ?, description = ?, description_en = ?, image_id = ?, rgbacolor = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[event_id, name, name_en, description, description_en, image_id, rgbacolor, action_id]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The action was updated successfully."
                resolve(successMessage);
            }
        });
    })
};

//Radera en action.
const deleteAction= (id) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM actions 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The action was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta actionchoices via actionid
const readAllActionChoices = (action_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT actionchoices.*, images.fullpath FROM actionchoices
                        JOIN images on images.id = actionchoices.image_id      
                        WHERE action_id = ?`;
        database.db.query(database.mysql.format(sql,[action_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta actionchoice
const readActionChoice = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actionchoices     
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Skapa en actionchoice
const createActionChoice = (action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO actionchoices(action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The actionchoice was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

// Uppdatera en actionchoice
const updateActionChoice = (action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, actionchoice_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE actionchoices 
                    set action_id = ?, actionchoicetype_id = ?, name = ?, name_en = ?, description = ?, description_en = ?, image_id = ?, sortorder = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[action_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, actionchoice_id]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The actionchoice was updated successfully."
                resolve(successMessage);
            }
        });
    })
};

//Radera en actionchoice.
const deleteActionChoice = (id) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM actionchoices 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The actionchoice was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta subactionchoices via actionchoiceid
const readAllSubActionChoices = (actionchoice_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT subactionchoices.*, images.fullpath FROM subactionchoices
                        JOIN images on images.id = subactionchoices.image_id      
                        WHERE actionchoice_id = ?`;
        database.db.query(database.mysql.format(sql,[actionchoice_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta subactionchoice
const readSubActionChoice = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM subactionchoices     
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Skapa en subactionchoice
const createSubActionChoice = (actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO subactionchoices(actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The subactionchoice was entered successfully."
                resolve(successMessage);
            }
        });
    })
};

// uppdatera en subactionchoice
const updateSubActionChoice = (actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE subactionchoices 
                    set actionchoice_id = ?, actionchoicetype_id = ?, name = ?, name_en = ?, description = ?, description_en = ?, image_id = ?, sortorder = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[actionchoice_id, actionchoicetype_id, name, name_en, description, description_en, image_id, sortorder, subactionchoice_id]), async function(err, result) {
            if(err) {
                console.log(err.message)
                reject(err.message)
            } else {
                const successMessage = "The subactionchoice was updated successfully."
                resolve(successMessage);
            }
        });
    })
};

//Radera en subactionchoice.
const deleteSubActionChoice = (id) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM subactionchoices 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The subactionchoice was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta alla actionchoicetypes
const readActionChoiceTypes = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actionchoicetypes`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta actionchoices via Actionid
/*
const readAllActionChoices = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actionchoices       
                    ORDER BY sortorder`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};
*/

//Hämta actionchoices via Actionid
const readActionChoices = (action_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT actionchoices.*, images.fullpath FROM actionchoices
                    JOIN images on images.id = image_id
                    WHERE action_id = ? 
                    ORDER BY sortorder`;
        database.db.query(database.mysql.format(sql,[action_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta alla subactionchoices
/*
const readAllSubActionChoices = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM subactionchoices       
                    ORDER BY sortorder`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};
*/
//Hämta subactionchoices via actionchoice_id
const readSubActionChoices = (actionchoice_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM subactionchoices       
                    WHERE actionchoice_id = ? 
                    ORDER BY sortorder`;
        database.db.query(database.mysql.format(sql,[actionchoice_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till useractionchoices(gjorda val av användare)
const createUserActionChoices = (actionchoice_id, uuid) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO useractionchoices (actionchoice_id, uuid)
                    VALUES(?, ?)`;
        database.db.query(database.mysql.format(sql,[actionchoice_id, uuid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till useractionchoices(gjorda val av användare)
const createUserSubActionChoices = (subactionchoice_id, uuid) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO usersubactionchoices (subactionchoice_id, uuid)
                    VALUES(?, ?)`;
        database.db.query(database.mysql.format(sql,[subactionchoice_id, uuid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till useractiondata(data från användare)
const createUserActionMessages = (subactionchoice_id, message, uuid) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO useractionmessages (subactionchoice_id, message, uuid)
                    VALUES(?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[subactionchoice_id, message, uuid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till useractiondata(data från användare)
const createUserActionData = (usertype_code, schoolcode, uuid) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO useractiondata (usertype_code, schoolcode, uuid)
                    VALUES(?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[usertype_code, schoolcode, uuid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta resultat av actionchoices via event_id
const readActionChoicesResult = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `
            SELECT 
                actions.id, 
                actions.description_en, 
                actions.description,
                actions.rgbacolor,
                count(actions.id) AS 'choices' 
            FROM actions
            INNER JOIN actionchoices
                ON actions.id = actionchoices.action_id
            INNER JOIN useractionchoices
                ON actionchoices.id = useractionchoices.actionchoice_id
            INNER JOIN events
                ON actions.event_id = events.id
            WHERE events.id = ?
            GROUP BY 
                actions.id,actions.description_en,actions.description, actions.rgbacolor`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta useractionchoices för en session
const readActionChoicesSession = (uuid) => {
    return new Promise(function (resolve, reject) {
        const sql = `
            SELECT 
               *
            FROM useractionchoices
            INNER JOIN actionchoices
                ON actions.id = actionchoices.action_id
            INNER JOIN useractionchoices
                ON actionchoices.id = useractionchoices.actionchoice_id
            INNER JOIN events
                ON actions.event_id = events.id
            WHERE events.id = ?
            GROUP BY 
                actions.id,actions.description_en,actions.description, actions.rgbacolor`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta stastistik
const readStatsUserActions = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `
        SELECT 
            actions.id as 'ActionID', 
            actions.name AS 'Beskrivning', 
            count(actions.id) AS 'Antal' 
        FROM actions
        INNER JOIN actionchoices
            ON actions.id = actionchoices.action_id
        INNER JOIN useractionchoices
            ON actionchoices.id = useractionchoices.actionchoice_id
        INNER JOIN events
            ON actions.event_id = events.id
        WHERE events.id = ?
        GROUP BY 
            actions.id,actions.name`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

const readStatsUserActionChoices = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `
        SELECT
            --useractiondata.usertype_code AS 'Användare',
            actionchoices.name AS 'Beskrivning',
            count(useractionchoices.id) AS 'Antal'
        FROM 
        	useractionchoices
        INNER JOIN
            actionchoices ON actionchoices.id = useractionchoices.actionchoice_id
        INNER JOIN
            useractiondata ON useractiondata.uuid = useractionchoices.uuid
        INNER JOIN
            actions ON actions.id = actionchoices.action_id
        INNER JOIN
            events ON events.id = actions.event_id
        WHERE event_id = ?
        GROUP BY
            --useractiondata.usertype_code,
            actionchoices.name`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

const readStatsUserSubActionChoices = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `
        SELECT
            --useractiondata.usertype_code AS 'Användare',
            actionchoices.name AS 'Kategorival',
            subactionchoices.name AS 'Beskrivning',
            count(usersubactionchoices.id) AS 'Antal'
        FROM 
            usersubactionchoices
        INNER JOIN
            subactionchoices ON subactionchoices.id = usersubactionchoices.subactionchoice_id
        INNER JOIN
            actionchoices ON actionchoices.id = subactionchoices.actionchoice_id
        INNER JOIN
            useractiondata ON useractiondata.uuid = usersubactionchoices.uuid
        INNER JOIN
            actions ON actions.id = actionchoices.action_id
        INNER JOIN
            events ON events.id = actions.event_id
        WHERE event_id = ?
        GROUP BY
            --useractiondata.usertype_code,
            actionchoices.name,
            subactionchoices.name`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till en votetype
const createVoteType = (type, description_en, description_sv, rgbacolor) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO votetypes(type, description_en, description_sv, rgbacolor)
                VALUES(?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[type, description_en, description_sv, rgbacolor]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The votetype was successfully created."
            resolve(successMessage);
        });
    })
};

//Ta bort en votetype
const deleteVoteType  = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM votetypes
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The votetype was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Uppdatera en votetype
const updateVoteType  = (type, description_en, description_sv, rgbacolor, id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE votetypes
                    SET type = ?, description_en = ?, description_sv = ?, rgbacolor = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[type, description_en, description_sv, rgbacolor, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The votetype was successfully updated."
            resolve(successMessage);
        });
    })
};

//Lägg till ett events bild
const createEventImage = (event_id, image_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO eventimage(events_id, images_id)
                VALUES(?, ?)`;
        database.db.query(database.mysql.format(sql,[event_id, image_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully created."
            resolve(successMessage);
        });
    })
};

//Ta bort ett events fält
const deleteEventImage = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM eventimage
                    WHERE events_id = ?`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta alla bilder i bildbanken
const readImages = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM images`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta en bild från bildbanken
const readImage = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM images 
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till en bild i bildbanken
const createImage = (fullpath, name, size, type) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO images(fullpath, name, size, type)
                VALUES(?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[fullpath, name, size, type]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully created."
            resolve(successMessage);
        });
    })
};

//Uppdatera bild i bildbanken
const updateImage = (id, name) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE images
                    SET name = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[name, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully updated."
            resolve(successMessage);
        });
    })
};

//Ta bort en bild ur bildbanken
const deleteImage = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM images
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta skolor
const readKthschools = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM kthschools`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Skapa en skola
const createKthschool = (name, name_en, code) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO kthschools(name, name_en, code)
                VALUES(?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[name, name_en, code]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The school was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

//Uppdatera en skola
const updateKthschool = (name, name_en, code, id) => {
    return new Promise(function (resolve, reject) {

        const sql = `UPDATE kthschools 
                SET name = ?, name_en = ?, code = ? 
                WHERE id = ?`;

        database.db.query(database.mysql.format(sql,[name, name_en, code, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }

            if(result.affectedRows > 0) {
                const successMessage = "The school was successfully updated."
                resolve(successMessage);
            } else {
                reject("Inget uppdaterades , kontakta KTH Bibliotekets IT-grupp")
            }
        });
    })
};

//Radera en skola
const deleteKthschool = (id) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM kthschools 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta skola
const getkthschool = (code) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM kthschools
                        WHERE code = ?`;
        database.db.query(database.mysql.format(sql,[code]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta usertyp(forskare / doktorand)
const getusertype = (code) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM usertypes
                        WHERE code = ?`;
        database.db.query(database.mysql.format(sql,[code]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

module.exports = {
    readEvents,
    readEventsByDate,
    readEventsPaginated,
    readEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    readAllUserTypes,
    readAllActions,
    readAllEventActions,
    readActions,
    readAction,
    createAction,
    updateAction,
    deleteAction,
    createActionChoice,
    updateActionChoice,
    deleteActionChoice,
    createSubActionChoice,
    updateSubActionChoice,
    deleteSubActionChoice,
    readActionChoiceTypes,
    readAllActionChoices,
    readActionChoice,
    readActionChoices,
    readAllSubActionChoices,
    readSubActionChoice,
    readSubActionChoices,
    createUserActionChoices,
    createUserSubActionChoices,
    createUserActionMessages,
    createUserActionData,
    readActionChoicesResult,
    readActionChoicesSession,
    readStatsUserActions,
    readStatsUserActionChoices,
    readStatsUserSubActionChoices,
    createVoteType,
    deleteVoteType,
    updateVoteType,
    createEventImage,
    deleteEventImage,
    readImages,
    readImage,
    createImage,
    updateImage,
    deleteImage,
    readKthschools,
    createKthschool,
    updateKthschool,
    deleteKthschool,
    getkthschool,
    getusertype
};