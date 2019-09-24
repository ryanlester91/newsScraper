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

let db = mongoose.connection;

db.on("error", function(error){
	console.log("Mongoose Error: ", error);
});

db.once("open", function(){
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

// saving those scraped articles
app.get('/saved', (req, res)=>{
  Article.find({saved: true})
  .then((dbArticle)=>{
      let articleObj = {article: dbArticle};

      // render page with articles found
      res.render('saved', articleObj);
  })
  .catch((err)=>{
      res.json(err);
  });
});

// A GET route for scraping
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://washingtontimes.com").then(function(response) {
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
        .children("a");

        
  

  // Send a message to the client
  res.send("Scrape Complete");
});
});



// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//app.get("/")

// Route for grabbing a specific Article by id, populate it with it's note
/*app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });*/
});



// Start the server
app.listen(PORT, function() {
  console.log("App is listening on port " + PORT + "!");
});
