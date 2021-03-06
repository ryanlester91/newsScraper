var express = require("express");
//let bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

//exphbs stuff
var exphbs = require('express-handlebars');
app.engine("handlebars", exphbs({
	defaultLayout: "main",
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
//Ask about the after backslash part
mongoose.connect("mongodb://localhost/news-scraper", { useNewUrlParser: true });

let connect = mongoose.connection;

connect.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

connect.once("open", function(){
	console.log("Mongoose connection successful.");
});


// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from The Washington Times:" +
            "\n***********************************\n");

// Routes


      
 // Render main page
 app.get("/", (req, res)=>{
            res.render('index');
      });



// A GET route for scraping
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://washingtontimes.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function() {
      // Save an empty result object
      var result = {};

      // Add the text and href and brief summary of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");
        result.summary = $(this)
        .children("p")
        .children("a")
        .text();

        
  // Send a message to the client
  res.send("Scrape Complete");
});
});

// saving those scraped articles
app.get('/saved', (req, res)=>{
  Article.find({saved: true})
  .then((article)=>{
      let articleObj = {article: article};

      // render page with articles found
      res.render('saved', articleObj);
  })
  .catch((err)=>{
      res.json(err);
  });
});


// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function() {
      // If we were able to successfully find Articles, send them back to the client
      res.json();
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function(data) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(data);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {

  // Create a new note and pass the req.body to the entry
  //var newNote = new Note(req.body);
  // And save the new note the db
  Note.create(req.body)  //Should create a note and pass it in req.body
    
      .then(function(data) {
      // Use the article id to find it and then push note
      return Note.findOneAndUpdate({ _id: req.params.id }, {$push: {note: data._id}}, {new: true});
      //.populate("notes")
        })
        .then(function(data){ res.json(data);})
        .catch(function(err){ res.json(err)});
});
});


// Start the server
app.listen(PORT, function() {
  console.log("App is listening on port " + PORT + "!");
});


module.exports = app;
