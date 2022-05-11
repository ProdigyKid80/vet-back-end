const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const fetch = require("node-fetch");

const {
  mysqlConfig,
  jwtSecret,
  mailServer,
  mailServerPassword,
} = require("../../config");
const validation = require("../../middleware/validation");
const { isLoggedIn } = require("../../middleware/middleware");
const {
  registrationSchema,
  loginSchema,
  changePassSchema,
  forgotPassSchema,
} = require("../../middleware/schemas");

const router = express.Router();

const status500 = "An issue was found. Please, try again later";

router.post("/register", validation(registrationSchema), async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      INSERT INTO users (name, email, password)
      VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(
      req.body.email
    )}, '${hash}')
    `);

    await con.end();

    if (!data.insertId || !data.affectedRows) {
      console.log(data);
      return res.status(500).send({ err: status500 });
    }

    return res.send({
      msg: "Successfully created account",
      accountId: data.insertId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

router.post("/login", validation(loginSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
      SELECT id, name, email, password
      FROM users
      WHERE email = ${mysql.escape(req.body.email)}
      LIMIT 1
    `);

    await con.end();

    if (data.length === 0) {
      return res.status(400).send({ err: "User not found" });
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      return res.status(400).send({ err: "Incorrect password" });
    }

    const token = jsonwebtoken.sign({ accountId: data[0].id }, jwtSecret);

    return res.send({
      msg: "Successfully logged in",
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

router.post(
  "/update",
  isLoggedIn,
  validation(changePassSchema),
  async (req, res) => {
    // chack if entered old pass matches the one in database
    try {
      const con = await mysql.createConnection(mysqlConfig);
      const [data] = await con.execute(`
        SELECT id, name, email, password
        FROM users
        WHERE id = ${req.user.accountId}
      `);

      await con.end();

      if (data.length === 0) {
        return res.status(400).send({ err: "User not found" });
      }

      if (!bcrypt.compareSync(req.body.oldPass, data[0].password)) {
        return res.status(400).send({ err: "Incorrect old password" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send({ err: status500 });
    }
    // update the password
    try {
      const hash = bcrypt.hashSync(req.body.newPass, 10);

      const con = await mysql.createConnection(mysqlConfig);
      const [data] = await con.execute(`
        UPDATE users SET PASSWORD = '${hash}' WHERE id = ${req.user.accountId}
      `);

      await con.end();

      if (!data.affectedRows) {
        console.log(data);
        return res.status(500).send({ err: status500 });
      }

      return res.send({
        msg: "Successfully changed password",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ err: status500 });
    }
  }
);

router.post("/forgot", validation(forgotPassSchema), async (req, res) => {
  try {
    const randomPass = Math.random().toString(36).slice(-8);
    const hash = bcrypt.hashSync(randomPass, 10);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
        UPDATE users SET password = '${hash}'
        WHERE email = ${mysql.escape(req.body.email)}
      `);

    await con.end();

    if (!data.affectedRows) {
      console.log(data);
      return res.status(500).send({ err: status500 });
    }

    const response = await fetch(mailServer, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: mailServerPassword,
        email: req.body.email,
        message: `Your temporary password is ${randomPass}`,
      }),
    });
    const json = await response.json();
    console.log(json.info);
    console.log(randomPass);

    return res.send({
      msg: `Temporary password was sent to ${req.body.email}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: status500 });
  }
});

module.exports = router;
