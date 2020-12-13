const { request, response } = require("express");
const { route } = require("./auth");
const neo4j = require("neo4j-driver");

const router = require("express").Router();
const auth = require("../verifyToken");
const { date } = require("joi");

router.put("/:post_id/like", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person), (p:POST) WHERE id(a) = $person_id AND id(p) = $post_id MERGE (a)-[:LIKES]->(p)",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
      }
    )
    .then((result) => {
      console.error(result);
      return { error: false, meta: "OK", body: result };
    })
    .catch((err) => {
      return { error: true, meta: "", body: err };
    });

  return response.status(result.error ? 400 : 200).send(result);
});

router.delete("/:post_id/like", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (a:Person)-[r:LIKES]->(p:POST) WHERE id(a) = $person_id AND id(p) = $post_id DELETE r",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
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

router.post("/:post_id/comment", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const now = new Date();
  const result = await session
    .run(
      "MATCH (a:Person), (p:POST) WHERE id(a) = $person_id AND id(p) = $post_id CREATE (a)-[:COMMENTED {timestamp: $date, text: $message}]->(p)",
      {
        person_id: request._id,
        post_id: neo4j.int(request.params.post_id),
        date: neo4j.types.DateTime.fromStandardDate(now),
        message: request.body.text,
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

router.get("/:post_id/comment", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const result = await session
    .run(
      "MATCH (p:POST)<-[r:COMMENTED]-(n:Person) WHERE id(p) = $post_id RETURN n.name, n.lastName, id(n), r.text, r.timestamp",
      {
        post_id: neo4j.int(request.params.post_id),
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

module.exports = router;
