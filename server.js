var express = require("express");
//let bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var db = require("./models");

var PORT = 3000;

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
	partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
//Ask about the after backslash part
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });


// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from The Washington Times:" +
            "\n***********************************\n");

// Making a request via axios for the Washington Times news site. 
axios.get("https://washingtontimes.com").then(function(response) {

  // Load the Response into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(response.data);

  // Now, we grab every h2 within an article tag, and do the following:
  $("article").each(function(i, element) {
    // Save an empty result object
    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.title = $(this)
      .children("a")
      .text();
    result.link = $(this)
      .children("a")
      .attr("href");

    // Create a new Article using the `result` object built from scraping
    db.Article.create(result)
      .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
  });

  // Send a message to the client
  res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
// TODO: Finish the route so it grabs all of the articles
db.Article.find({}, function(error, dbArticle) {
  if(error){
    console.log(error);
    res.send(error);
  }
  else{
    res.json(dbArticle);
  }
})
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne( {

    // Using the id in the url
    _id: mongojs.ObjectId(req.params.id)
  }
  .populate("note")
    .then(function(error, dbArticle) {


    if(error) {
      console.log(error);
    }
    else{
      res.json(dbArticle);
    }
}))



// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Article.create(req.body)
  .then(function(dbNote) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  db.Article.findOneAndUpdate({id: req.params.id}, {note: dbNote._id}, 
    {new: true}) 
    .then(function(dbArticle){
      res.json(dbArticle)
    })

    }

    
  // and update it's "note" property with the _id of the new note

// Start the server
app.listen(PORT, function() {
  console.log("App is listening on port " + PORT + "!");
});
