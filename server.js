const express = require("express");
const app = express();
const morgan = require("morgan");
const totalBalanceRouter = require("./Controllers/totalBalance.js");

//Middleware
app.use(express.json());
app.use(morgan("dev"));

//Controllers
app.use("/totalBalance", totalBalanceRouter);

//Routes
app.get("/", (req, res)=>{
    res.send("Landing Page");
});


//Start Application
app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});
