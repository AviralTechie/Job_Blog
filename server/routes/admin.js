const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

const adminLayout = '../views/layouts/admin';

/* Get Home Admin  */
router.get('/admin', async (req,res) => {

    try{
        const locals = {
            title : "Admin",
            description : "Simple Blog website"
        }
        res.render('admin/index', {locals,layout:adminLayout});
    }catch (error){
        console.log(error);
    }
});

/* Post Admin-Check Login  */
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(username === 'admin' && password === 'password'){
            // Redirect to /admin if login credentials are correct
            res.send('You are logged in.')
        } else {
            // Send error message if login credentials are incorrect
            res.send("Wrong username and Password");
        } 
    } catch (error) { 
        console.log(error);
    }
});


module.exports = router;