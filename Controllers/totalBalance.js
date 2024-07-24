//Import
const express = require("express");
const router = express.Router();
const { Pool } = require("pg"); //Using the Pool Class to configure connection to Posgtres Databse
require("dotenv").config();
const verifyToken = require("../middleware/verifyToken.js");

//Database Connection Configuration
const pool = new Pool({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

let client;
let userAccountResults;
let userIdResults;

//Routes

//GET all the existing transactions (NOT available to any User in Frontend)
router.get("/", async (req, res)=>{
    try{
        client = await pool.connect(); //connect() establishes connections with Postgres
        const fetchedUsers = await client.query("SELECT * FROM users FULL JOIN user_accounts ON users.id = user_accounts.user_id;");
        const formattedData = fetchedUsers.rows.map(row => ({
            id: row.id,
            user_name: row.user_name,
            user_id: row.user_id,
            total_balance: row.total_balance,
            date_transaction: row.date_transaction.toISOString().split("T")[0], //The toISOString() method converst the Date object into a string, so we can use the split() method at the "T" and return the first section of that string array created by split() method which is the section with ONLY the date format
            income_transaction: row.income_transaction,
            expense_transaction: row.expense_transaction
        }))
        //Here, we use "".rows" to display in JSON Format ONLY the records and not the additional metadata that the previous query fetched
        res.status(200).json(formattedData);
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release(); //release() disconnects from database
    }
});

//GET all the transactions of a SINGLE User
router.get("/:id", async (req, res)=>{
    const {id} = req.params;
    try{
        client = await pool.connect();
        userAccountResults = await client.query("SELECT * FROM users FULL JOIN user_accounts ON users.id = user_accounts.user_id WHERE users.id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            res.status(404);
            throw new Error ("User account does not exist, please provide valid id");
        }else{
            const formattedData = userAccountResults.rows.map(row => ({
                id: row.id,
                user_name: row.user_name,
                user_id: row.user_id,
                total_balance: row.total_balance,
                date_transaction: row.date_transaction.toISOString().split("T")[0],
                income_transaction: row.income_transaction,
                expense_transaction: row.expense_transaction
            }))
            res.status(200).json(formattedData);
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
})

//POST - Create transaction for SINGLE User
router.post("/:id", async (req, res)=>{
    const {id} = req.params;
    const {income_transaction, expense_transaction} = req.body;
    try{
        client = await pool.connect();
        //Express/NodeJS use "$1, $2, $n..." for paramaterized queries with Postgres
        await client.query("INSERT INTO user_accounts (user_id, income_transaction, expense_transaction) VALUES ($1, $2, $3);", [id, income_transaction, expense_transaction]);
        res.status(201).json({message: "Record inserted successfully"});
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});

//PUT - Edit transaction (Frontend will restrict most RECENT transaction as only transaction available to edit)
router.put("/:id", async (req, res)=>{
    const {id} = req.params;
    const {user_id, income_transaction, expense_transaction} = req.body;
    try{
        client = await pool.connect();

        userIdResults = await client.query("SELECT * FROM user_accounts WHERE user_id = $1;", [user_id]);
        if(userIdResults.rows.length === 0){
            res.status(403);
            throw new Error (`User id ${user_id} account details is a protected source`);
        }

        userAccountResults = await client.query("SELECT * FROM user_accounts WHERE id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            res.status(404);
            throw new Error (`History of User transaction with id ${id} does not exist, please provide valid transaction id`);
        }else{
            await client.query("UPDATE user_accounts SET income_transaction = $1, expense_transaction = $2 WHERE id = $3;", [income_transaction, expense_transaction, id]);
            res.status(200).json({message: "Record updated successfully"});
        }
    }catch(error){
        if(res.statusCode === 403){
            res.json({error:error.message});
        }else if(res.statusCode === 404){
            res.json({error:error.message});
        }else{
        res.status(500).json({error:error.message});
        }
    }finally{
        client.release();
    }
});

//DELETE - Delete transaction of SINGLE User (Frontend will require user to send user_id as confirmation for DELETION)
router.delete("/:id", async (req, res)=>{
    const {id} = req.params;
    const {user_id} = req.body;
    try{
        client = await pool.connect();

        userIdResults = await client.query("SELECT * FROM user_accounts WHERE user_id = $1;", [user_id]);
        if(userIdResults.rows.length === 0){
            res.status(403);
            throw new Error (`User id ${user_id} account details is a protected source`);
        }

        userAccountResults = await client.query("SELECT * FROM user_accounts WHERE id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            //Condition is based on length of the array that the "rows" property has, which is a property from the object that is retrieved form the query (If lenght is 0, it means there are no records that result from the query)
            res.status(404);
            throw new Error ("User transaction does not exist, please provide valid transaction id");
        }else{
            await client.query("DELETE FROM user_accounts WHERE id = $1;", [id]);
            res.status(200).json({message: `Record with id ${id} deleted successfully`});
        }  
    }catch(error){
        if(res.statusCode === 403){
            res.json({error:error.message});
        }else if(res.statusCode === 404){
            res.json({error:error.message});
        }else{
        res.status(500).json({error:error.message});
        }
    }finally{
        client.release();
    }
});

//Export
module.exports = router;