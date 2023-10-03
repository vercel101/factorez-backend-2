const percentage = (num, per) => {
    return (Number(num)*Number(per))/100;
}

const calculateMarginAndSelling = (sellerAmount, margin, sellingGst) => {
    if(Number(sellerAmount) === 0){
        return 0;
    }
  
    let baseAmount = Number(sellerAmount);
    if(Number(margin) === 0){
        return Number(baseAmount.toFixed(2));
    }else{
        let basePlusMarginAmt = percentage(baseAmount, margin) + baseAmount;
        let totalAmt = percentage(basePlusMarginAmt, sellingGst) + Number(basePlusMarginAmt);
        return Number(totalAmt.toFixed(2));
    }
}
module.exports = {percentage,calculateMarginAndSelling};