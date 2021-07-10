//For teachers and admin teachers
function teacher(req, res, next){
	if((req.user_token_details.type == 'T') || (req.user_token_details.type == 'A')){
		next()
	}else{
		res.status(401).send('Access Denied. Only available for teacher')
	}
}

module.exports = teacher