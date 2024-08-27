const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs")
const User = require("../models/User.js")
const isAuthorizedUpdating = require("../middlewares/authorizedUpdateUser.js")
const isAuthorizedDeleting = require("../middlewares/authorizedDeletingUser.js")

console.log("user.js loaded");

router.get('/ownUser', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    console.log("ownUser endpoint hit, user:", req.session.user);
    res.json({ user: req.session.user });
})

router.get('/allUsers', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    console.log("allUsers endpoint hit");
    try {
        console.log("User company:", req.session.user.company);
        console.log("User role:", req.session.user.role);
        console.log("User id:", req.session.user._id);

        const userCompany = req.session.user.company
        const isAppAdmin = req.session.user.appAdmin
        let returnedUsers

        if (isAppAdmin) {
            console.log("Fetching all users since user is app admin");
            returnedUsers = await User.find().select('username email role company ppURL _id initialUser appAdmin');
        } else {
            console.log("Fetching users with companies since user is not app admin");
            returnedUsers = await User.find({
                $or: [
                    { company: userCompany },
                    { appAdmin: true }
                ]
            }).select('username email role company ppURL _id initialUser appAdmin');
        }

        let ownUser = {
            role: req.session.user.role,
            _id: req.session.user._id
        }

        console.log("Returning users:", returnedUsers);
        console.log("Returning own user:", ownUser);

        res.json({allUsers: returnedUsers, ownUser: ownUser})
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
})

router.put('/updateUser', isAuthorizedUpdating, authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    console.log("updateUser endpoint hit");
    try {
        const { id, username, email, ppURL, shouldChangePassword, password, role, company } = req.body.submittedData;
        console.log("company given:", company)

        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let updateData = { username, email, ppURL, role };
        if(company !== undefined){
            console.log("company given has company")
            updateData.company = company
        }
        else{
            console.log("company given is undefined")
            updateData.company = null
        }

        if (shouldChangePassword) {
            if (!password || password.length < 5) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("User updated successfully:", updatedUser);

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error("An error occurred while updating the user:", error);
        res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
    }
})

router.delete('/deleteUser', authMiddleware, isAuthorizedDeleting, csrfMiddleware.validateCSRFToken, async (req, res) => {
    console.log("deleteUser endpoint hit");
    try {
        const user = req.body.user;
        console.log("User being deleted:", user);

        if (!user) {
            return res.status(400).json({ message: 'User information is required' });
        }

        const result = await User.deleteOne({ _id: user._id });

        if (result.deletedCount === 1) {
            if (req.session.user.role != "admin") {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Session destruction error:", err);
                        return res.status(500).json({ message: 'Failed to destroy session', error: err.message });
                    }
                    console.log("Session destroyed");
                    return res.status(200).json({ message: 'User deleted successfully. Redirecting to login...', redirect: '/login' });
                });
            } else {
                console.log("User deleted successfully.");
                return res.status(200).json({ message: 'User deleted successfully.' });
            }
        } else {
            return res.status(500).json({ message: 'Failed to delete the user' });
        }
    } catch (error) {
        console.error("An error occurred while deleting the user:", error);
        return res.status(500).json({ message: 'An error occurred while deleting the user', error: error.message });
    }
});

module.exports = router;