//Import
const express = require("express");
const morgan = require("morgan");
const totalBalanceRouter = require("./Controllers/totalBalance.js");
const userRouter = require("./Controllers/auth.js");

const app = express();
const port = 3000;

//Middleware
app.use(express.json());
app.use(morgan("dev"));

//Controllers
app.use("/totalbalance", totalBalanceRouter);

//Routes
app.get("/", async (req, res)=>{
    res.send("Landing Page");
});

//Start Application
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});

//Export
module.exports = app;