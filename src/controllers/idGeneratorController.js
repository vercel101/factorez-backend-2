// Generate Random ID of given length
function generateRandomID(length, preFix) {
    let id = preFix ? preFix : '';
    const digits = "0123456789";
    for (let i = 0; i < length - 5; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        id += digits[randomIndex];
    }
    id += Date.now().toString().slice(8);
    return id;
}

// Generate Random AlphaNumeric ID of given length
function generateRandomAlphaNumericID(length) {
    let id = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        id += characters[randomIndex];
    }
    return id;
}

module.exports = { generateRandomID, generateRandomAlphaNumericID };
