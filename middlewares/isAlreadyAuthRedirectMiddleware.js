function isAuthRedirect(req, res, next){
    if(req.session.isAuth){
        // Prevent redirect loop by checking if we're already coming from dashboard
        if(req.get('Referer') && req.get('Referer').includes('/dashboard')){
            return next();
        }
        res.redirect("/dashboard");
    }
    else{
        next()
    }
}

module.exports = isAuthRedirect;