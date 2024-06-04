const isAuthorizedUpdateUser = (req, res, next) => {
    if (req.session.role === "admin" || req.session.user._id === req.body.submittedData.id) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthorizedUpdateUser;