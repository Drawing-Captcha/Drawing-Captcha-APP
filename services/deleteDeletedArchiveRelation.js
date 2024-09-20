const DeletedCaptchaModel = require("../models/DeletedCaptchaModel.js")

async function deleteDeletedCaptchaModel(companyId) {
    console.log(`Deleting (DeletedArchive) Captcha relations with company ID: ${companyId}`)
    try {
        const captchas = await DeletedCaptchaModel.find({ companies: companyId })

        console.log(`Found ${captchas.length} (DeletedArchive) Captchas with company ID: ${companyId}`)
        captchas.forEach(captcha => {
            if (captcha.companies.includes(companyId)) {
                console.log(`Removing company ID: ${companyId} from (DeletedArchive) Captcha ID: ${captcha.ID}`)
                captcha.companies.splice(captcha.companies.indexOf(companyId), 1)
                captcha.save()
            }
        })

    } catch (error) {
        console.error(`An error occurred while deleting (DeletedArchive) Captcha relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteDeletedCaptchaModel;