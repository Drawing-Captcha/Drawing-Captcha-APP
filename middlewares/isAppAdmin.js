function isAppAdmin (req, res, next){
    if(req.session && req.session.user && req.session.user.appAdmin){
        next()
    }
    else{
        return res.status(401).json({ message: "Unauthorized" });
    }
    
}

module.exports = isAppAdmin;

