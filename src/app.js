const express = require("express");
const cors = require("cors");

const { serverPort } = require("./config");

const userRoutes = require("./routes/v1/users");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hey, its a vet app server");
});

app.use("/v1/users", userRoutes);

app.all("*", (req, res) => {
  res.status(404).send({ err: "Page not found" });
});

app.listen(serverPort, () =>
  console.log(`The server is running on port ${serverPort}`)
);
