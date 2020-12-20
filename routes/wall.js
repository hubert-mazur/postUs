const router = require("express").Router();
const { request, response } = require("express");
const neo4j = require("neo4j-driver");
const auth = require("../verifyToken");

router.get("/following", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:hmPerson)-[r:hmFOLLOWS]->(following:hmPerson) WHERE id(a) = $id RETURN COUNT(following)",
      { id: request._id }
    );
    return response.status(200).send({ error: false, meta: "", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

router.get("/followed", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:hmPerson)<-[r:hmFOLLOWS]-(followed:hmPerson) WHERE id(a) = $id RETURN COUNT(followed)",
      { id: request._id }
    );
    return response.status(200).send({ error: false, meta: "", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

router.get("/", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (me:hmPerson)-[p:hmPOSTED]->(n:hmPOST) WHERE id(me) = $id OPTIONAL MATCH (n)<-[com:hmCOMMENTED]-(c:hmPerson) CALL {with n MATCH (n)<-[l:hmLIKES]-(:hmPerson) RETURN COUNT(l) as likes}RETURN me.name, me.lastName, n, id(n), collect({com:com,name: c.name, lastName:c.lastName}) as comments, likes, EXISTS((me)-[:hmLIKES]->(n)) as doILike ORDER BY n.timestamp DESC",
      { id: request._id }
    );
    res = [];
    // console.error(result.records);
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

router.post("/", auth, async (request, response) => {
  const now = new Date();
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (me:hmPerson) WHERE id(me) = $id create (me)-[:hmPOSTED]->(:hmPOST {content: $content, timestamp: $timestamp})",
      {
        id: request._id,
        timestamp: neo4j.types.DateTime.fromStandardDate(now),
        content: request.body.content,
      }
    );
    response.status(200).send({ error: false, meta: "", body: result });
  } catch (err) {
    console.error(err);
    response.status(400).send({ error: true, meta: "", body: err });
  } finally {
    await session.close();
  }
});

router.delete("/:post_id/post", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (p:hmPOST) where id (p) = $post_id DETACH DELETE p",
      {
        post_id: parseInt(request.params.post_id),
      }
    );
    return response.status(200).send({ error: false, meta: "", body: result });
  } catch (err) {
    console.error(err);
    return response.status(400).send({ error: true, meta: "", body: result });
  } finally {
    await session.close();
  }
});

module.exports = router;
