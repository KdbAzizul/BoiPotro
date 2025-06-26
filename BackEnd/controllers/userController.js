import asyncHandler from '../middleware/asyncHandler.js';
import bcrypt from 'bcryptjs'
import pool from '../db.js';
import generateToken from '../utils/generateToken.js';



// @desc       Auth user & get token
// @route      POST /api/users/login
// @access     public
const authUser = asyncHandler(async(req,res) => {
    const{email,password}=req.body;

    const result=await pool.query(
        'SELECT * FROM "BOIPOTRO"."users" WHERE EMAIL=$1',[email]
    );
    const user = result.rows[0];
    
    if(user && await bcrypt.compare(password,user.password)) {

       generateToken(res,user.id)

        res.json({
            id:user.id,
            name:user.name,
            email:user.email,
            isAdmin:user.isadmin
        });
    }else{
        res.status(404).json({ message: 'Invalid email or password' });
    }
  
})

// @desc       Register user
// @route      POST /api/users
// @access     public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const result = await pool.query(
        'SELECT * FROM "BOIPOTRO"."users" WHERE email = $1',
        [email]
    );

    const userExists = result.rows[0];
    if (userExists) {
        return res.status(400).json({ message: 'User Already Exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertResult = await pool.query(
        `INSERT INTO "BOIPOTRO"."users" (name, email, password) 
         VALUES ($1, $2, $3) 
         RETURNING id, name, email, isadmin`,
        [name, email, hashedPassword]
    );

    const newUser = insertResult.rows[0];

    if (newUser) {
        generateToken(res,newUser.id)

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            isAdmin: newUser.isadmin,
        });
    } else {
        res.status(400).json({ message: 'Invalid User Data' });
    }
});



// @desc       Logout user / clear cookie
// @route      POST /api/users/logout
// @access     private
const logoutUser = asyncHandler(async(req,res) => {
    res.cookie('jwt','',{
        httpOnly:true,
        expires:new Date(0)
    });

    res.status(200).json({message:'Logged out successfully'});
})


// @desc       Get user profile
// @route      GET /api/users/profile
// @access     private
const getUserProfile = asyncHandler(async(req,res) => {
    
    const result=await pool.query(
        'SELECT * FROM "BOIPOTRO"."users" WHERE ID=$1',[req.user.id]
    );
    const user = result.rows[0];
  
    

    if(user){
         res.json({
            id:user.id,
            name:user.name,
            email:user.email,
            isAdmin:user.isadmin,
        });
    }else{
        res.status(404).json({ message: 'User not found' });
    }

})

// @desc       Update user profile
// @route      PUT /api/users/profile
// @access     private
const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(
        'SELECT * FROM "BOIPOTRO"."users" WHERE id = $1',
        [userId]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const updatedName = req.body.name || user.name;
    const updatedEmail = req.body.email || user.email;

    let updatedPassword = user.password;
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        updatedPassword = await bcrypt.hash(req.body.password, salt);
    }

   
    const updateResult = await pool.query(
        `UPDATE "BOIPOTRO"."users"
         SET name = $1, email = $2, password = $3
         WHERE id = $4
         RETURNING id, name, email, isadmin`,
        [updatedName, updatedEmail, updatedPassword, userId]
    );

    const updatedUser = updateResult.rows[0];

    res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isadmin,
    });
});


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