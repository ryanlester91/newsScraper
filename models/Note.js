let mongoose = require("mongoose");

// Save a reference to the Schema constructor
let Schema = mongoose.Schema;

let noteSchema = new Schema({
    body: {
		type: String,
	},
	article: {
		type: Schema.Types.ObjectId,
		ref: "Article"
	}
	let Note = mongoose.model("Note", NoteSchema);


});



//Export our Note model
module.exports = Note;