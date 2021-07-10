const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const config = require('config')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs');
const router = express.Router()
const {User} = require('../models/user')
const hash = require('../hash')
const {sendMail, fileAddPathCustom} = require('../functions/default')
//Validation
const {validateUser, validateUserEdit} = require('../validate/user.js')
//Auth middleware to protect routes
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

//Upload files
const destination = `uploads/${config.get('files').get('avatar')}`
const storage = multer.diskStorage({
	destination,
	filename: function (req, file, cb) {
		cb(null, `${Date.now()}-${file.originalname}`)
	}
})
const upload = multer({ 
	storage: storage,
	limits : {
		fieldSize: (30 * 1024 * 1024) //30MB
	}
})

/**  
	This part handles the routes for a user
**/

//Get the details of myself
router.get('/me', auth, async(req, res) => {
	const user = await User.findById(req.user_token_details._id).select('-password').lean()
	if(!user){
		return res.status(404).send('No user found')
	}

	user.profile_picture = fileAddPathCustom(user.profile_picture, 'profile')
	return res.send(user)
})

// //Updating my profile
// router.put('/me', [auth, upload.single('profile_picture')], async(req, res) => {
// 	const user = await User.findById(req.user_token_details._id).select('-password')
// 	if(!user){
// 		return res.status(404).send('No user found')
// 	}

// 	//New filename
// 	const mypic = req.file
// 	if((mypic) || (req.body.remove_profile_picture)){

// 		//Removing the old image if any
// 		if(user.profile_picture){
// 			try{
// 				fs.unlinkSync(`${destination}${user.profile_picture}`)
// 			}catch(ex){
				
// 			}
// 			user.set({
// 				profile_picture : null
// 			})
// 		}
			
// 		if(mypic){
// 			const new_filename = `${path.parse(mypic.filename).name}.webp`
// 			//COnverting the image into webp and resizing it to maximum 300 pixels in width or height
// 			await sharp(mypic.path).resize(300).webp({
// 				reductionEffort : 5
// 			}).toFile(path.resolve(mypic.destination, new_filename))

// 			//Updating the profile picture now
// 			user.set({
// 				profile_picture : new_filename
// 			})

// 			//Removing the png image now
// 			fs.unlinkSync(mypic.path)
// 		}
// 	}

// 	const introduction = req.body.introduction
// 	if(introduction){
// 		user.set({
// 			introduction
// 		})
// 	}

// 	await user.save()

// 	user.profile_picture = fileAddPathCustom(user.profile_picture, 'profile')

// 	return res.send(user)
// })

//Get the details of a user
router.get('/:id', async(req, res) => {
	//If admin requests the user information of the same department
	//if(req.user_token_details.type == 'A' && req.)
	const user = await User.findById(req.params.id).select('-password').lean()
	if(!user){
		return res.status(404).send('No user found')
	}
	return res.send(user)
})

//Create a new user --> Route authentication is remaining (should be only for superadmin)
router.post('/', async(req, res) => {

	const {error, value} = validateUser(req.body)
	if(error) return res.status(400).send(error.details[0].message)
		
	let user = await User.findOne({
		email : req.body.email
	}).lean()

	if(user) return res.status(400).send('User already registered')

	const user_type = value.type
	let user_obj = {
		name : value.name,
		email : value.email,
		mobile : value.mobile,
		gender : value.gender,
		password : await hash(req.body.password.trim()),
		type : 'U'
	}

	user = new User(user_obj)

	// await user.save()

	return res.send(user)
})

//Create a new user --> Route authentication is remaining (should be only for superadmin)
router.put('/me', auth, async(req, res) => {

	// const {error, value} = validateUser(req.body)
	// if(error) return res.status(400).send(error.details[0].message)
		
	let value = req.body
	let user = await User.findOne({
		_id : req.user_token_details._id
	})

	if(!user) return res.status(400).send('Invalid user')

	user.set(value)

	await user.save()

	return res.send(user)
})

module.exports = router