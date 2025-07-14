const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);
const isAdmin = (req, res, next) => {
    if (!req.session.user) {
        logger.warn("Session User is not defined", {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'is_admin'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.session.user.role === "admin" || req.session.user.appAdmin === true){
        next();
    }
    else{
        return res.redirect("/dashboard/notAuthorized");
    }
}

module.exports = isAdmin;