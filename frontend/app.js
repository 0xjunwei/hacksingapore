const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const ejs = require("ejs");
const axios = require("axios");
const FormData = require("form-data");
const { Blob } = require("buffer");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const secretKey = process.env.INFURA_API_KEY;
const secretKeyAPI = process.env.INFURA_KEY_SECRET;
const infura_authToken = Buffer.from(`${secretKey}:${secretKeyAPI}`).toString(
  "base64"
);

const port = 8080;

const db = mysql.createConnection({
  connectionLimit: 20,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DBNAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// HOME PAGE SEE LISTINGS

app.get("/", (req, res) => {
  let sql = "SELECT NAME, INFO, PLACE, START, END, POSTER FROM EVENTS";
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    console.log(results);
    res.render("home", { events: results });
  });
});

// ADD NEW LISTING PAGE

app.get("/addlisting", (req, res) => {
  res.render("addlisting");
});

app.post("/upload", upload.single("poster"), (req, res) => {
  const { name, info, place, start, end } = req.body;
  const poster = req.file.buffer;

  const sql =
    "INSERT INTO EVENTS (NAME, INFO, PLACE, START, END, POAP, POSTER) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, info, place, start, end, "abcdefabcdefabcdefabcdefabcdefab", poster],
    (err, result) => {
      if (err) {
        throw err;
      }
      res.redirect("/");
    }
  );
});

app.get("/details/:id", (req, res) => {
  const listingId = req.params.id;
  let sql = "SELECT NAME, INFO, PLACE, START, END, POSTER FROM EVENTS WHERE id = ?";
  db.query(sql, [listingId], (err, results) => {
    if (err) {
      throw err;
    }
    console.log(results);
    res.render("home", { event: results });
  });
});

async function generateImage(eventTitle) {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;
  const endpoint = "https://api.jigsawstack.com/v1/ai/image_generation";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: `create a single POAP badge for volunteers that participated in an event titled ${eventTitle}`,
      size: "small",
      model: "sd1.5",
    }),
  };

  try {
    const fetch = await import("node-fetch"); // Dynamic import
    const result = await fetch.default(endpoint, options);
    if (!result.ok) {
      const errorDetails = await result.text();
      throw new Error(
        `HTTP error! status: ${result.status}, details: ${errorDetails}`
      );
    }
    const blob = await result.blob();
    console.log("Blob done");

    // Create a buffer from the blob
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the buffer to IPFS
    const ipfsLink = await uploadFile(buffer);
    console.log("IPFS Link:", ipfsLink);
    return ipfsLink;
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

async function uploadFile(buffer) {
  const formData = new FormData();
  formData.append("file", buffer, {
    filename: "generated_image.png",
    contentType: "image/png",
  });

  try {
    const response = await axios.post(
      "https://ipfs.infura.io:5001/api/v0/add",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${infura_authToken}`,
        },
      }
    );
    const added = response.data;
    let ipfsLink = `https://hacksg.infura-ipfs.io/ipfs/${added.Hash}`;
    ipfsLink += "#";
    return ipfsLink;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

app.post("/generateImage", async (req, res) => {
  const { eventTitle } = req.body;
  try {
    const ipfsLink = await generateImage(eventTitle);
    console.log("Generated IPFS link:", ipfsLink); // Debugging statement
    res.json({ ipfsLink });
  } catch (error) {
    console.error("Error in /generateImage endpoint:", error); // Debugging statement
    res.status(500).json({ error: "Error generating image" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
