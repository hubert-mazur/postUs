const express = require("express");
const app = express();
const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");

// Database connection
dotenv.config();

neo4j.driver = neo4j.driver(process.env.DB_URL, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS), {disableLosslessIntegers: true});


neo4j.driver.verifyConnectivity()
    .then((msg) => {
        console.log(msg)
    })

neo4j.driver.session = neo4j.driver.session({database: 'neo4j'});



// Routes
const authRoute = require("./routes/auth");
const registerRoute = require("./routes/register");
const interactionRoute = require("./routes/interactions");
const peopleRoute = require("./routes/people");
// const apiRoute = require("./routes/landing_page");
// const userRoute = require("./routes/user_management");
// const machineRoute = require("./routes/machine");

// Middlewares
app.use(express.json());
// Routes middlewares

app.use("/api/login", authRoute);
app.use("/api/register", registerRoute);
app.use("/api/post", interactionRoute);
app.use("/api/people", peopleRoute);
// app.use("/api/landing", apiRoute);
// app.use("/api/user", userRoute);
// app.use("/api/machine", machineRoute);

app.listen(3000, () => {
  console.log("Server started");
});

// neo4j.driver.session.close();
