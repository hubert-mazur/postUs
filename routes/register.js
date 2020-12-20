const router = require("express").Router();
const validationSchemas = require("../validationSchemas/user");
const neo4j = require("neo4j-driver");

router.post("/", async (request, response) => {
  const err = await validationSchemas.registerValidation(request.body);
  if (err.error) {
    return response
      .status(400)
      .send({ error: true, meta: "", body: err.error });
  }

  session = neo4j.driver.session();
  try {
    const result = await session.run(
      `MATCH (n:hmPerson {email:\'${request.body.email}\'}) RETURN COUNT(n) as count`
    );

    if (result.records[0].get("count") != 0) {
      return response
        .status(400)
        .send({ error: true, meta: "user exists", body: "" });
    }
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }

  const now = new Date();
  session = neo4j.driver.session();

  try {
    const saveUser = await session.run(
      `CREATE (n:hmPerson {name: $name, lastName: $lastName,joined: $date,born: $birthday,email: $email,password: $password}) RETURN COUNT(n) as count, id(n) as id`,
      {
        name: request.body.name,
        date: neo4j.types.DateTime.fromStandardDate(now),
        birthday: request.body.born,
        email: request.body.email,
        password: request.body.password,
        lastName: request.body.lastName,
      }
    );

    if (saveUser.records[0].get("count") != 1) {
      return response
        .status(400)
        .send({ error: true, meta: "", body: saveUser });
    }

    return response.status(200).send({
      error: false,
      meta: "OK",
      body: "OK",
    });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

module.exports = router;
