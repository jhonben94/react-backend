const express = require('express');
const router = express.Router();
const passaport = require('passport');

const Experience = require('../../classes/Experience');
const Education = require('../../classes/Education');
const validarExperienceInput = require('../../validation/experience');
const validarEducationInput = require('../../validation/education');


//Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Models.
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//  @route  GET api/profile/test
//  @des    Test get route
//  @access public
router.get('/test', (req,res) => {
    res.json({ ok:true , message:'Profile works'});
 });


//  @route  GET api/profile/all
//  @des    Get all profiles
//  @access public
router.get('/all', (req, res) => {
    let errors = { };
    const user = req.params.user_id;
    Profile.find()
        .populate('user',['name','avatar'])
        .then( profiles => {
            if (!profiles) {
                errors.noprofile = 'There are no profiles for this user. ';
                return res.status(404).json(errors);
            }
            res.json(profiles);
            
        })
        .catch( err => res.status(404).json({profile: 'There are no profiles. '}) );
    
});

//  @route  GET api/profile/handle/:handle
//  @des    Get profile by handle
//  @access public
router.get('/handle/:handle', (req, res) => {
    let errors = { };
    const handle = req.params.handle;
    Profile.findOne({handle})
        .populate('user',['name','avatar'])
        .then( profile => {
            if (!profile) {
                errors.noprofile = 'There are no profiles. ';
                return res.status(404).json(errors);
            }
            res.json(profile);
            
        })
        .catch( err => res.status(404).json({profile: 'There are no profiles for this handle. '}) );
    
});


//  @route  GET api/profile/user/:userId
//  @des    Get profile by handle
//  @access public
router.get('/user/:user_id', (req, res) => {
    let errors = { };
    const user = req.params.user_id;
    Profile.findOne({user: req.params.user_id})
        .populate('user',['name','avatar'])
        .then( profile => {
        
            if (!profile) {
                errors.noprofile = 'There are no profiles for this user. ';
                return res.status(404).json(errors);
            }
            res.json(profile);
            
        })
        .catch( err => res.status(404).json({profile: 'There are no profiles for this user. '}) );
    
});

//  @route  GET api/profile
//  @des    Get current user profile
//  @access private
router.get('/', passaport.authenticate('jwt',{session: false}), (req,res) => {

    const errors = { };
    // Get profile.
    Profile.findOne( {user: req.user.id})
    .populate('user',['name','avatar'])
    .then( (profile)=> { 
        errors.noprofile ='There is no profile. ';
        if(!profile){
           return res.status(404).json(errors);
        }

        res.json(
            profile
        );

    }).catch(
        err => res.status(400).json(err)
    );
    
 });

//  @route  POST api/profile
//  @des    Get current user profile
//  @access private
 router.post('/', passaport.authenticate('jwt',{session: false}), (req, res) => {

     const { errors,isValid} = validateProfileInput(req.body) ;

    //check validations
     if(!isValid ){
        return res.status(400).json(errors);
     }

     const profileFields ={};
     profileFields.user = req.user.id;
     if(req.body.handle) profileFields.handle = req.body.handle;
     if(req.body.company) profileFields.company = req.body.company;
     if(req.body.website) profileFields.website = req.body.website;
     if(req.body.bio) profileFields.bio = req.body.bio;
     if(req.body.status) profileFields.status = req.body.status;
     if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
     if(typeof req.body.skills !='undefined'){
        profileFields.skills = req.body.skills.split(',');
     }
     //Social
     profileFields.social = {};
     if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
     if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
     if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
     if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
     if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

     if(req.body.location) profileFields.location = req.body.location;

     
     Profile.findOne({user: req.user.id})
        .then( (profile) => {
            if (profile) {
                //update 
                Profile.findOneAndUpdate( 
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true}
                ).then( profile => res.json(profile));
            }else{
                //create
                Profile.findOne({user: req.user.id})
                    .then( (profile) =>{
                        if(profile){
                            errors.handle ='that handle already exists. ';
                            res.status(400).json(errors);
                        }
                        new Profile(profileFields).save()
                            .then( profile => res.json(profile) )
                            .catch(err => res.json({err,profileFields}));
                    })

            }
     });
 });


//  @route  POST api/profile/experience
//  @des    Add experience
//  @access private
router.post('/experience', passaport.authenticate('jwt',{session: false}), (req, res) => {
    //Get the profile   
    const newExp = new Experience(
        req.body.title ,
        req.body.company ,
        req.body.location ,
        req.body.from ,
        req.body.to,
        req.body.current ,
        req.body.description 
    );
    const {errors,isValid } = validarExperienceInput(newExp) ;
    if (!isValid) {
        return res.status(400).json(errors)
    }
        
    Profile.findOne({user: req.user.id})
        .then( profile => {
            profile.experience.push(newExp);
            profile.save()
                .then( updatedProfile =>  res.json(updatedProfile))
                .catch(err => res.json(err));
        })
        .catch(err =>  res.json(err));
    
});

//  @route  POST api/profile/education
//  @des    Add education
//  @access private
router.post('/education', passaport.authenticate('jwt',{session: false}), (req, res) => {
    //Get the profile   
    const newEdu = new Education(
        req.body.school ,
        req.body.degree ,
        req.body.fieldofstudy ,
        req.body.from ,
        req.body.to,
        req.body.current ,
        req.body.description 
    );
    const {errors,isValid } = validarEducationInput(newEdu) ;
    //Check validation
    if (!isValid) {
        // return any error with status 400
        return res.status(400).json(errors)
    }
        
    Profile.findOne({user: req.user.id})
        .then( profile => {
           //Adding education to the current profile
            profile.education.push(newEdu);
            profile.save()
                .then( updatedProfile =>  res.json(updatedProfile))
                .catch(err => res.json(err));
        })
        .catch(err =>  res.json(err));
    
});

//  @route  DELETE api/profile/experience/:expId
//  @des    Delete experience
//  @access private
router.delete('/experience/:expId', passaport.authenticate('jwt',{session: false}), (req, res) => {
    //Get the profile      
    Profile.findOne({user: req.user.id})
        .then( profile => { 
        const newLista = profile.experience.filter(item =>item.id !== req.params.expId);
             profile.experience = newLista;
            
             profile.save()
                .then(profileUpdated => res.json(profileUpdated) )
                .catch(err => res.status(400).json(err) ); 
        })
        .catch(err =>  res.status(404).json(err));
    
});


//  @route  DELETE api/profile/education/:eduId
//  @des    Delete experience
//  @access private
router.delete('/education/:eduId', passaport.authenticate('jwt',{session: false}), (req, res) => {
    //Get the profile      
    Profile.findOne({user: req.user.id})
        .then( profile => {
        const newLista = profile.education.filter(item =>item.id !== req.params.eduId);
            profile.education = newLista;
            
             profile.save()
                .then(profileUpdated => res.json(profileUpdated) )
                .catch(err => res.status(400).json(err) ); 
        })
        .catch(err =>  res.status(404).json(err));
    
});


//  @route  DELETE api/profile/
//  @des    Delete user & profile
//  @access private
router.delete('/', passaport.authenticate('jwt',{session: false}), (req, res) => {    
    Profile.findOneAndRemove( {user: req.user.id})
        .then( ()=> {
            User.findOneAndRemove({_id : req.user.id })
                .then(res.json({msg:"Profile and user were deleted"}));
        })
        .catch( err => res.status(400).json(err));
    
});

 module.exports = router;