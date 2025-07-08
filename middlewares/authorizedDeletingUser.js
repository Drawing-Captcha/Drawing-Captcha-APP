const sanitizeInput = require("../services/sanitizeInput.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

const isAuthorizedDeletingUser = (req, res, next) => {
    const user = req.body.user;
    if (!req.session.user) {
        logger.warn(`Session User is not defined for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'delete_user_no_session'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }

    logger.info(`Requested user: ${user}`, {
        userId: req.session.user?._id,
        requestedUserId: sanitizeInput(user?._id),
        operation: 'delete_user_request'
    });
    if (!user || !sanitizeInput(user._id)) {
        console.log(user)
        logger.warn(`Submitted User ID is not defined for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'delete_user_no_user_id'
        });
        return res.status(400).json({ message: "Bad Request" });
    }

    const sessionUserId = req.session.user._id.toString();
    const submittedUserId = sanitizeInput(user._id.toString());

    logger.info(`Session User: ${sessionUserId}`, {
        userId: req.session.user?._id,
        sessionUserId: sessionUserId,
        operation: 'delete_user_session_user'
    });
    logger.info(`Submitted User: ${submittedUserId}`, {
        userId: req.session.user?._id,
        submittedUserId: submittedUserId,
        operation: 'delete_user_submitted_user'
    });

    if (req.session.user.role === "admin" || sessionUserId === submittedUserId) {
        logger.info(`req Session successful for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'delete_user_session_success'
        });
        next();
    } else {
        logger.warn(`req session unsuccessful for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'delete_user_session_unsuccessful'
        });
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthorizedDeletingUser;

