const request = require("supertest");
//Destructuring imports from server.js
const app  = require("../server");

// describe("API Routes Status", ()=>{

//     let response;

//     it("GET route should return a 200 status code", async ()=>{
//         response = await request(app).get("/totalbalance");
//         expect(response.statusCode).toBe(200);
//     });

//     it("GET route for single record should return a 200 status code", async ()=>{
//         response = await request(app).get("/totalbalance/1");
//         expect(response.statusCode).toBe(200);
//     });

//     it("PUT route should return a 200 status code for valid edit of record", async ()=>{
//         response = await request(app)
//         .put("/totalbalance/1")
//         .send({
//             user_name: "test",
//             total_balance: 100,
//             date_created: "2024-07-10",
//             income_transactions: 0,
//             expense_transactions: 0
//         });
//         expect(response.statusCode).toBe(200);
//     });

//     it("PUT route should return a 404 status code for invalid id", async ()=>{
//         response = await request(app)
//         .put("/totalbalance/100")
//         //The send() method from SuperTest is used to send data as an object in JavaScript and gets sent in JSON format --> It automatically sets the "Content-Type" header to application/json
//         .send({
//             user_name: "test",
//             total_balance: 100,
//             date_created: "2024-07-10",
//             income_transactions: 0,
//             expense_transactions: 0
//         });
//         expect(response.statusCode).toBe(404);
//     });

//     it("POST route should return a 201 status code for successfull creation of record", async ()=>{
//         response = await request(app)
//         .post("/totalbalance")
//         .send({
//             user_name: "test-post-2",
//             total_balance: 500,
//             date_created: "2024-07-10",
//             income_transactions: 50,
//             expense_transactions: 50
//         });
//         expect(response.statusCode).toBe(201);
//     });

//     it("POST route should return a 500 status code for attempt creation of existing record", async ()=>{
//         response = await request(app)
//         .post("/totalbalance")
//         .send({
//             user_name: "test-post",
//             total_balance: 500,
//             date_created: "2024-07-10",
//             income_transactions: 50,
//             expense_transactions: 50
//         });
//         expect(response.statusCode).toBe(500);
//     });

//     it("POST route should return a 500 status code for incorrect or missing data sent", async ()=>{
//         response = await request(app)
//         .post("/totalbalance")
//         .send({
//             user_name: "test-post",
//             total_balance: 500,
//             date_created: "2024-07-10",
//             income_transactions: 50,
//             expense_transactions: "test-incorrect-data"
//         });
//         expect(response.statusCode).toBe(500);
//     });

//     it("DELETE route should return a 200 status code for successfull deletion of record", async ()=>{
//         response = await request(app)
//         .delete("/totalbalance/7")
//         expect(response.statusCode).toBe(200);
//     });

//     it("DELETE route should return a 404 status code when providing invalid id", async ()=>{
//         response = await request(app)
//         .delete("/totalbalance/100");
//         expect(response.statusCode).toBe(404);
//     });
// });

