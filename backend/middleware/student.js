function student(req, res, next){
	if(req.user_token_details.type == 'S'){
		next()
	}else{
		res.status(401).send('Access Denied. Only available for students')
	}
}

module.exports = student