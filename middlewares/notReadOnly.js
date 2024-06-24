const notReadOnly = (req, res, next) => {
    if(req.session.user.role != "read"){
        next();
    }
    else{
        return res.redirect("/dashboard/notAuthorized")
    }
}

module.exports = notReadOnly;