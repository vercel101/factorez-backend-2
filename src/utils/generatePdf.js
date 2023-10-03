const Puppeteer = require("puppeteer");
var hbs = require("handlebars");
var fs = require("fs");
const path = require("path");

const generatePdf = async (invData, footerText) => {
    const templatePath = path.resolve("invoice.hbs");
    const content = fs.readFileSync(templatePath, "utf8");
    const template = hbs.compile(content);
    let html = template(invData);
    const browser = await Puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html);

    await page.addStyleTag({ content: ".pageNumbers { content: counter(page) }" })
    let pdf = await page.pdf({
        format:'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `<div style='width:100%; font-size:10px; text-align: end; font-weight: 600; padding-right:20px'>${footerText}<span style="margin-left:5px;"><span class='pageNumber'></span><span>/</span><span class='totalPages'></span></span></div>`,
    });
    await browser.close();
    return pdf;
};

module.exports = { generatePdf };


// const data = {
//     logo: "",
//     brandName: "",
//     soldBy: "",
//     soldByAddress: "",
//     soldByGst: "",
//     invoiceNo: "",
//     orderId: "",
//     orderDate: "",
//     invoiceDate: "",
//     billToName: "",
//     billToAddress: "",
//     billToPhone: "",
//     billToGST: "",
//     shipToName: "",
//     shipToAddress: "",
//     shipToPhone: "",
//     shipToGST: "",
//     tableRow: [],
//     totalAmt: "",
//     totalCGSTAmt: "",
//     totalSGSTAmt: "",
//     totalIGSTAmt: "",
//     taxableAmt: "",
//     totalTaxAmt: "",
//     grossTotalAmt: "",
//     discountAmt: "",
//     netPayableAmount: "",
// };