function isAppAdmin (res, req, next){
    if(req.session.user.appAdmin){
        next()
    }
    else{
        return res.status(401).json({ message: "Unauthorized" });
    }
    
}

module.exports = isAppAdmin;