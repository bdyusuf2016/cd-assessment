// Default Company List — kept minimal (only real office companies)
const DEFAULT_COMPANIES = [
  {
    "name": "A ONE (BD) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "AAMRA APPARELS LTD (FORMER-TEXAS FASHION WEAR LTD)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "AB FABRICS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "ACTOR SPORTING LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "ADVANTURE CLOTHING CO. (BD) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "ALFA PACKAGES (BANGLADESH) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "ALFA PATTERNS (BANGLADESH) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "ALLIANCE STITCHES LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "ASIAN POLY INDUSTRY",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "AUSTAN LTD (OLD-SIR JUNE (BD) CO. LIMITED)",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "AVERY DENNISON BANGLADESH LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "BANGLA GERMAN LATEX CO. LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "BAXTER BRENTON (BANGLADESH) CLOTHING MANUFACTURING CO. LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "BEN BANGLADESH (PVT) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "BENGAL WINDSOR THERMOPLASTICS  LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "BUILD-UP PLASTICS (BANGLADESH) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "BUREAU VERITAS CONSUMER PRODUCTS SERV:(BD)LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "CHERRY INTIMATE LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "COBA FASHIONS & APPARELS LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "CONTINENTAL SOCKS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "CROYDON KOWLOON DESIGNS LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "DADA (SAVAR) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "DAEYU BANGLADESH LIMITED (EPZ)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "DHAKA BEIJING D. & W. INDUSTRY LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "DHAKA REA LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "DONG BANG FACILITIES (BD) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "DONG CHANG (SAVAR) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "DUDI KNIT FASHION LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "EOS TEXTILE MILLS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "EPIC GARMENTS MANUFACTURING CO LTD, UNIT-02",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "ETACOL BANGLADESH LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "EVER WAY INDUSTRIES",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "EVERWAY CHEMICAL (BD) LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "EXPERIENCE ACCESSORIES CO. LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "EXPERIENCE CLOTHING COMPANY LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FAR EAST BANGLADESH CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FAWNWEAR LIMITED(EPZ)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "FCI (BD) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FEATHERLITE LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "FEM ACCESSORIES LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FINE TREE INDUSTRIES LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "FLAGSHIP DHAKA  CETP (BD) LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FROSTY FASHION LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "FULI INDUSTRIAL LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GEEBEE GARMENTS INDUSTRIES LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GERMAN CHEMICALS LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GLOBAL LABELS (BANGLADESH) LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "GOLD TEX GARMENTS LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GOLDTEX LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GOORYONG (BD) TEXTILE LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "GRAMEEN KNITWEAR LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "GUNZE UNITED LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HANGERS PLUS (BANGLADESH) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HAPUTEX WEAVING & DYEING FACTORY LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HELICON LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "HIN GETAH BANGLADESH LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HI-TECH KNITWEAR LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HO SUNG (BANGLADESH) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HONORWAY TEXTILES & APPA.(PVT.) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "HOP LUN (BANGLADESH) LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "HOP YICK (BANGLADESH) LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "HYOPSHIN CO. LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "IDEAL FASTENER (BD) LTD [OLD: GLOBALMAX TEXTILE CO. LTD]",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "IL KWANG CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "INTIMATE SUPPLIERS LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "JAE MEE EMBOTITCH (PVT) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "K. B. INTERLINING LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "K.B.C. CHEMICALS LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "KAIXI FASHION BANGLADESH CO. LTD(CANCELLED)",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "KAIXI FASHION BANGLADESH CO.LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "KRYOLAN (BANGLADESH) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "KUNG KENG TEXTILE (BANGLADESH) LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "LABEL MAKERS LTD(PROVISIONAL REG.)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "LEGEND ELECTRONICS (PVT) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "LENNY APPARELS LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "LENNY FASHIONS LIMITED (CONTINUOUS BOND)",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "LIK FUNG GARMENT (BANGLADESH) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "LSI INDUSTRIES LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "LZ FASHION WEAR LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "M.Y & UNION (BD) LIMITED (FORMAR RANCON SWEATERS LIMITED)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "MAINETTI BANGLADESH (PVT) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "MALANCHA HOLDINGS LTD(UNITED POWER GENERATION & DISTRIBUTION CO. LTD)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "MEE TICK HANGERS DHAKA LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "MERCHANDISE TESTING LABORATORIES (BD) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "MULTIMAX INTERNATIONAL LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "NEW STAR HI-LON CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "NEW STAR ORIENTAL LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "NIPPON MICRO DEVICE (BD) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "OSMAN INTERLINIG LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "OSPINTER GARMENTS LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "OTL DOUBLEGULL MANUFACTURING CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "PADDOCK'S JEANS LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "PAXAR BANGLADESH LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "QUEEN SOUTH TEXTILE MILLS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "REDPOINT JACKETS LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "REGENCY PACKAGING LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "RETAIL TECHNOLOGIES LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "RING SHINE TEXTILES LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SAVAR DYEING AND FINISHING INDUSTRIES LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SAVAR INDUSTRY (PVT) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SAVAR SPORTSWEAR CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SBC GARMENTS ACCESSORIES MFG (BD) LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SBF LTD (OLD-EXPCOM LIMITED)",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SCREENLINE EMBELLISHERS (BANGLADESH) LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SEJONG (BD) COMPANY LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SGWICUS (BD) LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SHANTA DENIMS LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SHANTA INDUSTRIES LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SHANTA WASH WORKS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SHASHA DENIMS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SHINE FASHION CO. PVT. LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SINSIN POLY LIMITED (OLD- JU HYUNG INDUSTRY CO. LTD)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SOFTEX SWEATER INDUSTRIES (PVT.) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SONAR MANUFACTURING LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SOUTH CHINA BLEACHING & DYEING FACTORY LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "STYRAX FASHIONS LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SUNGNAM TEXTILE MILLS LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SUPERIOR FOOTWEAR CO. LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SUPREX LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "SWAN INTERLINING CO LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "SWAN LON CO. LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "TAIWAN-BANGLA SPECIALIZED TIXTILES LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "TALISMAN LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "TEESTA HIGH FASHIONS LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "TEN CATES PERMESS INTERLINING (BD) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "THE ACCESSORIES LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "TIGERCO LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "UNITED POWER GENERATION & DISTRIBUTION COMPANY LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "VELOX FASHIONS LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "WELFORM APPARELS LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "WIREMECH BD. (PVT.) LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "YKK BANGLADESH PTE LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "YOUNG -A TEXTILE CO LIMITED",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "YOUNG OPTICS (BD) LIMITED (CONTINUOUS BOND)",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "YOUNGONE HI-TECH SPORTSWEAR INDUSTRIES LTD.",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "YOUNGONE SYNTHETIC FIBRE PROD. IND. LTD.",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "ZONG SINE TEXTILE IND. LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "TRENDY TEXTILES LTD",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "M. Y. & UNION (BD) LIMITED",
    "circle": "East",
    "status": "Active"
  },
  {
    "name": "GAVA PRIVATE LTD",
    "circle": "West",
    "status": "Active"
  },
  {
    "name": "Indochine Apparel (Bangladesh) Limited change from BAXTER BRENTON (BANGLADESH) CLOTHING MANUFACTURING CO. LTD.",
    "circle": "West",
    "status": "Active"
  }
];

const DEFAULT_MATERIALS = [
  { code: "1", description: "Waste tiny cut pcs of Fabrics", price: 15.0, unit: "kg" },
  { code: "2", description: "Waste carton", price: 11.0, unit: "kg" },
  { code: "3", description: "Waste Paper roll/cone", price: 14.0, unit: "kg" },
  { code: "4", description: "Waste Polythine", price: 20.0, unit: "kg" },
  { code: "5", description: "Waste Wood", price: 5.0, unit: "kg" },
  { code: "6", description: "Waste thread", price: 15.0, unit: "kg" },
  { code: "7", description: "Waste elastic", price: 15.0, unit: "kg" },
  { code: "8", description: "Waste elastic & thread", price: 15.0, unit: "kg" },
  { code: "9", description: "Waste broken hanger", price: 15.0, unit: "kg" },
  { code: "10", description: "Empty jerry can/(Big/small)", price: 80.0, unit: "pcs" },
  { code: "11", description: "Empty Steel Drum (Big)", price: 400.0, unit: "pcs" },
  { code: "12", description: "Empty steel drum (medium)", price: 320.0, unit: "pcs" },
  { code: "13", description: "Empty steel silicate drum", price: 420.0, unit: "pcs" },
  { code: "14", description: "Empty plastic drum (small)", price: 220.0, unit: "pcs" },
  { code: "15", description: "Empty steel drum (small)", price: 160.0, unit: "pcs" },
  { code: "16", description: "Waste p.p belt", price: 15.0, unit: "kg" },
  { code: "17", description: "Waste belt cover", price: 12.5, unit: "kg" },
  { code: "18", description: "Waste poly chat", price: 12.5, unit: "kg" },
  { code: "19", description: "Waste steel wire", price: 15.0, unit: "kg" },
  { code: "20", description: "Empty plastic container", price: 100.0, unit: "pcs" },
  { code: "21", description: "Empty plastic drum (medium)", price: 320.0, unit: "pcs" }
];

// Translation Dictionary for English and Bengali
const TRANSLATIONS = {
  bn: {
    title: "কাস্টমস শুল্কায়ন ব্যবস্থাপক",
    subtitle: "Customs Assessment Template",
    dashboard: "ড্যাশবোর্ড",
    assessment: "শুল্কায়ন শীট",
    materials: "মালামাল তালিকা",
    settings: "সেটিংস",
    companyName: "প্রতিষ্ঠানের নাম",
    permissionNo: "অনুমতি নং",
    yes: "হ্যাঁ",
    no: "না",
    searchPlaceholder: "কোড বা বিবরণ দিয়ে খুঁজুন...",
    addNewItem: "নতুন আইটেম যোগ করুন",
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল",
    edit: "সম্পাদনা",
    delete: "মুছুন",
    totalItems: "মোট মালামাল প্রকার",
    totalAssessableVal: "সর্বমোট শুল্কায়ন মূল্য (টাকা)",
    totalDutyTax: "সর্বমোট শুল্ক-করাদি (টাকা)",
    inWords: "কথায় : ",
    takaOnly: " টাকা মাত্র।",
    printBtn: "প্রিন্ট (A4)",
    exportBtn: "এক্সেল",
    exportHtml: "HTML ফাইল",
    exportPdf: "PDF ফাইল",
    importBtn: "ডাটা ইম্পোর্ট",
    saveAssessment: "সেভ করুন",
    saveHistory: "সংরক্ষিত ফাইল",
    whatsappShare: "WhatsApp শেয়ার",
    resetBtn: "সব মুছুন (Reset)",
    formulaSettings: "হিসাব সূত্র সেটিংস",
    standardBDFormula: "বাংলাদেশ কাস্টমস সূত্র (ভ্যাট ও এটি স্তরীভূত)",
    simplePercentFormula: "সরল শতকরা সূত্র (সরাসরি শুল্কায়ন মূল্যের উপর)",
    taxRates: "ডিফল্ট ট্যাক্স রেট (%)",
    insuranceRate: "ডিফল্ট ইনস্যুরেন্স চার্জ (%)",
    landingRate: "ডিফল্ট ল্যান্ডিং চার্জ (%)",
    // Table Headers
    sl: "ক্র. নং",
    approveCode: "অনুমোদন নথির ক্রমিক নং",
    description: "বিবরণ",
    unitPrice: "ইউনিট মূল্য (টাকা)",
    unit: "একক",
    qty: "পরিমাণ",
    totalPrice: "সর্বমোট মূল্য (টাকা)",
    insurance: "ইনস্যুরেন্স চার্জ",
    landing: "ল্যান্ড চার্জ",
    assessableVal: "শুল্কায়ন মূল্য (টাকা)",
    cd: "সিডি",
    rd: "আরডি",
    sd: "এসডি",
    vat: "মূসক",
    ait: "এআইটি",
    at: "এটি",
    dutyTax: "শুল্ক-করাদি (টাকা)",
    action: "অ্যাকশন",
    total: "মোট",
    signatures: "সাক্ষরসমূহ",
    preparedBy: "প্রস্তুতকারী",
    checkedBy: "যাচাইকারী",
    approvedBy: "অনুমোদনকারী কাস্টমস কর্মকর্তা"
  },
  en: {
    title: "Customs Assessment Manager",
    subtitle: "Customs Assessment Template",
    dashboard: "Dashboard",
    assessment: "Assessment Sheet",
    materials: "Materials Database",
    settings: "Settings",
    companyName: "Organization Name",
    permissionNo: "Permission No.",
    yes: "Yes",
    no: "No",
    searchPlaceholder: "Search code or description...",
    addNewItem: "Add New Item",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    totalItems: "Total Item Types",
    totalAssessableVal: "Total Assessable Value (BDT)",
    totalDutyTax: "Total Duty & Taxes (BDT)",
    inWords: "In Words: ",
    takaOnly: " Taka Only.",
    printBtn: "Print (A4)",
    exportBtn: "Export CSV",
    exportHtml: "Export HTML",
    exportPdf: "Export PDF",
    importBtn: "Import Data",
    saveAssessment: "Save",
    saveHistory: "Saved History",
    whatsappShare: "WhatsApp Share",
    resetBtn: "Reset All",
    formulaSettings: "Calculation Formula Settings",
    standardBDFormula: "BD Customs Standard (VAT/AT Compounded)",
    simplePercentFormula: "Simple Percentage (Direct on Assessable Value)",
    taxRates: "Default Tax Rates (%)",
    insuranceRate: "Default Insurance Charge (%)",
    landingRate: "Default Landing Charge (%)",
    // Table Headers
    sl: "Sl. No",
    approveCode: "Approve Code",
    description: "Description",
    unitPrice: "Unit Price (Tk)",
    unit: "Unit",
    qty: "Qty",
    totalPrice: "Total Price (Tk)",
    insurance: "Insurance",
    landing: "Landing Charge",
    assessableVal: "Assessable Value (Tk)",
    cd: "CD",
    rd: "RD",
    sd: "SD",
    vat: "VAT",
    ait: "AIT",
    at: "AT",
    dutyTax: "Duty & Taxes (Tk)",
    action: "Action",
    total: "Total",
    signatures: "Signatures",
    preparedBy: "Prepared By",
    checkedBy: "Checked By",
    approvedBy: "Approving Customs Officer"
  }
};

// Export variables if environment supports node modules, otherwise let them exist globally
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DEFAULT_COMPANIES, DEFAULT_MATERIALS, TRANSLATIONS };
}
