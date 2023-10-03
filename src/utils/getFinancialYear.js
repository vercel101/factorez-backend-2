const financialYear = () => {
    let date = new Date();
    let currentYear = date.getFullYear();
    let currentMonth = date.getMonth() + 1;
    let year = "";
    if (currentMonth < 4) {
        year = currentYear - 1;
    } else {
        year = currentYear;
    }
    return year.toString().slice(2);
};

module.exports = { financialYear };
