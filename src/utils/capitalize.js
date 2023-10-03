const capitalizeString = (text) => {
    text = text.toLowerCase();
    let arr = text.replaceAll("_", " ");
    arr = arr.split(" ");
    let str2 = "";
    for (let x of arr) {
        str2 += x.charAt(0).toUpperCase() + x.slice(1) + " ";
    }
    str2 = str2.trim();
    return str2;
};

module.exports = { capitalizeString };
