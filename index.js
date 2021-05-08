const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express')
const fs = require('fs');
const reader = require('maxmind');

console.log(process.env.GEODB_CITY);
console.log(process.env.GEODB_ASN);
console.log(process.env.GEODB_COUNTRY);

const cityDbBuffer = fs.readFileSync(process.env.GEODB_CITY);
const cityDb = new reader.Reader(cityDbBuffer);

const app = express();

const port = process.env.PORT || 80;

app.get('/ping', (req, res) => {
    res.send('pong')
});

app.get('/locate',
    async (req, res) => {
        if (!reader.validate(req.query.ip)) {
            res.status(400).send('bad ip');
            return;
        }
        const cityResponse = cityDb.get(req.query.ip);
        const result = {
            ipAddress: req.query.ip,
            countryName: cityResponse['country']['names']['en'],
            cityName: cityResponse['city']['names']['en'],
            latitude: cityResponse['location']['latitude'],
            longitude: cityResponse['location']['longitude'],
            v: 'n'
        }
        res.status(200).json(result);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
