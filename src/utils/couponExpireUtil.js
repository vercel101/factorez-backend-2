const isExpiryCoupon = (validTill) => {
    let day = validTill.getDate();
    let month = validTill.getMonth() + 1;
    let year = validTill.getFullYear();
    let expiryDateMS = new Date(`${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day}`).getTime() / 1000;

    let now = Date.now();
    // let date = new Date(now + (5.5 * (3600 * 1000))); // Deployment time cases for +5:30 GMT
    let date = new Date();
    let dateStr = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
    let currentDateMS = new Date(dateStr).getTime() / 1000;

    return currentDateMS <= expiryDateMS ? false : true;
};

module.exports = { isExpiryCoupon };
