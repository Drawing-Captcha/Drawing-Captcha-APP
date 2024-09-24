const UserModel = require("../models/User.js");


async function setUserRelationToReadOnly(companyId) {
    console.log(`Setting all users with company ID: ${companyId} to Read Only`);

    try {
        const alluser = await UserModel.find({company: companyId})
        console.log("allUsers: ", alluser)
        const users = await UserModel.updateMany(
            { company: companyId },
            { $set: { role: "read" } }
        );

        console.log(`Successfully set ${users} users with company ID: ${companyId} to Read Only`);

    } catch (error) {
        console.error(`An error occurred while setting all users with company ID: ${companyId} to Read Only`, error);
    }
}

module.exports = setUserRelationToReadOnly;

