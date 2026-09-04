const express=require("express");
const {getMeta}=require("./metadata");
const router=express.Router();
router.get("/meta/:type/:videoId.json",async(req,res)=>{
  if(req.params.type!=="series") return res.json({meta:null});
  const id=decodeURIComponent(req.params.videoId);
  try { const meta=await getMeta(id); res.setHeader("Cache-Control","public,max-age=21600,stale-while-revalidate=86400"); res.json({meta}); }
  catch(e){ console.error(`[meta] ${id}: ${e.message}`); res.json({meta:{id,type:"series",name:id.split(":").slice(1).join(":").replace(/[-_]+/g," ")}}); }
});
module.exports=router;
