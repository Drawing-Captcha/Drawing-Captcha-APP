const ColorKitModel = require("../models/ColorKit.js")

async function createCompanyColorKit(companyId) {
    console.log(`createCompanyColorKit: trying to create a new color kit for company ${companyId}`);
    try {
        const companyColorKitExists = await ColorKitModel.findOne({ company: companyId });
        const initColorKit = await ColorKitModel.findOne({initColorKit: true})
        let colorKit;
        if (companyColorKitExists) {
            console.log(`createCompanyColorKit: company color kit already exists for company ${companyId}`);
            return { success: false, message: "A company color kit for this company already exists." };
        }
        if(!initColorKit){
            colorKit = new ColorKitModel({
                buttonColorValue: "#007BFF",
                company: companyId,
                buttonColorHoverValue: "#0056b3",
                selectedCubeColorValue: "#ffff00", // yellow
                canvasOnHoverColorValue: "#ff0000", // red
                defaultTitle: "Please draw the object currently being displayed.",
                initColorKit: false
    
            });
    
        }
        else{
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
        console.log(`createCompanyColorKit: created new color kit: ${JSON.stringify(colorKit)}`);
        const savedColorKit = await colorKit.save();
        console.log(`createCompanyColorKit: saved new color kit to database: ${JSON.stringify(savedColorKit)}`);

        return { success: true, message: "Company color kit successfully created.", colorKit: savedColorKit };

    } catch (error) {
        console.error(`createCompanyColorKit: caught error: ${error.message}`);
        console.error(error);
    }
}

module.exports = createCompanyColorKit;
