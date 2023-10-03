const dateToLocalDate = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    return `${day}/${month}/${year}`;
};

const dateToLocalDateTime = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hr = date.getHours();
    let min = date.getMinutes();
    let ampm = hr < 12 ? "AM" : "PM";
    hr = hr % 12;
    hr = hr ? hr : 12;
    hr = hr < 10 ? "0" + hr : hr;
    min = min < 10 ? "0" + min : min;
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    return `${day}/${month}/${year} ${hr}:${min} ${ampm}`;
};

module.exports = { dateToLocalDate, dateToLocalDateTime };
