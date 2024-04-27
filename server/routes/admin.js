const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const adminLayout = '../views/layouts/admin';
const logout = '../views/layouts/logout';
const jwtSecret = process.env.JWT_SECRET;


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

/* Check For login (MiddleWare) */

const authMiddleWare = (req,res,next) =>{
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:'Unauthorized'});
    }
    try{
        const decoded = jwt.verify(token,jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
        res.status(401).json({message:'Unauthorized'});
    }
}



/* Post Admin-Check Login  */
/* router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(req.body.username === 'admin' && req.body.password === 'password'){
            // Redirect to /admin if login credentials are correct
            res.send('You are logged in.')
        } else {
            // Send error message if login credentials are incorrect
            res.send('Wrong username and Password');
        } 
    } catch (error) { 
        console.log(error);
    }
}); */

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message:'Invalid credential'});
        }
        const isPasswordVAlid = await bcrypt.compare(password,user.password);
        if(!isPasswordVAlid){
            return res.status(401).json({message:'Invalid password'});
        }
        const token = jwt.sign({userId: user._id},jwtSecret);
        res.cookie('token',token,{httpOnly:true});

        res.redirect('/dashboard'); 

    } catch (error) { 
        console.log(error);
    }
});

/* Post Admin-Check register */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        try{
            const user = await User.create({username, password : hashedPassword});
            res.status(201).json({message : 'User Created',user});
        }catch (error) { 
        if(error.code === 11000){
            res.status(409).json({message : 'User Already registered'});
        }
        res.status(500).json({message:'Internal server error'})
    }
        }catch(error){
        console.log(error);
    }
});


/* Dashboard Page */

/* Dashboard Page */
router.get('/dashboard', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title : "Dashboard",
            description : "Simple Blog website"
        }

        const data = await Post.find();
        res.render('admin/dashboard' , {
            locals,
            data,
            layout:logout
        });
    }catch(error){
        console.log(error);
    }
});


/* Get Admin - Create new Post */
router.get('/add-post', authMiddleWare, async (req, res) => {
    try {
        const locals = {
            title : "Add-New Post",
            description : "Simple Blog website"
        }

        const data = await Post.find();
        res.render('admin/add-post' , {
            locals,
            layout:logout
        });
    }catch(error){
        console.log(error);
    }
});

/* Post Admin - Publish or Post */

router.post('/add-post', authMiddleWare, async (req, res) => {
    try {
        console.log(req.body); 

        try {
            const newPost = new Post({
                title: req.body.title,
                body:req.body.body
            })
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
        res.redirect('/dashboard');
    }catch(error){
        console.log(error);
    }
});


/* GET Admin - View/Edit */
router.get('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {

        const locals = {
            title : "Edit Post",
            description : "Simple Blog website"
        };
      
      const data = await Post.findOne({_id:req.params.id});

      res.render('admin/edit-post',{
        locals,
        data,
        layout: logout
      })
    }catch(error){
        console.log(error);
    }
});


/* PUT Admin - Publish View/Post */
router.put('/edit-post/:id', authMiddleWare, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body:req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
    }catch(error){
        console.log(error);
    }
});


/* DELETE POST */
router.delete('/delete-post/:id', authMiddleWare, async (req, res) => {
    try {
        await Post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


/* Admin Logout */

router.get('/logout',(req,res) => {
    res.clearCookie('token');
    /* res.json({message:"Logout Successfull"}); */ 
    res.redirect('/'); 

});

router.get('/admin', (req,res) => {
    res.render('admin',{
        currentRoute:'/admin'
    });

});


module.exports = router; 