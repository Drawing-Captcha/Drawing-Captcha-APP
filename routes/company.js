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


router.get('/', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const allCompanies = await CompanyModel.find();
        let returnedCompanies = []
        if(req.session.user.appAdmin){
            returnedCompanies = allCompanies;
            console.log('returnedCompanies as appAdmin: ', returnedCompanies);
        }
        else{
            let sessionCompanies = req.session.user.company
            console.log('sessionCompanies: ', sessionCompanies);

            allCompanies.forEach(company => {
                if(sessionCompanies === company.companyId){
                    console.log(company)
                    returnedCompanies.push(company)
                }
            })            
            console.log('returnedCompanies as user: ', returnedCompanies);
        }
        console.log("companies that are being returned to the user: ", returnedCompanies)
        if (allCompanies) {
            console.log("Successfully found all Companies: ", returnedCompanies);
        }
        res.json({allCompanies: returnedCompanies, userRole: req.session.user.role})
    }
    catch (error) {
        console.error("Error occurred during admin initialization:", error);
    }
})

router.post('/', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        let companyExists = await CompanyModel.findOne({ name: req.body.name });
        if (companyExists) {
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
            return res.status(400).json({ message: registerKeyResult.message });
        }

        await company.save();
        
        createCompanyColorKit(company.companyId);
        console.log("originname: ", req.body)
        createAllowedOrigin(company.companyId, req.body.originName);

        return res.status(201).json({ message: "Company successfully created.", company });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while creating the company." });
    }
});


router.put('/', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        const { companyId, name, ppURL } = req.body;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required." });
        }
        if (!name) {
            return res.status(400).json({ message: "Company name is required." });
        }

        const company = await CompanyModel.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        company.name = name;
        company.ppURL = ppURL || company.ppURL;

        await company.save();

        res.status(200).json({ message: "Company successfully updated.", company });
    } catch (error) {
        console.error("Error occurred while updating the company:", error);
        res.status(500).json({ message: "An error occurred while updating the company." });
    }
});


router.delete('/', authMiddleware, csrfMiddleware.validateCSRFToken, notReadOnly, async (req, res) => {
    try {
        const { companyId } = req.body;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID is required." });
        }

        await deleteAllRelations(companyId)

        // const company = await CompanyModel.findOne({ companyId });

        // if (!company) {
        //     return res.status(404).json({ message: "Company not found." });
        // }

        // await CompanyModel.deleteOne({ companyId });

        // await CaptchaModel.updateMany(
        //     { companies: companyId },
        //     { $pull: { companies: companyId } }
        // );

        res.status(200).json({ message: "Company and related captchas successfully updated." });
    } catch (error) {
        console.error("Error occurred while deleting the company:", error);
        res.status(500).json({ message: "An error occurred while deleting the company." });
    }
});

module.exports = router;