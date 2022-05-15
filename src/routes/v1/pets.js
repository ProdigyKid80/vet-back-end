const express = require("express");
const mysql = require("mysql2/promise");
const { mysqlConfig } = require("../../config");
const { isLoggedIn } = require("../../middleware/middleware");
const { petSchema } = require("../../middleware/schemas");
const validation = require("../../middleware/validation");

const router = express.Router();

const status500 = "An issue was found. Please, try again later";

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT * FROM pets WHERE archived=0
    `);
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: status500 });
  }
});

router.post("/", isLoggedIn, validation(petSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      INSERT INTO pets (name, birthday, email) 
           VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(
      req.body.birthday
    )}, ${mysql.escape(req.body.email)})
    `);

    await con.end();

    if (!data.insertId) {
      console.log(data);
      return res.status(500).send({ err: status500 });
    }

    return res.send({
      msg: "Successfully added a pet",
      id: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

router.delete("/:id", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      UPDATE pets SET archived = 1 WHERE id = ${req.params.id}
    `);

    await con.end();

    if (!data.affectedRows) {
      console.log(data);
      return res.status(500).send({ err: status500 });
    }

    return res.send({
      msg: "Successfully deleted a pet",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

module.exports = router;
