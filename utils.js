// Bengali Number to Words Converter data
const BN_ONETH = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ",
                 "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ", "বিশ",
                 "একুশ", "বাইশ", "তেইশ", "চব্বিশ", "পঁচিশ", "ছব্বিশ", "সাতাশ", "আটაშ", "ঊনত্রিশ", "ত্রিশ",
                 "একত্রিশ", "বত্রিশ", "তেত্রিশ", "চৌত্রিশ", "পঁয়ত্রিশ", "ছত্রিশ", "সাতত্রিশ", "আটত্রিশ", "ঊনচল্লিশ", "চল্লিশ",
                 "একচল্লিশ", "বিয়াল্লিশ", "তেতাল্লিশ", "চৌয়াল্লিশ", "পঁয়তাল্লিশ", "ছেচল্লিশ", "সাতচল্লিশ", "আটচল্লিশ", "ঊনপঞ্চাশ", "পঞ্চাশ",
                 "একান্ন", "বায়ান্ন", "তিপ্পান্ন", "চৌয়ান্ন", "পঞ্চান্ন", "ছাপ্পান্ন", "সাতান্ন", "আটান্ন", "ঊনষাট", "ষাট",
                 "একষট্টি", "বাষট্টি", "তেষট্টি", "চৌষট্টি", "পঁয়ষট্টি", "ছেষট্টি", "সাতষট্টি", "আটষট্টি", "ঊনসত্তর", "সত্তর",
                 "একাত্তর", "বাহাত্তর", "তিয়াত্তর", "চৌয়াত্তর", "পঁচাত্তর", "ছিয়াত্তর", "সাতাত্তর", "আটাত্তর", "ঊনআশি", "আশি",
                 "একাশি", "বিয়াশি", "তিরাশি", "চৌরাশি", "পঁচাশী", "ছিয়াশি", "সাতাশি", "আটাশি", "ঊননব্বই", "নব্বই",
                 "একানব্বই", "বানব্বই", "তিরানব্বই", "চৌরানব্বই", "পঁচানব্বই", "ছিয়ানব্বই", "সাতানব্বই", "আটানব্বই", "নিরানব্বই"];

const EN_ONETH = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                 "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
                 "Twenty One", "Twenty Two", "Twenty Three", "Twenty Four", "Twenty Five", "Twenty Six", "Twenty Seven", "Twenty Eight", "Twenty Nine", "Thirty",
                 "Thirty One", "Thirty Two", "Thirty Three", "Thirty Four", "Thirty Five", "Thirty Six", "Thirty Seven", "Thirty Eight", "Thirty Nine", "Forty",
                 "Forty One", "Forty Two", "Forty Three", "Forty Four", "Forty Five", "Forty Six", "Forty Seven", "Forty Eight", "Forty Nine", "Fifty",
                 "Fifty One", "Fifty Two", "Fifty Three", "Fifty Four", "Fifty Five", "Fifty Six", "Fifty Seven", "Fifty Eight", "Fifty Nine", "Sixty",
                 "Sixty One", "Sixty Two", "Sixty Three", "Sixty Four", "Sixty Five", "Sixty Six", "Sixty Seven", "Sixty Eight", "Sixty Nine", "Seventy",
                 "Seventy One", "Seventy Two", "Seventy Three", "Seventy Four", "Seventy Five", "Seventy Six", "Seventy Seven", "Seventy Eight", "Seventy Nine", "Eighty",
                 "Eighty One", "Eighty Two", "Eighty Three", "Eighty Four", "Eighty Five", "Eighty Six", "Eighty Seven", "Eighty Eight", "Eighty Nine", "Ninety",
                 "Ninety One", "Ninety Two", "Ninety Three", "Ninety Four", "Ninety Five", "Ninety Six", "Ninety Seven", "Ninety Eight", "Ninety Nine"];

// Convert English numbers to Bengali digits
function toBengaliNumerals(number) {
  if (number === undefined || number === null) return "";
  const str = String(number);
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return str.replace(/[0-9]/g, (digit) => bnDigits[digit]);
}

// Convert Bengali digits to English digits
function toEnglishNumerals(str) {
  if (!str) return "";
  const enDigits = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  return String(str).replace(/[০-৯]/g, (digit) => enDigits[digit]);
}

// Format numbers as currency
function formatCurrency(amount, lang = "bn") {
  if (isNaN(amount) || amount === null || amount === undefined) amount = 0;
  
  // BD numbering format: 12,34,567.89
  const fixed = amount.toFixed(2);
  const [integerPart, decimalPart] = fixed.split(".");
  
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherParts = integerPart.substring(0, integerPart.length - 3);
  
  if (otherParts !== "") {
    lastThree = "," + lastThree;
  }
  
  const formattedInteger = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  const result = formattedInteger + "." + decimalPart;
  
  return lang === "bn" ? toBengaliNumerals(result) : result;
}

// Translate Integer to Bengali Words
function integerToBengaliWords(num) {
  if (num === 0) return "";
  
  let word = "";
  
  if (Math.floor(num / 10000000) > 0) {
    word += integerToBengaliWords(Math.floor(num / 10000000)) + " কোটি ";
    num %= 10000000;
  }
  
  if (Math.floor(num / 100000) > 0) {
    word += BN_ONETH[Math.floor(num / 100000)] + " লক্ষ ";
    num %= 100000;
  }
  
  if (Math.floor(num / 1000) > 0) {
    word += BN_ONETH[Math.floor(num / 1000)] + " হাজার ";
    num %= 1000;
  }
  
  if (Math.floor(num / 100) > 0) {
    word += BN_ONETH[Math.floor(num / 100)] + " শত ";
    num %= 100;
  }
  
  if (num > 0) {
    word += BN_ONETH[num];
  }
  
  return word.trim();
}

// Translate Decimal to Bengali Words
function numberToBengaliWords(num) {
  if (isNaN(num) || num === null || num === undefined) return "শূন্য";
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = "";
  
  if (integerPart === 0) {
    result = "শূন্য";
  } else {
    result = integerToBengaliWords(integerPart);
  }
  
  if (decimalPart > 0) {
    result += " টাকা এবং " + BN_ONETH[decimalPart] + " পয়সা";
  } else {
    result += "";
  }
  
  return result;
}

// Translate Integer to English Words
function integerToEnglishWords(num) {
  if (num === 0) return "";
  
  let word = "";
  
  // Crore (10 Million in BD system, let's keep crore format for compatibility)
  if (Math.floor(num / 10000000) > 0) {
    word += integerToEnglishWords(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  
  // Lakh (100 Thousand)
  if (Math.floor(num / 100000) > 0) {
    word += EN_ONETH[Math.floor(num / 100000)] + " Lakh ";
    num %= 100000;
  }
  
  // Thousand
  if (Math.floor(num / 1000) > 0) {
    word += EN_ONETH[Math.floor(num / 1000)] + " Thousand ";
    num %= 1000;
  }
  
  // Hundred
  if (Math.floor(num / 100) > 0) {
    word += EN_ONETH[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  
  if (num > 0) {
    word += EN_ONETH[num];
  }
  
  return word.trim();
}

// Translate Decimal to English Words
function numberToEnglishWords(num) {
  if (isNaN(num) || num === null || num === undefined) return "Zero";
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = "";
  
  if (integerPart === 0) {
    result = "Zero";
  } else {
    result = integerToEnglishWords(integerPart);
  }
  
  if (decimalPart > 0) {
    result += " Taka and " + EN_ONETH[decimalPart] + " Paisa";
  } else {
    result += "";
  }
  
  return result;
}

// Export to CSV helper
function downloadCSV(csvContent, filename) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export variables if environment supports node modules, otherwise let them exist globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    toBengaliNumerals,
    toEnglishNumerals,
    formatCurrency,
    numberToBengaliWords,
    numberToEnglishWords,
    downloadCSV
  };
}
