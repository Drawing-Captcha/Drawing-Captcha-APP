const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs")
const User = require("../models/User.js")
const isAuthorizedUpdating = require("../middlewares/authorizedUpdateUser.js")
const isAuthorizedDeleting = require("../middlewares/authorizedDeletingUser.js")


router.get('/ownUser', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    res.json({ user: req.session.user });
})

router.get('/allUsers', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const allUsers = await User.find().select('username email role companies ppURL -_id initialUser');
        if (allUsers) {
            console.log("Successfully found all Users: ", allUsers);
        }
        let ownUser =  {
            role: req.session.user.role,
            _id: req.session.user._id
        }
        res.json({allUsers, ownUser: ownUser})
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
})

router.put('/updateUser', isAuthorizedUpdating, authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const { id, username, email, ppURL, shouldChangePassword, password, role, companies } = req.body.submittedData;
        
        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let updateData = { username, email, ppURL, role, companies };

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

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error("An error occurred while updating the user:", error);
        res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
    }
});

router.delete('/deleteUser', authMiddleware, isAuthorizedDeleting, csrfMiddleware.validateCSRFToken, async (req, res) => {
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
                    return res.status(200).json({ message: 'User deleted successfully. Redirecting to login...', redirect: '/login' });
                });
            } else {
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