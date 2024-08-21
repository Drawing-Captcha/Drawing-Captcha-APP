const CompanyModel = require("../models/Company.js")
const deleteCaptchaRelation = require("../services/deleteCaptchaRelation.js");
const deleteUserRelation = require("../services/deleteUserRelation.js")
const deleteRegisterKey = require("../services/deleteRegisterKey.js")

async function deleteEverythingFromCompany(companyId) {
    try{
        console.log(`Deleting all company relations with company ID: ${companyId}`)
        const company = await CompanyModel.findOne({ companyId: companyId })
        console.log(`Found company: ${company ? company.name : "not found"}`)
        if(!company){
            console.log("Company not found")
            return {success: false, message: "Company not found"}
        }
        console.log(`Starting to delete captcha relations for company ID: ${company.companyId}`)
        await deleteCaptchaRelation(company.companyId)
        console.log(`Finished deleting captcha relations for company ID: ${company.companyId}`)

        console.log(`Starting to delete user relations for company ID: ${company.companyId}`)
        await deleteUserRelation(company.companyId)
        console.log(`Finished deleting user relations for company ID: ${company.companyId}`)

        console.log(`Starting to delete register key for company ID: ${company.companyId}`)
        await deleteRegisterKey(company.companyId)
        console.log(`Finished deleting register key for company ID: ${company.companyId}`)

        console.log(`Deleting company: ${company.name}`)
        await CompanyModel.deleteOne({ companyId: companyId })
        console.log(`Finished deleting company: ${company.name}`)

    }catch(error){
        console.error("Error occurred while deleting all company relations:", error)
        return {success: false, message: "An error occurred while deleting all company relations."}
    }
}

module.exports = deleteEverythingFromCompany;