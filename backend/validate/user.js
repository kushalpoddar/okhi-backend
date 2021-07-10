const Joi = require('joi')

const validateUser = function(user){
	const schema = Joi.object({
		name : Joi.string().required().trim(),
		gender : Joi.string().required().trim(),
		email : Joi.string().email().required().trim(),
		mobile : Joi.string().alphanum().allow('').trim(),
		password : Joi.string().required().trim(),
		// type : Joi.string().required().trim(),
	})

	return schema.validate(user)
}

const validateUserEdit = function(user){
	const schema = Joi.object({
		name : Joi.string().required().trim(),
		email : Joi.string().email().required().trim(),
		mobile : Joi.string().alphanum().allow('').trim(),
		status : Joi.boolean().required()
	}).unknown()

	return schema.validate(user)
}

module.exports = { validateUser, validateUserEdit }