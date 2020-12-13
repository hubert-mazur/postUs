const router = require("express").Router();
const { request, response } = require("express");
const auth = require("../verifyToken");
const neo4j = require("neo4j-driver");

router.put("/:user_id/follow", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person), (b:Person) WHERE id(a) = $person_id AND id(b) = $user_id CREATE (a)-[:FOLLOWS {since: $date}]->(b)",
      {
        person_id: request._id,
        user_id: neo4j.int(request.params.user_id),
        date: Date.now(),
      }
    )
    .then((result) => {
      return { error: false, meta: "OK", body: result };
    })
    .catch((err) => {
      return { error: true, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.delete("/:user_id/follow", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person)-[r:FOLLOWS]->(b:Person) WHERE id(a) = $person_id AND id(b) = $user_id DELETE r",
      {
        person_id: request._id,
        user_id: neo4j.int(request.params.user_id),
      }
    )
    .then((result) => {
      return { error: false, meta: "OK", body: result };
    })
    .catch((err) => {
      return { error: true, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.get("/", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person) WHERE id(a) <> $id RETURN id(a), a.name, a.lastName",
      { id: request._id }
    )
    .then((result) => {
      return { error: false, meta: "", body: result };
    })
    .catch((err) => {
      return { error: true, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.get("/identity", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person) WHERE id(a) = $id RETURN id(a), a.name, a.lastName",
      { id: request._id }
    )
    .then((result) => {
      // console.error(result);
      res = [];

      for (i in result.records) {
        res.push({});
        for (j in result.records[i].keys) {
          res[i][result.records[i].keys[j]] = result.records[i]._fields[j];
        }
      }

      // console.error(res);

      return { error: false, meta: "", body: res };
    })
    .catch((err) => {
      return { error: true, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

module.exports = router;
