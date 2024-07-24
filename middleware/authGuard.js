const companyModel = require('../models/companyModel')

const authGuard = async (req, res, next) => {
    try {
        if (req.session.company) {
            const companyFinded = await companyModel.findOne({ _id: req.session.company._id })
            if (companyFinded) {
                next()
            } else {
                res.redirect('/login')
            }
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        res.send(error.message)
    }
}

module.exports = authGuard


