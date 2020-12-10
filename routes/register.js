const router = require("express").Router();
const validationSchemas = require("../validationSchemas/user");
const neo4j = require("neo4j-driver");

router.post("/", async (request, response) => {
  const { err } = validationSchemas.registerValidation(request.body);
  if (err) {
    return response.status(400).send({ error: true, meta: "", body: err });
  }

  const result = await neo4j.driver.session.run(
    `MATCH (n:Person {email:\'${request.body.email}\'}) RETURN COUNT(n) as count`
  );

  console.error(result.records[0].get("count"));

  if (result.records[0].get("count") != 0) {
    return response
      .status(400)
      .send({ error: true, meta: "user exists", body: "" });
  }

  const saveUser = await neo4j.driver.session.run(
    `CREATE (n:Person {name: $name, lastName: $lastName,joined: $date,born: $birthday,email: $email,password: $password}) RETURN COUNT(n) as count, id(n) as id`,
    {
      name: request.body.name,
      date: Date.now(),
      birthday: request.body.born,
      email: request.body.email,
      password: request.body.password,
      lastName: request.body.lastName,
    }
  );

  console.error(saveUser.records[0].get("count"));
  if (saveUser.records[0].get("count") != 1) {
    return response.status(400).send({ error: true, meta: "", body: saveUser });
  } else {
    return response
      .status(200)
      .send({
        error: true,
        meta: "OK",
        body: { id: saveUser.records[0].get("id") },
      });
  }
});

module.exports = router;
