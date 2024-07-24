const employeeRouter = require("express").Router();
const employeeModel = require("../models/employeeModel");
const authGuard = require('../middleware/authGuard');
const upload = require('../middleware/upload');
const companyModel = require("../models/companyModel");

employeeRouter.get('/addEmployee', authGuard, (req, res) => {
    res.render("pages/addEmployee.twig", {
        company: req.session.company
    });
});

employeeRouter.post('/addEmployee', authGuard, upload.single('img'), async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = req.file.filename
        }
        const newEmployee = new employeeModel(req.body);
        newEmployee.validateSync();
        await newEmployee.save();
        await companyModel.updateOne({ _id: req.session.company._id }, { $push: { employeeCollection: newEmployee._id } });
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error)
        res.render("pages/addEmployee.twig", {
            company: req.session.company,
            error: error.message
        });
    }
});

employeeRouter.get('/employeedelete/:employeeid', authGuard, async (req, res) => {
    try {
        await employeeModel.deleteOne({ _id: req.params.employeeid });
        await companyModel.updateOne({_id: req.session.company._id},{$pull: { employeeCollection: req.params.employeeid }})
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error.message);
        res.render('pages/dashboard.twig', {
            errorMessage: "Un problème est survenu pendant la suppression",
            company: await companyModel.findById(req.session.company).populate("employeeCollection"),
            title: "dashboard"
        });
    }
});

employeeRouter.get('/employeeupdate/:employeeid', authGuard, async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.employeeid);
        res.render('pages/addEmployee.twig', {
            title: "Modifier un employé",
            company: await companyModel.findById(req.session.company),
            employee: employee
        });
    } catch (error) {
        res.render('pages/dashboard.twig', {
            errorMessage: "L'employé que vous souhaitez modifier n'existe pas",
            company: await companyModel.findById(req.session.company),
            title: "dashboard"
        });
    }
});

employeeRouter.post('/employeeupdate/:employeeid', authGuard, upload.single('img'), async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = req.file.filename
        }
        await employeeModel.updateOne({ _id: req.params.employeeid }, req.body);
        res.redirect("/dashboard");
    } catch (error) {
        res.render('pages/dashboard.twig', {
            errorMessage: "Un problème est survenu pendant la mise à jour",
            company: await companyModel.findById(req.session.company).populate("employeeCollection"),
            title: "dashboard"
        });
    }
});

employeeRouter.post('/increaseBlame/:employeeId', authGuard, async (req, res) => {
    const employeeId = req.params.employeeId;
    try {
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }
        // Vérifiez si l'employé appartient à la même entreprise que celui connecté
        const company = await companyModel.findById(req.session.company._id);
        if (!company.employeeCollection.includes(employeeId)) {
            return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cet employé' });
        }

        // Incrémenter le nombre de blame
        employee.blame += 1;
        
        if (employee.blame == 3) {
            res.redirect("/employeedelete/" + employee.id)
        }else {
            await employee.save();
            res.redirect("/dashboard");
        }

    } catch (error) {
        console.error('Erreur lors de l\'incrémentation du blame :', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'incrémentation du blame' });
    }
});

employeeRouter.get('/searchEmployees', authGuard, async (req, res) => {
    try {
        // Récupère la chaîne de recherche depuis la requête, ou une chaîne vide si elle n'est pas définie.
        const searchQuery = req.query.query || '';

        // Crée une expression régulière pour faire une recherche insensible à la casse avec le query.
        const regex = new RegExp(searchQuery, 'i');

        // Trouve l'entreprise par l'ID de session et peuple la collection des employés qui correspondent à la recherche.
        const company = await companyModel.findById(req.session.company._id).populate({
            path: 'employeeCollection', // Chemin vers la collection des employés de l'entreprise.
            match: {
                // Condition de correspondance, cherche par nom ou fonction avec l'expression régulière.
                $or: [
                    { name: regex },
                    { position: regex }
                ]
            }
        });

        // Rend la page du tableau de bord avec la liste des employés filtrés.
        res.render('pages/dashboard.twig', {
            employees: company.employeeCollection, // Liste des employés filtrés.
            company: req.session.company // Informations de la société pour l'affichage.
        });
    } catch (error) {
        // Log l'erreur dans la console en cas de problème avec la recherche.
        console.error('Erreur lors de la recherche d\'employés :', error);

        // Répond avec un statut 500 et un message d'erreur JSON en cas de problème serveur.
        res.status(500).json({ error: 'Erreur serveur lors de la recherche d\'employés' });
    }
});



module.exports = employeeRouter;


