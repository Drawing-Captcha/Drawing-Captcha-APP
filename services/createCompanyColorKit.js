const ColorKitModel = require("../models/ColorKit.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function createCompanyColorKit(companyId) {
    logger.info(`Attempting to create a new color kit for company ${companyId}`, {
        companyId: companyId,
        operation: 'create_company_color_kit_attempt'
    });
    try {
        const companyColorKitExists = await ColorKitModel.findOne({ company: companyId });
        const initColorKit = await ColorKitModel.findOne({ initColorKit: true });
        let colorKit;

        if (companyColorKitExists) {
            logger.warn(`Company color kit already exists for company ${companyId}`, {
                companyId: companyId,
                operation: 'create_company_color_kit_exists'
            });
            return { success: false, message: "A company color kit for this company already exists." };
        }

        if (!initColorKit) {
            colorKit = new ColorKitModel({
                buttonColorValue: "#007BFF",
                company: companyId,
                buttonColorHoverValue: "#0056b3",
                selectedCubeColorValue: "#ffff00",
                canvasOnHoverColorValue: "#ff0000",
                defaultTitle: "Please draw the object currently being displayed.",
                initColorKit: false
            });
        } else {
            colorKit = new ColorKitModel({
                buttonColorValue: initColorKit.buttonColorHoverValue,
                company: companyId,
                buttonColorHoverValue: initColorKit.buttonColorHoverValue,
                selectedCubeColorValue: initColorKit.selectedCubeColorValue,
                canvasOnHoverColorValue: initColorKit.canvasOnHoverColorValue,
                defaultTitle: initColorKit.defaultTitle,
                initColorKit: false
            });
        }

        logger.debug(`Created new color kit: ${JSON.stringify(colorKit)}`, {
            companyId: companyId,
            operation: 'create_company_color_kit_created'
        });

        const savedColorKit = await colorKit.save();

        logger.info(`Saved new color kit to database: ${JSON.stringify(savedColorKit)}`, {
            companyId: companyId,
            operation: 'create_company_color_kit_saved'
        });

        return { success: true, message: "Company color kit successfully created.", colorKit: savedColorKit };

    } catch (error) {
        logger.error(`Error creating company color kit for company ${companyId}: ${error.message}`, {
            companyId: companyId,
            error: error,
            operation: 'create_company_color_kit_error'
        });
    }
}

module.exports = createCompanyColorKit;

