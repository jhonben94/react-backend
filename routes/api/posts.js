const express = require('express');
const router = express.Router();

//  @route  GET api/posts/test
//  @des    Test get route
//  @access public
router.get('/test', (req,res) => {
    res.json({ ok:true , message:'Posts works'});
 });

 module.exports = router;

