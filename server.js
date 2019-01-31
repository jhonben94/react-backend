
//============ IMPORT SECTION =====================//

const express = require('express');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const mongoose = require('mongoose');
const config = require('./config/keys');
const bodyParser =require('body-parser');

//============ Inicialice Express App =============//

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Use Routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

// connect to mongoDB
mongoose.connect(config.mongoURL, { useNewUrlParser: true })
    .then( () => { 
        console.log('MongoDB Connected');
    })
    .catch( (err)=> { 
        console.log(err);
        
    });
app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(config.port, () => {
    console.log('Example app listening on port 3000!');
});

//Run app, then load http://localhost:3000 in a browser to see the output.
