const router = require("express").Router();
const { request, response } = require("express");
const neo4j = require("neo4j-driver");
const auth = require("../verifyToken");

router.get("/", auth, async (request, response) => {
  const result = await neo4j.driver.session
    .run(
      "MATCH (me:Person)-[r:FOLLOWS]->(b:Person)-[p:POSTED]->(n:POST) WHERE id(me) = $id RETURN b.name, b.lastName, n, id(n) ORDER BY n.timestamp DESC",
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
