const jwt = require("jsonwebtoken");


function verifyToken(req, res, next){
    try{
        //Extract the token from the Authorization Header (It is part of the HTTP Request)
        const token = req.headers.authorization.split(" ")[1];
        
        //Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Here, we are ATTACHING the decoded token payload (which includes the data used to create the JWT Token) to the Request Object
        req.user = decoded;

        //If there is no ERROR above and the verify() method verifies that the token is valid, proceed to next middleware or route handler logic
        next();
    }catch(error){
        //The verify() method from JWT Library will throw an error if token is invalid, expired, or tampered with and it will be caught here in the catch block
        res.status(401).json({error: "Invalid Token"});
    }
};

module.exports = verifyToken;