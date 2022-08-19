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
const createEvent = (name, name_en, description, description_en, startdate, enddate) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO events(name, name_en, description, description_en, startdate, enddate)
                VALUES(?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[name, name_en, description, description_en, startdate, enddate]), async function(err, result) {
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
const updateEvent = (name, description, startdate, enddate, id) => {
    return new Promise(function (resolve, reject) {

        const sql = `UPDATE events 
                SET name = ?, description = ?, startdate = ?, enddate = ? 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[name, description, startdate, enddate, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully updated."
            resolve(successMessage);
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

//Hämta actions via Eventid
const readActions = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actions       
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

//Skapa en action
const createAction = (event_id, description_sv, description_en, image, rgbacolor) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO actions(event_id, description_sv, description_en, image, rgbacolor)
                VALUES(?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[event_id, description_sv, description_en, image, rgbacolor]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The action was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

const updateAction = (description_sv, description_en, image, rgbacolor, action_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE actions 
                    set description_sv = ?, description_en = ?, image = ?, rgbacolor = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[description_sv, description_en, image, rgbacolor, action_id]), async function(err, result) {
            if(err) {
                reject(err.message)
            } else {
                const successMessage = "The action was updated successfully."
                resolve(successMessage);
            }
        });
    })
};

//Hämta actionchoices via Actionid
const readActionChoices = (action_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM actionchoices       
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
        const sql = `SELECT actions.id, 
                        actions.description_en, 
                        actions.description_sv,
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
                        GROUP BY actions.id,actions.description_en,actions.description_sv, actions.rgbacolor`;
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

module.exports = {
    readEvents,
    readEventsByDate,
    readEventsPaginated,
    readEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    readAllUserTypes,
    readActions,
    createAction,
    updateAction,
    readActionChoices,
    readSubActionChoices,
    createUserActionChoices,
    createUserSubActionChoices,
    createUserActionMessages,
    createUserActionData,
    readActionChoicesResult,
    createVoteType,
    deleteVoteType,
    updateVoteType,
    createEventImage,
    deleteEventImage,
    readImages,
    readImage,
    createImage,
    updateImage,
    deleteImage
};