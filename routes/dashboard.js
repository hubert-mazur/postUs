const router = require("express").Router();
const { request, response } = require("express");
const neo4j = require("neo4j-driver");
const auth = require("../verifyToken");

router.get("/", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (me:Person)-[r:FOLLOWS]->(b:Person)-[p:POSTED]->(n:POST) WHERE id(me) = $id OPTIONAL MATCH (n)<-[com:COMMENTED]-(c:Person)  CALL {with n MATCH (n)<-[l:LIKES]-(:Person) RETURN COUNT(l) as likes}RETURN b.name, b.lastName, n, id(n), collect({com:com,name: c.name, lastName:c.lastName}) as comments, likes, EXISTS((me)-[:LIKES]->(n)) as doILike ORDER BY n.timestamp DESC",
      { id: request._id }
    );

    res = [];

    for (i in result.records) {
      res.push({});
      for (j in result.records[i].keys) {
        res[i][result.records[i].keys[j]] = result.records[i]._fields[j];
      }
    }

    return response.status(200).send({ error: false, meta: "", body: res });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

module.exports = router;
