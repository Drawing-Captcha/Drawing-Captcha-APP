const express = require('express');
const router = express.Router();
const CompanyModel = require("../models/Company.js")
const CaptchaModel = require("../models/Captcha.js")
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const notReadOnly = require("../middlewares/notReadOnly.js")
const deleteAllRelations = require("../services/deleteAllCompanyRelation.js")
const createCompanyRegisterKey = require("../services/createCompanyRegisterKey.js")
const createCompanyColorKit = require("../services/createCompanyColorKit.js")
const crypto = require("crypto");
const createAllowedOrigin = require('../services/createAllowedOrigin.js');
const isAppAdmin = require("../middlewares/isAppAdmin.js")
const isAdmin = require("../middlewares/adminMiddleware.js")
const isRelatedToCompany = require('../services/companyRelationMiddleware.js');
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

router.get('/', async (req, res) => {
    logger.request(req, "Get companies request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        isAppAdmin: req.session.user?.appAdmin,
        operation: 'get_companies'
    });
    
    try {
        const allCompanies = await CompanyModel.find();
        let returnedCompanies = []
        if(req.session.user.appAdmin){
            returnedCompanies = allCompanies;
            logger.info('Returning all companies for app admin', {
                userId: req.session.user?._id,
                companyCount: returnedCompanies.length,
                operation: 'get_companies_admin'
            });
        }
        else{
            let sessionCompanies = req.session.user.company
            logger.info('Filtering companies for regular user', {
                userId: req.session.user?._id,
                userCompany: sessionCompanies,
                operation: 'get_companies_user'
            });

            allCompanies.forEach(company => {
                if(sessionCompanies === company.companyId){
                    logger.debug('Company matched user company', {
                        companyId: company.companyId,
                        companyName: company.name
                    });
                    returnedCompanies.push(company)
                }
            })            
            logger.info('Filtered companies for user', {
                userId: req.session.user?._id,
                companyCount: returnedCompanies.length,
                operation: 'get_companies_filtered'
            });
        }
        
        if (allCompanies) {
            logger.info("Successfully retrieved companies", {
                userId: req.session.user?._id,
                totalCompanies: allCompanies.length,
                returnedCompanies: returnedCompanies.length,
                operation: 'get_companies_success'
            });
        }
        res.json({allCompanies: returnedCompanies, userRole: req.session.user.role})
    }
    catch (error) {
        logger.error("Error retrieving companies", error, {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'get_companies'
        });
        res.status(500).json({ message: 'An error occurred while retrieving companies' });
    }
})

router.post('/', isAppAdmin, async (req, res) => {
    console.log("Create company request received");
    logger.request(req, "Create company request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        companyName: req.body.name,
        operation: 'create_company'
    });
    
    try {
        let companyExists = await CompanyModel.findOne({ name: req.body.name });
        if (companyExists) {
            logger.warn("Attempted to create company with existing name", {
                userId: req.session.user?._id,
                companyName: req.body.name,
                operation: 'create_company_duplicate'
            });
            return res.status(400).json({ message: "A company with this name already exists." });
        }

        const randomUUID = crypto.randomUUID();

        const company = new CompanyModel({
            companyId: randomUUID,
            name: req.body.name,
            ppURL: req.body.ppURL
        });

        const registerKeyResult = await createCompanyRegisterKey(randomUUID);

        if (!registerKeyResult.success) {
            logger.error("Failed to create register key for company", null, {
                userId: req.session.user?._id,
                companyName: req.body.name,
                companyId: randomUUID,
                message: registerKeyResult.message,
                operation: 'create_company_register_key_failed'
            });
            return res.status(400).json({ message: registerKeyResult.message });
        }

        await company.save();
        
        createCompanyColorKit(company.companyId);
        logger.info("Creating company with origin", {
            userId: req.session.user?._id,
            companyId: company.companyId,
            companyName: company.name,
            originName: req.body.originName,
            operation: 'create_company_origin'
        });
        createAllowedOrigin(company.companyId, req.body.originName);

        logger.info("Company successfully created", {
            userId: req.session.user?._id,
            companyId: company.companyId,
            companyName: company.name,
            operation: 'create_company_success'
        });
        return res.status(201).json({ message: "Company successfully created.", company });

    } catch (error) {
        logger.error("Error creating company", error, {
            userId: req.session.user?._id,
            companyName: req.body.name,
            operation: 'create_company'
        });
        return res.status(500).json({ message: "An error occurred while creating the company." });
    }
});

router.put('/', isAdmin, async (req, res) => {
    logger.request(req, "Update company request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        companyId: req.body.companyId,
        operation: 'update_company'
    });
    
    try {
        const { companyId, name, ppURL } = req.body;

        if(!isRelatedToCompany(req, companyId)){
            logger.warn("Unauthorized company update attempt", {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                companyId: companyId,
                operation: 'update_company_unauthorized'
            });
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!companyId) {
            logger.warn("Missing company ID in update request", {
                userId: req.session.user?._id,
                operation: 'update_company_invalid'
            });
            return res.status(400).json({ message: "Company ID is required." });
        }
        if (!name) {
            logger.warn("Missing company name in update request", {
                userId: req.session.user?._id,
                companyId: companyId,
                operation: 'update_company_invalid'
            });
            return res.status(400).json({ message: "Company name is required." });
        }

        const company = await CompanyModel.findOne({ companyId });
        if (!company) {
            logger.warn("Company not found for update", {
                userId: req.session.user?._id,
                companyId: companyId,
                operation: 'update_company_not_found'
            });
            return res.status(404).json({ message: "Company not found." });
        }

        const oldName = company.name;
        company.name = name;
        company.ppURL = ppURL || company.ppURL;

        await company.save();

        logger.info("Company successfully updated", {
            userId: req.session.user?._id,
            companyId: companyId,
            oldName: oldName,
            newName: name,
            operation: 'update_company_success'
        });
        res.status(200).json({ message: "Company successfully updated.", company });
    } catch (error) {
        logger.error("Error updating company", error, {
            userId: req.session.user?._id,
            companyId: req.body.companyId,
            operation: 'update_company'
        });
        res.status(500).json({ message: "An error occurred while updating the company." });
    }
});

router.delete('/', isAdmin, async (req, res) => {
    logger.request(req, "Delete company request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        companyId: req.body.companyId,
        operation: 'delete_company'
    });
    
    try {
        const { companyId } = req.body;

        if(!isRelatedToCompany(req, companyId)){
            logger.warn("Unauthorized company delete attempt", {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                companyId: companyId,
                operation: 'delete_company_unauthorized'
            });
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!companyId) {
            logger.warn("Missing company ID in delete request", {
                userId: req.session.user?._id,
                operation: 'delete_company_invalid'
            });
            return res.status(400).json({ message: "Company ID is required." });
        }

        // Log company information before deletion
        const company = await CompanyModel.findOne({ companyId });
        if (company) {
            logger.info("Deleting company", {
                userId: req.session.user?._id,
                companyId: companyId,
                companyName: company.name,
                operation: 'delete_company_start'
            });
        }

        await deleteAllRelations(companyId);

        logger.info("Company and related resources successfully deleted", {
            userId: req.session.user?._id,
            companyId: companyId,
            operation: 'delete_company_success'
        });
        res.status(200).json({ message: "Company and related captchas successfully updated." });
    } catch (error) {
        logger.error("Error deleting company", error, {
            userId: req.session.user?._id,
            companyId: req.body.companyId,
            operation: 'delete_company'
        });
        res.status(500).json({ message: "An error occurred while deleting the company." });
    }
});

module.exports = router;