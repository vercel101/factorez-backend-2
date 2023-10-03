const mongoose = require("mongoose");
const slugify = require("slugify");
const ObjectId = mongoose.Schema.Types.ObjectId;

const productSchema = new mongoose.Schema(
    {
        product_name: {
            type: String,
            required: true,
            trim: true,
        },

        sku_code: {
            type: String,
            required: true,
            trim: true,
        },
        hsn_code: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        mrp: {
            type: Number,
            required: true,
        },
        gst: {
            type: Number,
            required: true,
        },

        seller_price: {
            type: Number,
            required: true,
        },
        sellingGST: {
            type: Number,
        },
        margin: {
            type: Number,
        },

        stockStatus: {
            type: String,
            enum: ["In_stock", "Out_of_stock"],
            default: "In_stock",
        },

        qty_in_hand: {
            type: Number,
            required: true,
            trim: true,
        },

        min_order_qty: {
            type: Number,
            required: true,
            trim: true,
        },
        lotSizeQty: [
            {
                type: String,
                required: true,
                trim: true,
            },
        ],
        color_id: [
            {
                type: ObjectId,
                ref: "Color",
            },
        ],
        sole: {
            type: String,
            required: true,
            trim: true,
        },

        material: {
            type: String,
            required: true,
            trim: true,
        },
        packing_type: {
            type: String,
            required: true,
            trim: true,
        },

        made_in: {
            type: String,
            required: true,
            trim: true,
        },

        weight: {
            type: Number,
            trim: true,
        },

        categoryId: {
            type: ObjectId,
            ref: "Category",
            required: true,
        },
        subCatId: {
            type: ObjectId,
            ref: "Subcategory",
            required: true,
        },

        thumbnail_pic: {
            type: String,
        },

        multiple_pics: [
            {
                type: String,
            },
        ],

        meta_title: {
            type: String,
        },

        meta_keywords: {
            type: String,
        },

        meta_description: {
            type: String,
        },

        slug: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Approved", "Pending", "Rejected"],
            default: "Pending",
        },

        brandId: {
            type: ObjectId,
            ref: "Brand",
        },

        vendor_id: {
            type: ObjectId,
            ref: "Vendor",
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

productSchema.pre("validate", function (next) {
    if (this.product_name) {
        let product = this.product_name + " " + this.sku_code;
        this.slug = slugify(product, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);
