const express = require('express');
const router = express.Router();
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const bcrypt = require("bcryptjs")
const User = require("../models/User.js")
const isAuthorizedUpdating = require("../middlewares/authorizedUpdateUser.js")
const isAuthorizedDeleting = require("../middlewares/authorizedDeletingUser.js")
const mongoose = require('mongoose');
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const sanitizeInput = require("../services/sanitizeInput.js");

router.get('/ownUser', async (req, res) => {
    logger.request(req, `USER: ${req.session.user._id} ownUser endpoint hit`, {
        userId: req.session.user?._id,
        userRole: req.session.user?.role
    });
    res.json({ user: req.session.user });
})

router.get('/allUsers', async (req, res) => {
    logger.request(req, `USER: ${req.session.user._id} allUsers endpoint hit`, {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'get_all_users'
    });
    try {
        const userCompany = req.session.user.company
        const isAppAdmin = req.session.user.appAdmin
        let returnedUsers

        if (isAppAdmin) {
            returnedUsers = await User.find().select('username email role company ppURL _id initialUser appAdmin usedRegisterKey');
        } else {
            returnedUsers = await User.find({
                $or: [
                    { company: userCompany },
                    { appAdmin: true }
                ]
            }).select('username email role company ppURL _id initialUser appAdmin');
        }

        let ownUser = {
            role: req.session.user.role,
            _id: req.session.user._id,
            initialUser: req.session.user.initialUser,
            appAdmin: req.session.user.appAdmin,
            company: req.session.user.company
        }

        logger.info(`Returning users data with ${returnedUsers.length} to User ${req.session.user._id}`, {
            userId: req.session.user?._id,
            userCount: returnedUsers.length,
            operation: 'get_all_users'
        });

        res.json({ allUsers: returnedUsers, ownUser: ownUser })
    }
    catch (error) {
        logger.error("Error occurred during fetching users", error, {
            userId: req.session.user?._id,
            operation: 'get_all_users'
        });
        res.status(500).json({ message: 'An error occurred while fetching users' });
    }
})

router.put('/updateUser', isAuthorizedUpdating, async (req, res) => {
    logger.request(req, `USER: ${req.session.user._id} updateUser endpoint hit with Role: ${req.session.user.role} and appAdmin ${req.session.user.appAdmin}`, {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        targetUserId: req.body.submittedData?.id,
        operation: 'update_user'
    });
    try {
        const { id, username, email, ppURL, shouldChangePassword, password, role, company, appAdmin } = {
            id: sanitizeInput(req.body.submittedData.id),
            username: sanitizeInput(req.body.submittedData.username),
            email: sanitizeInput(req.body.submittedData.email),
            ppURL: sanitizeInput(req.body.submittedData.ppURL),
            shouldChangePassword: Boolean(req.body.submittedData.shouldChangePassword),
            password: sanitizeInput(req.body.submittedData.password),
            role: sanitizeInput(req.body.submittedData.role),
            company: sanitizeInput(req.body.submittedData.company),
            appAdmin: Boolean(req.body.submittedData.appAdmin)
        };
        const userRole = req.session.user.role;

        const focusedUser = await User.findById(id);

        if (focusedUser.appAdmin) {
            logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to update an appAdmin user of the company ${focusedUser.company}`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                targetUserId: focusedUser._id,
                operation: 'update_user'
            })
            if (!(req.session.user.appAdmin)) return res.status(401).json({ message: 'You are not authorized to perform this action' })
        }

        if (focusedUser.authType === "google" || focusedUser.authType === "microsoft") {
            if (shouldChangePassword) {
                logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to update a user with ${focusedUser.authType} authentication`, {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    targetUserId: focusedUser._id,
                    operation: 'update_user'
                })
                return res.status(400).json({ message: 'Cannot change password for Google or Microsoft authentication' });
            }
        }

        if (focusedUser.company != req.session.user.company && userRole === "admin" && req.session.user.appAdmin != true) {
            logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to update a user of another company`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                targetUserId: focusedUser._id,
                operation: 'update_user'
            })
            if (!req.session.user.appAdmin || req.session.user.email != focusedUser.email) return res.status(401).json({ message: 'You are not authorized to perform this action' })
        }

        if (focusedUser._id.toString() !== req.session.user._id.toString() && userRole !== "admin" && req.session.user.company !== focusedUser.company && !req.session.user.appAdmin) {
            logger.warn(`Usdr ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to update a user of another company ${focusedUser.company} focusedUser: ${focusedUser._id}`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                targetUserId: focusedUser._id,
                operation: 'update_user'
            })
            return res.status(401).json({ message: 'You are not authorized to perform this action' })
        }

        if (role !== "" && role !== req.session.user.role) {
            if (req.session.user.role !== "admin" && !req.session.user.appAdmin) {
                logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} and Role: ${req.session.user.role} and Company ${req.session.user.company} is trying to update a user role ${focusedUser.role} focusedUser: ${focusedUser._id}`, {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    targetUserId: focusedUser._id,
                    operation: 'update_user'
                })
                return res.status(401).json({ message: 'You are not authorized to perform this action' });
            }

            if (req.session.user.role === "admin" && req.session.user.company !== focusedUser.company && !req.session.user.appAdmin) {
                logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} and Role: ${req.session.user.role} and Company ${req.session.user.company} is trying to update a user role of another company ${focusedUser.company} focusedUser: ${focusedUser._id}`, {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    targetUserId: focusedUser._id,
                    operation: 'update_user'
                })
                return res.status(401).json({ message: 'You are not authorized to perform this action' });
            }
        }

        if (req.session.user.appAdmin !== focusedUser.appAdmin) {
            if (!req.session.user.appAdmin) {
                logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to update a user with appAdmin: ${focusedUser.appAdmin} focusedUser: ${focusedUser._id} `, {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    targetUserId: focusedUser._id,
                    operation: 'update_user'
                })
                return res.status(401).json({ message: 'You are not authorized to perform this action' });
            }
        }

        if (!id || !username || !email) return res.status(400).json({ message: 'Missing required fields' });

        let updateData = { username, email, ppURL };

        let focusedUserRole = focusedUser.role;

        if (shouldChangePassword) {
            // deepcode ignore HTTPSourceWithUncheckedType: <request body is sanitized and validated>
            if (!password || password.length < 5) return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            const hashedPassword = await bcrypt.hash(password, 12);
            updateData.password = hashedPassword;
        }

        if (company !== undefined) {
            updateData.company = company;
        }
        else {
            updateData.company = null;
        }

        if (!focusedUser.initialUser && req.session.user.appAdmin) {
            updateData.appAdmin = appAdmin;
            if (appAdmin) {
                focusedUserRole = "admin"
                updateData.role = focusedUserRole;
            }
            else if (!appAdmin) {
                if (role !== undefined) updateData.role = role;
            }
        }
        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).exec();

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        logger.info(`USER: ${req.session.user._id} with role ${req.session.user.role} has updated User: ${updatedUser._id} successfully`, {
            userId: req.session.user?._id,
            targetUserId: updatedUser._id,
            targetUsername: updatedUser.username,
            operation: 'update_user'
        });
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        logger.error("An error occurred while updating the user", error, {
            userId: req.session.user?._id,
            targetUserId: req.body.submittedData?.id,
            operation: 'update_user'
        });
        return res.status(500).json({ message: 'An error occurred while updating the user', error: error.message });
    }
});

router.delete('/deleteUser', isAuthorizedDeleting, async (req, res) => {
logger.request(req, `User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to call deleteUser endpoint`, {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        targetUserId: req.body.user?._id,
        operation: 'delete_user'
    });
    try {
        const user = req.body.user;

        if (!user) {
            logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to delete a user without user information`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                operation: 'delete_user'
            })
            return res.status(400).json({ message: 'User information is required' });
        }

        if (user.appAdmin && !user.initialUser && !req.session.user.appAdmin) {
            logger.warn(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to delete a USER: ${user._id} with appAdmin: ${user.appAdmin}`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                targetUserId: user?._id,
                operation: 'delete_user'
            })
            return res.status(403).json({ message: 'You are not allowed to delete this user' });

        }

        if (user.company === req.session.user.company && !user.initialUser || req.session.user.appAdmin && !user.initialUser) {
            logger.info(`User ${req.session.user._id} with appAdmin: ${req.session.user.appAdmin} is trying to delete a USER: ${user._id} with appAdmin: ${user.appAdmin}`, {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                targetUserId: user?._id,
                operation: 'delete_user'
            })
            const result = await User.deleteOne({ _id: user._id });
        }

        if (result.deletedCount === 1) {
            if (req.session.user.role != "admin") {
                req.session.destroy((err) => {
                    if (err) {
                        logger.error(`Failed to destroy session for USER: ${user._id}`, err, {
                            userId: req.session.user?._id,
                            targetUserId: user?._id,
                            operation: 'session_destroy'
                        });
                        return res.status(500).json({ message: 'Failed to destroy session', error: err.message });
                    }
                    logger.info("Session destroyed", {
                        userId: req.session.user?._id,
                        operation: 'session_destroy'
                    });
                    return res.status(200).json({ message: 'User deleted successfully. Redirecting to login...', redirect: '/login' });
                });
            } else {
                logger.info(`User: ${user._id} deleted successfully by user ${req.session.user._id}`, {
                    userId: req.session.user?._id,
                    targetUserId: user?._id,
                    operation: 'delete_user'
                });
                return res.status(200).json({ message: 'User deleted successfully.' });
            }
        } else {
            return res.status(500).json({ message: 'Failed to delete the user' });
        }
    } catch (error) {
        logger.error(`An error occurred while deleting the user`, error, {
            userId: req.session.user?._id,
            targetUserId: user?._id,
            operation: 'delete_user'
        });
        return res.status(500).json({ message: 'An error occurred while deleting the user', error: error.message });
    }
});

module.exports = router;