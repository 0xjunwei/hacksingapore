require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

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
    console.log("Blob done")
    // Create a buffer from the blob
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the buffer to a file
    const imageFilePath = path.join(__dirname, 'generated_image.png');
    fs.writeFileSync(imageFilePath, buffer);
    console.log('Image saved successfully:', imageFilePath);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

// Call the function
generateImage();
