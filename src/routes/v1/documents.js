const express = require("express");
const fs = require("fs");
const mysql = require("mysql2/promise");
const multer = require("multer");
const { isLoggedIn } = require("../../middleware/middleware");
const { mysqlConfig } = require("../../config");

const router = express.Router();

const status500 = "An issue was found. Please, try again later";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./docs"),
  filename: (req, file, cb) => cb(null, `${file.originalname}.pdf`),
});

const upload = multer({ storage });

router.get("/:id", isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT * FROM documents WHERE pet_id = ${req.params.id}`
    );
    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: status500 });
  }
});

router.get("/file/:filename", async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(
      `SELECT * FROM documents WHERE filename = ${mysql.escape(
        req.params.filename
      )}`
    );
    await con.end();

    const file = fs.readFileSync(
      __dirname + `/../../../docs/${req.params.filename}`
    );
    return res.end(file);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ msg: status500 });
  }
});

router.post("/:id", upload.single("document"), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        INSERT INTO documents (filename, pet_id)
        VALUES ('${req.file.originalname}', ${req.params.id})
    `);
    await con.end();

    if (!data.insertId) {
      return res.status(500).send({ msg: status500 });
    }

    return res.send({ msg: "Successfully added a document" });
  } catch (err) {
    return res.status(500).send({ msg: status500 });
  }
});

module.exports = router;
