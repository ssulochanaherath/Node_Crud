const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { resolveSoa } = require('dns');

//image upload

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    }
});

var upload = multer({
    storage: storage
}).single('image');

//insert an user into the database
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });

        await user.save();  // ✅ No callback

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/');         
    } catch (err) {
        res.json({message: err.message, type: 'danger'});
    }
});  

//get all users

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', { title: 'Users List', users });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
});

//edit a user

router.get('/edit/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/');
        }
        res.render('edit_user', { title: 'Edit User', user });
    } catch (err) {
        res.redirect('/');
    }
});

//update user

router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let updatedData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone
        };

        // If a new image is uploaded, update the image and delete the old one
        if (req.file) {
            updatedData.image = req.file.filename;

            if (req.body.OldImage) {
                fs.unlinkSync("uploads/" + req.body.OldImage);
            }
        }

        // ✅ Update user in database without a callback
        await User.findByIdAndUpdate(id, updatedData);

        req.session.message = {
            type: "success",
            message: "User updated successfully"
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});

//delete user

router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;

        // Delete user from the database
        await User.findByIdAndDelete(id);

        req.session.message = {
            type: "success",
            message: "User deleted successfully",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


module.exports = router; 