const fetch = require("node-fetch-commonjs");
const axios = require("axios");
const express = require("express");
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');
const { Blob } = require('buffer');

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
      const file_blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      form.append('file', file_blob, req.file.originalname);
    }

    let body = req.file ? form : JSON.stringify(req.body);

    let response = await axios({
      method: req.method.toLowerCase(),
      url: `http://localhost:8080${req.path.replace(/\)$/, '')}`, // Remove trailing parenthesis
      data: body,
      headers,
      params: { ...req.query },
      responseType: "json", // Changed to 'json' to automatically parse JSON
    });

    console.log(`Response status: ${response.status}`);
    console.log('Response data:', response.data);

    return res.status(response.status).json(response.data); // Return response directly
  } catch (error) {
    console.error('Error:', error);

    if (error.response) {
      // Propagate the actual status code from the backend
      console.error('Backend response status:', error.response.status);
      console.error('Backend response data:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    } else {
      // Handle other errors (e.g., network errors)
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

module.exports = {
  IHateCORSResource,
};
