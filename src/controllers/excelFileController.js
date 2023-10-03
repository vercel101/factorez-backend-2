const excelJs = require("exceljs");
const csv2json = require("csvtojson");
let csvToJsonC = require("convert-csv-to-json");
const request = require("request");
const vendorModel = require("../models/vendorModel");
const categoryModel = require("../models/categoryModel");
const colorModel = require("../models/colorModel");
const { uploadFile } = require("./imageController");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const { dateToLocalDateTime } = require("../utils/dateUtils");

const checkProductIds = async (req, res, product) => {
    let categoryIds = {};
    let colorIds = {};
    let vednorIdForx = "";
    if (req.userModel === "ADMIN") {
        let x = await vendorModel.findOne({ vendor_unique_id: product.vendor_id }).populate("brand_id");
        vednorIdForx = x._id;
    }
    if (Object.keys(categoryIds).length === 0) {
        let x = await categoryModel.find();
        for (let x1 of x) {
            categoryIds[x1._id] = x1.sub_category;
        }
    }
    if (Object.keys(colorIds).length === 0) {
        let x = await colorModel.find();
        for (let x1 of x) {
            colorIds[x1._id] = x1._id;
        }
    }

    if (product.brandId === "" || product.color_id === "" || product.categoryId === "" || product.subCatId === "") {
        return {
            status: false,
            message: "Please Provide All Dependent Ids for brand, color, category and sub category",
        };
    }
    if (categoryIds[product.categoryId] !== undefined) {
        if (!categoryIds[product.categoryId].includes(product.subCatId)) {
            return { status: false, message: "Invalid Sub Category Id" };
        }
    } else {
        return { status: false, message: "Invalid Category Id" };
    }

    if (product.color_id.length > 0) {
        // console.log(colorIds);
        console.log(colorIds, product.color_id);
        for (let x of product.color_id) {
            // console.log(colorIds, x);
            if (x !== "" && colorIds[x] === undefined) {
                return { status: false, message: "Invalid Color Id" };
            }
        }
    } else {
        return { status: false, message: "Color id required" };
    }
    return {
        status: true,
        message: "Everyhting is ok",
        vendorId: vednorIdForx,
    };
};

const exportIDs = async (req, res) => {
    //req.userModel === 'ADMIN' || 'VENDOR'
    //req.userId
    try {
        var workbook = new excelJs.Workbook();
        var worksheet = workbook.addWorksheet("Brand");
        var worksheet2 = workbook.addWorksheet("Category & SubCategory & Colors");

        let categories = await categoryModel.find().populate("sub_category");
        let colors = await colorModel.find();
        worksheet2.columns = [
            { header: "Category ID", key: "category_id" },
            { header: "Category Name", key: "category_name" },
            { header: "SubCategory ID", key: "subcategory_id" },
            { header: "SubCategory Name", key: "subcategory_name" },
        ];
        for (let cat of categories) {
            Object.keys(cat["sub_category"]).forEach((keys) => {
                worksheet2.addRow({
                    category_id: cat["_id"].toString(),
                    category_name: cat["category_name"],
                    subcategory_id: cat["sub_category"][keys]._id.toString(),
                    subcategory_name: cat["sub_category"][keys].subcategory_name,
                });
            });
        }
        if (req.userModel === "ADMIN") {
            let vendors = await vendorModel.find({ isActive: "Active", status: "Approved" }).populate("brand_id");

            worksheet.columns = [
                { header: "Vendor ID", key: "vendor_unique_id" },
                { header: "Firm Name", key: "firmName" },
                { header: "Brand ID", key: "brand_id" },
                { header: "Brand Name", key: "brand_name" },
            ];

            for (let singleVendor of vendors) {
                Object.keys(singleVendor["brand_id"]).forEach(function (key) {
                    if (singleVendor.marginInPercentage > 0) {
                        worksheet.addRow({
                            vendor_unique_id: singleVendor["vendor_unique_id"].toString(),
                            firmName: singleVendor["firmName"],
                            brand_id: singleVendor["brand_id"][key]._id.toString(),
                            brand_name: singleVendor["brand_id"][key].brand_name,
                        });
                    }
                });
            }
        } else {
            let singleVendor = await vendorModel
                .findById({
                    _id: req.userId,
                    isActive: "Active",
                    status: "Approved",
                })
                .populate("brand_id");
            worksheet.columns = [
                { header: "Brand ID", key: "brand_id" },
                { header: "Brand Name", key: "brand_name" },
            ];
            Object.keys(singleVendor["brand_id"]).forEach(function (key) {
                worksheet.addRow({
                    brand_id: singleVendor["brand_id"][key]._id.toString(),
                    brand_name: singleVendor["brand_id"][key].brand_name,
                });
            });
        }

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F08080" },
            };
        });
        worksheet2.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "9E99F7" },
            };
        });
        worksheet2.addRow();
        worksheet2.addRow({
            category_id: "Color ID",
            category_name: "Color Name",
        });
        worksheet2.lastRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.pattern = "solid";
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F08080" },
            };
        });
        for (let obj of colors) {
            worksheet2.addRow({
                category_id: obj._id.toString(),
                category_name: obj.colorName,
            });
        }
        worksheet.columns.forEach((column) => {
            const lengths = column.values.map((v) => v.toString().length);
            const maxLength = Math.max(...lengths.filter((v) => typeof v === "number"));
            column.width = maxLength + 3;
        });
        worksheet2.columns.forEach((column) => {
            const lengths = column.values.map((v) => v.toString().length);
            const maxLength = Math.max(...lengths.filter((v) => typeof v === "number"));
            column.width = maxLength + 3;
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; brandid.xlsx`);

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const exportProductAddDemoSheet = async (req, res) => {
    //req.userModel === 'ADMIN' || 'VENDOR'
    try {
        var workbook = new excelJs.Workbook();
        var worksheet = workbook.addWorksheet("Add Bulk Product");

        let columnData = [
            { header: "Product Name", key: "product_name" },
            { header: "SKU CODE", key: "skucode" },
            { header: "HSN CODE", key: "hsncode" },
            { header: "Brand ID", key: "brand_id" },
            { header: "Category ID", key: "category_id" },
            { header: "Sub Category ID", key: "subcategory_id" },
            { header: "Color ID", key: "color_id" },
            { header: "Lot Size", key: "lotsize" },
            { header: "MRP", key: "mrp" },
            { header: "GST", key: "gst" },
            { header: "Seller Price", key: "seller_price" },
            { header: "In Hand QTY", key: "in_hand_qty" },
            { header: "Min Order QTY", key: "min_order_qty" },
            { header: "Sole", key: "sole" },
            { header: "Material", key: "material" },
            { header: "Packing Type", key: "packing_type" },
            { header: "Made In", key: "made_in" },
            { header: "Weight", key: "weight" },
            { header: "Description", key: "description" },
            { header: "Thumbnail URL", key: "thumbnail_url" },
            { header: "Multiple Images", key: "multiple_images" },
        ];
        var data = {
            product_name: "Demo prouduct name",
            skucode: "---",
            hsncode: "---",
            brand_id: "64b53---demo---id---747b",
            category_id: "64b53---demo---id---747b",
            subcategory_id: "64b53---demo---id---747b",
            color_id: "64b53---demo---id---747b",
            lotsize: "put multiple lot size seperat by ',' comma",
            mrp: "100",
            gst: "12",
            seller_price: "00",
            in_hand_qty: "00",
            min_order_qty: "0",
            sole: "--",
            material: "--",
            packing_type: "--",
            made_in: "India",
            weight: "0",
            description: "This is demo Description",
            thumbnail_url: "put url here",
            multiple_images: "put multiple url seperated by ',' comma",
        };
        if (req.userModel === "ADMIN") {
            columnData.unshift({ header: "Vendor ID", key: "vendor_id" });
            const newColumnData = [...columnData.slice(0, 12), { header: "Margin", key: "margin" }, { header: "Selling GST", key: "sellingGST" }, ...columnData.slice(12)];
            columnData = newColumnData;
            data.vendor_id = "64b53---demo---id---747b";
            data.margin = 0;
            data.sellingGST = 0;
        }
        worksheet.columns = columnData;
        worksheet.addRow(data);
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "F08080" },
            };
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; brandid.xlsx`);

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const csvToJson = async (req, res) => {
    try {
        vendorIds = {};
        categoryIds = {};
        colorIds = {};
        let csvUrl = await uploadFile(req.files.csv);
        let resJson = [];
        await csv2json()
            .fromStream(request.get(csvUrl))
            .subscribe((json) => {
                if (json["Product Name"] !== "") {
                    resJson.push(json);
                }
            });
        let productData = {
            vendor_id: "",
            product_name: "",
            sku_code: "",
            hsn_code: "",
            brandId: "",
            color_id: "",
            categoryId: "",
            subCatId: "",
            lotSizeQty: "",
            mrp: "",
            gst: "",
            seller_price: "",
            qty_in_hand: "",
            min_order_qty: "",
            sole: "",
            material: "",
            packing_type: "",
            made_in: "",
            weight: "",
            description: "",
        };
        let productDataArr = [];
        let vendorArr = [];
        for (let Obj of resJson) {
            if (Obj["Vendor ID"] !== undefined) {
                productData.vendor_id = Obj["Vendor ID"];
            }
            if (Obj["Product Name"] !== undefined) {
                productData.product_name = Obj["Product Name"];
            }
            if (Obj["SKU CODE"] !== undefined) {
                productData.sku_code = Obj["SKU CODE"];
            }
            if (Obj["HSN CODE"] !== undefined) {
                productData.hsn_code = Obj["HSN CODE"];
            }
            if (Obj["Brand ID"] !== undefined) {
                productData.brandId = Obj["Brand ID"];
            }
            if (Obj["Category ID"] !== undefined) {
                productData.categoryId = Obj["Category ID"];
            }
            if (Obj["Sub Category ID"] !== undefined) {
                productData.subCatId = Obj["Sub Category ID"];
            }
            if (Obj["Color ID"] !== undefined) {
                productData.color_id = Obj["Color ID"].split(",").flatMap((el) => {
                    if (el !== "" && el !== " ") {
                        return el.trim();
                    }
                    return [];
                });
            }
            if (Obj["Lot Size"] !== undefined) {
                productData.lotSizeQty = Obj["Lot Size"].split(",").flatMap((el) => {
                    if (el !== "" && el !== " ") {
                        return el.trim();
                    }
                    return [];
                });
            }
            if (Obj["MRP"] !== undefined) {
                productData.mrp = Number(Obj["MRP"]);
            }
            if (Obj["GST"] !== undefined) {
                productData.gst = Number(Obj["GST"]);
            }
            if (Obj["Seller Price"] !== undefined) {
                productData.seller_price = Number(Obj["Seller Price"]);
            }
            if (Obj["Margin"] !== undefined) {
                productData.margin = Number(Obj["Margin"]);
            }
            if (Obj["Selling GST"] !== undefined) {
                productData.sellingGST = Number(Obj["Selling GST"]);
            }
            if (Obj["In Hand QTY"] !== undefined) {
                productData.qty_in_hand = Number(Obj["In Hand QTY"]);
            }
            if (Obj["Min Order QTY"] !== undefined) {
                productData.min_order_qty = Number(Obj["Min Order QTY"]);
            }
            if (Obj["Sole"] !== undefined) {
                productData.sole = Obj["Sole"];
            }
            if (Obj["Material"] !== undefined) {
                productData.material = Obj["Material"];
            }
            if (Obj["Packing Type"] !== undefined) {
                productData.packing_type = Obj["Packing Type"];
            }
            if (Obj["Made In"] !== undefined) {
                productData.made_in = Obj["Made In"];
            }
            if (Obj["Weight"] !== undefined) {
                productData.weight = Obj["Weight"];
            }
            if (Obj["Description"] !== undefined) {
                productData.description = Obj["Description"];
            }
            if (Obj["Thumbnail URL"] !== undefined) {
                productData.thumbnail_pic = Obj["Thumbnail URL"];
            }
            if (Obj["Multiple Images"] !== undefined) {
                productData.multiple_pics = Obj["Multiple Images"].split(",").map((el) => el.trim());
            }
            if (req.userModel === "VENDOR") {
                productData.vendor_id = req.userId;
            }
            let statusX = await checkProductIds(req, res, productData);
            if (statusX.status) {
                if (req.userModel === "ADMIN") {
                    if (vendorArr.indexOf(statusX.vendorId) === -1) {
                        vendorArr.push(statusX.vendorId);
                    }
                    productData.vendor_id = statusX.vendorId;
                    productData.status = "Approved";
                }
            } else {
                return res.status(400).send({ status: false, message: statusX.message });
            }

            productDataArr.push(productData);
            productData = {
                vendor_id: "",
                product_name: "",
                sku_code: "",
                hsn_code: "",
                brandId: "",
                color_id: "",
                categoryId: "",
                subCatId: "",
                lotSizeQty: "",
                mrp: "",
                gst: "",
                seller_price: "",
                qty_in_hand: "",
                min_order_qty: "",
                sole: "",
                material: "",
                packing_type: "",
                made_in: "",
                weight: "",
                description: "",
                thumbnail_pic: "",
                multiple_pics: [],
            };
            if (req.userModel === "ADMIN") {
                productData.margin = "";
                productData.sellingGST = "";
            }
        }
        if (req.userModel === "ADMIN") {
            let newProductObj = await productModel.insertMany(productDataArr);
            let arr = [];
            for (let vdr of vendorArr) {
                let x = await vendorModel.findById(vdr);
                arr.push(x);
            }
            for (let prdct of newProductObj) {
                let obj = arr.find((e) => e._id.toString() === prdct.vendor_id.toString());
                if (obj) {
                    obj.products.push(prdct);
                }
            }
            for (let vdr of arr) {
                await vdr.save();
            }
        } else {
            let vendorObj = await vendorModel.findById(req.userId);
            let newProductObj = await productModel.insertMany(productDataArr);
            vendorObj.products.push(...newProductObj);
            await vendorObj.save();
        }
        return res.status(200).send({
            status: true,
            message: "Bulk Product Added Successfully",
            data: { categoryIds, colorIds, vendorIds },
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const exportOrderReport = async (req, res) => {
    try {
        let data = req.body;
        let orders = await orderModel
            .find({ _id: { $in: data } })
            .populate([
                "vendorId",
                "payment_id",
                "order_status_id",
                "ordered_products",
                "purchaseInvoice",
                "saleInvoice",
                { path: "CouponCode", strictPopulate: false },
                { path: "customer_id", model: "Customer", strictPopulate: false, populate: { path: "defaultAddress", model: "CustomerAddress", strictPopulate: false } },
            ]);
        let ordersArr = [];
        let orderData = {};
        let productLength = 0;

        for (let order of orders) {
            orderData["orderId"] = order.orderId;
            orderData["orderDate"] = dateToLocalDateTime(order.order_date);
            orderData["invoiceNo"] = order.saleInvoice ? order.saleInvoice.invoiceNo : "";
            orderData["invoiceDate"] = order.saleInvoice ? dateToLocalDateTime(order.saleInvoice.invoiceDate) : "";
            orderData["productsLength"] = order.ordered_products ? order.ordered_products.products.length : "";
            if (order.ordered_products && order.ordered_products.products.length > productLength) {
                productLength = order.ordered_products.products.length;
            }
            if (order.ordered_products) {
                for (let x1 = 0; x1 < order.ordered_products.products.length; x1++) {
                    orderData[`sale_sku_code_${x1 + 1}`] = order.ordered_products.products[x1].skuCode;
                    orderData[`purchase_sku_code_${x1 + 1}`] = order.ordered_products.products[x1].skuCode;
                    orderData[`sale_lotSize_${x1 + 1}`] = order.ordered_products.products[x1].lotSize;
                    orderData[`purchase_lotSize_${x1 + 1}`] = order.ordered_products.products[x1].lotSize;
                    orderData[`sale_gst_percentage_${x1 + 1}`] = order.ordered_products.products[x1].selling_gst;
                    orderData[`purchase_gst_percentage_${x1 + 1}`] = order.ordered_products.products[x1].seller_gst;
                }
            }
            orderData["soldByGst"] = order.saleInvoice ? order.saleInvoice.soldBy.gst : "";
            orderData["customerName"] = order.customer_id.name;
            orderData["customerPhone"] = order.customer_id.phone;
            orderData["customerAddress"] = order.customer_id.defaultAddress.address;
            orderData["customerCity"] = order.customer_id.defaultAddress.city;
            orderData["customerState"] = order.customer_id.defaultAddress.state;
            orderData["customerPincode"] = order.customer_id.defaultAddress.pincode;
            orderData["customerGstNo"] = order.customer_id.gstNo;
            orderData["customerAltPhone"] = order.customer_id.alternate_phone;
            orderData["saleGrandTotal"] = order.grand_total;
            orderData["saleInvGrandTotal"] = order.grand_total;
            orderData["saleDiscount"] = order.discounted_amount;
            orderData["saleNetTotal"] = Number(order.grand_total) - Number(order.discounted_amount);
            orderData["saleTaxableAmt"] = order.total;
            orderData["saleGstType"] = order.saleInvoice ? order.saleInvoice.gstType : "";
            orderData["saleGstAmt"] = order.GST_amount;
            orderData["sellerName"] = order.vendorId.representativeName;
            orderData["sellerPhone"] = order.vendorId.mobileNo;
            orderData["sellerAddress"] = order.vendorId.pickupAddress;
            orderData["sellerCity"] = order.vendorId.pickupCity;
            orderData["sellerState"] = order.vendorId.pickupState;
            orderData["sellerPincode"] = order.vendorId.pickupPincode;
            orderData["sellerGstNo"] = order.vendorId.gstNo;
            orderData["sellerAltNo"] = order.vendorId.altMobileNo;
            orderData["purchaseGrandTotal"] = order.vendorAmtInfo.grandTotal;
            orderData["purchaseInvGrandTotal"] = order.vendorAmtInfo.grandTotal;
            orderData["purchaseNetTotal"] = order.vendorAmtInfo.grandTotal;
            orderData["purchaseTaxableAmt"] = order.vendorAmtInfo.total;
            orderData["purchaseGstType"] = order.purchaseInvoice ? order.purchaseInvoice.gstType : "";
            orderData["purchaseGstAmt"] = order.vendorAmtInfo.gstAmt;
            orderData["orderJourneyFinalStatus"] = order.order_status_id.status;
            for (let orderStatusList of order.order_status_id.statusList) {
                let actionTakenBy = "";
                let updatedDate = dateToLocalDateTime(orderStatusList.updatedAt);
                if (orderStatusList.updatedBy.admin) actionTakenBy = "ADMIN";
                if (orderStatusList.updatedBy.vendor) actionTakenBy = "SELLER";
                orderData[orderStatusList.status] = `${updatedDate} | ${actionTakenBy}`;
            }
            ordersArr.push(orderData);
            orderData = {};
        }
        var workbook = new excelJs.Workbook();
        var worksheet = workbook.addWorksheet("Order Report");
        let orderCol = [
            { header: "Order ID", key: "orderId" },
            { header: "Order date and time", key: "orderDate" },
            { header: "Invoice No", key: "invoiceNo" },
            { header: "Invoice date", key: "invoiceDate" },
            { header: "Order Quantity", key: "productsLength" },
            { header: "factorEz GST", key: "soldByGst" },
            { header: "STATE", key: "orderStatus" },
        ];
        let buyerCol = [
            { header: "Buyer Name", key: "customerName" },
            { header: "Buyer Phone Number", key: "customerPhone" },
            { header: "Full Address", key: "customerAddress" },
            { header: "Buyer City", key: "customerCity" },
            { header: "Buyer State", key: "customerState" },
            { header: "Pincode", key: "customerPincode" },
            { header: "Gst No.", key: "customerGstNo" },
            { header: "alternative phone", key: "customerAltPhone" },
        ];
        let saleCol = [
            { header: "Total Amount", key: "saleGrandTotal" },
            { header: "Discount", key: "saleDiscount" },
            { header: "Final amount/ sales", key: "saleNetTotal" },
            { header: "Invoice Value", key: "saleInvGrandTotal" },
            { header: "Taxable value", key: "saleTaxableAmt" },
            { header: "Gst Type", key: "saleGstType" },
            { header: "Gst amount", key: "saleGstAmt" },
        ];
        let sellerCol = [
            { header: "Seller name", key: "sellerName" },
            { header: "Seller phone Number", key: "sellerPhone" },
            { header: "Full Address", key: "sellerAddress" },
            { header: "Seller City", key: "sellerCity" },
            { header: "Seller State", key: "sellerState" },
            { header: "Pincode", key: "sellerPincode" },
            { header: "Gst No.", key: "sellerGstNo" },
            { header: "alternative phone", key: "sellerAltNo" },
        ];
        let purchaseCol = [
            { header: "Total Amount", key: "purchaseGrandTotal" },
            { header: "Seller Discount", key: "purchaseDiscount" },
            { header: "Final amount/ purchase", key: "purchaseNetTotal" },
            { header: "invoice value", key: "purchaseInvGrandTotal" },
            { header: "Taxable value", key: "purchaseTaxableAmt" },
            { header: "Gst Type", key: "purchaseGstType" },
            { header: "Gst amount", key: "purchaseGstAmt" },
        ];
        let orderJourney = [
            { header: "Final Status", key: "orderJourneyFinalStatus" },
            { header: "Delivered", key: "DELIVERED" },
            { header: "Out For Delivery", key: "OUT_FOR_DELIVERY" },
            { header: "Return delivered to seller/warehouse", key: "RETURNED_RTO_DELIVERED" },
            { header: "Return", key: "RETURNED" },
            { header: "Pickup-done/In transit", key: "PICKUP_DONE" },
            { header: "Pickup-Aligned", key: "PICKUP_ALIGNED" },
            { header: "Ready to dispatch", key: "READY_TO_DISPATCH" },
            { header: "Confirmed/in-process", key: "CONFIRMED" },
            { header: "cancelled", key: "CANCELLED" },
            { header: "Remarks", key: "remarks" },
        ];
        for (let m = 0; m < productLength; m++) {
            let saleSkuCol = { header: `SKU code ${m + 1}`, key: `sale_sku_code_${m + 1}` };
            let purchaseSkuCol = { header: `SKU code ${m + 1}`, key: `purchase_sku_code_${m + 1}` };
            let saleGstCol = { header: `GST percentage ${m + 1}`, key: `sale_gst_percentage_${m + 1}` };
            let purchaseGstCol = { header: `GST percentage ${m + 1}`, key: `purchase_gst_percentage_${m + 1}` };
            let saleLotSizeCol = { header: `Lot Set/Size set ${m + 1}`, key: `sale_lotSize_${m + 1}` };
            let purchaseLotSizeCol = { header: `Lot Set/Size set ${m + 1}`, key: `purchase_lotSize_${m + 1}` };
            saleCol.push(saleSkuCol, saleLotSizeCol, saleGstCol);
            purchaseCol.push(purchaseSkuCol, purchaseLotSizeCol, purchaseGstCol);
        }
        let columnData = [...orderCol, ...buyerCol, ...saleCol, ...sellerCol, ...purchaseCol, ...orderJourney];
        worksheet.columns = columnData;
        for (let x of ordersArr) {
            worksheet.addRow(x);
        }
        let orderLen = orderCol.length;
        let buyerLen = buyerCol.length + orderLen;
        let saleLen = saleCol.length + buyerLen;
        let sellerLen = sellerCol.length + saleLen;
        let purchaseLen = purchaseCol.length + sellerLen;
        let orderJLen = orderJourney.length + purchaseLen;
        worksheet.getRow(1).height = 20;
        worksheet.getRow(1).eachCell((cell, colNum) => {
            cell.border = {
                top: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
            };
            cell.font = { bold: true };
            if (colNum <= orderLen) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "d7ff38" },
                };
            } else if (colNum <= buyerLen) {
                cell.font = { color: { argb: "ffffff" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "2e397d" },
                };
            } else if (colNum <= saleLen) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "cad1fa" },
                };
            } else if (colNum <= sellerLen) {
                cell.font = { color: { argb: "ffffff" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "556b58" },
                };
            } else if (colNum <= purchaseLen) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "07f027" },
                };
            } else {
                cell.font = { color: { argb: "ffffff" } };
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "288a70" },
                };
            }
        });
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; orderReport.xlsx`);
        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { exportProductAddDemoSheet, exportIDs, csvToJson, exportOrderReport };
