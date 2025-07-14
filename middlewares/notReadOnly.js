const notReadOnly = (req, res, next) => {
    if(req.session.user.role != "read"){
        next();
    }
    else{
        return res.status(302).render("notAuthorized", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role })
    }
}

module.exports = notReadOnly;