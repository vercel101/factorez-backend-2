var excel = require('excel4node');
const csvFile = 'csv.csv';
const csv2json = require('csvtojson');
const csvToJson = async (data) => {
    console.log(csvFile);
    console.log(data);
    csv2json().fromFile(data).then(res => {
        console.log(res);
    })
}


const csvProductInportVerify = () => {
    {
        "Product Name"
        "SKU CODE"
        "Brand ID"
        "Article ID"
        "Category ID"
        "Sub Category ID"
        "Color ID"
        "Lot Size"
        "MRP	Seller Price"
        "Selling Price"
        "In Hand QTY"
        "Min Order QTY"
        "Sole"
        "Upper Material"
        "Packing Type"
        "Made In Weight"
        "Description"
        "Thumbnail URL"
        "Multiple Images"
    }
}


module.exports = { csvToJson }