import { 
     authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser
} from "../controllers/userController.js";
import express from "express";
import { protect,admin } from "../middleware/authMiddleware.js";

const router =express.Router();

router.route('/').post(registerUser).get(protect,admin,getUsers);
router.post('/logout',logoutUser);
router.post('/auth',authUser);
router.route('/profile').get(protect,getUserProfile).put(protect,updateUserProfile);
router.route('/:d').delete(protect,admin,deleteUser).get(protect,admin,getUserByID).put(protect,admin,updateUser);

export default router;