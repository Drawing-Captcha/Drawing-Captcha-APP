const express = require('express');
const router = express.Router();
const CompanyModel = require("../models/Company.js")
const csrfMiddleware = require("../middlewares/csurfMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const notReadOnly = require("../middlewares/notReadOnly.js")
const crypto = require("crypto");


router.get('/', authMiddleware, csrfMiddleware.validateCSRFToken, async (req, res) => {
    try {
        const allCompanies = await CompanyModel.find();
        let returnedCompanies = []
        if(req.session.user.role === "admin"){
            returnedCompanies = allCompanies;
        }
        else{
            let sessionCompanies = req.session.user.companies

            allCompanies.forEach(company => {
                if(sessionCompanies.includes(company.companyId)){
                    console.log(company)
                    returnedCompanies.push(company)
                }
            })            
            
        }
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
        let companyExists = await CompanyModel.findOne({name: req.body.name});
        if(companyExists){
            return res.status(400).json({message: "A company with this name already exists."});
        }

        const company = new CompanyModel({
            companyId: crypto.randomUUID(),
            name: req.body.name,
            ppURL: req.body.ppURL
        });

        await company.save();

        return res.status(201).json({message: "Company successfully created.", company});

    } catch(error) {
        console.error(error);
        return res.status(500).json({message: "An error occurred while creating the company."});
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

        const company = await CompanyModel.findOne({ companyId });
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        await CompanyModel.deleteOne({ companyId });

        res.status(200).json({ message: "Company successfully deleted." });
    } catch (error) {
        console.error("Error occurred while deleting the company:", error);
        res.status(500).json({ message: "An error occurred while deleting the company." });
    }
});
module.exports = router;