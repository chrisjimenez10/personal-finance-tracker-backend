const express = require("express");
const router = express.Router();
const { Pool } = require("pg"); //Using the Pool Class to configure connection to Posgtres Databse
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken.js");


//Database Connection Configuration
const pool = new Pool({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

let client;
let userDb;

//Retrieve Users
router.get("/", async (req, res)=>{
    try{
        client = await pool.connect();
        const results = await client.query("SELECT id, user_name FROM users;");
        res.status(200).json(results.rows);
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});

//Delete User (Authorized Access Only)
router.delete("/:id", verifyToken, async (req, res)=>{
    const {id} = req.params;
    try{
        client = await pool.connect();
        userDb = await client.query("SELECT * FROM users WHERE id = $1;", [id]);
        if(userDb.rows.length === 0){
            res.status(404);
            throw new Error (`User with id ${id} not found, please provide valid id`);
        }else{
            await client.query("DELETE FROM users WHERE id = $1;", [id]);
            res.status(200).json({message: `User with id ${id} deleted successfully`});
        }
    }catch(error){
        if(res.statusCode === 404){
            res.json({error:error.message});
        }else{
            res.status(500).json({error:error.message});
        }
    }finally{
        client.release();
    }
});

//Register New User
router.post("/signup", async (req, res)=>{
    const {user_name, password} = req.body;
    //Hashing Password
    const hashedPassword = bcrypt.hashSync(password, 10);

    try{
        client = await pool.connect();

        //Find potential existing user_name
        await client.query("INSERT INTO users (user_name, password) VALUES ($1, $2)", [user_name, hashedPassword]);

        //Retrieve created user to use data for JSON payload on JWT Token creation
        const createdUser = await client.query("SELECT * FROM users WHERE user_name = $1;", [user_name]);
        // console.log(createdUser.rows[0]);

        //Create JWT Token
        const token = jwt.sign({user: createdUser.rows[0]}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.status(201).json({message: "User account registered successfully", token: token, user: createdUser.rows[0]});
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

router.post("/signin", async (req, res)=>{
    const {user_name, password} = req.body;

    try{
        client = await pool.connect();
        userDb = await client.query("SELECT * FROM users WHERE user_name = $1", [user_name]);
        // console.log(userDb.rows[0].password);
        if(userDb.rows.length === 0){
            res.status(404);
            throw new Error (`Username ${user_name} not found, please provide valid Username`);
        }
        //Verifying that provided password MATCHES hashed password in database
        const validPassword = bcrypt.compareSync(password, userDb.rows[0].password);
        if(!validPassword){
            res.status(409)
            throw new Error (`Incorrect password, try again`);
        }

        //Create JWT Token
        const token = jwt.sign({user: userDb.rows[0]}, process.env.JWT_SECRET, {expiresIn: "1d"});

        res.status(200).json({message: "Username and Password are valid, you are now signed-in", token: token, user: userDb.rows[0]});
    }catch(error){
        if(res.statusCode === 404){
            res.json({error: error.message});
        }else if(res.statusCode === 409){
            res.json({error:error.message});
        }else{
            res.status(500).json({error:error.message})
        }
    }finally{
        client.release();
    }
});

module.exports = router;