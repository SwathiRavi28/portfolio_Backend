const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const pdf = require('html-pdf');
const cors = require('cors');


const pdfTemplate = require('./documents');

const app = express();

const port = process.env.PORT || 5000;


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
const users = require("./routes/api/users");



// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);

app.listen(port, () => console.log(`Server up and running on port ${port} !`));



// POST Route - PDF generation and fetching of the data

app.post('/create-pdf', (req, res) => {
    pdf.create(pdfTemplate(req.body), {}).toFile('Resume.pdf', (err) => {
        if(err){
            res.send(Promise.reject());
            console.log(err);
        }

        res.send(Promise.resolve());
        console.log('Success');
    });
});


// Get - Send generated pdf to the client
app.get('/fetch-pdf', (req,res) => {
    res.sendFile(`${__dirname}/Resume.pdf`);
});

// Serve static assets if in production
if(process.env.NODE_ENV === 'production'){
    //set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}


//app.listen(port, () => console.log(`Server started on port ${port}`));
