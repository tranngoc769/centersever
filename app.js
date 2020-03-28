const express = require('express');
const port =  process.env.PORT || 3000;
const app =  express();
const path = require('path');
// INIT
// VIEWS ENGINE
// app.set('views', path.join(__dirname,'views'));
// app.set('view engine','ejs');
// app.use(express.static(path.join(__dirname, '/public')));
/* @@END VIEWS ENGINE */

app.use(express.static(__dirname + "/public" ));
app.get('/',function(req,res){
    res.redirect('index.html');
    });

// START
app.listen(port, () => {
    console.log('Server runing on : '+ `${port}`);
});