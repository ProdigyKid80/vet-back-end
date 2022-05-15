const express = require("express");
const mysql = require("mysql2/promise");
const { mysqlConfig } = require("../../config");
const { isLoggedIn } = require("../../middleware/middleware");
const { logSchema } = require("../../middleware/schemas");
const validation = require("../../middleware/validation");

const router = express.Router();

const status500 = "An issue was found. Please, try again later";

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT * FROM logs WHERE id = ${req.body.id}
    `);
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: status500 });
  }
});

router.post("/", isLoggedIn, validation(logSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      INSERT INTO logs (pet_id, status, description) 
           VALUES (${req.body.id}, ${mysql.escape(
      req.body.status
    )}, ${mysql.escape(req.body.description)})
    `);

    await con.end();

    if (!data.insertId) {
      console.log(data);
      return res.status(500).send({ err: status500 });
    }

    return res.send({
      msg: "Successfully added a log",
      id: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

module.exports = router;
