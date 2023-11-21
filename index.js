const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/city-info', async (req, res) => {
  try {
    const cityName = req.query.city;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required.' });
    }

    // Fetch city details from Geonames API
    const geoNamesUrl = `http://api.geonames.org/searchJSON?q=${cityName}&maxRows=1&username=${process.env.GEONAMES_USERNAME}`;
    const geoNamesResponse = await axios.get(geoNamesUrl);
    const cityDetails = geoNamesResponse.data.geonames[0];

    if (!cityDetails) {
      return res.status(404).json({ error: 'City not found.' });
    }

    // Fetch current time from TimezoneDB API
    const timezoneDbUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=${process.env.TIMEZONE_DB_KEY}&format=json&by=position&lat=${cityDetails.lat}&lng=${cityDetails.lng}`;
    const timezoneDbResponse = await axios.get(timezoneDbUrl);
    const currentTime = new Date(timezoneDbResponse.data.formatted);

    // Prepare the response data
    const cityData = {
      country: cityDetails.countryName,
      state: cityDetails.adminName1 || '',
      population: cityDetails.population || 0,
      currentTime: currentTime.toISOString(),
    };

    res.json(cityData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});