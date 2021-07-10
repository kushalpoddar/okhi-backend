const mongoose = require('mongoose')

// All general information will be stored here
const bgthemeSchema = mongoose.Schema({
	name : {
		type : String,
		required : true,
		trim : true,
	},
	file : {
		type : String, //T = Teacher, S = Student, A = Teacher Department Admin
		required : true,
		trim : true
	},
	created_at : {
		type: Date,
		default : Date.now
	}
})

const BGTheme = mongoose.model('BGTheme', bgthemeSchema)

module.exports.BGTheme = BGTheme