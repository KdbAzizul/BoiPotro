import  jwt  from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import pool from "../db.js";

//protect routes
const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const result = await pool.query(
                'SELECT * FROM "BoiPotro"."app_user" WHERE ID = $1',
                [decoded.userId]
            );

            if (!result.rows[0]) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Remove password from the user object
            const { password, ...user } = result.rows[0];
            

            req.user = user;

            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
});


//admin middleware
const admin=(req,res,next)=>{
    console.log("req.user:", req.user);


    if(req.user && req.user.isadmin===true){
        next();
    }else{
        res.status(401).json({ message: 'Not authorized as admin' });
    }
}

export{protect,admin};