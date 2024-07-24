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

//Example route for crud operations on users and their account details
router.get("/join", async (req, res)=>{
    try{
        client = await pool.connect();
        const fetchedUsers = await client.query("SELECT * FROM users FULL JOIN user_accounts ON users.id = user_accounts.user_id WHERE users.id = 1;");
        res.status(200).json(fetchedUsers.rows);
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});

//Routes
router.get("/", async (req, res)=>{
    try{
        client = await pool.connect(); //connect() establishes connections with Postgres
        const fetchedUsers = await client.query("SELECT * FROM user_accounts;");
        const formattedData = fetchedUsers.rows.map(row => ({
            id: row.id,
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

router.get("/:id", async (req, res)=>{
    const {id} = req.params;
    try{
        client = await pool.connect();
        userAccountResults = await client.query("SELECT * FROM user_accounts WHERE id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            res.status(404);
            throw new Error ("User account does not exist, please provide valid id");
        }else{
            const formattedData = userAccountResults.rows.map(row => ({
                id: row.id,
                user_name: row.user_name,
                total_balance: row.total_balance,
                date_created: row.date_created.toISOString().split("T")[0],
                income_transactions: row.income_transactions,
                expense_transactions: row.expense_transactions
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

router.post("/", async (req, res)=>{
    const {user_name, total_balance, date_created, income_transactions, expense_transactions} = req.body;
    try{
        client = await pool.connect();
        //Express/NodeJS use "$1, $2, $n..." for paramaterized queries with Postgres
        await client.query("INSERT INTO user_accounts (user_name, total_balance, date_created, income_transactions, expense_transactions) VALUES ($1, $2, $3, $4, $5);", [user_name, total_balance, date_created, income_transactions, expense_transactions]);
        res.status(201).json({message: "Record inserted successfully"});
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});

router.put("/:id", async (req, res)=>{
    const {id} = req.params;
    const {user_name, total_balance, date_created, income_transactions, expense_transactions} = req.body;
    try{
        client = await pool.connect();
        userAccountResults = await client.query("SELECT * FROM user_accounts WHERE id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            res.status(404);
            throw new Error ("User account does not exist, please provide valid id");
        }else{
            await client.query("UPDATE user_accounts SET user_name = $1, total_balance = $2, date_created = $3, income_transactions = $4, expense_transactions = $5 WHERE id = $6;", [user_name, total_balance, date_created, income_transactions, expense_transactions, id]);
            res.status(200).json({message: "Record updated successfully"});
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

router.delete("/:id", async (req, res)=>{
    const {id} = req.params;
    try{
        client = await pool.connect();
        userAccountResults = await client.query("SELECT * FROM user_accounts WHERE id = $1;", [id]);
        if(userAccountResults.rows.length === 0){
            //Condition is based on length of the array that the "rows" property has, which is a property from the object that is retrieved form the query (If lenght is 0, it means there are no records that result from the query)
            res.status(404);
            throw new Error ("User account does not exist, please provide valid id");
        }else{
            await client.query("DELETE FROM user_accounts WHERE id = $1;", [id]);
            res.status(200).json({message: `Record with id ${id} deleted successfully`});
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

//Export
module.exports = router;