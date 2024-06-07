function isAuthRedirect(req, res, next){
    if(req.session.isAuth){
        res.redirect("/dashboard");
    }
    else{
        next()
    }
}

module.exports = isAuthRedirect;