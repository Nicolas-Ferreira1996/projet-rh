const authGuard = require('../middleware/authGuard');
const employeeModel = require('../models/employeeModel');
const companyModel = require('../models/companyModel');
const bcrypt = require('bcrypt');
const companyRouter = require('express').Router();

companyRouter.get('/signin', (req, res) => {
    res.render("pages/signin.twig");
});

companyRouter.post('/signin', async (req, res) => {
    try {
        // Validation des champs
        if (!req.body.email || !req.body.password) {
            throw new Error("Les champs email et mot de passe sont requis");
        }
        // Vérification de l'existence de l'email
        const existingCompany = await companyModel.findOne({ email: req.body.email });
        if (existingCompany) {
            throw new Error("Cet email est déjà utilisé");
        }
        
        // Hashage du mot de passe
        

        let newCompany = new companyModel(req.body);
        await newCompany.validate();
        await newCompany.save();
        res.redirect('/login');
    } catch (error) {
        res.render("pages/signin.twig", { error: error.message });
    }
});

companyRouter.get('/login', (req, res) => {
    res.render('pages/login.twig');
});

companyRouter.post('/login', async (req, res) => {
    try {
        const company = await companyModel.findOne({ email: req.body.email });
        console.log(company);
        if (company) {
            console.log(req.body);
            if (bcrypt.compareSync(req.body.password, company.password)) {
                req.session.company = company;
                res.redirect("/dashboard");
            } else {
                throw new Error("Le mot de passe ne correspond pas");
            }
        } else {
            throw new Error("Utilisateur non enregistré");
        }
    } catch (error) {
        res.render('pages/login.twig', {
            error: error.message
        });
    }
});

companyRouter.get('/dashboard', authGuard, async (req, res) => {
    try {
        const companyFinded = await companyModel.findById(req.session.company._id).populate({ path: "employeeCollection" });
        if (!companyFinded) {
            throw new Error("La compagnie n'existe pas");
        }
        res.render('pages/dashboard.twig', {
            company: req.session.company,
            employees: companyFinded.employeeCollection
        });
    } catch (error) {
        res.render('pages/login.twig', {
            error: "Erreur lors de la récupération du tableau de bord : " + error.message
        });
    }
});

companyRouter.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.render('pages/dashboard.twig', { error: "Erreur lors de la déconnexion" });
        }
        res.redirect('/login');
    });
});

module.exports = companyRouter;
