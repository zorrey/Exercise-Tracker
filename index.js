require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');
//const url = require('url');
//const querystring = require('querystring');
const app = express();
const apiRoutes = require("./routes/api")

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});
  
apiRoutes(app);

    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
