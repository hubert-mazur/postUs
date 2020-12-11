const router = require("express").Router();
const { request, response } = require("express");
const neo4j = require("neo4j-driver");
const auth = require("../verifyToken");

router.get("/following", auth, async (request, response) => {
  const result = await neo4j.driver.session
    .run(
      "MATCH (a:Person)-[r:FOLLOWS]->(following:Person) WHERE id(a) = $id RETURN COUNT(following)",
      { id: request._id }
    )
    .then((result) => {
      return { error: false, meta: "", body: result };
    })
    .catch((err) => {
      return { error: false, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.get("/followed", auth, async (request, response) => {
  const result = await neo4j.driver.session
    .run(
      "MATCH (a:Person)<-[r:FOLLOWS]-(followed:Person) WHERE id(a) = $id RETURN COUNT(followed)",
      { id: request._id }
    )
    .then((result) => {
      return { error: false, meta: "", body: result };
    })
    .catch((err) => {
      return { error: false, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.get("/", auth, async (request, response) => {
    const result = await neo4j.driver.session
      .run(
        "MATCH (me:Person)-[:POSTED]->(p:POST) WHERE id(me) = $id RETURN me.name, me.lastName, p, id(p) ORDER BY p.timestamp DESC",
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

module.exports = router;
