//Import
const express = require("express");
const router = express.Router();

//Routes
router.get("/", (req, res)=>{
    res.send("Total Balance");
});

router.post("/", async (req, res)=>{
    try{
        const totalBalance = req.body;
        res.status(201).json(totalBalance);
    }catch(error){
        res.status(500).json({error:error.message});
    }
});




//Export
module.exports = router;