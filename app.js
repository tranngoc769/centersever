const express = require('express');
const port = process.env.PORT || 3000;
var app = new express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    res.redirect('index.html');
});
var fs = require('fs');
io.on('connection',async function (socket) {

    socket.on('stream',async function (data) {
        console.log('broadcast');
        await socket.broadcast.emit('stream', data);
        //fs.writeFile('./public/client.jpg', data, 'base64',function(err,data){if(err){console.log(err);}});
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