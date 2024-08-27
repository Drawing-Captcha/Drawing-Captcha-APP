const UserModel = require("../models/User.js")

async function deleteUserRelation(companyId){
    try{
        console.log(`Deleting user relations with company ID: ${companyId}`)
        const users = await UserModel.updateMany({ company: companyId }, { $unset: { company: "" } })

        console.log(`Successfully deleted ${users.nModified} users with company ID: ${companyId}`)

    }catch(error){
        console.error(`An error occurred while deleting user relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteUserRelation;
