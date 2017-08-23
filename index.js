const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const functions = require('./models/models.js');
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const awsS3Url = "https://s3.amazonaws.com/inasocial";
const server = require('http').Server(app);
const io = require('socket.io')(server);

let onlineUsers = [];


//          SETUP

if (process.env.NODE_ENV != 'production') {
    app.use(require('./build'));
}

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(cookieSession({
    secret: 'funny string',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

app.use(express.static(__dirname + '/public/'));


var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});



//          ROUTES


app.get('/welcome', function(req, res){
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.get('/', function(req,res) {
    if (!req.session.user) {
        res.redirect('/welcome');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});


app.post('/register', function(req, res) {

    functions.hashPassword(req.body.password).then(function(hash) {
        functions.addUserData(req.body.first, req.body.last, req.body.email, hash).then(function(results) {
            req.session.user = {
                userId: results.rows[0].id,
                firstName: req.body.first,
                lastName: req.body.last,
                email: req.body.email
            };
            res.json({
                success: true
            });
        }).catch(function(err){
            res.status(500).json({ err: 'Failure'});
        });
    }).catch(function(err){
        res.status(500).json({ err: 'Failure'});
    });
});


app.post('/login', function(req, res) {

    functions.getUserData(req.body.email).then(function(results) {
        functions.checkPassword(req.body.password, results.rows[0].password).then(function(doesMatch) {
            if (doesMatch) {
                req.session.user = {
                    userId: results.rows[0].id,
                    firstName: results.rows[0].first_name,
                    lastName: results.rows[0].last_name,
                    email: results.rows[0].email,
                };
                res.json({
                    success: true
                });
            } else {
                res.status(500).json({ err: 'Failure'});
            }
        }).catch(function(err){
            res.status(500).json({ err: 'Failure'});
        });

    }).catch(function(err){
        res.status(500).json({ err: 'Failure'});
    });
});


app.get('/user', function(req, res) {
    functions.getUserData(req.session.user.email).then(function(results) {
        res.json(results.rows[0]);
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/upload', uploader.single('file'), function(req, res) {

    if (req.file) {
        functions.sendFile(req.file).then(function() {
            res.json({
                success: true,
                fileName: req.file.filename
            });
            functions.addImgToDb(req.file.filename, req.body.userId);
        }).catch(function(err){
            res.status(500).json({ err: 'Failure'});
        });
    } else {
        res.status(500).json({ err: 'Failure'});
    }
});


app.post('/bio', function(req, res) {
    functions.updateDbWithBio(req.body.bio, req.session.user.userId).then(function() {
        res.json({
            success: true,
            bio: req.body.bio
        });
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/otheruserprofile', function(req, res) {
    functions.getUserDataById(req.body.id).then(function(results) {
        res.json(results.rows[0]);
    }).catch(function(err) {
        console.log(err);
    });
});



app.post('/status', function(req, res) {
    functions.getFriendStatus(req.body.otherUserId, req.session.user.userId).then(function(results) {
        res.json(results.rows[0]);
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/makerequest', function(req, res) {
    console.log('this is the body', req.body.status, req.body.otherUserId);
    functions.checkIfRowExists(req.body.otherUserId, req.session.user.userId).then(function(doesRowExist) {
        if(!doesRowExist) {
            functions.addRelationshipStatus(req.session.user.userId, req.body.otherUserId, req.body.status).then(function() {
                res.json({
                    success: true
                });
            });
        } else {
            functions.updateRelationshipStatus(req.body.status, req.body.otherUserId, req.session.user.userId).then(function() {
                res.json({
                    success: true
                });
            });
        }
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/cancel', function(req, res) {
    functions.updateRelationshipStatus(req.body.status, req.body.otherUserId, req.session.user.userId).then(function() {
        res.json({
            success: true
        });
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/end', function(req, res) {
    functions.endFriendship(req.body.otherUserId, req.session.user.userId).then(function() {
        res.json({
            success: true
        });
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/accept', function(req, res) {
    functions.updateAccept(req.body.otherUserId, req.session.user.userId).then(function() {
        res.json({
            success: true
        });
    }).catch(function(err) {
        console.log(err);
    });
});


app.get('/friend-requests', function(req, res) {
    functions.getFriendRequests(req.session.user.userId).then(function(results) {
        for (var i=0; i<results.rows.length; i++) {
            if (results.rows[i].image) {
                results.rows[i].image = awsS3Url + '/' + results.rows[i].image;
            }
        }
        res.json({users: results.rows});
    }).catch(function(err) {
        console.log(err);
    });
});


app.get('/connected/:socketId', function(req, res) {
    const user = onlineUsers.find(user => user.socketId == req.params.socketId);
    if (!user) {
        onlineUsers.push({
            socketId: req.params.socketId,
            userId: req.session.user.userId
        });

        functions.getUserDataById(req.session.user.userId).then(function(data) {
            for (var i=0; i<data.rows.length; i++) {
                if (data.rows[i].image) {
                    data.rows[i].image = awsS3Url + '/' + data.rows[i].image;
                }
            }
            io.sockets.emit('userJoined', {
                newUser: data.rows
            });
        }).catch(function(err) {
            console.log(err);
        });

        functions.getUsersByIds(onlineUsers.map(user=>user.userId)).then(function(users) {
            for (var i=0; i<users.rows.length; i++) {
                if (users.rows[i].image) {
                    users.rows[i].image = awsS3Url + '/' + users.rows[i].image;
                }
            }
            io.sockets.sockets[req.params.socketId].emit('onlineUsers', {
                users:users.rows
            });
        }).catch(function(err) {
            console.log(err);
        });

        functions.getMessages().then(function(data) {
            for (var i=0; i<data.rows.length; i++) {
                if (data.rows[i].image) {
                    data.rows[i].image = awsS3Url + '/' + data.rows[i].image;
                }
            }
            io.sockets.sockets[req.params.socketId].emit('chatMessages', {
                messages:data.rows
            });
        }).catch(function(err) {
            console.log(err);
        });

        functions.getPendingRequests(req.session.user.userId).then(function(data) {
            io.sockets.sockets[req.params.socketId].emit('friendRequests', {
                requests:data.rows[0].count
            });
        }).catch(function(err) {
            console.log(err);
        });

    }
    console.log(onlineUsers);

});


app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/');
});


app.get('*', function(req, res) {
    if(!req.session.user) {
        res.redirect('/wecome');
    }
    res.sendFile(__dirname + '/index.html');
});



io.on('connection', function(socket) {
    console.log(`socket with the id ${socket.id} is now connected`);

    socket.on('disconnect', function() {
        const leavingUser = onlineUsers.find(user => user.socketId == socket.id);
        onlineUsers = onlineUsers.filter(function(u) {
            return u.socketId != socket.id;
        });
        io.sockets.emit('userLeft', {leavingUser});
    });

    socket.on('disconnect', function() {
        console.log(`socket with the id ${socket.id} is now disconnected`);
    });

    socket.on('chatMessage', function(data) {

        functions.addMessage(data.userId, data.message).then(function(data) {
            functions.getMessageAndUser(data.rows[0].id).then(function(messageData) {
                for (var i=0; i<messageData.rows.length; i++) {
                    if (messageData.rows[i].image) {
                        messageData.rows[i].image = awsS3Url + '/' + messageData.rows[i].image;
                    }
                }
                io.sockets.emit('chatMessage', {
                    newMessage: messageData.rows
                });
            }).catch(function(err) {
                console.log(err);
            });

        }).catch(function(err) {
            console.log(err);
        });
    });

    socket.on('newFriendRequest', function(data) {
        const receivingUser = onlineUsers.find(user => user.userId == data.otherUserId);
        if(receivingUser) {
            console.log('tämä on receiver', receivingUser.socketId);

            io.sockets.sockets[receivingUser.socketId].emit('newFriendRequest', {
                newRequest: 1
            });

        }
    });

    socket.on('acceptPendingRequest', function(data) {
        console.log('tämä on userId###', data);
        const acceptor = onlineUsers.find(user => user.userId == data.userId);
        if(acceptor) {
            io.sockets.sockets[acceptor.socketId].emit('acceptPendingRequest', {
                changeOfRequests: -1
            });
        }

    });

});


server.listen(8080, function() {console.log("I'm listening.");});
