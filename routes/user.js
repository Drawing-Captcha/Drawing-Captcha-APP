const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
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

        const updateData = {
            username,
            email,
            ppURL
        };

        if (shouldChangePassword) {
            updateData.password = await User.hashPassword(password);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
    }
});


module.exports = router;