require("dotenv").config();
const {Pool} = require("pg");

const pool = new Pool({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

let client;

describe("PostgreSQL Connection", ()=>{
    it("should connect to the PostgreSQL database successfully", async ()=>{
        client = await pool.connect();
        //The toBeDefined() test checks if a variable or function returns something (checks that value is NOT undefined)
        expect(client).toBeDefined();
        client.release();
    });
});

describe("PostgreSQL Queries", ()=>{

    //Setup before each test is executed
    beforeEach(async ()=>{
        client = await pool.connect();
    });

    //Cleanup after each test is completed
    afterEach(()=>{
        if(client){
            client.release();
        }
    });

    it("should return run a successfull query", async ()=>{
        const results = await client.query("SELECT * FROM user_accounts;");
        expect(results.rows.length).toBeGreaterThanOrEqual(0);
    });

    it("should return the key property id", async ()=>{
        const results = await client.query("SELECT * FROM user_accounts;");
        expect(results.rows[0]).toHaveProperty("id");
    });

    it("should return user_name property key value as a string", async ()=>{
        const results = await client.query("SELECT * FROM user_accounts;");
        expect(typeof results.rows[0].user_name).toBe("sring");
    })

});





