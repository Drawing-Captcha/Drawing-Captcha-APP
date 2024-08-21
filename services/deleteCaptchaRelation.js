const CaptchaModel = require("../models/Captcha.js")

async function deleteCaptchaRelation(companyId) {
    console.log(`Deleting Captcha relations with company ID: ${companyId}`)
    try {
        const captchas = await CaptchaModel.find({ companies: companyId })

        console.log(`Found ${captchas.length} Captchas with company ID: ${companyId}`)
        captchas.forEach(captcha => {
            if (captcha.companies.includes(companyId)) {
                console.log(`Removing company ID: ${companyId} from Captcha ID: ${captcha.ID}`)
                captcha.companies.splice(captcha.companies.indexOf(companyId), 1)
                captcha.save()
            }
        })

    } catch (error) {
        console.error(`An error occurred while deleting Captcha relations with company ID: ${companyId}`, error)
    }

}

module.exports = deleteCaptchaRelation;