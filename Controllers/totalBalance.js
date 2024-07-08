//Import
const express = require("express");
const router = express.Router();
const { Pool } = require("pg"); //Using the Pool Class to configure connection to Posgtres Databse

//Database Connection Configuration
const pool = new Pool({
    database: "finance_tracker",
    user: "christopherjimenez",
    password: "cratose@41795"
});

//Routes
router.get("/", async (req, res)=>{
    let client;
    try{
        client = await pool.connect(); //connect() establishes connections with Postgres
        const fetchedPets = await client.query("SELECT * FROM user_accounts;");
        const formattedData = fetchedPets.rows.map(row => ({
            id: row.id,
            user_name: row.user_name,
            total_balance: row.total_balance,
            date_created: row.date_created.toISOString().split("T")[0], //The toISOString() method converst the Date object into a string, so we can use the split() method at the "T" and return the first section of that string array created by split() method which is the section with ONLY the date format
            income_transactions: row.income_transactions,
            expense_transactions: row.expense_transactions
        }))
        //Here, we use "".rows" to display in JSON Format ONLY the records and not the additional metadata that the previous query fetched
        res.status(200).json(formattedData);
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release(); //release() disconnects from database
    }
});

router.post("/", async (req, res)=>{
    let client;
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
    let client;
    const {user_name, total_balance, date_created, income_transactions, expense_transactions} = req.body;
    try{
        client = await pool.connect();
        await client.query("UPDATE user_accounts SET user_name = $1, total_balance = $2, date_created = $3, income_transactions = $4, expense_transactions = $5 WHERE id = $6;", [user_name, total_balance, date_created, income_transactions, expense_transactions, id]);
        res.status(200).json({message: "Record updated successfully"});
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});

router.delete("/:id", async (req, res)=>{
    const {id} = req.params;
    let client;
    try{
        client = await pool.connect();
        await client.query("DELETE from user_accounts WHERE id = $1;", [id]);
        res.status(200).json({message: `Record with id ${id} deleted successfully`});
    }catch(error){
        res.status(500).json({error:error.message});
    }finally{
        client.release();
    }
});




//Export
module.exports = router;