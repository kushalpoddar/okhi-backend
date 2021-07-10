const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

//Config
const config = require('config')
const file_config = config.get('files')
const base_path = file_config.get('basepath')
// List of bgthemes
router.get('/', async(req, res) => {

	let filenames = ['bg1.png', 'bg2.png', 'bg3.png']
	
	return res.send(filenames.map(filename => {
		return `${base_path}static/theme/${filename}`
	}))
})

module.exports = router