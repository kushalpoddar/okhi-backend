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

router.get('/', [auth, admin], async(req, res) => {
	let search_obj = {
		type : 'U'
	}

	for(let key in req.query){
		let val = req.query[key]
		let regex = new RegExp(`${val}`, 'i')
		if(key == 'mobile'){
			search_obj['$or'] = [{
				mobile : regex
			}, {
				whatsapp : regex
			}]
		}else if(key == 'marked'){	
			search_obj[key] = val
		}else{	
			search_obj[key] = regex
		}
	}
	const users = await User.find(search_obj).select('-password').lean()

	return res.send(users)
})

//Get the details of myself
router.get('/me', auth, async(req, res) => {

	const user = await User.findById(req.user_token_details._id).select('-password').lean()
	if(!user){
		return res.status(404).send('No user found')
	}

	user.profile_picture_url = fileAddPathCustom(user.profile_picture, 'avatar')

	return res.send(user)
})

//Get the details of a user by mobile
router.get('/mobile/:mobile', async(req, res) => {
	//If admin requests the user information of the same department
	//if(req.user_token_details.type == 'A' && req.)
	const mobile = req.params.mobile
	const user = await User.findOne({
		mobile : mobile
	}).select('-password').lean()
	
	if(!user){
		return res.status(404).send('No user found')
	}

	user.profile_picture_url = fileAddPathCustom(user.profile_picture, 'avatar')
	return res.send(user)
})

//Get the details of a user
router.get('/:id', async(req, res) => {
	//If admin requests the user information of the same department
	//if(req.user_token_details.type == 'A' && req.)
	const id = req.params.id
	const user = await User.findOne({
		$or : [{_id : id}, {mobile : id}] 
	}).select('-password').lean()

	if(!user){
		return res.status(404).send('No user found')
	}
	return res.send(user)
})

//Uploading a file
router.post('/upload', [auth, upload.single('file')], async(req, res) => {
	// Updating the user model for new file
	let user = await User.findOne({
		_id : req.user_token_details._id
	})

	if(req.file && req.file.filename){
		const filename = req.file.filename
		user.set({
			profile_picture : filename
		})
	}

	await user.save()

	const file_url = fileAddPathCustom(user.profile_picture, 'avatar')
	return res.send({
		url : file_url,
		filename
	})
})

//Create a new user --> Route authentication is remaining (should be only for superadmin)
router.post('/', async(req, res) => {

	const {error, value} = validateUser(req.body)
	if(error) return res.status(400).send(error.details[0].message)
		
	// Checking duplicacy for mobile and email
	let user = await User.findOne({
		$or : [{
			email : req.body.email
		},{
			mobile : req.body.mobile
		}]
		
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

	await user.save()

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

router.put('/approve', [auth, admin], async(req, res) => {
	// const {error, value} = validateUser(req.body)
	// if(error) return res.status(400).send(error.details[0].message)
		
	const user_id = req.body.user_id
	let user = await User.findById(user_id)

	if(!user) return res.status(400).send('Invalid user')

	let new_approve_status = !user.is_approved

	user.set({
		is_approved : new_approve_status
	})

	await user.save()

	return res.send(user)
})

router.put('/:id', [auth, admin], async(req, res) => {
	// const {error, value} = validateUser(req.body)
	// if(error) return res.status(400).send(error.details[0].message)
		
	const user_id = req.params.id
	const subscription_amount = req.body.subscription_amount
	const marked = req.body.marked
	
	let user = await User.findById(user_id)

	if(!user) return res.status(400).send('Invalid user')

	user.set({
		subscription_amount,
		marked
	})

	await user.save()

	return res.send(user)
})

module.exports = router