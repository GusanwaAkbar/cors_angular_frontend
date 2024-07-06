const fetch = require("node-fetch-commonjs");
const axios = require("axios");
const express = require("express");
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');

const IHateCORSResource = express.Router();

IHateCORSResource.use("", upload.single('file'), async (req, res) => {
  try {
    console.log(`Received request: ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);
    console.log('Body:', req.body);

    let headers = {
      "Content-Type": req.headers["content-type"],
      Authorization: req.headers["authorization"],
    };

    let form = new FormData();

    if (req.file) {
      form.append('file', req.file.buffer, req.file.originalname);
      headers = form.getHeaders(headers);
    }

    let response = await axios({
      method: req.method.toLowerCase(),
      url: `http://localhost:8080${req.path.replace(/\)$/, '')}`, // Remove trailing parenthesis
      data: req.file ? form : req.body,
      headers,
      params: { ...req.query },
      responseType: 'arraybuffer' // This is important for binary file responses
    });

    console.log(`Response status: ${response.status}`);
    console.log('Response headers:', response.headers);

    // Set the response headers to match the original response
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value);
    }

    return res.status(response.status).send(response.data); // Send raw data directly
  } catch (error) {
    console.error('Error:', error);

    if (error.response) {
      // Propagate the actual status code from the backend
      console.error('Backend response status:', error.response.status);
      console.error('Backend response data:', error.response.data);
      return res.status(error.response.status).send(error.response.data);
    } else {
      // Handle other errors (e.g., network errors)
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = {
  IHateCORSResource,
};
