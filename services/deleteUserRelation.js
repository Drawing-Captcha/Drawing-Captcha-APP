const UserModel = require("../models/User.js")

async function deleteUserRelation(companyId){
    try{
        console.log(`Deleting user relations with company ID: ${companyId}`)
        const users = await UserModel.find({ companies: companyId })

        console.log(`Found ${users.length} users with company ID: ${companyId}`)
        users.forEach(user => {
            if(user.companies.includes(companyId)){
                console.log(`Removing company ID: ${companyId} from user ID: ${user._id}`)
                user.companies.splice(user.companies.indexOf(companyId), 1)
                user.save()
            }
        })

    }catch(error){
        console.error(`An error occurred while deleting user relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteUserRelation;