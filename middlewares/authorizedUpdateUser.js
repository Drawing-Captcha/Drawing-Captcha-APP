const isAuthorizedUpdateUser = (req, res, next) => {
    console.log("Session User: ", req.session.user._id);
    console.log("Submitted User: ", req.body.submittedData.id);
    if (req.session.user.role === "admin" || req.session.user._id === req.body.submittedData.id) {
        console.log("req Session successfull")
        next();
    } else {
        console.log("req session unsuccessfull")
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthorizedUpdateUser;