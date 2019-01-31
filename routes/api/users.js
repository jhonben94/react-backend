const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/keys');
const gravatar = require('gravatar');
const passport = require('passport');
const validateRegisterInput= require('../../validation/register');
const validateLoginInput= require('../../validation/login');


//  @route  GET api/users/test
//  @des    Test get route
//  @access public
router.get('/test', (req,res) => {
    res.json({ ok:true , msg:'Users works'});
 });

 
//  @route  POST api/users/register
//  @des    Register User
//  @access public
 router.post('/register', (req, res) => {

    const {errors,isValid} = validateRegisterInput(req.body);
    //check validation
    if(!isValid){
        res.status(400).json(errors);
    }
    User.findOne( {email: req.body.email})
        .then( (user)=>{
            if(user){
                errors.msg ='User already exists'
                return res.status(400).json(
                    {errors }
                );
            }else {

                const avatar = gravatar.url(req.body.email, {
                    s:'200', // size
                    r: 'pg', //rating
                    d: 'mm'   //default
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    avatar
                });
                bcryptjs.genSalt( 10, (err,salt) => {
                    bcryptjs.hash(newUser.password,salt, (err, hash) =>{ 
                        if(err) throw err;
                        newUser.password= hash;
                        newUser.save()
                            .then( usr =>{
                                res.status(201).json(usr);
                            })
                            .catch( err => console.log(err) );

                    });
                });
            }
        });

 });
 //  @route  POST    api/users/login
 //  @des    Login User / Return token
 //  @access public 
 router.post('/login', (req, res) => {
        const {errors,isValid} = validateLoginInput(req.body);
        //check validation
        if(!isValid){
            res.status(400).json(errors);
        }
        const email= req.body.email;
        const pass = req.body.password;
        User.findOne({email})
            .then( (user) =>{
                // Check User
                if(!user){
                    return res.status(404).json(
                        {
                            msg:'User not found'
                        });
                }
                //Check pass
                bcryptjs.compare(pass , user.password )
                    .then( (isMatch) => { 
                        if(isMatch){
                            // User Matched
                            const payload ={
                                id: user.id,
                                name: user.name,
                                avatar: user.avatar
                            }
                            //sign token
                            jwt.sign( payload , config.secretOrKey, { expiresIn:3600 }, (err,token)=>{ 
                                    if (err) throw err;
                                
                                    return res.status(200).json(
                                        {   
                                            success:true,
                                            msg:'Bearer '+token
                                        });
                            });
                        }else{
                            res.status(400).json({msg:'Password Incorrect.'});
                        }
                    })
                    .catch(err => console.log(err));

                
            })
            .catch();
 });
 //  @route  POST    api/users/login
 //  @des    Login User / Return token
 //  @access private 
 router.get('/current', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      });
    }
  );

 module.exports = router;