const express = require('express');
const router = express.Router();
const passaport = require('passport');

const validarPostInput = require('../../validation/post');

//load classess

const PostClass = require('../../classes/Post');
const Comment = require('../../classes/Comment');
// Load models 
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

//  @route  GET api/posts/test
//  @des    Test get route
//  @access public
router.get('/test', (req,res) => {
    res.json({ ok:true , message:'Posts works'});
 });

 
//  @route  POST api/posts/
//  @des    Add a post
//  @access public
router.post('/', passaport.authenticate('jwt',{session: false}), (req,res) => {

    const {errors, isValid} = validarPostInput(req.body);

    if(!isValid){
        res.status(400).json(errors);
    }
    const newPost = new PostClass(
                            req.user.id,
                            req.body.text,
                            req.body.name,
                            req.body.avatar);

    new Post(newPost).save()
     .then( post => res.json(post));
 });


//  @route  GET api/posts
//  @des    get posts 
//  @access public
router.get('/', (req,res) => {
    Post.find()
        .sort({date: -1})
        .then( posts => res.json(posts))
        .catch(err => res.status(404).json({notfound:'No posts found'}));
 });

 //  @route  GET api/posts/:postId
//  @des    Get post by id
//  @access public
router.get('/:postId', (req,res) => {
    Post.findById(req.params.postId)
        .then( post => res.json(post))
        .catch(err => res.status(404).json({notfound:'No post found'}));
 });

//  @route  DELETE api/posts/:id
//  @des    Get post by id
//  @access private
router.delete('/:id',  passaport.authenticate('jwt',{session: false}),(req, res) => {
    Profile.findOne({user: req.user.id})
        .then( profile => {        
                Post.findById(req.params.id)
                    .then(post => {
                    //check post owner
                    if(post.user.toString() !== req.user.id){
                         return res.status(401).json({notauthorized: 'User not authorized.'});
                    }
                    post.remove().then(() => res.json({ success: true}))
                }).catch( err =>
                    res.status(404).json({postnotfound:'Post not found.'})
                );
        })
        .catch(err => res.status(400).json(err));
    
});


//  @route  POST api/posts/like/:id
//  @des    Get post by id
//  @access private
router.post('/like/:id',  passaport.authenticate('jwt',{session: false}),(req, res) => {
    Profile.findOne({user: req.user.id})
        .then( profile => {        
                Post.findById(req.params.id)
                    .then(post => {
                        const likes = post.likes.filter( like => like.user.toString() === req.user.id );

                        if( likes.length > 0 ){
                          res.status(400).json({like:'User already like this post'});                          
                        }else{
                          //  post.likes = post.likes.filter( like => like.id !== req.user.id );
                          //likes.push({ user: req.user.id})
                          post.likes.push({ user: req.user.id});
                        }
                        post.save()
                            .then( newLike => res.json(newLike))
                            .catch( err => res.status(400).json(err))
                    
                }).catch( err =>
                    res.status(404).json({postnotfound:'Post not found.'})
                );
        })
        .catch(err => res.status(400).json(err));
    
});

//  @route  POST api/posts/unlike/:id
//  @des    Get post by id
//  @access private
router.post('/unlike/:id',  passaport.authenticate('jwt',{session: false}),(req, res) => {
                Post.findById(req.params.id)
                    .then(post => {
                        const likes = post.likes.filter( like => like.user.toString() === req.user.id );

                        if( likes.length <= 0 ){
                          res.status(400).json({like:'You have not yet like the post. '});                          
                        }
                        else {
                            post.likes = post.likes.filter( item => item.user.toString() !== req.user.id );
                        }
                        post.save()
                            .then( newLike => res.json(newLike))
                            .catch( err => res.status(400).json(err))
                    
                }).catch( err =>
                    res.status(404).json({postnotfound:'Post not found.'+err})
                );
    
});

//  @route  POST api/posts/comment/:id
//  @des    Get post by id
//  @access private
router.post('/comment/:id',  passaport.authenticate('jwt',{session: false}),(req, res) => {

                 const {errors, isValid} = validarPostInput(req.body);

                if(!isValid){
                    return res.status(400).json(errors);
                }
                Post.findById(req.params.id)
                    .then(post => {
                        const newComment= new Comment(
                            req.body.text,
                            req.user.id,
                            req.user.name,
                            req.user.avatar
                        );
                        post.comments.push(newComment);
                        post.save()
                            .then(post =>  res.json(post))
                            .catch(err => res.status(400).json(err));
                   
                }).catch( err =>
                    res.status(404).json({postnotfound:'Post not found.'})
                );
    
});
//  @route  DELETE api/posts/comment/:id/:commentId
//  @des    Get post by id
//  @access private
router.post('/comment/:id/:commentId',  passaport.authenticate('jwt',{session: false}),(req, res) => {

                Post.findById(req.params.id)
                    .then(post => {
                    post.comments = post.comments.filter( comment => comment.id.toString() !== req.params.commentId );
                }).catch( err =>
                    res.status(404).json({postnotfound:'Post not found.'})
                );    
});



 module.exports = router;

