const express = require("express");
const router = express.Router();
const { Pool } = require("pg"); //Using the Pool Class to configure connection to Posgtres Databse
require("dotenv").config();

//Database Connection Configuration
const pool = new Pool({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

let client;

//Retrieve Users
router.get("/", async (req, res)=>{
    try{
        client = await pool.connect();
        const results = await client.query("SELECT * FROM users;");
        res.status(200).json(results.rows);
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
})

//Register New User
router.post("/", async (req, res)=>{
    const {user_name, password} = req.body;
    try{
        client = await pool.connect();
        //Find potential existing user_name
        await client.query("INSERT INTO users (user_name, password) VALUES ($1, $2)", [user_name, password]);
        res.status(201).json({message: "User account registered successfully"});
    }catch(error){
        //We can use the error thrown by PostgreSQL when the UNIQUE constraint is violated --> PostgreSQL throws error with code "23505" when UNIQUE constraint is violated, which we can access with "error.code"
        if(error.code === '23505'){
            res.status(409).json({error: `Username ${user_name} already exists, choose another`});
        }else{
            res.status(500).json({error: error.message});
        }
    }finally{
        client.release();
    }
});

module.exports = router;