const CompanyModel = require("../models/Company.js")
const deleteCaptchaRelation = require("../services/deleteCaptchaRelation.js");
const deleteUserRelation = require("../services/deleteUserRelation.js")
const deleteRegisterKey = require("../services/deleteRegisterKey.js");
const deleteColorKitRelation = require("../services/deleteColorKitRelation.js");
const deleteAllowedOriginRelation = require("../services/deleteAllowedOriginRelation.js")
const deleteDeletedArchiveRelation = require("../services/deleteDeletedArchiveRelation.js")
const setUserRelationToReadOnly = require("../services/setAllRelatedUsersToReadOnly.js")
const deleteApiKeyRelation = require("../services/deleteApiKeyRelation.js")
async function deleteEverythingFromCompany(companyId) {
    try {
        console.log(`Deleting all company relations with company ID: ${companyId}`)
        const company = await CompanyModel.findOne({ companyId: companyId })
        console.log(`Found company: ${company ? company.name : "not found"}`)
        if (!company) {
            console.log("Company not found")
            return { success: false, message: "Company not found" }
        }
        console.log(`Starting to delete captcha relations for company ID: ${company.companyId}`)
        await deleteCaptchaRelation(company.companyId)
        console.log(`Finished deleting captcha relations for company ID: ${company.companyId}`)

        console.log(`Starting to set all users with company ID: ${company.companyId} to Read Only`)
        await setUserRelationToReadOnly(company.companyId)
        console.log(`Finished setting all users with company ID: ${company.companyId} to Read Only`)

        console.log(`Starting to delete user relations for company ID: ${company.companyId}`)
        await deleteUserRelation(company.companyId)
        console.log(`Finished deleting user relations for company ID: ${company.companyId}`)

        console.log(`Starting to delete register key for company ID: ${company.companyId}`)
        await deleteRegisterKey(company.companyId)
        console.log(`Finished deleting register key for company ID: ${company.companyId}`)

        console.log(`Starting to delete color kit relation for company ID: ${company.companyId}`)
        await deleteColorKitRelation(company.companyId)
        console.log(`Finished deleting color kit relation for company ID: ${company.companyId}`)

        console.log(`Starting to delete allowed origins relation for company ID: ${company.companyId}`)
        await deleteAllowedOriginRelation(company.companyId)
        console.log(`Finished deleting allowed origins relation for company ID: ${company.companyId}`)

        console.log(`Starting to delete deleted Archive relation for company ID: ${company.companyId}`)
        await deleteDeletedArchiveRelation(company.companyId)
        console.log(`Finished deleting deleted Archive relation for company ID: ${company.companyId}`)

        console.log(`Starting to delete api key relations for company ID: ${company.companyId}`)
        await deleteApiKeyRelation(company.companyId)
        console.log(`Finished deleting api key relations for company ID: ${company.companyId}`)

        console.log(`Deleting company: ${company.name}`)
        await CompanyModel.deleteOne({ companyId: companyId })
        console.log(`Finished deleting company: ${company.name}`)

    } catch (error) {
        console.error("Error occurred while deleting all company relations:", error)
        return { success: false, message: "An error occurred while deleting all company relations." }
    }
}

module.exports = deleteEverythingFromCompany;