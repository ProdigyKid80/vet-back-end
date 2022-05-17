const express = require("express");
const cors = require("cors");

const { serverPort } = require("./config");

const userRoutes = require("./routes/v1/users");
const petRoutes = require("./routes/v1/pets");
const logRoutes = require("./routes/v1/logs");
const docRoutes = require("./routes/v1/documents");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("hey, its a vet app server");
});

app.use("/v1/users", userRoutes);
app.use("/v1/pets", petRoutes);
app.use("/v1/logs", logRoutes);
app.use("/v1/documents", docRoutes);

app.all("*", (req, res) => {
  res.status(404).send({ err: "Page not found" });
});

app.listen(serverPort, () =>
  console.log(`The server is running on port ${serverPort}`)
);
