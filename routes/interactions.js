const { request, response } = require("express");
const neo4j = require("neo4j-driver");
const router = require("express").Router();
const auth = require("../verifyToken");

router.put("/:post_id/like", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:Person), (p:POST) WHERE id(a) = $person_id AND id(p) = $post_id MERGE (a)-[:LIKES]->(p)",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
      }
    );
    return response
      .status(200)
      .send({ error: false, meta: "OK", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "OK", body: err });
  } finally {
    await session.close();
  }
});

router.delete("/:post_id/like", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:Person)-[r:LIKES]->(p:POST) WHERE id(a) = $person_id AND id(p) = $post_id DELETE r",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
      }
    );
    return response
      .status(200)
      .send({ error: false, meta: "OK", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "OK", body: err });
  } finally {
    await session.close();
  }
});

router.post("/:post_id/comment", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const now = new Date();
  try {
    const result = await session.run(
      "MATCH (a:Person), (p:POST) WHERE id(a) = $person_id AND id(p) = $post_id CREATE (a)-[:COMMENTED {timestamp: $date, text: $message}]->(p)",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
        date: neo4j.types.DateTime.fromStandardDate(now),
        message: request.body.text,
      }
    );
    return response
      .status(200)
      .send({ error: false, meta: "OK", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "OK", body: err });
  } finally {
    await session.close();
  }
});

router.get("/:post_id/comment", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (p:POST)<-[r:COMMENTED]-(n:Person) WHERE id(p) = $post_id RETURN n.name, n.lastName, id(n), r.text, r.timestamp",
      {
        post_id: neo4j.int(request.params.post_id),
      }
    );
    return response
      .status(200)
      .send({ error: false, meta: "OK", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "OK", body: err });
  } finally {
    await session.close();
  }
});

module.exports = router;