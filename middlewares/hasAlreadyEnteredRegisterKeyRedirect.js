const UserModel = require("../models/User");
const RegisterKeyModel = require("../models/RegisterKey");

async function hasAlreadyEnteredRegisterKeyRedirect(req, res, next) {
    try {
        const user = await UserModel.findById(req.session.user._id);
        if (!user.usedRegisterKey && !user.initialUser && !user.appAdmin && !user.company) {
            next();
        }   
        else{
            res.status(302).redirect("/dashboard");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = hasAlreadyEnteredRegisterKeyRedirect;

