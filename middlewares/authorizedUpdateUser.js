const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const isAuthorizedUpdateUser = (req, res, next) => {
    if (!req.session.user) {
        logger.warn(`Session User is not defined for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'update_user_no_session'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.body.submittedData || !req.body.submittedData.id) {
        logger.warn(`Submitted User ID is not defined for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'update_user_no_user_id'
        });
        return res.status(400).json({ message: "Bad Request" });
    }

    const sessionUserId = req.session.user._id.toString();
    const submittedUserId = req.body.submittedData.id.toString();

    logger.info(`Session User: ${sessionUserId}`, {
        userId: req.session.user?._id,
        sessionUserId: sessionUserId,
        operation: 'update_user_session_user'
    });
    logger.info(`Submitted User: ${submittedUserId}`, {
        userId: req.session.user?._id,
        submittedUserId: submittedUserId,
        operation: 'update_user_submitted_user'
    });

    if (req.session.user.role === "admin" || sessionUserId === submittedUserId || req.session.user.appAdmin) {
        logger.info(`req Session successful for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'update_user_session_success'
        });
        next();
    } else {
        logger.warn(`req session unsuccessful for user ${req.session.user?._id}`, {
            userId: req.session.user?._id,
            operation: 'update_user_session_unsuccessful'
        });
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthorizedUpdateUser;

