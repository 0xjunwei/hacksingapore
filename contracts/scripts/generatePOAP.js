require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const FormData = require("form-data");

let infura_authToken;
let secretKey = process.env.INFURA_API_KEY;
let secretKeyAPI = process.env.INFURA_KEY_SECRET;
infura_authToken = secretKey + ":" + secretKeyAPI;

async function generateImage() {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;
  const endpoint = "https://api.jigsawstack.com/v1/ai/image_generation";

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: "create a single POAP badge for volunteers that participated in a event titled help the elderlies learn coding",
      size: "small",
      model: "sd1.5",
    }),
  };

  try {
    const result = await fetch(endpoint, options);
    if (!result.ok) {
      const errorDetails = await result.text();
      throw new Error(`HTTP error! status: ${result.status}, details: ${errorDetails}`);
    }
    const blob = await result.blob();
    console.log("Blob done");
    // Create a buffer from the blob
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the buffer to IPFS
    const ipfsLink = await uploadFile(buffer);
    console.log('IPFS Link:', ipfsLink);
  } catch (error) {
    console.error('Error generating image:', error);
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
            Authorization: "Basic " + Buffer.from(infura_authToken).toString("base64"),
          },
        }
      );
      const added = response.data;
      let ipfs_link = "https://hacksg.infura-ipfs.io/ipfs/" + added.Hash;
      return ipfs_link;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

// Call the function
generateImage();
