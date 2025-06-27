const ColorKitModel = require("../models/ColorKit.js");
const createModuleLogger = require('../utils/loggerHelper');
const logger = createModuleLogger(__filename);

async function createInitColorKit() {
    try {
        const initColorKit = await ColorKitModel.findOne({ initColorKit: true });
        if (!initColorKit) {
            const started = Date.now();
            logger.info("Creating initial ColorKit...", {
                operation: 'create_init_color_kit'
            });
            const newInitColorKit = new ColorKitModel({
                buttonColorValue: "#007BFF",
                buttonColorHoverValue: "#0056b3",
                selectedCubeColorValue: "#ffff00", // yellow
                canvasOnHoverColorValue: "#ff0000", // red
                defaultTitle: "Please draw the object currently being displayed.",
                initColorKit: true
            });

            await newInitColorKit.save();
            const ended = Date.now();
                logger.debug(`Initial ColorKit created and saved successfully in ${ended - started} ms` , {
                operation: 'create_init_color_kit'
            })
        } else {
            logger.info("Initial ColorKit already exists.");
        }
    } catch (error) {
        console.error("An error occurred while creating the initial ColorKit:", error);
    }
}

module.exports = createInitColorKit;
