const path = require("path");
const { promises: fsPromises } = require('fs');
const mongoose = require('mongoose');
const fs = require("fs");
const uuid = require('uuid');
const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const ColorKit = require("../models/ColorKit.js");
const AllowedOriginModel = require("../models/AllowedOrigins.js");
const { pool, deletedBin, initializeAllowedOrigins, initializePool, initializeBin } = require("../controllers/initializeController");
const ApiKeyModel = require("../models/ApiKey.js")
const doesApiKeyExist = require("../services/apiKeyExist.js")
const isAdmin = require("../middlewares/adminMiddleware.js")
const registerKeyModel = require("../models/RegisterKey.js")
const generateNewRegisterKey = require("../services/generateRegisterKey.js")
const notReadOnly = require("../middlewares/notReadOnly.js")
const isAppAdmin = require("../middlewares/isAppAdmin.js")
const CaptchaModel = require("../models/Captcha.js")
const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")
const CompanyModel = require("../models/Company.js")
const isRelatedToCompany = require("../services/companyRelationMiddleware.js")
const proofRegexOrigins = require("../services/proofRegexOrigins.js")
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

router.get('/getElements', async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Dashboard getElements request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        isAppAdmin: req.session.user?.appAdmin,
        operation: 'dashboard_get_elements'
    });
    
    try {
        let globalPool = await initializePool()
        let userRole = req.session.user.role;
        let appAdmin = req.session.user.appAdmin;
        let returnedPool
        
        if (globalPool) {
            if (appAdmin) {
                logger.info("Admin user accessing all elements", {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    totalElements: globalPool.length,
                    operation: 'dashboard_get_elements_admin'
                });
                returnedPool = globalPool
            }
            else {
                returnedPool = []
                logger.info("Regular user filtering elements by company", {
                    userId: req.session.user?._id,
                    userCompany: req.session.user?.company,
                    operation: 'dashboard_get_elements_filtered'
                });
                
                globalPool.forEach(item => {
                    if (item.initialCaptcha === true || item.companies.some(company => req.session.user.company === company)) {
                        returnedPool.push(item)
                    }
                })
            }
        } else {
            logger.error("Pool not defined", null, {
                userId: req.session.user?._id,
                operation: 'dashboard_get_elements_pool_missing'
            });
        }
        
        const duration = Date.now() - startTime;
        logger.info("Elements retrieved successfully", {
            userId: req.session.user?._id,
            userRole: userRole,
            isAppAdmin: appAdmin,
            elementCount: returnedPool?.length || 0,
            duration: `${duration}ms`,
            operation: 'dashboard_get_elements_success'
        });
        
        res.json({ globalPool: returnedPool, userRole, appAdmin: req.session.user.appAdmin });
    } catch (error) {
        logger.error("Error retrieving dashboard elements", error, {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'dashboard_get_elements'
        });
        res.status(500).send({ message: 'Server error' });
    }
});

router.get('/getElements/notCategorized', isAppAdmin, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Dashboard get uncategorized elements request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        isAppAdmin: req.session.user?.appAdmin,
        operation: 'dashboard_get_uncategorized'
    });
    
    try {
        let globalPool = await initializePool()
        let userRole = req.session.user.role;
        let returnedPool
        
        if (globalPool) {
            returnedPool = []
            globalPool.forEach(item => {
                if (item.companies === null || item.companies.length === 0) {
                    returnedPool.push(item)
                }
            })
            logger.info("Uncategorized elements retrieved", {
                userId: req.session.user?._id,
                totalElements: globalPool.length,
                uncategorizedCount: returnedPool.length,
                operation: 'dashboard_get_uncategorized'
            });
        }
        else {
            logger.error("Pool not defined", null, {
                userId: req.session.user?._id,
                operation: 'dashboard_get_uncategorized_pool_missing'
            });
        }
        
        const duration = Date.now() - startTime;
        logger.info("Uncategorized elements request completed", {
            userId: req.session.user?._id,
            userRole: userRole,
            elementCount: returnedPool?.length || 0,
            duration: `${duration}ms`,
            operation: 'dashboard_get_uncategorized_success'
        });
        
        res.json({ globalPool: returnedPool, userRole });
    } catch (error) {
        logger.error("Error retrieving uncategorized dashboard elements", error, {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'dashboard_get_uncategorized'
        });
        res.status(500).send({ message: 'Server error' });
    }
});


router.put("/crud", notReadOnly, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Dashboard CRUD operation", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: req.body.isDelete ? 'dashboard_delete_item' : 'dashboard_update_item',
        itemCount: req.body.tmpPool?.length || 0
    });
    
    let globalPool = await initializePool();
    let globalDeletedBin = await initializeBin();
    
    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let companyId = tmpPool[0].companies[0];
    let index;
    
    if (!isRelatedToCompany(req, companyId)) {
        logger.warn("Unauthorized CRUD operation attempt", {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            companyId: companyId,
            operation: req.body.isDelete ? 'dashboard_delete_unauthorized' : 'dashboard_update_unauthorized'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    logger.info("Processing dashboard CRUD operation", {
        userId: req.session.user?._id,
        isDelete: req.body.isDelete,
        itemId: tmpPool[0]?.ID,
        companyId: companyId,
        operation: 'dashboard_crud_process'
    });

    if (Array.isArray(tmpPool)) {
        tmpPool.forEach(x => {
            index = globalPool.findIndex(b => b.ID === x.ID);
        });

        if (req.body.isDelete) {
            deletedObject = globalPool.splice(index, 1)[0];
            logger.info("Item deleted from pool", {
                userId: req.session.user?._id,
                itemId: deletedObject?.ID,
                itemName: deletedObject?.Name,
                companyId: companyId,
                operation: 'dashboard_delete_item'
            });
            logger.debug("Pool state after deletion", {
                userId: req.session.user?._id,
                poolSize: globalPool.length,
                operation: 'dashboard_delete_item_pool_update'
            });

            globalDeletedBin.push(deletedObject);

            try {
                const found = await CaptchaModel.findOne({ ID: deletedObject.ID });

                if (found) {
                    await CaptchaModel.deleteOne({ ID: deletedObject.ID });

                    const deletedCaptcha = new DeletedCaptchaModel({
                        ...deletedObject.toObject(),
                        _id: new mongoose.Types.ObjectId(),
                    });

                    await deletedCaptcha.save();
                    logger.info('Data added to deleted bin in MongoDB', {
                        userId: req.session.user?._id,
                        itemId: deletedObject?.ID,
                        operation: 'dashboard_add_to_deleted_bin'
                    });
                } else {
                    logger.error('Document not found in Captcha collection', null, {
                        userId: req.session.user?._id,
                        itemId: deletedObject?.ID,
                        operation: 'dashboard_delete_not_found'
                    });
                }
            } catch (err) {
                logger.error('Error saving to deleted bin in MongoDB', err, {
                    userId: req.session.user?._id,
                    itemId: deletedObject?.ID,
                    operation: 'dashboard_add_to_deleted_bin_error'
                });
            }
        } else {
            logger.info("Updating item with companies", {
                userId: req.session.user?._id,
                itemId: tmpPool[0]?.ID,
                itemName: tmpPool[0]?.Name,
                companies: tmpPool[0]?.companies,
                operation: 'dashboard_update_item'
            });
            let updatedCaptcha = {
                Name: tmpPool[0].Name,
                ValidateF: tmpPool[0].ValidateF,
                validateMinCubes: tmpPool[0].validateMinCubes,
                validateMaxCubes: tmpPool[0].validateMaxCubes,
                MaxTolerance: (tmpPool[0].validateMaxCubes.length * 1) / tmpPool[0].ValidateF.length,
                MinTolerance: (tmpPool[0].validateMinCubes.length * 1) / tmpPool[0].ValidateF.length,
                todoTitle: tmpPool[0].todoTitle,
                backgroundSize: tmpPool[0].backgroundSize,
                companies: tmpPool[0].companies
            };

            try {
                await CaptchaModel.updateOne({ ID: tmpPool[0].ID }, updatedCaptcha, { runValidators: true });
                logger.info('Data updated in MongoDB', {
                    userId: req.session.user?._id,
                    itemId: tmpPool[0]?.ID,
                    itemName: tmpPool[0]?.Name,
                    operation: 'dashboard_update_item_success'
                });
            } catch (err) {
                logger.error('Error updating data in MongoDB', err, {
                    userId: req.session.user?._id,
                    itemId: tmpPool[0]?.ID,
                    operation: 'dashboard_update_item_error'
                });
            }
        }

        isGood = true;
        const duration = Date.now() - startTime;
        logger.info("CRUD operation completed successfully", {
            userId: req.session.user?._id,
            operation: req.body.isDelete ? 'dashboard_delete_success' : 'dashboard_update_success',
            duration: `${duration}ms`
        });
    } else {
        logger.error("Problem with the tmpPool array", null, {
            userId: req.session.user?._id,
            operation: 'dashboard_crud_array_error',
            tmpPoolType: typeof tmpPool,
            isArray: Array.isArray(tmpPool)
        });
        isGood = false;
    }
    res.json({ isGood });
});


router.get('/deletedArchive', (req, res) => {
    logger.request(req, "Access deleted archive view", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'dashboard_view_deleted_archive'
    });
    res.render("deletedArchive", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin })
})

router.get('/notAuthorized', (req, res) => {
    logger.warn("User accessed unauthorized page", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        username: req.session.user?.username,
        operation: 'dashboard_unauthorized_access'
    });
    res.render("notAuthorized", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role })
})

router.put('/deletedArchive', notReadOnly, async (req, res) => {

    let globalPool = await initializePool();
    let globalDeletedBin = await initializeBin();

    let deletedObject;
    let tmpPool = req.body.tmpPool;
    let companyId = tmpPool[0].companies[0];
    let index;

    if (!isRelatedToCompany(req, companyId)) {
        logger.warn("Unauthorized attempt to access deleted archive", {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            companyId: companyId,
            operation: 'access_deleted_archive_unauthorized'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }
    logger.debug("Processing deleted archive pool", {
        userId: req.session.user?._id,
        poolSize: tmpPool?.length,
        operation: 'process_deleted_archive'
    });

    if (Array.isArray(tmpPool)) {
        tmpPool.forEach(x => {
            index = globalDeletedBin.findIndex(b => b.ID === x.ID);
            logger.debug("Found item index in deleted bin", {
                userId: req.session.user?._id,
                itemId: x.ID,
                index: index,
                operation: 'find_deleted_item'
            });
        });

        if (req.body.isDelete) {
            deletedObject = globalDeletedBin.splice(index, 1)[0];
            try {
                await DeletedCaptchaModel.deleteOne({ ID: deletedObject.ID });
                logger.info('Deleted object removed from MongoDB deleted bin', {
                    userId: req.session.user?._id,
                    itemId: deletedObject?.ID,
                    operation: 'remove_from_deleted_bin'
                });
            } catch (err) {
                logger.error('Error deleting from MongoDB deleted bin', err, {
                    userId: req.session.user?._id,
                    itemId: deletedObject?.ID,
                    operation: 'remove_from_deleted_bin_error'
                });
            }
        } else {
            deletedObject = globalDeletedBin.splice(index, 1)[0];
            globalPool.push(deletedObject);

            try {
                await DeletedCaptchaModel.deleteOne({ ID: deletedObject.ID });
                const newCaptcha = new CaptchaModel({
                    ...deletedObject.toObject(),
                    _id: new mongoose.Types.ObjectId(),
                });
                await newCaptcha.save();
                logger.info('Deleted object restored to active pool', {
                    userId: req.session.user?._id,
                    itemId: deletedObject?.ID,
                    operation: 'restore_deleted_item'
                });
            } catch (err) {
                logger.error('Error restoring object to pool', err, {
                    userId: req.session.user?._id,
                    itemId: deletedObject?.ID,
                    operation: 'restore_deleted_item_error'
                });
            }
        }

        isGood = true;
    } else {
        logger.error("Problem with the deleted archive array", null, {
            userId: req.session.user?._id,
            operation: 'deleted_archive_array_error',
            tmpPoolType: typeof tmpPool,
            isArray: Array.isArray(tmpPool)
        });
        isGood = false;
    }
    res.json({ isGood });
});

router.get('/deletedArchiveAssets', async (req, res) => {
    let globalDeletedBin = await initializeBin()
    let appAdmin = req.session.user.appAdmin
    let returnedPool

    if (globalDeletedBin) {
        if (appAdmin) {
            returnedPool = globalDeletedBin
        }
        else {
            returnedPool = []
            globalDeletedBin.forEach(item => {
                if (item.companies.some(company => req.session.user.company === company)) {
                    returnedPool.push(item)
                }
            })
        }
    } else {
        logger.error("Deleted bin pool not defined", null, {
            userId: req.session.user?._id,
            operation: 'get_deleted_archive_assets_pool_missing'
        });
    }

    if (globalDeletedBin) {
        logger.info("Returning deleted archive assets", {
            userId: req.session.user?._id,
            userRole: req.session.user.role,
            isAppAdmin: req.session.user.appAdmin,
            itemCount: returnedPool?.length || 0,
            operation: 'get_deleted_archive_assets_success'
        });
        res.json({ globalDeletedBin: returnedPool, userRole: req.session.user.role, appAdmin: req.session.user.appAdmin });
    }
    else {
        logger.error("Deleted bin not defined", null, {
            userId: req.session.user?._id,
            operation: 'get_deleted_archive_assets_bin_missing'
        });
    }
});

router.get("/apiKeySection", isAdmin, (req, res) => {
    logger.request(req, "Access API key management section", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'view_api_key_section'
    });
    
    res.render("apiKeys", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin });
})

router.put("/apiKey", isAdmin, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "API key delete request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'delete_api_key',
        isDelete: req.body.isDelete
    });
    
    if (req.body.isDelete) {
        let key = req.body.key;
        let isKeyDeleted = false;
        try {
            logger.info("Looking up API key for deletion", {
                userId: req.session.user?._id,
                keyExists: !!key,
                operation: 'delete_api_key_lookup'
            });
            
            let keyExists = await ApiKeyModel.findOne({ apiKey: key });
            let companyId = keyExists.companies[0];
            if (!isRelatedToCompany(req, companyId)) {
                logger.warn("Unauthorized API key deletion attempt", {
                    userId: req.session.user?._id,
                    userRole: req.session.user?.role,
                    companyId: companyId,
                    operation: 'delete_api_key_unauthorized'
                });
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (keyExists) {
                let keyDeleted = await ApiKeyModel.deleteOne({ apiKey: key });
                isKeyDeleted = true;
                if (keyDeleted.deletedCount === 0) {
                    throw new Error("Error deleting API key");
                }
            } else {
                return res.status(404).json({ error: "The given key does not exist" });
            }
        } catch (err) {
            logger.error("Error deleting API key", err, {
                userId: req.session.user?._id,
                keyPresent: !!key,
                operation: 'delete_api_key_error'
            });
            return res.status(500).json({ error: "An error occurred while deleting the API key" });
        }
        
        const duration = Date.now() - startTime;
        logger.info("API key deletion complete", {
            userId: req.session.user?._id,
            success: isKeyDeleted,
            duration: `${duration}ms`,
            operation: 'delete_api_key_complete'
        });
        res.json({ isKeyDeleted });
    } else {
        logger.warn("Invalid API key delete request", {
            userId: req.session.user?._id,
            isDelete: req.body.isDelete,
            operation: 'delete_api_key_invalid_request'
        });
        return res.status(400).json({ error: "Invalid request: 'isDelete' is not true" });
    }
});

router.get("/apiKey", isAdmin, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Get API keys request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        isAppAdmin: req.session.user?.appAdmin,
        operation: 'get_api_keys'
    });
    
    try {
        let userRole = req.session.user.role
        let appAdmin = req.session.user.appAdmin
        let company = req.session.user.company

        let returnedKeys

        if (appAdmin) {
            logger.info("Admin retrieving all API keys", {
                userId: req.session.user?._id,
                isAppAdmin: appAdmin,
                operation: 'get_all_api_keys'
            });
            returnedKeys = await ApiKeyModel.find({});
        }
        else {
            logger.info("User retrieving company API keys", {
                userId: req.session.user?._id,
                company: company,
                operation: 'get_company_api_keys'
            });
            returnedKeys = await ApiKeyModel.find({ companies: { $in: company } })
        }
        
        logger.info("API keys retrieved", {
            userId: req.session.user?._id,
            keyCount: returnedKeys?.length || 0,
            operation: 'get_api_keys_success'
        });

        res.json({ apiKeys: returnedKeys, userRole, appAdmin: req.session.user.appAdmin });
    } catch (error) {
        logger.error("Error fetching API keys", error, {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'get_api_keys_error'
        });
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/apiKey/deleteAll", isAppAdmin, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Delete all API keys request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'delete_all_api_keys'
    });
    
    let deleteAll;
    logger.info("Starting deletion of all API keys", {
        userId: req.session.user?._id,
        operation: 'delete_all_api_keys_start'
    });
    try {
        const keys = await ApiKeyModel.find({});
        if (keys.length > 0) {
            const result = await ApiKeyModel.deleteMany({});
            if (result) {
                deleteAll = "All API keys have been successfully deleted."
            }
        }
        else {
            deleteAll = "No existing Keys"
        }

    }
    catch (err) {
        deleteAll = "The deletion of all API keys has failed."
    }
    
    const duration = Date.now() - startTime;
    logger.info("API keys deletion completed", {
        userId: req.session.user?._id,
        status: deleteAll,
        duration: `${duration}ms`,
        operation: 'delete_all_api_keys_complete'
    });
    
    res.json({ deleteAll })

})

router.post("/apiKey", isAdmin, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Create API key request", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        keyName: req.body.apiKeyName,
        operation: 'create_api_key'
    });
    
    let successfully;
    let message;
    try {
        let name = req.body.apiKeyName;
        let selectedCompanies = req.body.selectedCompanies;
        let companyId = req.body.selectedCompanies[0];
        
        if (!isRelatedToCompany(req, companyId)) {
            logger.warn("Unauthorized API key creation attempt", {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                companyId: companyId,
                operation: 'create_api_key_unauthorized'
            });
            return res.status(401).json({ message: "Unauthorized" });
        }
        let doesNameExist = await ApiKeyModel.findOne({ name: name });
        if (!doesNameExist) {
            let apiKey = crypto.randomUUID();
            while ((await doesApiKeyExist(apiKey))) {
                apiKey = crypto.randomUUID();
            }
            api = new ApiKeyModel({
                apiKey,
                name,
                companies: selectedCompanies
            })

            await api.save();
            successfully = true;


            message = "Successfully created an API Key"
            logger.info("API key created successfully", {
                userId: req.session.user?._id,
                keyName: name,
                companyId: companyId,
                operation: 'create_api_key_success'
            });
        }
        else {
            successfully = false;
            message = "Api key name already exists";
            logger.warn("API key creation failed - name exists", {
                userId: req.session.user?._id,
                keyName: name,
                operation: 'create_api_key_duplicate'
            });
        }

    }
    catch (err) {
        logger.error("Error creating API key", err, {
            userId: req.session.user?._id,
            keyName: req.body.apiKeyName,
            operation: 'create_api_key_error'
        });
        successfully = false;
    }
    
    const duration = Date.now() - startTime;
    logger.info("API key creation process completed", {
        userId: req.session.user?._id,
        success: successfully,
        duration: `${duration}ms`,
        operation: 'create_api_key_complete'
    });
    
    res.json({ successfully, message });
})

router.get("/", (req, res) => {
    res.render("dashboard", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin });
})

router.get("/captchaSettings", isAdmin, async (req, res) => {
    let companyData = {};

    try {
        let company = await CompanyModel.findOne({ companyId: req.session.user.company })
        if (company) {
            companyData.company = company.name;
        }
    } catch (error) {
        logger.error("Error fetching company data", error, {
            userId: req.session.user?._id,
            companyId: req.session.user?.company,
            operation: 'get_captcha_settings_company_error'
        });
        return res.status(500).json({ error: "An internal server error occurred." });
    }

    res.render("captchaSettings", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, ...companyData, appAdmin: req.session.user.appAdmin });
})

router.get("/registeredUsers", (req, res) => {
    res.render("users", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin });
})
router.get("/companies", (req, res) => {
    res.render("company", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin });
})

router.get("/registerKey", isAdmin, (req, res) => {
    res.render("registerKey", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role, appAdmin: req.session.user.appAdmin });
})
router.get("/registerKey/assets", isAdmin, async (req, res) => {
    logger.request(req, "Get register keys assets", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        operation: 'get_register_keys'
    });
    try {
        let userRole = req.session.user.companies;
        let userAppAdmin = req.session.user.appAdmin;
        let allKeys = await registerKeyModel.find({});
        let returnedKey;

        if (userAppAdmin) {
            if (allKeys.length) {
                returnedKey = allKeys;
            }
        } else {
            returnedKey = [];
            allKeys.forEach(key => {
                if (req.session.user.company === key.Company) {
                    returnedKey.push(key);
                }
            });
        }
        logger.info("Register keys retrieved successfully", {
            userId: req.session.user?._id,
            keyCount: returnedKey?.length || 0,
            isAppAdmin: req.session.user?.appAdmin,
            operation: 'get_register_keys_success'
        });

        res.json({ returnedKey });
    } catch (error) {
        logger.error("Error retrieving register keys", error, {
            userId: req.session.user?._id,
            operation: 'get_register_keys_error'
        });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put("/registerKey", isAdmin, notReadOnly, async (req, res) => {
    try {
        let companyId = req.body.companyId;
        if (!isRelatedToCompany(req, companyId)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        generateNewRegisterKey(req, res);
    } catch (error) {
        logger.error("Error handling register key", error, {
            userId: req.session.user?._id,
            companyId: companyId,
            operation: 'update_register_key_error'
        });
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});


router.post("/captchaSettings", isAdmin, async (req, res) => {
    try {
        logger.debug("Captcha settings request body", {
            userId: req.session.user?._id,
            companyId: req.body.company,
            operation: 'update_captcha_settings'
        });
        const {
            buttonColorValue,
            buttonColorHoverValue,
            selectedCubeColorValue,
            canvasOnHoverColorValue,
            defaultTitle,
            isResetColorKit,
            company,
            initColorKit,
            memorizeCaptcha
        } = req.body;

        let companyId = company;
        if (!isRelatedToCompany(req, companyId)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        logger.debug("Captcha settings init color kit", {
            userId: req.session.user?._id,
            initColorKit: initColorKit,
            operation: 'update_captcha_settings'
        });
        let message;

        if (initColorKit === true) {
            if (!req.session.user.appAdmin === true) {
                return res.status(403).json({ success: false, message: "You don't have enough rights to perform this action" });
            }
        }
        if (isResetColorKit && company) {
            let initColorKit = await ColorKit.findOne({ initColorKit: true });
            await ColorKit.updateOne({ company: company }, {
                buttonColorValue: initColorKit.buttonColorValue,
                buttonColorHoverValue: initColorKit.buttonColorHoverValue,
                selectedCubeColorValue: initColorKit.selectedCubeColorValue,
                canvasOnHoverColorValue: initColorKit.canvasOnHoverColorValue,
                defaultTitle: initColorKit.defaultTitle,
                company: initColorKit.company,
                initColorKit: false,
                memorizeCaptcha: false
            })
            message = "ColorKit has been reseted successfully."
        }
        else {

            let doesColorKitAlreadyExist = await ColorKit.findOne({});

            if (!doesColorKitAlreadyExist) {
                let newColorKit = new ColorKit({
                    buttonColorValue,
                    buttonColorHoverValue,
                    selectedCubeColorValue,
                    canvasOnHoverColorValue,
                    defaultTitle,
                    company,
                    initColorKit,
                    memorizeCaptcha
                });
                await newColorKit.save();
                message = "ColorKit has been created successfully."
            } else {
                if (initColorKit) {
                    logger.debug("Updating initial color kit", {
                        userId: req.session.user?._id,
                        initColorKit: initColorKit,
                        operation: 'update_init_color_kit'
                    });
                    await ColorKit.updateOne({ initColorKit: true }, {
                        buttonColorValue,
                        buttonColorHoverValue,
                        selectedCubeColorValue,
                        canvasOnHoverColorValue,
                        defaultTitle,
                        initColorKit,
                        memorizeCaptcha
                    });
                }
                else {
                    if (company) {
                        await ColorKit.updateOne({ company: company }, {
                            buttonColorValue,
                            buttonColorHoverValue,
                            selectedCubeColorValue,
                            canvasOnHoverColorValue,
                            defaultTitle,
                            company,
                            memorizeCaptcha
                        });
                    }
                }
                logger.info("Color kit updated successfully", {
                    userId: req.session.user?._id,
                    company: company,
                    initColorKit: initColorKit,
                    operation: 'update_color_kit_success'
                });
                message = "ColorKit has been updated successfully."
            }
        }

        res.status(200).json({ message });

    } catch (err) {
        logger.error("Error processing captcha settings request", err, {
            userId: req.session.user?._id,
            companyId: req.body.company,
            operation: 'update_captcha_settings_error'
        });
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

router.get("/colorKit", notReadOnly, async (req, res) => {
    try {
        const company = req.session.user.company;
        const appAdmin = req.session.user.appAdmin;
        let returnedColorKit;

        if (appAdmin) {
            returnedColorKit = await ColorKit.findOne({ initColorKit: true });
        }
        else {
            returnedColorKit = await ColorKit.findOne({ company: company });
        }
        if (!returnedColorKit) {
            return res.status(404).json({ message: "ColorKit not found" });
        }
        res.status(200).json({ returnedColorKit });
    } catch (err) {
        logger.error("Error retrieving color kit", err, {
            userId: req.session.user?._id,
            company: company,
            isAppAdmin: appAdmin,
            operation: 'get_color_kit_error'
        });
        res.status(500).json({ error: "An internal server error occurred." });
    }
})

router.get("/createItem", notReadOnly, (req, res) => {
    res.render("createItem", { username: req.session.user.username, email: req.session.user.email, ppURL: req.session.user.ppURL, role: req.session.user.role });
})

router.post("/logout", (req, res) => {
    logger.info("User logging out", {
        userId: req.session.user?._id,
        username: req.session.user?.username,
        userRole: req.session.user?.role,
        operation: 'user_logout'
    });
    
    req.session.destroy((err) => {
        if (err) {
            logger.error("Error destroying session during logout", err, {
                operation: 'user_logout_error'
            });
            throw err;
        }
        logger.info("User logged out successfully", {
            operation: 'user_logout_success'
        });
        res.redirect("/login")
    })
})

router.post('/newValidation', notReadOnly, async (req, res) => {
    const startTime = Date.now();
    logger.request(req, "Create new validation", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        componentName: req.body.sessionComponentName,
        operation: 'create_new_validation'
    });
    
    let globalPool = await initializePool();
    const ID = crypto.randomUUID();
    const validateTrueCubes = req.body.validateTrueCubes;
    const validateMinCubes = req.body.validateMinCubes;
    const validateMaxCubes = req.body.validateMaxCubes;
    const componentName = req.body.sessionComponentName;
    const backgroundImage = req.body.backgroundImage;
    const todoTitle = req.body.todoTitle;
    const backgroundSize = req.body.backgroundSize;
    const selectedCompanies = req.body.selectedCompanies
    
    let companyId = selectedCompanies[0];
    if (!isRelatedToCompany(req, companyId)) {
        logger.warn("Unauthorized attempt to create validation", {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            companyId: companyId,
            operation: 'create_validation_unauthorized'
        });
        return res.status(401).json({ message: "Unauthorized" });
    }

    let isValid = false;

    if (validateTrueCubes && validateMinCubes && validateMaxCubes && componentName) {
        isValid = true;

        const MaxTolerance = (validateMaxCubes.length * 1) / validateTrueCubes.length;
        const MinTolerance = (validateMinCubes.length * 1) / validateTrueCubes.length;

        const captchaData = {
            ID: ID,
            Name: componentName,
            URL: backgroundImage,
            MaxTolerance: MaxTolerance,
            MinTolerance: MinTolerance,
            ValidateF: validateTrueCubes,
            validateMinCubes: validateMinCubes,
            validateMaxCubes: validateMaxCubes,
            todoTitle: todoTitle,
            backgroundSize: backgroundSize,
            companies: selectedCompanies

        };

        logger.debug("Captcha data prepared", {
            userId: req.session.user?._id,
            captchaId: ID,
            captchaName: componentName,
            operation: 'create_new_validation_data'
        });

        try {
            const newCaptcha = new CaptchaModel(captchaData);
            await newCaptcha.save();
            logger.info('New validation data added to MongoDB', {
                userId: req.session.user?._id,
                itemId: ID,
                itemName: componentName,
                companyId: companyId,
                operation: 'create_validation_success'
            });
        } catch (err) {
            logger.error('Error saving validation to MongoDB', err, {
                userId: req.session.user?._id,
                itemName: componentName,
                operation: 'create_validation_db_error'
            });
            isValid = false;
        }
        
        await initializePool();
        const duration = Date.now() - startTime;
        logger.info('Validation creation process completed', {
            userId: req.session.user?._id,
            success: isValid,
            duration: `${duration}ms`,
            operation: 'create_validation_complete'
        });
        res.json({ isValid });
    } else {
        logger.error("Error retrieving validation data from client", null, {
            userId: req.session.user?._id,
            operation: 'create_validation_invalid_data',
            hasTrueCubes: !!validateTrueCubes,
            hasMinCubes: !!validateMinCubes,
            hasMaxCubes: !!validateMaxCubes,
            hasName: !!componentName
        });
        res.json({ isValid });
    }
});

router.post('/newValidation/nameExists', notReadOnly, async (req, res) => {
    let globalPool = await initializePool()
    let nameExists = false;
    globalPool.forEach(item => {
        if (item.Name === req.body.sessionComponentName) {
            nameExists = true;
            return;
        }
    });
    res.json({ nameExists });
});
router.get('/allowedOrigins', async (req, res) => {
    try {
        const userRole = req.session.user.role;
        const appAdmin = req.session.user.appAdmin;
        const userCompany = req.session.user.company;
        let returnedOrigins;
        let message;

        if (appAdmin) {
            returnedOrigins = await AllowedOriginModel.find({ initOrigin: false });
            message = "All allowed origins are returned, as you are an App Administrator";
        } else {
            returnedOrigins = await AllowedOriginModel.find({ companies: { $in: userCompany }, initOrigin: false });
            message = "Only the allowed origins related to your company are returned, as you are not an App Administrator";
        }
        logger.info("Retrieved allowed origins", {
            userId: req.session.user?._id,
            userRole: userRole,
            isAppAdmin: appAdmin,
            originCount: returnedOrigins?.length || 0,
            operation: 'get_allowed_origins_success'
        });

        res.json({ allowedOrigins: returnedOrigins, userRole, message, appAdmin: req.session.user.appAdmin });
    } catch (err) {
        logger.error("Error retrieving allowed origins", err, {
            userId: req.session.user?._id,
            userRole: req.session.user?.role,
            operation: 'get_allowed_origins_error'
        });
        return res.status(500).json({ error: "An error occurred while attempting to retrieve the allowed origins" });
    }
})
router.post('/allowedOrigins', isAdmin, async (req, res) => {
    logger.request(req, "Create allowed origin", {
        userId: req.session.user?._id,
        userRole: req.session.user?.role,
        originName: req.body.originName,
        operation: 'create_allowed_origin'
    });
    
    try {
        let message;
        let originName = req.body.originName;
        let selectedCompanies = req.body.selectedCompanies;
        let regexResult = await proofRegexOrigins(originName);
        if(!regexResult.test){
            logger.warn("Invalid origin format", {
                userId: req.session.user?._id,
                originName: originName,
                operation: 'create_allowed_origin_invalid_format'
            });
            return res.status(401).json({ message: "Regex error: please define your origin like this schema: https://yourdomain.com" });
        }
        let doesOriginExist = await AllowedOriginModel.findOne({ allowedOrigin: originName, companies: { $in: selectedCompanies } });
        
        let companyId = selectedCompanies[0];
        if (!isRelatedToCompany(req, companyId)) {
            logger.warn("Unauthorized attempt to create allowed origin", {
                userId: req.session.user?._id,
                userRole: req.session.user?.role,
                companyId: companyId,
                operation: 'create_allowed_origin_unauthorized'
            });
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (originName && !doesOriginExist && selectedCompanies.length > 0) {
            let origin = new AllowedOriginModel({
                allowedOrigin: originName,
                companies: selectedCompanies,
                initOrigin: false
            });

            await origin.save();
            initializeAllowedOrigins();
            logger.info("Allowed origin successfully created", {
                userId: req.session.user?._id,
                originName: originName,
                companyId: companyId,
                operation: 'create_allowed_origin_success'
            });
            message = "Allowed origin successfully created";
        } else {
            logger.warn("Allowed origin already exists or is undefined", {
                userId: req.session.user?._id,
                originName: originName,
                originExists: !!doesOriginExist,
                operation: 'create_allowed_origin_duplicate'
            });
            message = `${originName} is undefined or already exists`;
        }
        
        res.json({ message });
    } catch (err) {
        logger.error("Error while trying to create AllowedOrigins", err, {
            userId: req.session.user?._id,
            originName: req.body.originName,
            operation: 'create_allowed_origin_error'
        });
        return res.status(500).json({ error: "An error occurred while trying to create AllowedOrigins" });
    }
});

router.put("/allowedOrigins", isAdmin, async (req, res) => {
    if (req.body.isDelete) {
        let origin = req.body.allowedOrigin;
        let isOriginDeleted = false;
        try {
            let originExists = await AllowedOriginModel.findOne({ allowedOrigin: origin });
            let companyId = originExists.companies[0];
            if (!isRelatedToCompany(req, companyId)) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            if (originExists && !originExists.initOrigin) {
                let originDeleted = await AllowedOriginModel.deleteOne({ allowedOrigin: origin });
                isOriginDeleted = true;
                initializeAllowedOrigins();
                if (originDeleted.deletedCount === 0) {
                    throw new Error("Error deleting allowed Origin");
                }
            } else {
                return res.status(404).json({ error: "The given Origin does not exist" });
            }
        } catch (err) {
            logger.error("Error deleting allowed origin", err, {
                userId: req.session.user?._id,
                origin: origin,
                operation: 'delete_allowed_origin_error'
            });
            return res.status(500).json({ error: "An error occurred while deleting the allowed origin" });
        }
        res.json({ isOriginDeleted });
    } else {
        return res.status(400).json({ error: "Invalid request: 'isDelete' is not true" });
    }
});

module.exports = router