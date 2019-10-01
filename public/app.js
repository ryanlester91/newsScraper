

// Grab the articles as a json
$.getJSON("/articles", function(data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page
      $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "<br />" + data[i].summary + "</p>");
    }
  });
  
  
  // Whenever someone clicks the Let's Scrape button
  $("#submit").on("click", function() {
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/scrape"
    })
      // With that done, add the note information to the page
      .done(function(data) {
        console.log(data);

        window.location = "/"
        
      });
    });

    // The title of the article
    $("#articles").append("<h2>" + data.title + "</h2>");
    // An input to enter a new title
    $("#articles").append("<input id='titleinput' name='title' >");
    // A textarea to add a new note body
    $("#articles").append("<textarea id='bodyinput' name='body'></textarea>");
    // A button to submit a new note, with the id of the article saved to it
    $("#articles").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");