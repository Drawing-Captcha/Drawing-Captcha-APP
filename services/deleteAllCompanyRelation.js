const CompanyModel = require("../models/Company.js")
const deleteCaptchaRelation = require("../services/deleteCaptchaRelation.js");
const deleteUserRelation = require("../services/deleteUserRelation.js")
const deleteRegisterKey = require("../services/deleteRegisterKey.js");
const deleteColorKitRelation = require("../services/deleteColorKitRelation.js");
const deleteAllowedOriginRelation = require("../services/deleteAllowedOriginRelation.js")
const deleteDeletedArchiveRelation = require("../services/deleteDeletedArchiveRelation.js")
const setUserRelationToReadOnly = require("../services/setAllRelatedUsersToReadOnly.js")
const deleteApiKeyRelation = require("../services/deleteApiKeyRelation.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function deleteEverythingFromCompany(companyId) {
    try {
        logger.info(`Deleting all company relations with company ID: ${companyId}`, {
            companyId: companyId,
            operation: 'delete_all_company_relations'
        })
        const company = await CompanyModel.findOne({ companyId: companyId })
        logger.info(`Found company: ${company ? company.name : "not found"}`, {
            companyId: companyId,
            companyName: company ? company.name : "not found",
            operation: 'delete_all_company_relations'
        })
        if (!company) {
            logger.warn(`Company not found`, {
                companyId: companyId,
                operation: 'delete_all_company_relations'
            })
            return { success: false, message: "Company not found" }
        }
        logger.info(`Starting to delete captcha relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_captcha_relation'
        })
        await deleteCaptchaRelation(company.companyId)
        logger.info(`Finished deleting captcha relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_captcha_relation'
        })

        logger.info(`Starting to set all users with company ID: ${company.companyId} to Read Only`, {
            companyId: company.companyId,
            operation: 'set_user_to_read_only'
        })
        await setUserRelationToReadOnly(company.companyId)
        logger.info(`Finished setting all users with company ID: ${company.companyId} to Read Only`, {
            companyId: company.companyId,
            operation: 'set_user_to_read_only'
        })

        logger.info(`Starting to delete user relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_user_relation'
        })
        await deleteUserRelation(company.companyId)
        logger.info(`Finished deleting user relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_user_relation'
        })

        logger.info(`Starting to delete register key for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_register_key'
        })
        await deleteRegisterKey(company.companyId)
        logger.info(`Finished deleting register key for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_register_key'
        })

        logger.info(`Starting to delete color kit relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_color_kit_relation'
        })
        await deleteColorKitRelation(company.companyId)
        logger.info(`Finished deleting color kit relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_color_kit_relation'
        })

        logger.info(`Starting to delete allowed origins relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_allowed_origin_relation'
        })
        await deleteAllowedOriginRelation(company.companyId)
        logger.info(`Finished deleting allowed origins relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_allowed_origin_relation'
        })

        logger.info(`Starting to delete deleted Archive relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_deleted_archive_relation'
        })
        await deleteDeletedArchiveRelation(company.companyId)
        logger.info(`Finished deleting deleted Archive relation for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_deleted_archive_relation'
        })

        logger.info(`Starting to delete api key relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_api_key_relation'
        })
        await deleteApiKeyRelation(company.companyId)
        logger.info(`Finished deleting api key relations for company ID: ${company.companyId}`, {
            companyId: company.companyId,
            operation: 'delete_api_key_relation'
        })

        logger.info(`Deleting company: ${company.name}`, {
            companyId: company.companyId,
            companyName: company.name,
            operation: 'delete_company'
        })
        await CompanyModel.deleteOne({ companyId: companyId })
        logger.info(`Finished deleting company: ${company.name}`, {
            companyId: company.companyId,
            companyName: company.name,
            operation: 'delete_company'
        })

    } catch (error) {
        logger.error(`Error occurred while deleting all company relations: ${error}`, {
            companyId: companyId,
            error: error,
            operation: 'delete_all_company_relations'
        })
        return { success: false, message: "An error occurred while deleting all company relations." }
    }
}

module.exports = deleteEverythingFromCompany;
