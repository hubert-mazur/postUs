const router = require("express").Router();
const { request, response } = require("express");
const auth = require("../verifyToken");
const neo4j = require("neo4j-driver");

router.put("/:user_id/follow", auth, async (request, response) => {
  const session = neo4j.driver.session();
  const now = new Date();
  try {
    const result = await session.run(
      "MATCH (a:Person), (b:Person) WHERE id(a) = $person_id AND id(b) = $user_id MERGE (a)-[:FOLLOWS {since: $date}]->(b)",
      {
        person_id: request._id,
        user_id: neo4j.int(request.params.user_id),
        date: neo4j.types.DateTime.fromStandardDate(now),
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

router.delete("/:user_id/follow", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:Person)-[r:FOLLOWS]->(b:Person) WHERE id(a) = $person_id AND id(b) = $user_id DELETE r",
      {
        person_id: request._id,
        user_id: neo4j.int(request.params.user_id),
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

router.get("/", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:Person) WHERE id(a) <> $id RETURN id(a), a.name, a.lastName",
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

router.get("/identity", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "MATCH (a:Person) WHERE id(a) = $id RETURN id(a), a.name, a.lastName",
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

router.get("/mayKnow", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "match (me:Person)-[f:FOLLOWS]->(myfriends:Person)-[theirFollows:FOLLOWS]->(c:Person) WHERE id(me) = $id AND NOT (me)-[:FOLLOWS]->(c) RETURN c, COUNT(theirFollows) as tf ORDER BY tf DESC",
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

router.get("/followed", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "match (me:Person)-[f:FOLLOWS]->(myfriends:Person) where id(me) = $id RETURN myfriends;",
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

router.get("/following", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "match (me:Person)<-[f:FOLLOWS]-(following:Person) where id(me) = $id RETURN following, EXISTS((me)-[:FOLLOWS]->(following)) as doIFollow;",
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

router.get("/other", auth, async (request, response) => {
  const session = neo4j.driver.session();
  try {
    const result = await session.run(
      "match (me:Person), (other:Person) where not (me)-[:FOLLOWS]->(other) and id(me) = $id RETURN other;",
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
