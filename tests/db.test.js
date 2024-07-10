require("dotenv").config();
const {Pool} = require("pg");

const pool = new Pool({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

describe("PostgreSQL Connection", ()=>{
    it("should connect to the PostgreSQL database successfully", async ()=>{
        const client = await pool.connect();
        //The toBeDefined() test checks if a variable or function returns something (checks that value is NOT undefined)
        expect(client).toBeDefined();
        client.release();
    });
});

