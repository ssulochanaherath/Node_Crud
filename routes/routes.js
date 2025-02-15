const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

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

router.get('/', (req, res) => {
    User.find().exec((err, users) => {
        if (err) {
            res.json({message: err.message });
        } else {
            res.render('index', { 
                title: 'Users List',
                 users: users 
            });
        }
    })
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
});

module.exports = router; 