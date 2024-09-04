const ColorKitModel = require("../models/ColorKit.js");

async function createInitColorKit() {
    console.log("Trying to create the initial ColorKit...");
    try {
        const initColorKit = await ColorKitModel.findOne({ initColorKit: true });
        if (!initColorKit) {
            console.log("No ColorKit found, creating a new one...");
            const newInitColorKit = new ColorKitModel({
                buttonColorValue: "#007BFF",
                buttonColorHoverValue: "#0056b3",
                selectedCubeColorValue: "#ffff00", // yellow
                canvasOnHoverColorValue: "#ff0000", // red
                defaultTitle: "Please draw the object currently being displayed.",
                initColorKit: true
            });

            await newInitColorKit.save();
            console.log("Initial ColorKit created and saved successfully.");
        } else {
            console.log("Initial ColorKit already exists, no changes made.");
        }
    } catch (error) {
        console.error("An error occurred while creating the initial ColorKit:", error);
    }
}

module.exports = createInitColorKit;
