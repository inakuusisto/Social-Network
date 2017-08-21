const spicedPg = require('spiced-pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const knox = require('knox');
let secrets;

var db = spicedPg(process.env.DATABASE_URL || `postgres:${require('../secrets.json').name}:${require('../secrets.json').pass}@localhost:5432/socialnetwork`);


if (process.env.NODE_ENV == 'production') {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require('../secrets.json'); // secrets.json is in .gitignore
}
const client = knox.createClient({
    key: secrets.AWS_KEY,
    secret: secrets.AWS_SECRET,
    bucket: 'inasocial'
});


function hashPassword(password) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}


function addUserData (first, last, email, password) {
    return db.query('INSERT INTO users(first_name, last_name, email, password) values($1, $2, $3, $4) returning id',
    [first, last, email, password]);
}


function getUserData (email) {
    return db.query('SELECT * FROM users WHERE email=$1', [email]);
}


function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function(err, doesMatch) {
            if (err) {
                reject(err);
            } else {
                resolve(doesMatch);
            }
        });
    });
}


function sendFile(file) {
    return new Promise (function(resolve, reject) {

        const s3Request = client.put(file.filename, {
            'Content-Type': file.mimetype,
            'Content-Length': file.size,
            'x-amz-acl': 'public-read'
        });

        const readStream = fs.createReadStream(file.path);
        readStream.pipe(s3Request);

        s3Request.on('response', (s3Response) => {

            if (s3Response.statusCode == 200) {
                console.log('jee');
                resolve();
            } else {
                console.log('noouuu!');
                reject();
            }
        });
    });
}


function addImgToDb(image, id) {
    return new Promise (function(resolve, reject) {
        db.query ('UPDATE users SET image=$1 WHERE id=$2',[image, id])

    }).catch(function(err) {
        console.log(err);
    });
}


function updateDbWithBio(bio, id) {
    return db.query ('UPDATE users SET bio=$1 WHERE id=$2',[bio, id]);
}


function getUserDataById (id) {
    return db.query('SELECT * FROM users WHERE id=$1', [id]);
}


function getFriendStatus(otherUserId, userId) {
    return db.query('SELECT request_id, status FROM friend_requests WHERE (recipient_id=$1 OR recipient_id=$2) AND (request_id=$2 OR request_id=$1)', [otherUserId, userId]);
}

function checkIfRowExists(otherUserId, userId) {
    return new Promise(function(resolve, reject) {
        db.query('SELECT * FROM friend_requests WHERE (recipient_id=$1 OR recipient_id=$2) AND (request_id=$2 OR request_id=$1)', [otherUserId, userId])
            .then(function(results) {
                if (results.rows.length != 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(function(err) {
                reject(err);
            });
    });
}


function addRelationshipStatus(userId, otherUserId, status) {
    return db.query ('INSERT INTO friend_requests(request_id, recipient_id, status) values($1, $2, $3)', [userId, otherUserId, status]);
}

function updateRelationshipStatus(status, otherUserId, userId) {
    return db.query('UPDATE friend_requests SET status=$1 WHERE (recipient_id=$2 OR recipient_id=$3) AND (request_id=$3 OR request_id=$2)', [status, otherUserId, userId]);
}


function updateAccept(otherUserId, userId) {
    return db.query('UPDATE friend_requests SET status=1 WHERE (recipient_id=$1 OR recipient_id=$2) AND (request_id=$2 OR request_id=$1)', [otherUserId, userId]);
}


function endFriendship(otherUserId, userId) {
    return db.query('DELETE FROM friend_requests WHERE (recipient_id=$1 OR recipient_id=$2) AND (request_id=$2 OR request_id=$1)', [otherUserId, userId]);
}


function getFriendRequests(userId) {
    return db.query('SELECT users.id, first_name, last_name, image, status FROM friend_requests JOIN users ON (status=2 AND recipient_id=$1 AND request_id=users.id) OR (status=1 AND recipient_id=$1 AND request_id=users.id) OR (status=1 AND request_id=$1 AND recipient_id=users.id)', [userId]);
}

function getUsersByIds(arrayOfIds) {
    const query = `SELECT * FROM users WHERE id = ANY($1)`;
    return db.query(query, [arrayOfIds]);
}

function addMessage(userId, message) {
    return db.query ('INSERT INTO messages(user_id, message) values($1, $2) returning id, user_id', [userId, message]);
}

function getMessageAndUser(messageId) {
    return db.query ('SELECT users.id, users.first_name, users.last_name, users.image, messages.message, messages.timestamp FROM users JOIN messages ON users.id = messages.user_id WHERE messages.id=$1;', [messageId]);
}

function getMessages() {
    return db.query ('SELECT users.id, users.first_name, users.last_name, users.image, messages.message, messages.timestamp FROM users JOIN messages ON users.id = messages.user_id ORDER BY messages.timestamp DESC LIMIT 10');
}

function getPendingRequests(userId) {
    return db.query('SELECT COUNT(*) FROM friend_requests WHERE status=2 AND recipient_id=$1', [userId]);
}

module.exports.hashPassword = hashPassword;
module.exports.addUserData = addUserData;
module.exports.getUserData = getUserData;
module.exports.checkPassword = checkPassword;
module.exports.sendFile = sendFile;
module.exports.addImgToDb = addImgToDb;
module.exports.updateDbWithBio = updateDbWithBio;
module.exports.getUserDataById = getUserDataById;
module.exports.getFriendStatus = getFriendStatus;
module.exports.addRelationshipStatus = addRelationshipStatus;
module.exports.checkIfRowExists = checkIfRowExists;
module.exports.updateRelationshipStatus = updateRelationshipStatus;
module.exports.endFriendship = endFriendship;
module.exports.getFriendRequests = getFriendRequests;
module.exports.updateAccept = updateAccept;
module.exports.getUsersByIds = getUsersByIds;
module.exports.addMessage = addMessage;
module.exports.getMessageAndUser = getMessageAndUser;
module.exports.getMessages = getMessages;
module.exports.getPendingRequests = getPendingRequests;
