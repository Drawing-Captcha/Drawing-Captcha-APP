const isAdmin = (req, res, next) => {
    if (!req.session.user) {
        console.log("Session User is not defined");
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.session.user.role === "admin"){
        next();
    }
    else{
        res.status(401).json({ message: "Unauthorized access please contact your administrator" });
    }
}

module.exports = isAdmin;