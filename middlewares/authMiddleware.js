const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        console.log("is authenticated falied")
        res.redirect("/login");
    }
};

module.exports = isAuth;
