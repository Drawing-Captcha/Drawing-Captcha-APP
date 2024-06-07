const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs")
const User = require("../models/User.js")
const isAuthorized = require("../middlewares/authorizedUpdateUser.js")

router.get('/ownUser', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    res.json({ user: req.session.user });
})

router.get('/allUsers', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const allUsers = await User.find();
        if (allUsers) {
            console.log("Successfully found all Users: ", allUsers);
        }
        res.json({allUsers, ownUser: req.session.user})
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
})

router.put('/updateUser', isAuthorized, authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const { id, username, email, ppURL, shouldChangePassword, password } = req.body.submittedData;
        
        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let updateData = { username, email, ppURL };

        if (shouldChangePassword) {
            if (!password || password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error("An error occurred while updating the user:", error);
        res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
    }
});


module.exports = router;