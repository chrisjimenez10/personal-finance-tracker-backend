const request = require("supertest");
//Destructuring imports from server.js
const app  = require("../server");

describe("API Routes Status", ()=>{


    it("GET route should return a 200 status code", async()=>{
        const response = await request(app).get("/totalbalance");
        expect(response.statusCode).toBe(200);
    });

    it("GET route for single record should return a 200 status code", async()=>{
        const response = await request(app).get("/totalbalance/1");
        expect(response.statusCode).toBe(200);
    });

    it("PUT route should return a 404 for invalid id", async()=>{
        const response = await request(app)
        .put("/totalbalance/100")
        //The send() method from SuperTest is used to send data as an object in JavaScript and gets sent in JSON format --> It automatically sets the "Content-Type" header to application/json
        .send({
            user_name: "test",
            total_balance: 100,
            date_created: "2024-07-10",
            income_transactions: 0,
            expense_transactions: 0
        });
        expect(response.statusCode).toBe(404);
    });
});

