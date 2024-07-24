const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
require('dotenv').config()

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, "Le nom de l'entreprise est requis"],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9\s\.\-&'@!]{2,100}$/.test(value);
            },
            message: "le nom de l'entreprise doit contenir des caractères valides"
        }
    },
    siretNumber: {
        type: String,
        required: [true, "le numéro de siret est requis"],
        validate: {
            validator: function (value) {
                return /^\d{14}$/.test(value);
            },
            message: "le numéro de siret doit contenir des caractères valides"
        }
    },

    email: {
        type: String,
        required: [true, "le mail est requis"],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value);
            },
            message: "le mail doit contenir des caractères valides"
        }
    },
    directorName: {
        type: String,
        required: [true, "le nom du directeur est requis"],
        validate: {
            validator: function (value) {
                return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value);
            },
            message: "le nom du directeur doit contenir des caractères valides"
        }
    },
    password: {
        type: String,
        required: [true, "le password est requis"],
        validate: {
            validator: function (value) {
                return /^(?=.*\d).{8,}$/.test(value);
            },
            message: "le mot de passe doit contenir au moins 8 caractères avec au moins 1 chiffre"
        }
    },
    employeeCollection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee'
    }]
})

companySchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, parseInt(process.env.SALT))
    }
    next()
})

companySchema.pre("validate", async function (next) {
    try {
        const existingCompany = await this.constructor.findOne({ email: this.email });
        if (existingCompany) {
            this.invalidate("email", "Cet email est déjà enregistré.");
        }
        next();
    } catch (error) {
        next(error);
    }
});







const companyModel = mongoose.model('company', companySchema)

module.exports = companyModel