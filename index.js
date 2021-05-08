const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express')
const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;
const validator = require('fluent-validator');


console.log(process.env.GEODB_CITY);
console.log(process.env.GEODB_ASN);
console.log(process.env.GEODB_COUNTRY);

const cityDbBuffer = fs.readFileSync(process.env.GEODB_CITY);
// const asnDbBuffer = fs.readFileSync(process.env.GEODB_ASN);
// const countryDbBuffer = fs.readFileSync(process.env.GEODB_COUNTRY);

const cityDb = Reader.openBuffer(cityDbBuffer);
// const asnDb = Reader.openBuffer(asnDbBuffer);
// const countryDb = Reader.openBuffer(countryDbBuffer);

const app = express();

const port = process.env.PORT || 80;

app.get('/ping', (req, res) => {
    res.send('pong')
});

app.get('/locate',
    (req, res) => {
        const isValid = validator().validate(req.query.ip).isIP().check();
        if (!isValid) {
            res.status(400).send('bad ip');
            return;
        }
        const cityResponse = cityDb.city(req.query.ip);
        const result = {
            countryName: cityResponse['country']['names']['en'],
            ...cityResponse['traits'],
            cityName: cityResponse['city']['names']['en'],
            latitude: cityResponse['location']['latitude'],
            longitude: cityResponse['location']['longitude']
        }
        res.status(200).json(result);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
