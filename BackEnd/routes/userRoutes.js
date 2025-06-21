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

const router =express.Router();

router.route('/').post(registerUser).get(getUsers);
router.post('/logout',logoutUser);
router.post('/login',authUser);
router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.route('/:d').delete(deleteUser).get(getUserByID).put(updateUser);

export default router;