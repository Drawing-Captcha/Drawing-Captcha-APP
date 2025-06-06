const sanitize = require("mongo-sanitize");
const xss = require("xss");

const isAuthorizedDeletingUser = (req, res, next) => {
    const user = xss(sanitize(req.body.user));
    if (!req.session.user) {
        console.log("Session User is not defined");
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("requested user: ", user)
    if (!user || !user._id) {
        console.log("Submitted User ID is not defined");
        return res.status(400).json({ message: "Bad Request" });
    }

    const sessionUserId = req.session.user._id.toString();
    const submittedUserId = user._id.toString();

    console.log("Session User: ", sessionUserId);
    console.log("Submitted User: ", submittedUserId);

    if (req.session.user.role === "admin" || sessionUserId === submittedUserId) {
        console.log("req Session successful");
        next();
    } else {
        console.log("req session unsuccessful");
        res.status(401).json({ message: "Unauthorized" });
    }
};

module.exports = isAuthorizedDeletingUser;
