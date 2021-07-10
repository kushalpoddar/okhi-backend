const mongoose = require('mongoose')
const {User} = require('../models/user')

//Function to return the classrooms of the user which is not deleted 
async function getValidClassrooms({userid}){
	let user_classrooms = await User.findById(userid).populate({ path : 'classrooms', select : 'is_deleted' }).select('classrooms')
	
	return user_classrooms.classrooms.filter(classroom => !classroom.is_deleted).map(classroom => classroom._id)
}

async function getUserDepartments({userid}){
	userid = mongoose.Types.ObjectId(userid)
	let departments = await User.aggregate([
	{
		$match : {
			_id : userid
		}
	},
	{
		$lookup : {
			from : 'classrooms',
			localField : 'classrooms',
			foreignField : '_id',
			as : 'classroom'
		}
	},
	{
		$project : {
			'classroom.created_by' : 1
		}
	},
	{
		$unwind : '$classroom'
	},
	{
		$lookup : {
			from : 'users',
			localField : 'classroom.created_by',
			foreignField : '_id',
			as : 'user'
		}
	},
	{
		$unwind : '$user'
	},
	{
		$project : {
			'user.department' : 1
		}
	},
	{
		$group : {
			_id : '$user.department'
		}
	},
	{
		$lookup : {
			from : 'departments',
			localField : '_id',
			foreignField : '_id',
			as : 'department'
		}
	},
	{
		$unwind : '$department'
	},
	{
		$lookup : {
			from : 'institutes',
			localField : 'department.institute',
			foreignField : '_id',
			as : 'institute'
		}
	},
	{
		$unwind : '$institute'
	},
	])

	// Now finding the user department & institute & setting the same shape
	const user_obj = await User.findById(userid).select('department').populate({ path : 'department', populate : { path : 'institute' }}).lean()
	
	// If user's own department present
	if(user_obj.department){
		const user_dept_institute = Object.assign({}, user_obj.department.institute)
		let user_dept = Object.assign({}, user_obj.department)
		user_dept['institute'] = user_dept_institute._id

		const user_own_department = {
			_id : user_dept._id,
			department : user_dept,
			institute : user_dept_institute
		}

		departments = [user_own_department, ...departments.filter(department => !department._id.equals(user_own_department._id))]
	}
	
	

	
	
	return departments
}

module.exports = {
	getValidClassrooms,
	getUserDepartments
}
