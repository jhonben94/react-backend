const express = require('express');
const router = express.Router();

//  @route  GET api/profile/test
//  @des    Test get route
//  @access public
router.get('/test', (req,res) => {
    res.json({ ok:true , message:'Profile works'});
 });

 module.exports = router;