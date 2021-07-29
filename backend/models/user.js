const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

// All general information will be stored here
const userSchema = mongoose.Schema({
	name : {
		type : String,
		required : true,
		trim : true,
	},
	profile_picture : {
		type : String,
		trim : true,
	},
	type : {
		type : String, //A = Admin, U - User
		required : true,
		trim : true,
		enum : ['A', 'U']
	},
	email : {
		type : String,
		unique : true,
		required : true,
		trim : true,
		lowercase : true
	},
	mobile : {
		type : String,
		trim : true,
		unique : true
	},
	whatsapp : {
		type : String,
		trim : true,
	},
	password : {
		type : String,
		required : true,
		trim : true
	},
	is_email_verified : {
		type : Boolean,
		default : false
	},
	avatar : {
		type : String,
	},
	gender : {
		type : String,
		enum : ['M', 'F', 'O']
	},
	address : {
		type : String,
		trim : true,
	},
	personal_upi : {
		type : String,
		trim : true,
	},
	color : {
		type : String,
		default : '#fff'
	},
	theme : {
		type : String,
	},

	//Profile
	aboutme : {
		type : String
	},
	education : {
		type : String, 
		trim : true
	},
	skills : {
		type : String, 
		trim : true
	},
	experience : {
		type : String, 
		trim : true
	},

	// Company
	company : {
		type : String,
		trim : true,
	},
	company_address : {
		type : String,
		trim : true,
	},
	company_website : {
		type : String,
		trim : true,
	},
	company_email : {
		type : String,
		trim : true,
	},
	company_bank : {
		type : String,
		trim : true,
	},
	
	// Social media
	website : {
		type : String,
		trim : true,
	},
	
	twitter : {
		type : String,
		trim : true,
	},
	linkedin : {
		type : String,
		trim : true,
	},
	instagram : {
		type : String,
		trim : true,
	},
	fb : {
		type : String,
		trim : true,
	},
	skype : {
		type : String,
		trim : true,
	},
	youtube : {
		type : String,
		trim : true,
	},
	github : {
		type : String,
		trim : true,
	},

	created_at : {
		type : Date,
		default : Date.now
	},
	status : {
		type : Boolean,
		default : true
	},
	is_approved : {
		type : Boolean,
		default : false
	},
	subscription_amount : {
		type : Number,
	},
	marked : {
		type : Boolean
	}
})

userSchema.methods.generateAuthToken = function(){
	const token = jwt.sign({ name : this.name , email : this.email , _id : this._id, type : this.type }, 'KP')
	return token
}
const User = mongoose.model('User', userSchema)

module.exports.User = User