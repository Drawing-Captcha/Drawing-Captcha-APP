const isAdmin = (req, res, next) => {
    console.log("ifAdmin")
    if (!req.session.user) {
        console.log("Session User is not defined");
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