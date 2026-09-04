const express=require("express"); const router=express.Router();
router.get("/stream/:type/:videoId.json",(_req,res)=>res.json({streams:[]}));
module.exports=router;
