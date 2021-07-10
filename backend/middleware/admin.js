function admin(req, res, next){
	if(req.user_token_details.type == 'A'){
		next()
	}else{
		res.status(401).send('Access Denied. Only available for admin')
	}
}

module.exports = admin