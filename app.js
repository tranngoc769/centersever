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
io.on('connection', function (socket) {

    socket.on('stream', function (data) {
        console.log('broadcast');
        // 'data:image/png;base64, '
        fs.writeFile('./public/client.jpg', data, 'base64',
            function (err, data) {
                if (err) {
                    console.log(err);
                }
            });
        socket.broadcast.emit('stream', data);
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