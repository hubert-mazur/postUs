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
const dashboardRoute = require("./routes/dashboard");
const wallRoute = require("./routes/wall");
// const apiRoute = require("./routes/landing_page");
// const userRoute = require("./routes/user_management");
// const machineRoute = require("./routes/machine");

// Middlewares
app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// Routes middlewares

app.use("/api/login", authRoute);
app.use("/api/register", registerRoute);
app.use("/api/post", interactionRoute);
app.use("/api/people", peopleRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/wall', wallRoute);
// app.use("/api/landing", apiRoute);
// app.use("/api/user", userRoute);
// app.use("/api/machine", machineRoute);

app.listen(3000, () => {
  console.log("Server started");
});

// neo4j.driver.session.close();
