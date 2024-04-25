const express = require('express');
const router = express.Router();
const Post = require('../models/Post');


/* router.get('', async (req,res) => {

    const locals = {
        title : "NodeJs Blog",
        description : "Simple Blog website"
    }

    try{
        const data = await Post.find();
        res.render('index', {locals,data});
    }catch (error){
        console.log(error);
    }
}); */

router.get('', async (req,res) => {
    try {
        const locals = {
            title: "NodeJs Blog",
            description: "Simple Blog website"
        };

        let perPage = 4;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort:{createdAt:-1}}])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments(); // Corrected to countDocuments

        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count/perPage);

        // Generate current date
        const currentDate = new Date();

        res.render('index', {
            locals,
            data,
            currentDate,
            current: page,
            nextPage: hasNextPage ? nextPage : null  , 
            currentRoute : '/'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});


/* Models Post: */

/* function insertPostData(){
    Post.insertMany([
        {
            title:"Building a Blog",
            body: "This is the Body Text"
        }
    ])
}
insertPostData(); */

/* Get Home Post:id */

router.get('/post/:id', async (req,res) => {
    
    try{
        let slug = req.params.id;
        const data = await Post.findById({_id:slug});

        const locals = {
            title : data.title,
            description : "Simple Blog website", 
            currentRoute : `/post/${slug}`
        }


        res.render('post', {locals,data});
    }catch (error){
        console.log(error);
    }
});

/* GET POST: Search  */
router.post('/search', async (req,res) => {

   
    try{
        const locals = {
            title : "Search",
            description : "Simple Blog website"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const data = await Post.find({
            $or:[
                {title: {$regex: new RegExp(searchNoSpecialChar,'i')}},
                {body: {$regex: new RegExp(searchNoSpecialChar,'i')}}
            ]
        });
        //const data = await Post.find();

        res.render("search",{
            data,
            locals
        });
        



    }catch (error){
        console.log(error);
    }
});


router.get('/about', (req,res) => {
    res.render('about',{
        currentRoute:'/about'
    });

});

router.get('/contact', (req,res) => {
    res.render('contact',{
        currentRoute:'/contact'
    });

});

module.exports = router;