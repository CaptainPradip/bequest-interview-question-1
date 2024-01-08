import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import {
  verifyUser,
  hashData,
  SECRET_KEY,
  readPrivateAndPublicKey,
  encryptData,
  decryptData,
} from "./util";


const PORT = 8080;
const app = express();

// database
const database = { data: "Hello World", hash: "", encryptedData: "" };
// backup database
const backupDatabase = { data: "Hello World", hash: "", encryptedData: "" };

app.use(cors());
app.use(express.json());

readPrivateAndPublicKey();

// Init data
const initData = () => {
  database.hash = hashData(database.data);
  backupDatabase.hash = hashData(database.data);
  const { encryptedData } = encryptData(database.data);
  database.encryptedData = encryptedData;
  backupDatabase.encryptedData = encryptedData;
};

// this route is used for getting the data
app.get("/", verifyUser, (req, res) => {
  res
    .status(200)
    .json({ data: database.data, encryptedData: database.encryptedData });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    const token = jwt.sign({ username: username }, SECRET_KEY || "", {
      expiresIn: "1h",
    });
    res.status(200).json({ token: token });
  } else {
    res.status(400).json({ msg: "Invalid credentials" });
  }
});

app.post("/", verifyUser, (req, res) => {
  const clientData = req.body.data;
  const encryptedData = req.body.encryptedData;
  if (!clientData || !encryptedData) {
    res.status(400).json({ msg: "Invalid data" , status: false});
    return;
  }
  try {
    const { data, hash } = decryptData(encryptedData);
    const serverHashHex = database.hash;

    if (serverHashHex === hash) {
      database.encryptedData = encryptData(clientData).encryptedData;
      database.data = clientData;
      database.hash = hashData(clientData);
      backupDatabase.encryptedData = encryptData(clientData).encryptedData;
      backupDatabase.data = clientData;
      backupDatabase.hash = hashData(clientData);
      res.json({ data: database.data, msg: "Data Updated Successfully" , status: true});
    } else {
      res.sendStatus(400);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Data is tempered or invalid" , status: false});
  }
});

app.post("/encrypt", (req, res) => {
  try {
    const data = req.body.data;
    const { encryptedData, hash } = encryptData(data);
    res.json({ encryptedData: encryptedData });
  } catch (error: any) {
    console.error("Error encrypting data:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/decrypt", (req, res) => {
  try {
    const encryptedData = req.body.encryptedData;
    try {
      const { data } = decryptData(encryptedData);
      res.json({ data: data });
    } catch (error) {}
  } catch (error: any) {
    console.error("Error decrypting data:", error.message);
    res.status(400).json({ error: "Invalid data" });
  }
});
// Verify routes used for verifying data
app.post("/verify", (req, res) => {
  const clientData = req.body.data; // normal text
  const encrypted = req.body.encryptedData; // encrypted text
  const clientHash = hashData(clientData);
  const { data, hash } = decryptData(encrypted);
  const serverHashHex = database.hash; // data base hash of original data
  if (hash === clientHash && serverHashHex === hash && data === clientData) {
    res.status(200).json({
      msg: "Data is verified",
      status: true
    });
  } else {
    res.status(400).json({ msg: "Data is tempered or invalid", status: false });
  }
});

// Backup routes used for restoring data
app.get("/retrieve-backup-data", verifyUser, (req, res) => {
  const { data } = decryptData(backupDatabase.encryptedData);
  const encryptedData = encryptData(data);
  res
    .status(200)
    .json({ data: data, encryptedData: encryptedData.encryptedData });
});

app.listen(PORT, () => {
  initData();
  readPrivateAndPublicKey();
  console.log("Server running on port " + PORT);
});
