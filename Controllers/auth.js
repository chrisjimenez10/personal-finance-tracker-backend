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

//Register New User
router.post("/", async(req, res)=>{
    const {user_name, password} = req.body;
    try{
        client = await pool.connect();

        //Find potential existing user_name
        const usersDb = await client.query("SELECT user_name FROM users WHERE user_name = $1", [user_name]);
        if(usersDb.rows.length === 0){
            res.status(409);
            throw new Error (`Username ${user_name} already exists, choose another`);
        }else{
            await client.query("INSERT INTO users (user_name, password) VALUES ($1, $2)", [user_name, password]);
            res.status(201).json({message: "User account registered successfully"});
        }

    }catch(error){
        if(res.statusCode === 409){
            res.json({error: error.message});
        }
    }
});