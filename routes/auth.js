const router = require("express").Router();
const validationSchemas = require("../validationSchemas/user");
const jwt = require("jsonwebtoken");
const neo4j = require("neo4j-driver");

router.post("/", async (request, response) => {
  const err = await validationSchemas.loginValidation(request.body);
  console.error(request.body)
  if (err.error) {
    return response.status(400).send({ error: true, meta: "", body: "err.error" });
  }

  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      `MATCH (n:hmPerson {email:\'${request.body.email}\'}) RETURN n.password, COUNT(n) as count, id(n) as id`
    );

    if (result.records.length == 0) {
      return response
        .status(401)
        .send({ error: true, meta: "invalid email or password", body: "" });
    }

    if (result.records[0].get("n.password") != request.body.password) {
      return response
        .status(400)
        .send({ error: true, meta: "invalid email or password", body: "" });
    }

    const token = jwt.sign(
      { _id: result.records[0].get("id") },
      process.env.SECRET_TOKEN,
      { expiresIn: "2h" }
    );
    response.header("auth-token", token).send(token);
  } catch (err) {
    console.error(err);
    return response.status(500).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

module.exports = router;
