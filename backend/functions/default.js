//Global configurations
const config = require('config')
const file_config = config.get('files')
// const email_config = config.get('email')

//Nodemailer
const nodemailer = require('nodemailer')

const fileAddPath = function(files){
	const new_files = files.map(file_name => `${file_config.path}${file_name}`)
	return new_files
}

//Adding file path (both for array and string)
const fileAddPathCustom = function(files, type){
	if(files == null){
		return null
	}
	const var_type = typeof files
	if(var_type == "string"){
		//If string type then convert to an array
		files = [files]
	}

	let new_files = files.filter(file_name => file_name && file_name.length).map(file_name => {
		let new_file
		if(type == 'avatar'){
			new_file = `${file_config.path}${file_config.avatar}${file_name}`
		}
	
		return new_file
	})

	if(var_type == "string"){
		return new_files[0]
	}
	return new_files
}

// const sendMail = async function({to, subject, html}){
// 	let mailTransporter = nodemailer.createTransport({ 
// 		pool : true, //Pooling is true to create only one connection to reduce overhead in connecting on every email
// 		maxMessages : 500, //Max messages is 500 after which a new connection will be made
// 		host: email_config.host,
// 		port : email_config.port, 
// 		auth: { 
// 			user: email_config.auth.email, 
// 			pass: email_config.auth.password
// 		},
// 		tls: {
//         	rejectUnauthorized: false
//     	}
// 	}); 
// 	let mailDetails = { 
// 		from: `Teachomatrix <${email_config.auth.email}>`, 
// 		to, 
// 		subject,
// 		html,
// 	}; 

// 	const result = await mailTransporter.sendMail(mailDetails);
// 	return result
// }

module.exports = { fileAddPath, fileAddPathCustom }