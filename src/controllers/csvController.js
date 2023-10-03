const csvModel = require("../models/csvModel");
// const fs = require('fs');
const path = "./pulbic/uploads";
const csv = require("csvtojson");
const CsvParser = require('json2csv').Parser;
const { response } = require("express");

// IMPORT CSV
const importCSV = async (req, res) => {
  try {
    let csvData = [];
    csv()
      .fromFile(req.file.path)
      .then(async (response) => {
        console.log(response);
        for (let i = 0; i < response.length; i++) {
          csvData.push({
            name: response[i].Name,
            email: response[i].Email,
            mobile: response[i].Mobile,
          });
        }

        await csvModel.insertMany(csvData);
        console.log(csvData);
        return res
          .status(200)
          .send({ status: true, message: "success", data: csvData });
      });
  } catch (error) {
    return res.status(500).send({ status: true, message: error.message });
  }
};


// EXPORT CSV
const exportCSV = async (req, res) => {
    try {

        let users = [];
        let usersData = await csvModel.find();

        usersData.forEach((user)=>{
            const { id, name, email, mobile } = user;
            users.push({ id, name, email, mobile });
        })

        const csvFields = ['Id', 'Name', 'Email', 'Mobile'];
        const csvParser = new CsvParser({csvFields});
        const csvData = csvParser.parse(users);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment: filename=usersData.csv");
        return res.status(200).end(csvData);
    } catch (error) {
        return res.status(500).send({ status: true, message: error.message });
    }
}

module.exports = { importCSV, exportCSV };
