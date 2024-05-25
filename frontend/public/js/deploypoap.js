require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const factoryAddress = "0x4B6772a737eCC47326911b7073d7D079A94D80F8";

let infura_authToken;
let secretKey = process.env.INFURA_API_KEY;
let secretKeyAPI = process.env.INFURA_KEY_SECRET;
infura_authToken = secretKey + ":" + secretKeyAPI;

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
      prompt:
        "create a single POAP badge for volunteers that participated in a event titled ${eventTitle}",
      size: "small",
      model: "sd1.5",
    }),
  };

  try {
    const result = await fetch(endpoint, options);
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
          Authorization:
            "Basic " + Buffer.from(infura_authToken).toString("base64"),
        },
      }
    );
    const added = response.data;
    let ipfs_link = "https://hacksg.infura-ipfs.io/ipfs/" + added.Hash;
    ipfs_link = ipfslink + "#";
    return ipfs_link;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}
let account;
const connectMetamask = async () => {
  if (typeof window.ethereum !== "undefined") {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    document.getElementById("wallet").innerHTML =
      "Connected wallet address: " + account;

    // hide button after connecting
    var button = document.getElementById("myButton");
    button.style.display = "none";
  } else {
    console.log("Please install MetaMask.");
  }
};

const deployPOAP = async () => {
  var titleOfPOAP = document.getElementById("name").value;
  var ipfslink = await generateImage(titleOfPOAP);

  approvalInstance = await new Web3(window.ethereum);
  factoryContract = await new approvalInstance.eth.Contract(
    factory_ABI,
    factoryAddress
  );
  const deployPOAP = await factoryContract.methods
    .deployPOAP(account, "POAP NAME", "PN", ipfslink)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      $("#txStatus").text("Transaction Hash:" + hash);
    })
    .on("receipt", (receipt) => {
      $("#txStatus").text("Successfully deployed poap !");
    })
    .on("error", (error) => {
      $("#txStatus").text("An error occurred, please try again !");
    });
};
