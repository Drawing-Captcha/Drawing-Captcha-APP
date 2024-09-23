function isRelatedToCompany(req, companyId){

    if(req.session && req.session.user && req.session.user.appAdmin){
        return true
    }
    if(req.session.user.company === companyId){
        return true
    }
    else{
        false
    }
    
}

module.exports = isRelatedToCompany;


