import asyncHandler from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs'
import pool from '../db.js';




// @desc       Auth user & get token
// @route      POST /api/users/login
// @access     public
const authUser = asyncHandler(async(req,res) => {
    const{email,password}=req.body;

    const result=await pool.query(
        'SELECT * FROM "BoiPotro"."app_user" WHERE EMAIL=$1',[email]
    );
    const user = result.rows[0];
    
    if(user && await bcrypt.compare(password,user.password)) {
        res.json({
            id:user.id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin
        });
    }else{
        res.status(404).json({ message: 'Invalid email or password' });
    }
  
})

// @desc       Register user
// @route      POST /api/users
// @access     public
const registerUser = asyncHandler(async(req,res) => {
    res.send('register user');
})


// @desc       Logout user / clear cookie
// @route      POST /api/users/logout
// @access     private
const logoutUser = asyncHandler(async(req,res) => {
    res.send('logout user');
})


// @desc       Get user profile
// @route      GET /api/users/profile
// @access     private
const getUserProfile = asyncHandler(async(req,res) => {
    res.send('get user profile');
})


// @desc       Update user profile
// @route      PUT /api/users/profile
// @access     private
const updateUserProfile = asyncHandler(async(req,res) => {
    res.send('update user profile');
})


// @desc       Get all users
// @route      GET /api/users
// @access     private/admin
const getUsers = asyncHandler(async(req,res) => {
    res.send('get users');
})

// @desc       Get user by id
// @route      GET /api/users/:id
// @access     private/admin
const getUserByID = asyncHandler(async(req,res) => {
    res.send('get user by id');
})

// @desc       Delete user
// @route      DELETE /api/users/:id
// @access     private/admin
const deleteUser = asyncHandler(async(req,res) => {
    res.send('delete user');
})

// @desc       Update user
// @route      PUT /api/users/:id
// @access     private/admin
const updateUser = asyncHandler(async(req,res) => {
    res.send('update user');
})


export{
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser
}