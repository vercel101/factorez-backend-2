let roleEnums = {
    MANAGE_MENU: {
        ADD_CATEGORY: "ADD_CATEGORY",
        ADD_SUBCATEGORY: "ADD_SUBCATEGORY",
    },
    MANAGE_PRODUCT: {
        ADD_PRODUCT: "ADD_PRODUCT",
        ALL_PRODUCT: "ALL_PRODUCT",
        PRODUCT_COLOR: "PRODUCT_COLOR",
        PRODUCT_SIZE: "PRODUCT_SIZE",
        BRAND: "BRAND",
        OUT_OF_STOCK_PRODUCTS: "OUT_OF_STOCK_PRODUCTS",
        PRODUCT_REVIEW: "PRODUCT_REVIEW",
    },
    MANAGE_ORDERS: {
        ALL_ORDERS: "ALL_ORDERS",
        CONFIRM_ORDERS: "CONFIRM_ORDERS",
        SHIPPED_ORDER: "SHIPPED_ORDER",
        PICKUP_PENDING: "PICKUP_PENDING",
        DELIVERED_ORDER: "DELIVERED_ORDER",
        RTO_ORDER: "RTO_ORDER",
        RTO_DELIVERED: "RTO_DELIVERED",
        CANCEL_ORDER: "CANCEL_ORDER",
        PARTIAL_DELIVERED: "PARTIAL_DELIVERED",
        HOLD: "HOLD",
        PICKUP_INITIATE: "PICKUP_INITIATE",
    },
    IMPORT_PINCODE: "IMPORT_PINCODE",
    MANAGE_RETURN: {
        RETURN_REQUEST: "RETURN_REQUEST",
        SETTLEMENT_REQUEST: "SETTLEMENT_REQUEST",
        REFUNDED: "REFUNDED",
        SETTLEMENT_REQUEST_CANCEL: "SETTLEMENT_REQUEST_CANCEL",
    },
    ALL_USERS: "ALL_USERS",
    MANAGE_COUPONS: {
        ADD_COUPON: "ADD_COUPON",
        ALL_COUPON: "ALL_COUPON",
    },
    MANAGE_SALES: "MANAGE_SALES",
    HOMEPAGE_MANAGE: "HOMEPAGE_MANAGE",
    MANAGE_VENDOR: {
        ADD_VENDOR: "ADD_VENDOR",
        ALL_VENDOR: "ALL_VENDOR",
        ALL_OUTSTANDING: "ALL_OUTSTANDING",
        ALL_SETTLED: "ALL_SETTLED",
    },
    ADD_EMPLOYEE: "ADD_EMPLOYEE",
    EXPORT_INFORMATION: "EXPORT_INFORMATION",
};
let accessControls = {
    ORDERS: {
        ACCESS: {
            ORDERS_VIEW: false,
            ORDERS_EDIT: false,
            ORDERS_DOWNLOAD: false,
        },
        ORDERS_ALL_ORDERS: "ALL_ORDERS",
        ORDERS_CHANGE_ORDER_STATUS: "CHANGE_ORDER_STATUS",
        ORDERS_ABANDONED_ORDERS: "ABANDONED_ORDERS",
    },
    COUPON: {
        ACCESS: {
            COUPON_VIEW: false,
            COUPON_EDIT: false,
            COUPON_DOWNLOAD: false,
        },
        COUPON_ALL_COUPON: "ALL_COUPON",
        COUPON_ADD_NEW_COUPON: "ADD_NEW_COUPON",
    },
    PRODUCT: {
        ACCESS: {
            PRODUCT_VIEW: false,
            PRODUCT_EDIT: false,
            PRODUCT_DOWNLOAD: false,
        },
        PRODUCT_ALL_PRODUCT: "ALL_PRODUCT",
        PRODUCT_ADD_PRODUCT: "ADD_PRODUCT",
    },
    VENDOR: {
        ACCESS: {
            VENDOR_VIEW: false,
            VENDOR_EDIT: false,
            VENDOR_DOWNLOAD: false,
        },
        VENDOR_ALL_VENDOR: "ALL_VENDOR",
        VENDOR_ADD_VENDOR: "ADD_VENDOR",
        VENDOR_VENDOR_PAYMENT: "VENDOR_PAYMENT",
        VENDOR_VENDOR_MOV: "VENDOR_MOV",
    },
    CUSTOMER: {
        ACCESS: {
            CUSTOMER_VIEW: false,
            CUSTOMER_EDIT: false,
            CUSTOMER_DOWNLOAD: false,
        },
        CUSTOMER_ALL_CUSTOMER: "ALL_CUSTOMER",
        CUSTOMER_CUSTOMER_ORDER_BY_PHONE: "CUSTOMER_ORDER_BY_PHONE",
    },
    SETTING: {
        SETTING_BUSINESS_INFO_SETTING: "BUSINESS_INFO_SETTING",
        SETTING_HOMEPAGE_SETTING: "HOMEPAGE_SETTING",
    },
    REPORT: {
        ACCESS: { REPORT_VIEW: false, REPORT_DOWNLOAD: false },
    },
    SUB_ADMIN: {
        ACCESS: { SUBADMIN_VIEW: false, SUBADMIN_DOWNLOAD: false },
        SUB_ADMIN_ALL_ADMIN: "ALL_ADMIN",
        SUB_ADMIN_ADD_ADMIN: "ADD_ADMIN",
    },
};
const listOfRoleEnums = () => {
    let arr = ["ADMIN"];

    for (let keys in roleEnums) {
        if (typeof roleEnums[keys] === "string") {
            arr.push(roleEnums[keys]);
        } else {
            arr = [...arr, ...Object.values(roleEnums[keys]).flat()];
        }
    }
    return arr;
};

const listOfAccessControll = () => {
    let arr = ["ADMIN"];
    for (let x of Object.keys(accessControls)) {
        if (typeof accessControls[x] !== "string") {
            for (let y of Object.keys(accessControls[x])) {
                if (typeof accessControls[x][y] !== "string") {
                    for (let z of Object.keys(accessControls[x][y])) {
                        arr.push(z);
                    }
                } else {
                    arr.push(y);
                }
            }
        }
    }
    return arr;
};

module.exports = {
    roleEnums,
    listOfRoleEnums,
    accessControls,
    listOfAccessControll,
};
