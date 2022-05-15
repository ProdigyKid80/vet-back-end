const express = require("express");
const mysql = require("mysql2/promise");
const { mysqlConfig } = require("../../config");
const { isLoggedIn } = require("../../middleware/middleware");
const { logSchema } = require("../../middleware/schemas");
const validation = require("../../middleware/validation");

const router = express.Router();

const status500 = "An issue was found. Please, try again later";

router.get("/:id", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT logs.*, pets.name FROM logs, pets WHERE logs.pet_id = ${req.params.id} AND logs.pet_id = pets.id ORDER BY logs.date desc
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
      INSERT INTO logs (pet_id, title, description, date) 
           VALUES (${req.body.pet_id}, ${mysql.escape(
      req.body.title
    )}, ${mysql.escape(req.body.description)}, ${mysql.escape(req.body.date)})
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
