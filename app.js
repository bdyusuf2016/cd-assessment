/* ================================================================
   CUSTOMS ASSESSMENT MANAGER — app.js v2.0
   All business logic preserved. New: sidebar, toasts, animations.
   ================================================================ */

// === STATE ===
let state = {
  language: "en",
  calculationMethod: "bd",
  defaultRates: {
    cd: 25.0, rd: 8.0, sd: 0.0, vat: 15.0,
    ait: 5.0, at: 7.5, insurance: 1.0, landing: 1.0
  },
  columnVisibility: {
    cd: true, rd: true, sd: true, vat: true, ait: true, at: true
  },
  materials: [],
  companies: [],
  assessmentRows: [],
  savedAssessments: [],
  header: {
    companyName: "GUNGE",
    permissionNo: "15062600"
  }
};

// === INIT ===
function initOnDomReady() {
  // Show login gate if not authenticated
  if (!authIsLoggedIn()) {
    showLoginGate();
  } else {
    hideLoginGate();
    bootApp();
  }

  // Login gate enter-key support
  ["lgUsername", "lgPassword"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") handleLoginGate(); });
  });

  // Attach login button handlers (use IDs to avoid relying on inline onclick)
  const pwdToggle = document.getElementById('lgPwdToggle');
  if (pwdToggle) pwdToggle.addEventListener('click', e => { if (typeof toggleLoginPwd === 'function') toggleLoginPwd(); });
  const submitBtn = document.getElementById('lgSubmitBtn');
  if (submitBtn) submitBtn.addEventListener('click', e => { if (typeof handleLoginGate === 'function') handleLoginGate(); });
  const resetBtn = document.getElementById('lgResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', e => { if (typeof resetLocalLogin === 'function') resetLocalLogin(); });

  // User modal close button
  const closeUserBtn = document.getElementById("closeUserModalBtn");
  if (closeUserBtn) closeUserBtn.addEventListener("click", closeUserModal);
  const userModalEl = document.getElementById("userModal");
  if (userModalEl) userModalEl.addEventListener("click", e => { if (e.target === userModalEl) closeUserModal(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOnDomReady);
} else {
  initOnDomReady();
}

function bootApp() {
  loadData();
  // Always force English as the app language
  state.language = "en";
  document.documentElement.lang = "en";
  recalculateAllRows();
  initSidebar();
  initEventListeners();
  updateUI();
  initColumnVisibilityCheckboxes();
  renderCompanyOptions();
  renderCompanyList();
  if (state.assessmentRows.length === 0) addRow();
  updateTopbarUser();
}

// === LOCAL STORAGE ===
function readStoredJson(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Discarding invalid saved data for ${key}.`, error);
    localStorage.removeItem(key);
    return fallback;
  }
}

function loadData() {
  const storedMaterials = readStoredJson("customs_materials", null);
  state.materials = Array.isArray(storedMaterials) ? storedMaterials : [...DEFAULT_MATERIALS];
  if (!Array.isArray(storedMaterials)) localStorage.setItem("customs_materials", JSON.stringify(state.materials));

  let parsedCompanies = readStoredJson("customs_companies", []);

  // Purge legacy demo companies (inserted in older versions)
  const DEMO_NAMES = [
    "m/s apex spinning & knitting mills ltd.",
    "m/s youngone high-tech sportswear ltd.",
    "m/s beximco synthetics ltd.",
    "m/s square fashions ltd."
  ];
  parsedCompanies = Array.isArray(parsedCompanies)
    ? parsedCompanies.filter(c => !DEMO_NAMES.includes((c.name || "").toLowerCase()))
    : [];

  const isLegacyPlaceholderList = parsedCompanies.length > 0 &&
    parsedCompanies.every(c => (c.name || "").trim().toLowerCase() === "gunge");

  if (parsedCompanies.length === 0 || isLegacyPlaceholderList) {
    parsedCompanies = [...DEFAULT_COMPANIES];
  }
  state.companies = parsedCompanies;
  localStorage.setItem("customs_companies", JSON.stringify(parsedCompanies));

  const storedRates = readStoredJson("customs_default_rates", {});
  if (storedRates && typeof storedRates === "object" && !Array.isArray(storedRates)) {
    state.defaultRates = { ...state.defaultRates, ...storedRates };
  }

  const storedMethod = localStorage.getItem("customs_calc_method");
  if (storedMethod) state.calculationMethod = storedMethod;

  const storedHeader = readStoredJson("customs_header", {});
  if (storedHeader && typeof storedHeader === "object" && !Array.isArray(storedHeader)) {
    state.header = { ...state.header, ...storedHeader };
  }

  const activeCompany = state.companies.find(c => c.status !== "Inactive");
  const headerCompanyValid = state.header.companyName && state.companies.some(c => c.name === state.header.companyName && c.status !== "Inactive");
  if (!headerCompanyValid && activeCompany) {
    state.header.companyName = activeCompany.name;
    saveState();
  }

  const storedRows = readStoredJson("customs_assessment_rows", []);
  state.assessmentRows = Array.isArray(storedRows) ? storedRows : [];

  const storedHistory = readStoredJson("customs_saved_assessments", []);
  state.savedAssessments = Array.isArray(storedHistory) ? storedHistory : [];

  const storedColVis = readStoredJson("customs_column_visibility", {});
  if (storedColVis && typeof storedColVis === "object") {
    state.columnVisibility = { ...state.columnVisibility, ...storedColVis };
  }
}

function saveState() {
  localStorage.setItem("customs_materials",           JSON.stringify(state.materials));
  localStorage.setItem("customs_companies",           JSON.stringify(state.companies));
  localStorage.setItem("customs_default_rates",       JSON.stringify(state.defaultRates));
  localStorage.setItem("customs_calc_method",         state.calculationMethod);
  localStorage.setItem("customs_header",              JSON.stringify(state.header));
  localStorage.setItem("customs_assessment_rows",     JSON.stringify(state.assessmentRows));
  localStorage.setItem("customs_column_visibility",   JSON.stringify(state.columnVisibility));
}

function clearAllCompanies() {
  const confirmed = window.confirm(
    state.language === "bn"
      ? "আপনি কি সত্যিই সব কোম্পানি মুছতে চান? এই কাজটি ফেরানো যাবে না।"
      : "Are you sure you want to clear ALL companies? This cannot be undone."
  );
  if (!confirmed) return;
  state.companies = [];
  state.header.companyName = "";
  saveState();
  renderCompanyOptions();
  renderCompanyList();
  updatePrintHeader();
  showToast(state.language === "bn" ? "সব কোম্পানি মুছে ফেলা হয়েছে।" : "All companies cleared.", "info");
}

// === SIDEBAR ===
function initSidebar() {
  const sidebar   = document.getElementById("sidebar");
  const backdrop  = document.getElementById("sidebarBackdrop");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (window.innerWidth > 900) {
        // Desktop: collapse/expand sidebar
        document.body.classList.toggle("sidebar-collapsed");
      } else {
        // Mobile: slide in/out with backdrop
        sidebar.classList.toggle("open");
        backdrop.classList.toggle("visible");
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("open");
      backdrop.classList.remove("visible");
    });
  }
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) { console.warn(message); return; }

  const iconMap = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || "ℹ️"}</span>
    <span class="toast-msg">${message}</span>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, duration);
}

// === EVENT LISTENERS ===
function initEventListeners() {
  // Language
  document.getElementById("langBtnEn").addEventListener("click", () => setLanguage("en"));
  document.getElementById("langBtnBn").addEventListener("click", () => setLanguage("bn"));

  // Theme toggle
  document.getElementById("themeToggleBtn").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
    const isDark = document.body.classList.contains("dark-mode");
    document.getElementById("themeToggleBtn").textContent = isDark ? "🌓" : "☀️";
  });

  // Calculation method
  document.getElementById("calcMethodSelect").addEventListener("change", (e) => {
    state.calculationMethod = e.target.value;
    saveState();
    recalculateAllRows();
    renderAssessmentTable();
    updateDashboardMetrics();
    showToast(state.language === "bn" ? "হিসাব সূত্র পরিবর্তিত হয়েছে।" : "Calculation method updated.", "info");
  });

  // Default rate inputs
  const rateKeys = ["cd","rd","sd","vat","ait","at","insurance","landing"];
  rateKeys.forEach(key => {
    const el = document.getElementById(`default-${key}`);
    if (!el) return;
    el.value = state.defaultRates[key];
    el.addEventListener("input", (e) => {
      state.defaultRates[key] = parseFloat(e.target.value) || 0;
      saveState();
    });
    el.addEventListener("change", () => {
      // Keep the table-header rate display aligned with the Settings value.
      renderAssessmentTable();
    });
  });

  document.getElementById("applyDefaultsBtn").addEventListener("click", () => {
    if (confirm(state.language === "bn"
      ? "আপনি কি বিদ্যমান সকল লাইনে এই ডিফল্ট রেটগুলো প্রয়োগ করতে চান?"
      : "Do you want to apply these default rates to all existing rows?")) {
      state.assessmentRows.forEach(row => {
        row.cdRate  = state.defaultRates.cd;
        row.rdRate  = state.defaultRates.rd;
        row.sdRate  = state.defaultRates.sd;
        row.vatRate = state.defaultRates.vat;
        row.aitRate = state.defaultRates.ait;
        row.atRate  = state.defaultRates.at;
      });
      saveState();
      recalculateAllRows();
      renderAssessmentTable();
      updateDashboardMetrics();
      showToast(state.language === "bn" ? "সব লাইনে রেট প্রয়োগ করা হয়েছে।" : "Default rates applied to all rows.", "success");
    }
  });

  // Header field bindings
  const headerKeys = ["companyName", "permissionNo"];
  headerKeys.forEach(key => {
    const el = document.getElementById(`header-${key}`);
    if (!el) return;
    if (key !== "companyName") el.value = state.header[key] || "";
    const sync = (e) => {
      state.header[key] = e.target.value;
      saveState();
      updatePrintHeader();
    };
    el.addEventListener("input",  sync);
    el.addEventListener("change", sync);
  });

  // Assessment action buttons
  document.getElementById("addRowBtn").addEventListener("click", () => addRow());
  document.getElementById("saveAssessmentBtn").addEventListener("click", saveCurrentAssessment);
  document.getElementById("savedHistoryBtn").addEventListener("click", openHistoryModal);
  document.getElementById("whatsappShareBtn").addEventListener("click", () => shareToWhatsApp());
  if (document.getElementById("sharePdfWhatsappBtn")) {
    document.getElementById("sharePdfWhatsappBtn").addEventListener("click", () => sharePdfToWhatsApp());
  }
  const inWordsWaBtn = document.getElementById("inWordsWhatsappBtn");
  if (inWordsWaBtn) inWordsWaBtn.addEventListener("click", () => shareToWhatsApp());

  const closeHistBtn = document.getElementById("closeHistoryModalBtn");
  if (closeHistBtn) closeHistBtn.addEventListener("click", closeHistoryModal);
  const closeHistFootBtn = document.getElementById("closeHistoryModalFooterBtn");
  if (closeHistFootBtn) closeHistFootBtn.addEventListener("click", closeHistoryModal);

  document.getElementById("printBtn").addEventListener("click", printFromExportTemplate);
  if (document.getElementById("exportPdfBtn")) document.getElementById("exportPdfBtn").addEventListener("click", exportToPDF);
  if (document.getElementById("exportHtmlBtn")) document.getElementById("exportHtmlBtn").addEventListener("click", exportToHTML);
  document.getElementById("resetBtn").addEventListener("click", resetAllData);
  document.getElementById("exportBtn").addEventListener("click", exportToCSV);
  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFileInput").click());
  document.getElementById("importFileInput").addEventListener("change", importFromCSV);

  // Paste Excel events
  if (document.getElementById("pasteExcelBtn")) {
    document.getElementById("pasteExcelBtn").addEventListener("click", openPasteExcelModal);
  }
  if (document.getElementById("closePasteExcelModalBtn")) {
    document.getElementById("closePasteExcelModalBtn").addEventListener("click", closePasteExcelModal);
  }
  if (document.getElementById("cancelPasteExcelBtn")) {
    document.getElementById("cancelPasteExcelBtn").addEventListener("click", closePasteExcelModal);
  }
  if (document.getElementById("processPasteExcelBtn")) {
    document.getElementById("processPasteExcelBtn").addEventListener("click", handleBulkPasteFromModal);
  }
  const pasteExcelModalEl = document.getElementById("pasteExcelModal");
  if (pasteExcelModalEl) {
    pasteExcelModalEl.addEventListener("click", e => { if (e.target === pasteExcelModalEl) closePasteExcelModal(); });
  }

  // Sidebar navigation
  document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Materials & Company CRUD
  document.getElementById("addNewMaterialBtn").addEventListener("click", () => openMaterialModal());
  document.getElementById("closeModalBtn").addEventListener("click", closeMaterialModal);
  document.getElementById("cancelModalBtn").addEventListener("click", closeMaterialModal);
  document.getElementById("saveMaterialBtn").addEventListener("click", saveMaterial);
  document.getElementById("searchMaterialInput").addEventListener("input", renderMaterialsList);
  document.getElementById("importMaterialsBtn").addEventListener("click", () => document.getElementById("materialsImportFileInput").click());
  if (document.getElementById("downloadSampleMaterialBtn")) {
    document.getElementById("downloadSampleMaterialBtn").addEventListener("click", downloadSampleMaterialTemplate);
  }
  if (document.getElementById("downloadSampleMaterialBtn2")) {
    document.getElementById("downloadSampleMaterialBtn2").addEventListener("click", downloadSampleMaterialTemplate);
  }
  document.getElementById("materialsImportFileInput").addEventListener("change", importMaterialsFromFile);
  document.getElementById("importCompaniesBtn").addEventListener("click", () => document.getElementById("companiesImportFileInput").click());
  document.getElementById("companiesImportFileInput").addEventListener("change", importCompaniesFromFile);
  if (document.getElementById("downloadSampleCompanyBtn")) {
    document.getElementById("downloadSampleCompanyBtn").addEventListener("click", downloadSampleCompanyTemplate);
  }
  if (document.getElementById("importCompaniesCardBtn")) {
    document.getElementById("importCompaniesCardBtn").addEventListener("click", () => document.getElementById("companiesImportFileInput").click());
  }
  if (document.getElementById("addCompanyBtn")) {
    document.getElementById("addCompanyBtn").addEventListener("click", addNewCompany);
  }
  if (document.getElementById("clearAllCompaniesBtn")) {
    document.getElementById("clearAllCompaniesBtn").addEventListener("click", clearAllCompanies);
  }
  if (document.getElementById("saveSupabaseCredsBtn")) {
    document.getElementById("saveSupabaseCredsBtn").addEventListener("click", handleSaveSupabaseCredentials);
  }
  if (document.getElementById("testSupabaseBtn")) {
    document.getElementById("testSupabaseBtn").addEventListener("click", handleTestSupabase);
  }
  if (document.getElementById("copySqlSchemaBtn")) {
    document.getElementById("copySqlSchemaBtn").addEventListener("click", handleCopySqlSchema);
  }
  if (document.getElementById("syncAllToCloudBtn")) {
    document.getElementById("syncAllToCloudBtn").addEventListener("click", handleSyncAllToCloud);
  }

  updateSupabaseUI();

  // Add Company Modal events
  const closeAddCo = document.getElementById("closeAddCompanyModalBtn");
  if (closeAddCo) closeAddCo.addEventListener("click", closeAddCompanyModal);
  const cancelAddCo = document.getElementById("cancelAddCompanyBtn");
  if (cancelAddCo) cancelAddCo.addEventListener("click", closeAddCompanyModal);
  const addCoModal = document.getElementById("addCompanyModal");
  if (addCoModal) addCoModal.addEventListener("click", e => { if (e.target === addCoModal) closeAddCompanyModal(); });
  // Enter key to save
  ["newCompanyName", "newCompanyCircle"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") saveNewCompany(); });
  });

  // Global keyboard shortcuts
  document.addEventListener("keydown", handleGlobalEscape);
}

// === TAB SWITCHING ===
function switchTab(tabId) {
  // Sidebar nav
  document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Tab panels
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `${tabId}-tab`);
  });

  // Topbar action groups
  document.getElementById("assessmentActions").style.display = tabId === "assessment" ? "" : "none";
  document.getElementById("materialsActions").style.display  = tabId === "materials"  ? "" : "none";
  document.getElementById("settingsActions").style.display   = tabId === "settings"   ? "" : "none";

  // Update page name
  const dict = TRANSLATIONS[state.language];
  const pageNames = { assessment: dict.assessment, materials: dict.materials, settings: dict.settings };
  const el = document.getElementById("topbarPageName");
  if (el) el.textContent = pageNames[tabId] || "";

  // Render if needed
  if (tabId === "materials") renderMaterialsList();

  // Close mobile sidebar
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("visible");
}

// === LANGUAGE ===
function setLanguage(lang) {
  state.language = lang;
  document.documentElement.lang = lang;

  document.getElementById("langBtnBn").classList.toggle("active", lang === "bn");
  document.getElementById("langBtnEn").classList.toggle("active", lang === "en");

  updateUI();
}

// === COLUMN VISIBILITY CHECKBOXES ===
function initColumnVisibilityCheckboxes() {
  const keys = ["cd", "rd", "sd", "vat", "ait", "at"];
  keys.forEach(key => {
    const cb = document.getElementById(`col-vis-${key}`);
    if (!cb) return;
    cb.checked = state.columnVisibility[key] !== false;
    cb.addEventListener("change", () => {
      state.columnVisibility[key] = cb.checked;
      saveState();
      renderAssessmentTable();
    });
  });
}

// === FULL UI UPDATE ===
function updateUI() {
  const dict = TRANSLATIONS[state.language];
  document.title = dict.title;

  // Sidebar labels
  document.getElementById("sidebarTitle").textContent     = dict.title;
  document.getElementById("navLabelAssessment").textContent = dict.assessment;
  document.getElementById("navLabelMaterials").textContent  = dict.materials;
  document.getElementById("navLabelSettings").textContent   = dict.settings;

  // Topbar page name (based on active tab)
  const activeTab = document.querySelector(".nav-item.active[data-tab]");
  if (activeTab) {
    const pageNames = { assessment: dict.assessment, materials: dict.materials, settings: dict.settings };
    const el = document.getElementById("topbarPageName");
    if (el) el.textContent = pageNames[activeTab.dataset.tab] || "";
  }

  // Action bar labels
  document.getElementById("lblAddRow").textContent = dict.addNewItem;
  if (document.getElementById("lblSaveAssessment")) document.getElementById("lblSaveAssessment").textContent = dict.saveAssessment;
  if (document.getElementById("lblSavedHistory"))    document.getElementById("lblSavedHistory").textContent    = dict.saveHistory;
  if (document.getElementById("lblWhatsappShare"))   document.getElementById("lblWhatsappShare").textContent   = dict.whatsappShare;
  document.getElementById("lblPrint").textContent  = dict.printBtn;
  if (document.getElementById("lblExportPdf"))  document.getElementById("lblExportPdf").textContent  = dict.exportPdf;
  if (document.getElementById("lblExportHtml")) document.getElementById("lblExportHtml").textContent = dict.exportHtml;
  document.getElementById("lblExport").textContent = dict.exportBtn;
  document.getElementById("lblImport").textContent = dict.importBtn;
  document.getElementById("lblReset").textContent  = dict.resetBtn;

  // Dashboard labels
  document.getElementById("dashLabelItems").textContent   = dict.totalItems;
  document.getElementById("dashLabelVal").textContent     = dict.totalAssessableVal;
  document.getElementById("dashLabelTax").textContent     = dict.totalDutyTax;

  // Form labels
  if (document.getElementById("lblCompanyName")) document.getElementById("lblCompanyName").textContent   = dict.companyName;
  if (document.getElementById("lblHasFile"))       document.getElementById("lblHasFile").textContent       = dict.hasFileNo;
  if (document.getElementById("lblFilePage"))      document.getElementById("lblFilePage").textContent      = dict.filePageNo;
  if (document.getElementById("lblNotePara"))      document.getElementById("lblNotePara").textContent      = dict.noteParaNo;
  if (document.getElementById("lblLetterPage"))    document.getElementById("lblLetterPage").textContent    = dict.letterPageNo;
  if (document.getElementById("lblBepza"))         document.getElementById("lblBepza").textContent         = dict.bepzaRecNo;

  // Excel Paste elements
  if (document.getElementById("lblPasteExcel"))            document.getElementById("lblPasteExcel").textContent = dict.pasteExcelBtn;
  if (document.getElementById("lblPasteExcelModalTitle"))  document.getElementById("lblPasteExcelModalTitle").textContent = dict.pasteExcelModalTitle;
  if (document.getElementById("lblPasteExcelLabel"))       document.getElementById("lblPasteExcelLabel").textContent = dict.pasteExcelLabel;
  if (document.getElementById("excelPasteArea"))           document.getElementById("excelPasteArea").placeholder = dict.pasteExcelPlaceholder;
  if (document.getElementById("processPasteExcelBtn"))     document.getElementById("processPasteExcelBtn").innerHTML = `<span>📋</span> ${dict.importDataBtn}`;
  if (document.getElementById("cancelPasteExcelBtn"))      document.getElementById("cancelPasteExcelBtn").textContent = dict.cancelBtn;

  // Settings
  document.getElementById("lblFormulaTitle").textContent  = dict.formulaSettings;
  document.getElementById("lblTaxRatesTitle").textContent = dict.taxRates;
  document.getElementById("calcMethodSelect").options[0].text = dict.standardBDFormula;
  document.getElementById("calcMethodSelect").options[1].text = dict.simplePercentFormula;
  document.getElementById("applyDefaultsBtn").textContent =
    state.language === "bn" ? "সব লাইনে প্রয়োগ" : "Apply to All Rows";

  // Search placeholder
  document.getElementById("searchMaterialInput").placeholder = dict.searchPlaceholder;

  renderAssessmentTable();
  renderMaterialsList();
  renderCompanyOptions();
  renderCompanyList();
  updateDashboardMetrics();
  updatePrintHeader();
}

// === ROW MANAGEMENT ===
function addRow(data = {}) {
  const rowId = "row_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const newRow = {
    id:          rowId,
    approveCode: data.approveCode || "",
    description: data.description || "",
    unitPrice:   data.price !== undefined ? data.price : 0,
    unit:        data.unit || "kg",
    quantity:    data.quantity !== undefined ? data.quantity : 0,
    totalPrice: 0, insurance: 0, landing: 0, assessableValue: 0,
    cdRate:  state.defaultRates.cd,  rdRate:  state.defaultRates.rd,
    sdRate:  state.defaultRates.sd,  vatRate: state.defaultRates.vat,
    aitRate: state.defaultRates.ait, atRate:  state.defaultRates.at,
    cd: 0, rd: 0, sd: 0, vat: 0, ait: 0, at: 0, totalDutyTax: 0
  };
  state.assessmentRows.push(newRow);
  calculateRow(newRow);
  saveState();
  renderAssessmentTable();
  updateDashboardMetrics();
  return rowId;
}

function calculateRow(row) {
  const qty   = parseFloat(row.quantity)  || 0;
  const price = parseFloat(row.unitPrice) || 0;
  row.totalPrice     = qty * price;
  row.insurance      = row.totalPrice * (state.defaultRates.insurance / 100);
  row.landing        = (row.totalPrice + row.insurance) * (state.defaultRates.landing / 100);
  
  // Assessable Value rounded up to next integer
  row.assessableValue = Math.ceil(row.totalPrice + row.insurance + row.landing);
  const av = row.assessableValue;

  if (state.calculationMethod === "bd") {
    row.cd  = Math.ceil(av * (row.cdRate / 100));
    row.rd  = Math.ceil(av * (row.rdRate / 100));
    row.sd  = Math.ceil((av + row.cd + row.rd) * (row.sdRate / 100));
    row.vat = Math.ceil((av + row.cd + row.rd + row.sd) * (row.vatRate / 100));
    row.ait = Math.ceil(av * (row.aitRate / 100));
    row.at  = Math.ceil((av + row.cd + row.rd + row.sd) * (row.atRate / 100));
  } else {
    row.cd  = Math.ceil(av * (row.cdRate  / 100));
    row.rd  = Math.ceil(av * (row.rdRate  / 100));
    row.sd  = Math.ceil(av * (row.sdRate  / 100));
    row.vat = Math.ceil(av * (row.vatRate / 100));
    row.ait = Math.ceil(av * (row.aitRate / 100));
    row.at  = Math.ceil(av * (row.atRate  / 100));
  }
  row.totalDutyTax = Math.ceil(row.cd + row.rd + row.sd + row.vat + row.ait + row.at);
}

function recalculateAllRows() {
  state.assessmentRows.forEach(row => calculateRow(row));
  saveState();
}

// Update only the readonly-val spans in a single row (no full re-render)
// Span order must match the row template in renderAssessmentTable()
function updateRowInPlace(row, tr) {
  const lang  = state.language;
  const spans = tr.querySelectorAll("span.readonly-val");
  const vals  = [
    row.description,                             // [0] desc
    formatCurrency(row.unitPrice, lang),         // [1] unit price
    row.unit,                                    // [2] unit
    formatCurrency(row.totalPrice, lang),        // [3] total price
    formatCurrency(row.insurance, lang),         // [4] insurance
    formatCurrency(row.landing, lang),           // [5] landing
    formatCurrency(row.assessableValue, lang),   // [6] AV
    formatCurrency(row.cd, lang),                // [7] CD
    formatCurrency(row.rd, lang),                // [8] RD
    formatCurrency(row.sd, lang),                // [9] SD
    formatCurrency(row.vat, lang),               // [10] VAT
    formatCurrency(row.ait, lang),               // [11] AIT
    formatCurrency(row.at, lang),                // [12] AT
    formatCurrency(row.totalDutyTax, lang),      // [13] Duty+Tax
  ];
  spans.forEach((span, i) => {
    if (i < vals.length) span.textContent = vals[i];
  });
}

// Refresh only the totals footer row and in-words panel
function refreshTotals() {
  const tfoot = document.getElementById("assessmentTableFoot");
  if (!tfoot) return;
  const lang = state.language;
  const dict = TRANSLATIONS[lang];

  let totQty=0, totVal=0, totIns=0, totLand=0, totAv=0;
  let totCd=0, totRd=0, totSd=0, totVat=0, totAit=0, totAt=0, totDt=0;

  state.assessmentRows.forEach(r => {
    totQty  += parseFloat(r.quantity) || 0;
    totVal  += r.totalPrice;  totIns  += r.insurance; totLand += r.landing;
    totAv   += r.assessableValue;
    totCd   += r.cd; totRd += r.rd; totSd += r.sd;
    totVat  += r.vat; totAit += r.ait; totAt += r.at;
    totDt   += r.totalDutyTax;
  });

  const qtyDisplay = totQty.toFixed(2);
  const cv = state.columnVisibility;
  tfoot.innerHTML = `
    <tr class="total-row">
      <td colspan="5" class="text-right font-bold" style="padding-right:12px;">${dict.total}:</td>
      <td class="cell-num font-bold">${qtyDisplay}</td>
      <td class="cell-num font-bold">${formatCurrency(totVal,  lang)}</td>
      <td class="cell-num font-bold">${formatCurrency(totIns,  lang)}</td>
      <td class="cell-num font-bold">${formatCurrency(totLand, lang)}</td>
      <td class="cell-num font-bold highlight-val">${formatCurrency(totAv,  lang)}</td>
      ${cv.cd  ? `<td class="cell-num font-bold">${formatCurrency(totCd,  lang)}</td>` : ''}
      ${cv.rd  ? `<td class="cell-num font-bold">${formatCurrency(totRd,  lang)}</td>` : ''}
      ${cv.sd  ? `<td class="cell-num font-bold">${formatCurrency(totSd,  lang)}</td>` : ''}
      ${cv.vat ? `<td class="cell-num font-bold">${formatCurrency(totVat, lang)}</td>` : ''}
      ${cv.ait ? `<td class="cell-num font-bold">${formatCurrency(totAit, lang)}</td>` : ''}
      ${cv.at  ? `<td class="cell-num font-bold">${formatCurrency(totAt,  lang)}</td>` : ''}
      <td class="cell-num font-bold highlight-val sticky-right-2">${formatCurrency(totDt, lang)}</td>
      <td class="print-hidden cell-action sticky-right"></td>
    </tr>
  `;

  // In-words
  const inWordsValue = lang === "bn" ? numberToBengaliWords(totDt) : numberToEnglishWords(totDt);
  const inWordsTextEl = document.getElementById("inWordsText");
  if (inWordsTextEl) {
    inWordsTextEl.textContent = inWordsValue + dict.takaOnly;
  }
  const inWordsLabelEl = document.querySelector("#inWordsDisplay .in-words-label");
  if (inWordsLabelEl) {
    inWordsLabelEl.textContent = dict.inWords;
  }
}

function deleteRow(rowId) {
  state.assessmentRows = state.assessmentRows.filter(r => r.id !== rowId);
  if (state.assessmentRows.length === 0) addRow();
  else { saveState(); renderAssessmentTable(); updateDashboardMetrics(); }
}

// === RENDER ASSESSMENT TABLE ===
function renderAssessmentTable() {
  const tbody = document.getElementById("assessmentTableBody");
  const thead = document.getElementById("assessmentTableHead");
  const tfoot = document.getElementById("assessmentTableFoot");
  if (!tbody || !thead || !tfoot) return;

  const dict = TRANSLATIONS[state.language];
  const dr   = state.defaultRates;

  // Build header — no input boxes in CD/RD/SD/VAT/AIT/AT, column visibility applied
  const cv = state.columnVisibility;
  thead.innerHTML = `
    <tr>
      <th class="cell-sl" style="text-align:center;">${dict.sl}</th>
      <th style="min-width:120px; text-align:center;">${dict.approveCode}</th>
      <th style="min-width:170px; text-align:center;">${dict.description}</th>
      <th class="cell-num" style="text-align:center;">${dict.unitPrice}</th>
      <th class="cell-unit" style="text-align:center;">${dict.unit}</th>
      <th class="cell-num" style="min-width:75px; text-align:center;">${dict.qty}</th>
      <th class="cell-num" style="text-align:center;">${dict.totalPrice}</th>
      <th class="cell-num" style="text-align:center;">
        ${dict.insurance}<br><small style="font-weight:400; opacity:0.8;">(${dr.insurance}%)</small>
      </th>
      <th class="cell-num" style="text-align:center;">
        ${dict.landing}<br><small style="font-weight:400; opacity:0.8;">(${dr.landing}%)</small>
      </th>
      <th class="cell-num" style="min-width:110px; text-align:center;">${dict.assessableVal}</th>
      ${cv.cd  ? `<th class="cell-num" style="text-align:center;">${dict.cd}<br><small style="font-weight:400; opacity:0.8;">(${dr.cd}%)</small></th>` : ''}
      ${cv.rd  ? `<th class="cell-num" style="text-align:center;">${dict.rd}<br><small style="font-weight:400; opacity:0.8;">(${dr.rd}%)</small></th>` : ''}
      ${cv.sd  ? `<th class="cell-num" style="text-align:center;">SD<br><small style="font-weight:400; opacity:0.8;">(${dr.sd}%)</small></th>` : ''}
      ${cv.vat ? `<th class="cell-num" style="text-align:center;">${dict.vat}<br><small style="font-weight:400; opacity:0.8;">(${dr.vat}%)</small></th>` : ''}
      ${cv.ait ? `<th class="cell-num" style="text-align:center;">${dict.ait}<br><small style="font-weight:400; opacity:0.8;">(${dr.ait}%)</small></th>` : ''}
      ${cv.at  ? `<th class="cell-num" style="text-align:center;">${dict.at}<br><small style="font-weight:400; opacity:0.8;">(${dr.at}%)</small></th>` : ''}
      <th class="cell-num sticky-right-2" style="text-align:center;">${dict.dutyTax}</th>
      <th class="cell-action print-hidden sticky-right" style="text-align:center;">${dict.action}</th>
    </tr>
  `;

  tbody.innerHTML = "";

  let totQty=0, totVal=0, totIns=0, totLand=0, totAv=0;
  let totCd=0, totRd=0, totSd=0, totVat=0, totAit=0, totAt=0, totDt=0;

  state.assessmentRows.forEach((row, idx) => {
    totQty  += parseFloat(row.quantity) || 0;
    totVal  += row.totalPrice;
    totIns  += row.insurance;
    totLand += row.landing;
    totAv   += row.assessableValue;
    totCd   += row.cd;  totRd  += row.rd;  totSd  += row.sd;
    totVat  += row.vat; totAit += row.ait; totAt  += row.at;
    totDt   += row.totalDutyTax;

    const slNo = idx + 1;
    const tr = document.createElement("tr");
    tr.id = row.id;
    tr.innerHTML = `
      <td class="cell-sl">${slNo}</td>
      <td class="cell-code autocomplete-wrap">
        <textarea class="input-cell code-input" rows="2" placeholder="Code" autocomplete="off" spellcheck="false">${escapeHtml(row.approveCode)}</textarea>
        <div class="autocomplete-list hidden"></div>
      </td>
      <td class="cell-desc"><span class="readonly-val">${escapeHtml(row.description)}</span></td>
      <td class="cell-num"><span class="readonly-val">${formatCurrency(row.unitPrice, state.language)}</span></td>
      <td class="cell-unit"><span class="readonly-val">${escapeHtml(row.unit)}</span></td>
      <td class="cell-num">
        <input type="number" step="any" class="input-cell qty-input" value="${row.quantity}">
      </td>
      <td class="cell-num"><span class="readonly-val">${formatCurrency(row.totalPrice, state.language)}</span></td>
      <td class="cell-num"><span class="readonly-val">${formatCurrency(row.insurance, state.language)}</span></td>
      <td class="cell-num"><span class="readonly-val">${formatCurrency(row.landing, state.language)}</span></td>
      <td class="cell-num"><span class="readonly-val av-val">${formatCurrency(row.assessableValue, state.language)}</span></td>
      ${cv.cd  ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.cd,  state.language)}</span></td>` : ''}
      ${cv.rd  ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.rd,  state.language)}</span></td>` : ''}
      ${cv.sd  ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.sd,  state.language)}</span></td>` : ''}
      ${cv.vat ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.vat, state.language)}</span></td>` : ''}
      ${cv.ait ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.ait, state.language)}</span></td>` : ''}
      ${cv.at  ? `<td class="cell-num"><span class="readonly-val">${formatCurrency(row.at,  state.language)}</span></td>` : ''}
      <td class="cell-num sticky-right-2"><span class="readonly-val dt-val">${formatCurrency(row.totalDutyTax, state.language)}</span></td>
      <td class="cell-action print-hidden sticky-right">
        <button class="btn-delete-row" title="${dict.delete}">✕</button>
      </td>
    `;

    tbody.appendChild(tr);

    const codeInput = tr.querySelector(".code-input");
    const qtyInput  = tr.querySelector(".qty-input");
    const delBtn    = tr.querySelector(".btn-delete-row");

    setupAutocomplete(codeInput, row, tr);

    // qty input: update in-place (no re-render → cursor stays put)
    qtyInput.addEventListener("input", () => {
      row.quantity = parseFloat(qtyInput.value) || 0;
      calculateRow(row);
      saveState();
      updateRowInPlace(row, tr);
      refreshTotals();
      updateDashboardMetrics();
    });

    qtyInput.addEventListener("keydown", event => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        document.getElementById("addRowBtn")?.focus();
      }
    });

    codeInput.addEventListener("change", () => {
      row.approveCode = codeInput.value.trim();
      saveState();
    });
    codeInput.addEventListener("paste", (e) => {
      const clipboardData = e.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData("Text");
      if (pastedText && (pastedText.includes("\t") || pastedText.includes("\n"))) {
        e.preventDefault();
        handleExcelPaste(pastedText, row.id);
      }
    });
    delBtn.addEventListener("click", () => deleteRow(row.id));
  });

  // Render footer totals + in-words via shared function
  refreshTotals();
}


// === RATE HEADER INPUTS ===
function bindDefaultRateHeaderInputs(thead) {
  thead.querySelectorAll(".default-rate-input").forEach(input => {
    input.addEventListener("click", e => e.stopPropagation());
    input.addEventListener("change", () => {
      const key = input.dataset.rateKey;
      state.defaultRates[key] = parseFloat(input.value) || 0;
      if (["cd","rd","sd","vat","ait","at"].includes(key)) {
        state.assessmentRows.forEach(row => { row[`${key}Rate`] = state.defaultRates[key]; });
      }
      // Sync settings panel inputs
      const settingsInput = document.getElementById(`default-${key}`);
      if (settingsInput) settingsInput.value = state.defaultRates[key];
      recalculateAllRows();
      renderAssessmentTable();
      updateDashboardMetrics();
    });
  });
}

// === DASHBOARD METRICS ===
function updateDashboardMetrics() {
  let totalAv = 0, totalDt = 0;
  state.assessmentRows.forEach(row => {
    totalAv += row.assessableValue;
    totalDt += row.totalDutyTax;
  });

  const lang = state.language;
  const countEl = document.getElementById("dashValItems");
  const avEl    = document.getElementById("dashValTotalVal");
  const dtEl    = document.getElementById("dashValTotalTax");

  if (countEl) countEl.textContent = lang === "bn" ? toBengaliNumerals(state.assessmentRows.length) : state.assessmentRows.length;
  if (avEl)    avEl.textContent    = (lang === "bn" ? "৳" : "৳") + formatCurrency(totalAv, lang);
  if (dtEl)    dtEl.textContent    = (lang === "bn" ? "৳" : "৳") + formatCurrency(totalDt, lang);
}

// === PRINT HEADER ===
function updatePrintHeader() {
  const dict = TRANSLATIONS[state.language];
  const printHeaderContainer = document.getElementById("printHeaderInfo");
  if (!printHeaderContainer) return;

  const company = state.header.companyName;
  const permNo = state.header.permissionNo ? "GB" + state.header.permissionNo : "";
  const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  printHeaderContainer.innerHTML = `
    <div class="print-meta-grid">
      <div class="meta-item">
        <span class="meta-label">Organization Name :</span>
        <span class="meta-val font-bold">${company}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Permission No. :</span>
        <span class="meta-val font-bold">${escapeHtml(permNo)}</span>
      </div>
      <div class="meta-item" style="justify-content:flex-end;">
        <span class="meta-label">Date :</span>
        <span class="meta-val font-bold">${currentDate}</span>
      </div>
    </div>
  `;
}

// === RESET ===
function resetAllData() {
  const msg = state.language === "bn"
    ? "আপনি কি নিশ্চিতভাবে সকল তথ্য মুছে ফেলতে চান?"
    : "Are you sure you want to reset all calculations?";
  if (confirm(msg)) {
    state.assessmentRows = [];
    localStorage.removeItem("customs_assessment_rows");
    addRow();
    showToast(state.language === "bn" ? "সব তথ্য মুছে ফেলা হয়েছে।" : "All data has been reset.", "warning");
  }
}

// === HTML ESCAPE ===
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Format helper for print header values
function fmt(val) {
  if (!val) return "";
  return state.language === "bn" ? toBengaliNumerals(escapeHtml(val)) : escapeHtml(val);
}

// === AUTOCOMPLETE ===
function closeAllAutocomplete() {
  document.querySelectorAll(".autocomplete-list").forEach(l => l.classList.add("hidden"));
}

function handleGlobalEscape(e) {
  if (e.key !== "Escape") return;
  closeAllAutocomplete();
  closeMaterialModal();
  closeHistoryModal();
  closeAddCompanyModal();
  closeUserModal();
  closePasteExcelModal();
}

// === SAVE ASSESSMENTS & WHATSAPP SHARE ===
function saveCurrentAssessment() {
  const defaultTitle = `${state.header.companyName || "Customs Assessment"} - ${new Date().toLocaleDateString(state.language === "bn" ? "bn-BD" : "en-US")}`;
  const title = prompt(
    state.language === "bn" ? "সংরক্ষিত শুল্কায়নের একটি নাম লিখুন:" : "Enter a name for this saved assessment:",
    defaultTitle
  );
  if (title === null) return;

  const snapshot = {
    id: "saved_" + Date.now(),
    title: title.trim() || defaultTitle,
    timestamp: new Date().toLocaleString(state.language === "bn" ? "bn-BD" : "en-US"),
    header: JSON.parse(JSON.stringify(state.header)),
    assessmentRows: JSON.parse(JSON.stringify(state.assessmentRows)),
    defaultRates: JSON.parse(JSON.stringify(state.defaultRates)),
    calculationMethod: state.calculationMethod
  };

  state.savedAssessments.unshift(snapshot);
  localStorage.setItem("customs_saved_assessments", JSON.stringify(state.savedAssessments));

  if (typeof syncAssessmentToSupabaseCloud === "function" && getSupabaseClient()) {
    syncAssessmentToSupabaseCloud({
      id: snapshot.id,
      companyName: snapshot.header.companyName,
      date: new Date().toISOString(),
      rows: snapshot.assessmentRows,
      totalAssessableValue: snapshot.assessmentRows.reduce((a, b) => a + b.assessableValue, 0),
      totalDutyTax: snapshot.assessmentRows.reduce((a, b) => a + b.totalDutyTax, 0),
      header: snapshot.header
    });
  }

  showToast(state.language === "bn" ? "শুল্কায়ন ফাইল স্থানীয়ভাবে ও ক্লাউডে সংরক্ষিত হয়েছে!" : "Assessment saved locally & in cloud!", "success");
}

function openHistoryModal() {
  renderHistoryList();
  document.getElementById("historyModal").classList.add("active");
}

function closeHistoryModal() {
  document.getElementById("historyModal").classList.remove("active");
}

function renderHistoryList() {
  const container = document.getElementById("historyListContainer");
  if (!container) return;

  if (!state.savedAssessments || state.savedAssessments.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">
      ${state.language === "bn" ? "কোন সংরক্ষিত শুল্কায়ন ফাইল পাওয়া যায়নি।" : "No saved assessments found."}
    </div>`;
    return;
  }

  const lang = state.language;
  container.innerHTML = state.savedAssessments.map(item => {
    let totalAv = 0, totalDt = 0;
    (item.assessmentRows || []).forEach(r => {
      totalAv += r.assessableValue || 0;
      totalDt += r.totalDutyTax || 0;
    });

    return `
      <div class="history-item-card" id="${item.id}">
        <div>
          <div class="history-title">${escapeHtml(item.title)}</div>
          <div class="history-meta">
            🏢 ${escapeHtml(item.header?.companyName || "N/A")} | 
            📦 ${item.assessmentRows?.length || 0} ${lang === "bn" ? "টি আইটেম" : "items"} | 
            💰 ৳${formatCurrency(totalAv, lang)} | 
            🏛️ ৳${formatCurrency(totalDt, lang)}
            <br>
            <small style="opacity:0.7;">📅 ${escapeHtml(item.timestamp)}</small>
          </div>
        </div>
        <div class="history-actions">
          <button class="btn btn-primary btn-sm btn-history-load" data-id="${item.id}">📂 ${lang === "bn" ? "লোড" : "Load"}</button>
          <button class="btn btn-whatsapp btn-sm btn-history-wa" data-id="${item.id}">💬 Share</button>
          <button class="btn btn-danger btn-sm btn-history-del" data-id="${item.id}">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".btn-history-load").forEach(btn => {
    btn.addEventListener("click", () => loadSavedAssessment(btn.dataset.id));
  });
  container.querySelectorAll(".btn-history-wa").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = state.savedAssessments.find(s => s.id === btn.dataset.id);
      if (item) shareToWhatsApp(item);
    });
  });
  container.querySelectorAll(".btn-history-del").forEach(btn => {
    btn.addEventListener("click", () => deleteSavedAssessment(btn.dataset.id));
  });
}

function loadSavedAssessment(id) {
  const item = state.savedAssessments.find(s => s.id === id);
  if (!item) return;

  if (confirm(state.language === "bn" ? "আপনি কি নিশ্চিতভাবে এই ফাইলটি লোড করতে চান?" : "Load this saved assessment? Current workspace data will be replaced.")) {
    state.header = JSON.parse(JSON.stringify(item.header));
    state.assessmentRows = JSON.parse(JSON.stringify(item.assessmentRows));
    if (item.defaultRates) state.defaultRates = JSON.parse(JSON.stringify(item.defaultRates));
    if (item.calculationMethod) state.calculationMethod = item.calculationMethod;

    saveState();
    recalculateAllRows();
    updateUI();
    closeHistoryModal();
    showToast(state.language === "bn" ? "সংরক্ষিত ফাইল সফলভাবে লোড হয়েছে!" : "Assessment loaded successfully!", "success");
  }
}

function deleteSavedAssessment(id) {
  if (confirm(state.language === "bn" ? "আপনি কি নিশ্চিতভাবে এই ফাইলটি মুছে ফেলতে চান?" : "Delete this saved assessment?")) {
    state.savedAssessments = state.savedAssessments.filter(s => s.id !== id);
    localStorage.setItem("customs_saved_assessments", JSON.stringify(state.savedAssessments));
    renderHistoryList();
    showToast(state.language === "bn" ? "সংরক্ষিত ফাইল মুছে ফেলা হয়েছে।" : "Saved item deleted.", "info");
  }
}

function shareToWhatsApp(savedItem = null) {
  const header = savedItem ? savedItem.header : state.header;
  const rows   = savedItem ? savedItem.assessmentRows : state.assessmentRows;
  const lang   = state.language;

  let totAv = 0, totDt = 0, totQty = 0;
  rows.forEach(r => {
    totQty += parseFloat(r.quantity) || 0;
    totAv  += r.assessableValue || 0;
    totDt  += r.totalDutyTax || 0;
  });

  const inWordsValue = lang === "bn" ? numberToBengaliWords(totDt) : numberToEnglishWords(totDt);

  let msg = `📋 *কাস্টমস শুল্কায়ন সমারি*\n`;
  msg += `🏢 প্রতিষ্ঠান: ${header.companyName || "N/A"}\n`;
  msg += `------------------------------------\n`;
  msg += `📦 মোট মালামাল: ${rows.length} প্রকার (${formatCurrency(totQty, lang)})\n`;
  msg += `💰 মোট শুল্কায়ন মূল্য: ৳${formatCurrency(totAv, lang)}\n`;
  msg += `🏛️ মোট শুল্ক-করাদি: ৳${formatCurrency(totDt, lang)}\n`;
  msg += `🗣️ কথায়: ${inWordsValue} টাকা মাত্র।\n`;
  msg += `------------------------------------\n`;
  msg += `📦 *পণ্য বিবরণ সংক্ষেপ:*\n`;

  rows.forEach((r, idx) => {
    msg += `${idx + 1}. ${r.approveCode ? "["+r.approveCode+"] " : ""}${r.description} (${r.quantity} ${r.unit})\n`;
    msg += `   • শুল্কায়ন মূল্য: ৳${formatCurrency(r.assessableValue, lang)}\n`;
    msg += `   • শুল্ক-করাদি: ৳${formatCurrency(r.totalDutyTax, lang)}\n`;
  });

  msg += `------------------------------------\n`;
  msg += `Customs Assessment Manager`;

  const encodedMsg = encodeURIComponent(msg);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  window.open(whatsappUrl, "_blank");
}

// === EXPORT HTML DOCUMENT ===
function exportToHTML() {
  const company = state.header.companyName || "Customs_Assessment";
  const lang = state.language;

  // Use shared HTML builder so HTML and PDF match
  const htmlContent = generateExportHtml(company, lang);

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Customs_Assessment_${company.replace(/\s+/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(lang === "bn" ? "HTML ফাইল ডাউনলোড হয়েছে!" : "HTML file downloaded!", "success");
}

// Build shared export HTML used by both HTML download and PDF generation
function generateExportHtml(company, lang) {
  // Always force English for all exported documents and print formats
  lang = "en";
  const dict = TRANSLATIONS[lang];
  const dr = state.defaultRates;
  const h = state.header;

  let totQty=0, totVal=0, totIns=0, totLand=0, totAv=0;
  let totCd=0, totRd=0, totSd=0, totVat=0, totAit=0, totAt=0, totDt=0;

  state.assessmentRows.forEach(r => {
    totQty += parseFloat(r.quantity) || 0;
    totVal += r.totalPrice;
    totIns += r.insurance;
    totLand += r.landing;
    totAv += r.assessableValue;
    totCd += r.cd;
    totRd += r.rd;
    totSd += r.sd;
    totVat += r.vat;
    totAit += r.ait;
    totAt += r.at;
    totDt += r.totalDutyTax;
  });

  const inWordsValue = numberToEnglishWords(totDt);
  const currentDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  const fmtVal = v => v ? escapeHtml(v) : "";
  const officeSub = "Customs Bond Commissionerate, Dhaka (South), DEPZ Division, Savar, Dhaka.";
  const docTitle = "Customs Assessment Sheet";
  const dateLabel = "Date";
  const inWordsLabel = dict.inWords.replace(':', '').trim();
  const permNoDisplay = h.permissionNo ? "GB" + escapeHtml(h.permissionNo) : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>Customs Assessment - ${escapeHtml(company)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 0.3in 0.4in;
      background: #ffffff !important;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      font-family: 'Noto Serif Bengali', 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Inter', sans-serif !important;
      color: #000000 !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
      padding: 10px 10px 12px !important;
      font-size: 8.5pt !important;
      line-height: 1.4 !important;
    }
    .sheet {
      width: 100% !important;
      background: #ffffff !important;
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    .sheet * {
      color: #000000 !important;
      border-color: #000000 !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
    /* Elements that must stay visually transparent (no fill) */
    .signature-line,
    .signature-line-wrapper,
    .signature-col,
    .signatures {
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
    .header {
      text-align: center !important;
      margin-bottom: 22px !important;
    }
    .office-title {
      font-size: 17pt !important;
      font-weight: 700 !important;
      margin-bottom: 4px !important;
      letter-spacing: 0.3px !important;
    }
    .office-sub {
      font-size: 11pt !important;
      font-weight: 500 !important;
      margin-bottom: 8px !important;
    }
    .doc-title {
      font-size: 13.5pt !important;
      font-weight: 700 !important;
      text-decoration: underline !important;
      text-underline-offset: 4px !important;
    }
    .meta-row {
      width: 100% !important;
      border: 1px solid #000 !important;
      border-collapse: collapse !important;
      margin-bottom: 14px !important;
      table-layout: fixed !important;
      background-color: #fff !important;
      background: #fff !important;
    }
    .meta-row td {
      border: none !important;
      padding: 10px 14px !important;
      font-size: 10.5pt !important;
      vertical-align: middle !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
    }
    .meta-left { text-align: left !important; }
    .meta-center { text-align: center !important; }
    .meta-right { text-align: right !important; }
    .meta-label {
      font-weight: 700 !important;
      margin-right: 4px !important;
    }
    .meta-value {
      font-weight: 700 !important;
    }
    .assessment-table {
      width: 100% !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin-bottom: 12px !important;
      font-size: 8pt !important;
      background-color: #fff !important;
      background: #fff !important;
    }
    .assessment-table th,
    .assessment-table td {
      border: 1px solid #000 !important;
      padding: 5px 3px !important;
      vertical-align: middle !important;
      background-color: #fff !important;
      background: #fff !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
    }
    .assessment-table thead th {
      font-weight: 700 !important;
      text-align: center !important;
      font-size: 7.5pt !important;
      height: 42px !important;
      line-height: 1 !important;
      background-color: #fff !important;
      background: #fff !important;
    }
    .assessment-table tbody td {
      font-size: 7.5pt !important;
      line-height: 1.3 !important;
    }
    .assessment-table tfoot td {
      font-weight: 700 !important;
      font-size: 7.5pt !important;
      background-color: #fff !important;
      background: #fff !important;
    }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }
    
    .note-box {
      border: 1px solid #000 !important;
      padding: 10px 14px !important;
      margin-top: 14px !important;
      font-size: 10.5pt !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      width: 100% !important;
      background-color: #fff !important;
      background: #fff !important;
    }
    .note-label {
      font-weight: 700 !important;
      white-space: nowrap !important;
    }
    .note-value {
      font-weight: normal !important;
    }
    
    .signatures {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr) !important;
      gap: 40px !important;
      margin-top: 65px !important;
      align-items: end !important;
      width: 100% !important;
    }
    .signature-col {
      text-align: center !important;
    }
    .signature-line-wrapper {
      width: 85% !important;
      margin: 0 auto !important;
    }
    .signature-line {
      border-top: 1px solid #000 !important;
      margin-bottom: 8px !important;
      height: 0 !important;
    }
    .signature-label {
      font-size: 10.5pt !important;
      font-weight: 700 !important;
    }
    
    /* Column Widths to match screenshot ratio precisely */
    .assessment-table th:nth-child(1), .assessment-table td:nth-child(1) { width: 3% !important; }
    .assessment-table th:nth-child(2), .assessment-table td:nth-child(2) { width: 7.5% !important; text-align: center !important; }
    .assessment-table th:nth-child(3), .assessment-table td:nth-child(3) { width: 14% !important; }
    .assessment-table th:nth-child(4), .assessment-table td:nth-child(4) { width: 6.5% !important; }
    .assessment-table th:nth-child(5), .assessment-table td:nth-child(5) { width: 3.5% !important; text-align: center !important; }
    .assessment-table th:nth-child(6), .assessment-table td:nth-child(6) { width: 5.5% !important; }
    .assessment-table th:nth-child(7), .assessment-table td:nth-child(7) { width: 7.5% !important; }
    .assessment-table th:nth-child(8), .assessment-table td:nth-child(8) { width: 5.5% !important; }
    .assessment-table th:nth-child(9), .assessment-table td:nth-child(9) { width: 5.5% !important; }
    .assessment-table th:nth-child(10), .assessment-table td:nth-child(10) { width: 7.5% !important; }
    .assessment-table th:nth-child(11), .assessment-table td:nth-child(11) { width: 5.5% !important; }
    .assessment-table th:nth-child(12), .assessment-table td:nth-child(12) { width: 5.5% !important; }
    .assessment-table th:nth-child(13), .assessment-table td:nth-child(13) { width: 5.5% !important; }
    .assessment-table th:nth-child(14), .assessment-table td:nth-child(14) { width: 5.5% !important; }
    .assessment-table th:nth-child(15), .assessment-table td:nth-child(15) { width: 5.5% !important; }
    .assessment-table th:nth-child(16), .assessment-table td:nth-child(16) { width: 5.5% !important; }
    .assessment-table th:nth-child(17), .assessment-table td:nth-child(17) { width: 7.5% !important; }

    table { page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr, td, th { page-break-inside: avoid; page-break-after: auto; }
  </style>
</head>
<body style="font-family: 'Noto Serif Bengali', 'SolaimanLipi', 'Kalpurush', 'Hind Siliguri', 'Inter', sans-serif !important; color: #000000 !important; background: #ffffff !important; background-color: #ffffff !important; padding: 10px 10px 12px !important; font-size: 9.5pt !important; line-height: 1.4 !important;">
  <div class="sheet" style="width: 100% !important; background: #ffffff !important; background-color: #ffffff !important; color: #000000 !important;">
    <div class="header" style="text-align: center !important; margin-bottom: 18px !important; background: #ffffff !important;">
      <div class="office-sub" style="font-size: 14pt !important; font-weight: 700 !important; margin-bottom: 6px !important; text-align: center !important; color: #000000 !important; background: #ffffff !important; letter-spacing: 0.2px !important;">${officeSub}</div>
      <div class="doc-title" style="font-size: 12pt !important; font-weight: 600 !important; display: inline-block !important; border-bottom: 2px solid #000000 !important; padding-bottom: 1px !important; text-decoration: none !important; text-align: center !important; color: #000000 !important; background: #ffffff !important;">${docTitle}</div>
    </div>

    <table class="meta-row" style="width: 100% !important; border: 1px solid #000000 !important; border-collapse: collapse !important; margin-bottom: 14px !important; table-layout: fixed !important; background: #ffffff !important; background-color: #ffffff !important;">
      <tr>
        <td class="meta-left" style="border: none !important; padding: 10px 14px !important; font-size: 10.5pt !important; vertical-align: middle !important; text-align: left !important; color: #000000 !important; background: #ffffff !important;">
          <span class="meta-label" style="font-weight: 700 !important; margin-right: 4px !important; color: #000000 !important;">Organization Name :</span>
          <span class="meta-value" style="font-weight: 700 !important; color: #000000 !important;">${escapeHtml(company)}</span>
        </td>
        <td class="meta-center" style="border: none !important; padding: 10px 14px !important; font-size: 10.5pt !important; vertical-align: middle !important; text-align: center !important; color: #000000 !important; background: #ffffff !important;">
          <span class="meta-label" style="font-weight: 700 !important; margin-right: 4px !important; color: #000000 !important;">Permission No. :</span>
          <span class="meta-value" style="font-weight: 700 !important; color: #000000 !important;">${permNoDisplay}</span>
        </td>
        <td class="meta-right" style="border: none !important; padding: 10px 14px !important; font-size: 10.5pt !important; vertical-align: middle !important; text-align: right !important; color: #000000 !important; background: #ffffff !important;">
          <span class="meta-label" style="font-weight: 700 !important; margin-right: 4px !important; color: #000000 !important;">${dateLabel} :</span>
          <span class="meta-value" style="font-weight: 700 !important; color: #000000 !important;">${currentDate}</span>
        </td>
      </tr>
    </table>

    <table class="assessment-table" style="width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; margin-bottom: 14px !important; font-size: 9pt !important; background: #fff !important; background-color: #fff !important; border: 1px solid #000 !important;">
      <thead>
        <tr>
          <th style="width: 3% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.sl}</th>
          <th style="width: 7.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.approveCode}</th>
          <th style="width: 14% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.description}</th>
          <th style="width: 6.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.unitPrice}</th>
          <th style="width: 3.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.unit}</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.qty}</th>
          <th style="width: 7.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.totalPrice}</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.insurance}</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.landing}</th>
          <th style="width: 7.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.assessableVal}</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">CD (${lang === "bn" ? toBengaliNumerals(dr.cd) : dr.cd}%)</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">RD (${lang === "bn" ? toBengaliNumerals(dr.rd) : dr.rd}%)</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">SD (${lang === "bn" ? toBengaliNumerals(dr.sd) : dr.sd}%)</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.vat} (${lang === "bn" ? toBengaliNumerals(dr.vat) : dr.vat}%)</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">AIT (${lang === "bn" ? toBengaliNumerals(dr.ait) : dr.ait}%)</th>
          <th style="width: 5.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">AT (${lang === "bn" ? toBengaliNumerals(dr.at) : dr.at}%)</th>
          <th style="width: 7.5% !important; border: 1px solid #000 !important; padding: 6px 4px !important; font-weight: 700 !important; text-align: center !important; font-size: 8.5pt !important; height: 42px !important; line-height: 1.25 !important; background: #fff !important; color: #000 !important;">${dict.dutyTax}</th>
        </tr>
      </thead>
      <tbody>
        ${state.assessmentRows.map((r, i) => `
          <tr>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: center !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${lang === "bn" ? toBengaliNumerals(i + 1) : i + 1}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: center !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${escapeHtml(r.approveCode)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: left !important; font-size: 8.5pt !important; word-wrap: break-word !important; overflow-wrap: break-word !important; background: #fff !important; color: #000 !important;">${escapeHtml(r.description)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.unitPrice, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: center !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${escapeHtml(r.unit)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${lang === "bn" ? toBengaliNumerals((parseFloat(r.quantity) || 0).toFixed(2)) : (parseFloat(r.quantity) || 0).toFixed(2)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.totalPrice, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.insurance, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.landing, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.assessableValue, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.cd, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.rd, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.sd, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.vat, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.ait, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.at, lang)}</td>
            <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(r.totalDutyTax, lang)}</td>
          </tr>
        `).join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${dict.total}:</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${lang === "bn" ? toBengaliNumerals(totQty.toFixed(2)) : totQty.toFixed(2)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totVal, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totIns, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totLand, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totAv, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totCd, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totRd, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totSd, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totVat, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totAit, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totAt, lang)}</td>
          <td style="border: 1px solid #000 !important; padding: 6px 4px !important; vertical-align: middle !important; text-align: right !important; font-size: 8.5pt !important; font-weight: 700 !important; background: #fff !important; color: #000 !important;">${formatCurrency(totDt, lang)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="note-box" style="border: 1px solid #000000 !important; padding: 10px 14px !important; margin-top: 14px !important; font-size: 10.5pt !important; display: flex !important; align-items: center !important; gap: 6px !important; width: 100% !important; background: #ffffff !important; color: #000000 !important;">
      <span class="note-label" style="font-weight: 700 !important; white-space: nowrap !important; color: #000000 !important; background: #ffffff !important;">${inWordsLabel} :</span>
      <span class="note-value" style="font-weight: normal !important; color: #000000 !important; background: #ffffff !important;">${inWordsValue}${dict.takaOnly}</span>
    </div>

    <div class="signatures" style="display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 40px !important; margin-top: 65px !important; align-items: end !important; width: 100% !important; background: #ffffff !important;">
      <div class="signature-col" style="text-align: center !important; background: #ffffff !important;">
        <div class="signature-line-wrapper" style="width: 85% !important; margin: 0 auto !important; background: #ffffff !important;">
          <div class="signature-line" style="border-top: 1px solid #000000 !important; margin-bottom: 8px !important; height: 0 !important; background: #ffffff !important;"></div>
        </div>
        <div class="signature-label" style="font-size: 10.5pt !important; font-weight: 700 !important; color: #000000 !important; background: #ffffff !important;">${dict.preparedBy}</div>
      </div>
      <div class="signature-col" style="text-align: center !important; background: #ffffff !important;">
        <div class="signature-line-wrapper" style="width: 85% !important; margin: 0 auto !important; background: #ffffff !important;">
          <div class="signature-line" style="border-top: 1px solid #000000 !important; margin-bottom: 8px !important; height: 0 !important; background: #ffffff !important;"></div>
        </div>
        <div class="signature-label" style="font-size: 10.5pt !important; font-weight: 700 !important; color: #000000 !important; background: #ffffff !important;">${dict.checkedBy}</div>
      </div>
      <div class="signature-col" style="text-align: center !important; background: #ffffff !important;">
        <div class="signature-line-wrapper" style="width: 85% !important; margin: 0 auto !important; background: #ffffff !important;">
          <div class="signature-line" style="border-top: 1px solid #000000 !important; margin-bottom: 8px !important; height: 0 !important; background: #ffffff !important;"></div>
        </div>
        <div class="signature-label" style="font-size: 10.5pt !important; font-weight: 700 !important; color: #000000 !important; background: #ffffff !important;">${dict.approvedBy}</div>
      </div>
    </div>
    <div class="pdf-footer">
      Developed by: <strong style="color:#000000 !important;">Md. Yusuf Ali</strong> &nbsp;|&nbsp; Mobile: <strong style="color:#000000 !important;">+8801933814200</strong>
    </div>
  </div>
</body>
</html>`;
}
async function createExportRenderFrame(htmlContent) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "11.69in";
  iframe.style.height = "8.27in";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  iframe.style.pointerEvents = "none";
  iframe.style.background = "#ffffff";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  const frameWin = iframe.contentWindow;
  if (!frameDoc || !frameWin) {
    iframe.remove();
    throw new Error("Unable to create export render frame.");
  }

  frameDoc.open();
  frameDoc.write(htmlContent);
  frameDoc.close();

  await new Promise(resolve => {
    iframe.onload = () => resolve();
    setTimeout(resolve, 300);
  });

  // Wait for Bengali fonts to load inside the iframe document
  if (frameDoc.fonts && frameDoc.fonts.load) {
    try {
      await frameDoc.fonts.load('16px "Noto Serif Bengali"');
      await frameDoc.fonts.ready;
    } catch (error) {
      console.warn("Noto Serif Bengali iframe preload failed:", error);
    }
  }

  // Give the browser 250ms to settle the text layout
  await new Promise(resolve => setTimeout(resolve, 250));

  try {
    if (frameDoc.fonts?.ready) {
      await frameDoc.fonts.ready;
    }
  } catch (error) {
    console.warn("Export frame fonts could not be fully loaded.", error);
  }

  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return iframe;
}

async function printFromExportTemplate() {
  const company = state.header.companyName || "Customs_Assessment";
  const lang = state.language;
  const exportHtml = generateExportHtml(company, lang);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 400);
  };

  const printWindow = iframe.contentWindow;
  const printDoc = iframe.contentDocument || (printWindow ? printWindow.document : null);

  if (!printWindow || !printDoc) {
    cleanup();
    window.print();
    return;
  }

  printDoc.open();
  printDoc.write(exportHtml);
  printDoc.close();

  await new Promise(resolve => {
    iframe.onload = () => resolve();
    setTimeout(resolve, 300);
  });

  try {
    if (printWindow.document.fonts?.ready) {
      await printWindow.document.fonts.ready;
    }
  } catch (error) {
    console.warn("Print fonts could not be fully loaded.", error);
  }

  printWindow.focus();
  printWindow.onafterprint = () => cleanup();

  try {
    printWindow.print();
  } catch (error) {
    console.error(error);
    cleanup();
    window.print();
  }
}

// Ensure Bengali glyphs are available before html2canvas captures the PDF content.
async function ensurePdfFontReady() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await document.fonts.load('16px "Noto Serif Bengali"');
    await document.fonts.ready;
  } catch (error) {
    console.warn('Noto Serif Bengali could not be preloaded for PDF export.', error);
  }
}

// === EXPORT PDF DOCUMENT ===
function addPageNumbersToPdf(pdf) {
  if (!pdf || typeof pdf.getNumberOfPages !== 'function') return;

  const pageCount = pdf.getNumberOfPages();
  const pageSize = pdf.internal.pageSize || pdf.internal.pageSize;
  const pageWidth = typeof pageSize.getWidth === 'function' ? pageSize.getWidth() : pageSize.width;
  const pageHeight = typeof pageSize.getHeight === 'function' ? pageSize.getHeight() : pageSize.height;

  pdf.setFontSize(7);
  pdf.setTextColor(85, 85, 85);

  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.text(`Page ${page} of ${pageCount}`, pageWidth - 0.4, pageHeight - 0.25, { align: 'right' });
  }
}

async function exportToPDF() {
  const company = state.header.companyName || "Customs_Assessment";
  const lang = state.language;
  await ensurePdfFontReady();

  if (typeof html2pdf !== "undefined") {
    const exportFrame = await createExportRenderFrame(generateExportHtml(company, lang));

    const opt = {
      margin:       [0.2, 0.3, 0.15, 0.3],
      filename:     `Customs_Assessment_${company.replace(/\s+/g, "_")}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'], after: '.pdf-summary' }
    };

    const exportRoot = exportFrame.contentDocument?.body;
    if (!exportRoot) throw new Error("Export frame body not available.");
    await new Promise(resolve => setTimeout(resolve, 180));
    showToast("Generating PDF...", "info");
    try {
      const worker = html2pdf().set(opt).from(exportRoot);
      const pdfDoc = await worker.toPdf().get('pdf');
      addPageNumbersToPdf(pdfDoc);
      const pdfBlob = await worker.output('blob');
      if (!pdfBlob || pdfBlob.size < 1024) {
        throw new Error('PDF blob empty or too small: ' + (pdfBlob ? pdfBlob.size : 'null'));
      }

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Customs_Assessment_${company.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("PDF downloaded!", "success");
    } catch (error) {
      console.error(error);
      window.print();
    } finally {
      exportFrame.remove();
    }
  } else {
    window.print();
  }
}

// === DIRECT WHATSAPP PDF SHARE ===
async function sharePdfToWhatsApp() {
  const company = state.header.companyName || "Customs_Assessment";
  const lang = state.language;
  const dict = TRANSLATIONS[lang];
  const filename = `Customs_Assessment_${company.replace(/\s+/g, "_")}.pdf`;

  // Open blank window immediately to bypass desktop browser popup blocker
  let waWindow = null;
  const canShare = navigator.canShare && navigator.canShare({ files: [new File([], filename, { type: "application/pdf" })] });
  if (!canShare) {
    waWindow = window.open("", "_blank");
  }

  try {
    await ensurePdfFontReady();

    if (typeof html2pdf === "undefined") {
      if (waWindow) waWindow.close();
      exportToPDF();
      return;
    }

    showToast(lang === "bn" ? "WhatsApp PDF প্রসেস হচ্ছে..." : "Processing WhatsApp PDF...", "info");

    const exportFrame = await createExportRenderFrame(generateExportHtml(company, lang));

    const opt = {
      margin:       [0.2, 0.3, 0.15, 0.3],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'], after: '.pdf-summary' }
    };

    const exportRoot = exportFrame.contentDocument?.body;
    if (!exportRoot) {
      if (waWindow) waWindow.close();
      throw new Error("Export frame body not available.");
    }
    await new Promise(resolve => setTimeout(resolve, 180));

    const pdfBlob = await html2pdf().set(opt).from(exportRoot).output('blob');
    exportFrame.remove();

    if (!pdfBlob || pdfBlob.size < 1024) {
      if (waWindow) waWindow.close();
      throw new Error('PDF blob empty or too small: ' + (pdfBlob ? pdfBlob.size : 'null'));
    }
    const file = new File([pdfBlob], filename, { type: "application/pdf" });

    if (canShare) {
      await navigator.share({
        files: [file],
        title: `Customs Assessment - ${company}`,
        text: `Customs Assessment Sheet PDF (${company})`
      });
      showToast(lang === "bn" ? "PDF সরাসরি শেয়ার করা হয়েছে!" : "PDF shared directly!", "success");
    } else {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const msgText = encodeURIComponent(`📋 *কাস্টমস শুল্কায়ন PDF — ${company}*\n(PDF ফাইলটি ডাউনলোড করা হয়েছে, WhatsApp এ ফাইল হিসেবে সংলগ্ন করুন)`);
      const whatsappUrl = `https://api.whatsapp.com/send?text=${msgText}`;

      if (waWindow) {
        waWindow.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank");
      }
      showToast(lang === "bn" ? "PDF ডাউনলোড করা হয়েছে! WhatsApp খোলা হচ্ছে..." : "PDF downloaded! Opening WhatsApp...", "info");
    }
  } catch (err) {
    console.error(err);
    if (waWindow) waWindow.close();
    exportToPDF();
  }
}

function applyMaterialSelection(row, match) {
  row.approveCode = match.code;
  row.description = match.description;
  row.unitPrice   = match.price;
  row.unit        = match.unit;
  calculateRow(row);
  saveState();
}

function setupAutocomplete(inputEl, row, tr) {
  const container = inputEl.parentElement;
  const listEl    = container.querySelector(".autocomplete-list");

  const showList = () => {
    const val = inputEl.value.trim().toLowerCase();
    listEl.innerHTML = "";
    const matches = state.materials.filter(m =>
      m.code.toLowerCase().includes(val) ||
      m.description.toLowerCase().includes(val)
    ).slice(0, 8);

    if (matches.length > 0) {
      listEl.classList.remove("hidden");
      matches.forEach(match => {
        const item = document.createElement("div");
        item.className = "autocomplete-item";
        item.innerHTML = `
          <span class="ac-code">${escapeHtml(match.code)}</span>
          <span class="ac-desc">${escapeHtml(match.description)}</span>
          <span class="ac-meta">${escapeHtml(match.unit)} Â· ${formatCurrency(match.price, state.language)}</span>
        `;
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          inputEl.value = match.code;
          applyMaterialSelection(row, match);
          renderAssessmentTable();
          updateDashboardMetrics();
          listEl.classList.add("hidden");
        });
        listEl.appendChild(item);
      });
    } else {
      listEl.classList.add("hidden");
    }
  };

  inputEl.addEventListener("focus", showList);
  inputEl.addEventListener("click", showList);
  inputEl.addEventListener("input", showList);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      listEl.classList.add("hidden");
      inputEl.blur();
      return;
    }

    // Tab OR Enter: autofill best match and move focus to quantity
    if (e.key === "Tab" || e.key === "Enter") {
      const val = inputEl.value.trim().toLowerCase();
      if (!val) return; // nothing typed, let default Tab/Enter work

      // Priority: 1) exact match → 2) starts with → 3) contains
      const match =
        state.materials.find(m => m.code.toLowerCase() === val) ||
        state.materials.find(m => m.code.toLowerCase().startsWith(val)) ||
        state.materials.find(m => m.code.toLowerCase().includes(val) || m.description.toLowerCase().includes(val));

      if (match) {
        e.preventDefault(); // stop default tab/enter behavior
        inputEl.value = match.code;
        applyMaterialSelection(row, match);
        listEl.classList.add("hidden");
        renderAssessmentTable();
        updateDashboardMetrics();

        // After re-render, focus the quantity input of this row
        const rowEl = document.getElementById(row.id);
        if (rowEl) {
          const qtyInput = rowEl.querySelector(".qty-input");
          if (qtyInput) {
            qtyInput.focus();
            qtyInput.select();
          }
        }
      }
    }
  });

  inputEl.addEventListener("blur", () => setTimeout(() => listEl.classList.add("hidden"), 200));
}

// === MATERIALS LIST ===
function renderMaterialsList() {
  const tableHead = document.getElementById("materialsTableHead");
  const grid      = document.getElementById("materialsGrid");
  const searchVal = document.getElementById("searchMaterialInput").value.trim().toLowerCase();
  if (!grid || !tableHead) return;

  const dict = TRANSLATIONS[state.language];
  tableHead.innerHTML = `
    <tr>
      <th>Code</th>
      <th>${dict.description}</th>
      <th style="text-align:right">${dict.unitPrice}</th>
      <th style="text-align:center">${dict.unit}</th>
      <th style="text-align:center">${dict.action}</th>
    </tr>
  `;

  grid.innerHTML = "";

  const filtered = state.materials.filter(m =>
    m.code.toLowerCase().includes(searchVal) ||
    m.description.toLowerCase().includes(searchVal)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<tr><td colspan="5" class="materials-empty">No materials found.</td></tr>`;
    return;
  }

  filtered.forEach(m => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="mat-code-badge">${escapeHtml(m.code)}</span></td>
      <td>${escapeHtml(m.description)}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums;">${formatCurrency(m.price, state.language)}</td>
      <td style="text-align:center"><span class="mat-unit-badge">${escapeHtml(m.unit)}</span></td>
      <td>
        <div class="mat-actions">
          <button class="btn-mat-edit">${dict.edit}</button>
          <button class="btn-mat-delete">${dict.delete}</button>
        </div>
      </td>
    `;
    grid.appendChild(row);

    row.querySelector(".btn-mat-edit").addEventListener("click", () => {
      document.getElementById("mat-code").value  = m.code;
      document.getElementById("mat-desc").value  = m.description;
      document.getElementById("mat-price").value = m.price;
      document.getElementById("mat-unit").value  = m.unit;
      document.getElementById("materialModalTitle").textContent =
        state.language === "bn" ? "মালামালের তথ্য সম্পাদনা" : "Edit Material Details";
      openMaterialModal();
    });

    row.querySelector(".btn-mat-delete").addEventListener("click", () => {
      if (confirm(state.language === "bn"
        ? "আপনি কি এই মালামালটি মুছতে চান?"
        : "Are you sure you want to delete this material?")) {
        state.materials = state.materials.filter(item => item.code !== m.code);
        saveState();
        renderMaterialsList();
        showToast(state.language === "bn" ? "মালামাল মুছে ফেলা হয়েছে।" : "Material deleted.", "success");
      }
    });
  });
}

// === MATERIALS IMPORT ===
function importMaterialsFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const ext    = file.name.split(".").pop().toLowerCase();
  const useCsv = ext === "csv";

  if (!useCsv && typeof XLSX === "undefined") {
    showToast("Excel parser is not loaded. Please use CSV.", "error");
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      let rows = [];
      if (useCsv) {
        const text = evt.target.result;
        rows = text.split(/\r?\n/)
          .map(line => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, "").trim()))
          .filter(cols => cols.some(col => col));
      } else {
        const workbook = XLSX.read(evt.target.result, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
      }

      const imported = normalizeImportedMaterials(rows);
      if (imported.length === 0) {
        showToast("No usable material rows were found in the import file.", "warning");
      } else {
        const replaceMaterials = window.confirm(
          state.language === "bn"
            ? `Replace current ${state.materials.length} materials with ${imported.length} imported materials?`
            : `Replace the current ${state.materials.length} materials with ${imported.length} imported materials?`
        );
        if (replaceMaterials) {
          state.materials = imported;
          saveState();
          renderMaterialsList();
          showToast(`${imported.length} materials imported successfully.`, "success");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Unable to import materials. Check file format.", "error");
    }
    e.target.value = "";
  };

  useCsv ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
}

function normalizeImportedMaterials(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const normalized = [];
  rows.forEach((row, index) => {
    if (!Array.isArray(row)) return;
    const cells = row.map(cell => String(cell ?? "").trim());
    if (cells.every(cell => !cell)) return;
    if (index === 0) {
      const hdr = cells.join(" ").toLowerCase();
      if (hdr.includes("code") || hdr.includes("description")) return;
    }
    const code = cells[0] || "";
    const description = cells[1] || "";
    const price = parseFloat(String(cells[2]).replace(/,/g, "")) || 0;
    const unit = cells[3] || "kg";
    if (!code || !description) return;
    normalized.push({ code, description, price, unit });
  });

  const deduped = [], seen = new Set();
  normalized.forEach(m => {
    const key = m.code.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(m);
  });
  return deduped;
}

// === SAMPLE MATERIAL TEMPLATE DOWNLOAD ===
function downloadSampleMaterialTemplate() {
  const sampleCsv = `Code,Description,UnitPrice,Unit
1,Waste tiny cut pcs of Fabrics,15.00,kg
2,Waste carton,11.00,kg
3,Waste Paper roll/cone,14.00,kg
4,Waste Polythine,20.00,kg
5,Waste Wood,5.00,kg
10,Empty jerry can/(Big/small),80.00,pcs
11,Empty Steel Drum (Big),400.00,pcs
14,Empty plastic drum (small),220.00,pcs`;

  downloadCSV(sampleCsv, "customs_materials_sample.csv");
  showToast(state.language === "bn" ? "নমুনা ফরম্যাট ডাউনলোড হয়েছে!" : "Sample Excel template downloaded!", "success");
}

// === COMPANY MANAGEMENT ===
function renderCompanyOptions() {
  const select = document.getElementById("header-companyName");
  if (!select) return;
  const active  = state.companies.filter(c => c.status !== "Inactive");
  const current = state.header.companyName || "";
  const options = [...active];

  if (!current && active.length) {
    state.header.companyName = active[0].name;
    saveState();
  }

  if (state.header.companyName && !options.some(c => c.name === state.header.companyName)) {
    options.unshift({ name: state.header.companyName, circle: "", status: "Active" });
  }

  select.innerHTML = options.length
    ? options.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}${c.circle ? ` (${escapeHtml(c.circle)})` : ""}</option>`).join("")
    : `<option value="">No active companies</option>`;
  select.value = state.header.companyName || "";
}

function renderCompanyList() {
  const head = document.getElementById("companyTableHead");
  const body = document.getElementById("companyTableBody");
  if (!head || !body) return;

  const dict = TRANSLATIONS[state.language];
  head.innerHTML = `<tr>
    <th>${dict.companyName || "Name"}</th>
    <th>Circle / Address</th>
    <th>Status</th>
    <th style="text-align:center;">Action</th>
  </tr>`;

  const sorted = [...state.companies].sort((a, b) => a.name.localeCompare(b.name));
  if (!sorted.length) {
    body.innerHTML = `<tr><td colspan="4" class="materials-empty">No companies found.</td></tr>`;
    return;
  }
  body.innerHTML = sorted.map(c => `
    <tr>
      <td style="font-weight:600">${escapeHtml(c.name)}</td>
      <td style="color:var(--text-secondary)">${escapeHtml(c.circle || "-")}</td>
      <td><span class="company-status ${c.status === "Inactive" ? "status-inactive" : "status-active"}">${escapeHtml(c.status || "Active")}</span></td>
      <td style="text-align:center;">
        <button class="btn btn-danger btn-sm btn-delete-company" data-name="${escapeHtml(c.name)}" title="Delete">✕</button>
      </td>
    </tr>
  `).join("");

  body.querySelectorAll(".btn-delete-company").forEach(btn => {
    btn.addEventListener("click", () => {
      const companyName = btn.dataset.name;
      if (confirm(state.language === "bn" ? `আপনি কি "${companyName}" মুছতে চান?` : `Delete "${companyName}"?`)) {
        state.companies = state.companies.filter(c => c.name !== companyName);
        saveState();
        renderCompanyOptions();
        renderCompanyList();
        showToast(state.language === "bn" ? "কোম্পানি মুছে ফেলা হয়েছে।" : "Company deleted.", "info");
      }
    });
  });
}

function addNewCompany() {
  openAddCompanyModal();
}

function openAddCompanyModal() {
  const modal = document.getElementById("addCompanyModal");
  if (!modal) return;
  // Clear fields
  document.getElementById("newCompanyName").value  = "";
  document.getElementById("newCompanyCircle").value = "";
  document.getElementById("newCompanyStatus").value = "Active";
  const errEl = document.getElementById("addCompanyError");
  if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
  modal.classList.add("active");
  setTimeout(() => document.getElementById("newCompanyName").focus(), 80);
}

function closeAddCompanyModal() {
  const modal = document.getElementById("addCompanyModal");
  if (modal) modal.classList.remove("active");
}

function saveNewCompany() {
  const name   = (document.getElementById("newCompanyName")?.value || "").trim();
  const circle = (document.getElementById("newCompanyCircle")?.value || "").trim();
  const status = document.getElementById("newCompanyStatus")?.value || "Active";
  const errEl  = document.getElementById("addCompanyError");

  if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }

  if (!name) {
    if (errEl) { errEl.textContent = "প্রতিষ্ঠানের নাম দিন।"; errEl.style.display = "block"; }
    return;
  }

  if (state.companies.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    if (errEl) { errEl.textContent = "এই নামের কোম্পানি ইতিমধ্যে তালিকায় আছে।"; errEl.style.display = "block"; }
    return;
  }

  const newCompany = { name, circle, status };
  state.companies.push(newCompany);
  state.header.companyName = name;

  saveState();
  renderCompanyOptions();
  renderCompanyList();
  updatePrintHeader();
  closeAddCompanyModal();
  showToast(state.language === "bn" ? `"${name}" কোম্পানি তালিকায় যোগ হয়েছে!` : `"${name}" added to company list!`, "success");
}


function downloadSampleCompanyTemplate() {
  const sampleCsv = `CompanyName,Circle,Status
M/s Apex Spinning & Knitting Mills Ltd.,Circle-1 (Dhaka),Active
M/s Youngone High-Tech Sportswear Ltd.,Circle-2 (DEPZ),Active
M/s Beximco Synthetics Ltd.,Circle-3 (Savar),Active
M/s Square Fashions Ltd.,Circle-1 (Dhaka),Active`;

  downloadCSV(sampleCsv, "customs_companies_sample.csv");
  showToast(state.language === "bn" ? "কোম্পানির নমুনা এক্সেল ফাইল ডাউনলোড হয়েছে!" : "Sample company template downloaded!", "success");
}

function importCompaniesFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const ext    = file.name.split(".").pop().toLowerCase();
  const useCsv = ext === "csv";
  if (!useCsv && typeof XLSX === "undefined") {
    showToast("Excel parser not loaded. Please use CSV.", "error");
    e.target.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      let rows = [];
      if (useCsv) {
        rows = String(evt.target.result).split(/\r?\n/)
          .map(line => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, "").trim()))
          .filter(cols => cols.some(col => col));
      } else {
        const workbook = XLSX.read(evt.target.result, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" });
      }

      const imported = normalizeImportedCompanies(rows);
      if (!imported.length) {
        showToast(state.language === "bn" ? "ফাইলে কোনো গ্রহণযোগ্য কোম্পানি পাওয়া যায়নি। কলামের শিরোনাম বা ফরম্যাট চেক করুন।" : "No usable company rows found in file.", "warning");
      } else {
        // Merge imported companies with existing list
        const existingNames = new Set(state.companies.map(c => c.name.toLowerCase()));
        let addedCount = 0;
        imported.forEach(c => {
          if (!existingNames.has(c.name.toLowerCase())) {
            state.companies.push(c);
            existingNames.add(c.name.toLowerCase());
            addedCount++;
          }
        });

        if (!state.companies.some(c => c.name === state.header.companyName && c.status !== "Inactive")) {
          const first = state.companies.find(c => c.status !== "Inactive");
          state.header.companyName = first ? first.name : "";
        }

        saveState();
        renderCompanyOptions();
        renderCompanyList();
        updatePrintHeader();

        // Also sync to Supabase Cloud if connected
        if (typeof syncCompaniesToSupabaseCloud === "function" && getSupabaseClient()) {
          syncCompaniesToSupabaseCloud(state.companies);
        }

        const msg = state.language === "bn"
          ? `${addedCount} টি নতুন কোম্পানি সফলভাবে তালিকায় যুক্ত করা হয়েছে!`
          : `${addedCount} new companies imported successfully!`;
        showToast(msg, "success");
      }
    } catch (err) {
      console.error(err);
      showToast(state.language === "bn" ? "কোম্পানি ফাইল ইমপোর্ট করতে সমস্যা হয়েছে।" : "Unable to import company list.", "error");
    }
    e.target.value = "";
  };
  useCsv ? reader.readAsText(file) : reader.readAsArrayBuffer(file);
}

function isHeaderCellText(str) {
  const s = String(str ?? "").trim().toLowerCase();
  const headers = [
    "company name", "company_name", "companyname", "প্রতিষ্ঠানের নাম", "কোম্পানির নাম", "প্রতিষ্ঠানের নাম:", "কোম্পানি নাম",
    "sl no", "sl.no", "sl", "s/n", "serial", "ক্রমিক", "ক্রমিক নং", "সিরিয়াল",
    "circle", "সার্কেল", "address", "ঠিকানা", "location", "status", "স্ট্যাটাস"
  ];
  return headers.includes(s);
}

function normalizeImportedCompanies(rows) {
  if (!Array.isArray(rows) || !rows.length) return [];
  const normalized = [];

  rows.forEach((row, index) => {
    if (!row) return;

    let name = "";
    let circle = "";
    let status = "Active";

    if (Array.isArray(row)) {
      const cells = row.map(cell => String(cell ?? "").trim());
      if (cells.every(cell => !cell)) return;

      // Skip header row ONLY if first cell matches exact column title keywords
      if (index === 0 && (isHeaderCellText(cells[0]) || isHeaderCellText(cells[1]))) {
        return;
      }

      // Check if col 0 is serial number (1, 2, 3...)
      const isSerial0 = /^\d+$/.test(cells[0]);
      if (isSerial0 && cells[1]) {
        name = cells[1];
        circle = cells[2] || "";
        status = /inactive/i.test(cells[3] || "") ? "Inactive" : "Active";
      } else {
        name = cells[0] || "";
        circle = cells[1] || "";
        status = /inactive/i.test(cells[2] || "") ? "Inactive" : "Active";
      }
    } else if (typeof row === "object") {
      const keys = Object.keys(row);
      const nameKey = keys.find(k => /name|company|কোম্পানি|প্রতিষ্ঠানের|firm|importer/i.test(k));
      const circleKey = keys.find(k => /circle|address|সার্কেল|ঠিকানা|location/i.test(k));
      const statusKey = keys.find(k => /status|স্ট্যাটাস/i.test(k));

      name = nameKey ? String(row[nameKey] ?? "").trim() : (row[keys[0]] ? String(row[keys[0]]).trim() : "");
      circle = circleKey ? String(row[circleKey] ?? "").trim() : (row[keys[1]] ? String(row[keys[1]]).trim() : "");
      status = (statusKey && /inactive/i.test(String(row[statusKey]))) ? "Inactive" : "Active";
    }

    if (!name || (/^\d+$/.test(name) && name.length < 4)) return;
    normalized.push({ name, circle, status });
  });

  const deduped = [], seen = new Set();
  normalized.forEach(c => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(c);
  });
  return deduped;
}

// === PASTE EXCEL MODAL ===
function openPasteExcelModal() {
  document.getElementById("pasteExcelModal").classList.add("active");
  const area = document.getElementById("excelPasteArea");
  if (area) {
    area.value = "";
    area.focus();
  }
}

function closePasteExcelModal() {
  document.getElementById("pasteExcelModal").classList.remove("active");
  const area = document.getElementById("excelPasteArea");
  if (area) area.value = "";
}

function handleBulkPasteFromModal() {
  const area = document.getElementById("excelPasteArea");
  if (!area) return;
  const text = area.value;
  if (!text.trim()) {
    showToast(state.language === "bn" ? "কোন ডাটা পেস্ট করা হয়নি।" : "No data pasted.", "warning");
    return;
  }
  closePasteExcelModal();
  handleExcelPaste(text, null);
}

function isHeaderRow(cols) {
  if (cols.length === 0) return false;
  const col0 = cols[0].toLowerCase().trim();
  const col1 = cols[1] ? cols[1].toLowerCase().trim() : "";
  
  const headerKeywords = [
    "approve code", "code", "নথির", "ক্রমিক", "approve_code", "approve-code",
    "description", "বিবরণ", "particulars", "item name", "items"
  ];
  
  return headerKeywords.some(keyword => col0.includes(keyword) || col1.includes(keyword));
}

function handleExcelPaste(text, startRowId) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return;

  // Detect and skip header row if present
  let firstLineCols = lines[0].split("\t");
  let startIndexLines = 0;
  if (isHeaderRow(firstLineCols)) {
    startIndexLines = 1;
    console.log("Skipping header row in Excel paste:", lines[0]);
  }

  let currentIdx = 0;
  if (startRowId) {
    currentIdx = state.assessmentRows.findIndex(r => r.id === startRowId);
    if (currentIdx === -1) currentIdx = 0;
  }

  let pastedCount = 0;

  for (let i = startIndexLines; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split("\t");
    if (cols.length === 0 || !cols[0].trim()) continue;

    const code = cols[0] ? cols[0].trim() : "";
    let desc = cols[1] ? cols[1].trim() : "";
    let priceStr = cols[2] ? cols[2].trim() : "";
    let unit = cols[3] ? cols[3].trim() : "";
    let qtyStr = cols[4] ? cols[4].trim() : "";

    // Parse fewer columns case
    if (cols.length === 2) {
      if (!isNaN(cols[1]) && cols[1] !== "") {
        qtyStr = cols[1];
        desc = "";
        priceStr = "";
        unit = "";
      } else {
        desc = cols[1];
        priceStr = "";
        unit = "";
        qtyStr = "";
      }
    } else if (cols.length === 3) {
      if (!isNaN(cols[2]) && cols[2] !== "") {
        qtyStr = cols[2];
        if (!isNaN(cols[1]) && cols[1] !== "") {
          priceStr = cols[1];
          desc = "";
        } else {
          desc = cols[1];
          priceStr = "";
        }
      } else {
        desc = cols[1];
        priceStr = cols[2];
      }
    } else if (cols.length === 4) {
      qtyStr = cols[3];
      if (!isNaN(cols[2]) && cols[2] !== "") {
        priceStr = cols[2];
        desc = cols[1];
      } else {
        unit = cols[2];
        desc = cols[1];
      }
    }

    // Lookup fallback using loaded state.materials
    const material = state.materials.find(m => m.code.toLowerCase() === code.toLowerCase());
    if (material) {
      if (!desc) desc = material.description;
      if (!priceStr) priceStr = material.price.toString();
      if (!unit) unit = material.unit;
    }

    const cleanNum = (str) => {
      if (!str) return 0;
      const sanitized = str.replace(/[$,৳\s]/g, "").replace(/,/g, "");
      const val = parseFloat(sanitized);
      return isNaN(val) ? 0 : val;
    };

    const price = cleanNum(priceStr);
    const qty = cleanNum(qtyStr);

    let row;
    if (currentIdx < state.assessmentRows.length) {
      row = state.assessmentRows[currentIdx];
      row.approveCode = code;
      row.description = desc;
      row.unitPrice = price;
      row.unit = unit || "kg";
      row.quantity = qty;
    } else {
      const rowId = "row_" + Date.now() + "_" + Math.floor(Math.random() * 1000) + "_" + currentIdx;
      row = {
        id:          rowId,
        approveCode: code,
        description: desc,
        unitPrice:   price,
        unit:        unit || "kg",
        quantity:    qty,
        totalPrice: 0, insurance: 0, landing: 0, assessableValue: 0,
        cdRate:  state.defaultRates.cd,  rdRate:  state.defaultRates.rd,
        sdRate:  state.defaultRates.sd,  vatRate: state.defaultRates.vat,
        aitRate: state.defaultRates.ait, atRate:  state.defaultRates.at,
        cd: 0, rd: 0, sd: 0, vat: 0, ait: 0, at: 0, totalDutyTax: 0
      };
      state.assessmentRows.push(row);
    }

    calculateRow(row);
    currentIdx++;
    pastedCount++;
  }

  saveState();
  renderAssessmentTable();
  updateDashboardMetrics();

  const successMsg = state.language === "bn"
    ? `${pastedCount}টি লাইনের ডাটা এক্সেল হতে পেস্ট করা হয়েছে।`
    : `Pasted ${pastedCount} rows of data from Excel.`;
  showToast(successMsg, "success");
}

// === MATERIAL MODAL ===
function openMaterialModal() {
  document.getElementById("materialModal").classList.add("active");
}

function closeMaterialModal() {
  document.getElementById("materialModal").classList.remove("active");
  document.getElementById("mat-code").value  = "";
  document.getElementById("mat-desc").value  = "";
  document.getElementById("mat-price").value = "";
  document.getElementById("mat-unit").value  = "kg";
  document.getElementById("materialModalTitle").textContent =
    state.language === "bn" ? "নতুন মালামাল যোগ" : "Add New Material";
}

function saveMaterial() {
  const code  = document.getElementById("mat-code").value.trim();
  const desc  = document.getElementById("mat-desc").value.trim();
  const price = parseFloat(document.getElementById("mat-price").value) || 0;
  const unit  = document.getElementById("mat-unit").value.trim();

  if (!code || !desc) {
    showToast(state.language === "bn" ? "কোড এবং বিবরণী পূরণ করা আবশ্যক।" : "Code and Description are required.", "error");
    return;
  }

  const idx = state.materials.findIndex(m => m.code === code);
  if (idx > -1) {
    state.materials[idx] = { code, description: desc, price, unit };
    showToast(state.language === "bn" ? "মালামাল আপডেট করা হয়েছে।" : "Material updated.", "success");
  } else {
    state.materials.push({ code, description: desc, price, unit });
    showToast(state.language === "bn" ? "নতুন মালামাল যোগ করা হয়েছে।" : "Material added.", "success");
  }

  saveState();
  closeMaterialModal();
  renderMaterialsList();
}

// === CSV EXPORT ===
function exportToCSV() {
  const dict = TRANSLATIONS[state.language];
  let csv = "";
  csv += `Customs Assessment Export,${state.header.companyName}\n`;
  csv += `File No. Exist,${state.header.hasFileNo}\n`;
  csv += `Note Para,${state.header.noteParaNo},Letter Page,${state.header.letterPageNo},BEPZA Rec,${state.header.bepzaRecNo}\n\n`;

  const headers = [
    dict.sl, dict.approveCode, dict.description, dict.unitPrice, dict.unit, dict.qty,
    dict.totalPrice, dict.insurance, dict.landing, dict.assessableVal,
    "CD", "RD", "SD", "VAT", "AIT", "AT", dict.dutyTax
  ];
  csv += headers.join(",") + "\n";

  state.assessmentRows.forEach((row, i) => {
    const data = [
      i + 1,
      `"${row.approveCode.replace(/"/g, '""')}"`,
      `"${row.description.replace(/"/g, '""')}"`,
      row.unitPrice, `"${row.unit}"`, row.quantity,
      row.totalPrice, row.insurance, row.landing, row.assessableValue,
      row.cd, row.rd, row.sd, row.vat, row.ait, row.at, row.totalDutyTax
    ];
    csv += data.join(",") + "\n";
  });

  downloadCSV(csv, `customs_assessment_${state.header.companyName || "export"}.csv`);
  showToast(state.language === "bn" ? "ফাইল ডাউনলোড হচ্ছে..." : "File download started.", "success");
}

// === CSV IMPORT ===
function importFromCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const text  = evt.target.result;
    const lines = text.split("\n");
    if (lines.length < 3) {
      showToast(state.language === "bn" ? "ভুল ফাইল ফরম্যাট।" : "Invalid CSV format.", "error");
      return;
    }
    try {
      const newRows = [];
      let parsedHeader = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, "").trim());

        if (cols[0] === "Customs Assessment Export") { state.header.companyName = cols[1] || ""; parsedHeader = true; continue; }
        if (cols[0] === "File No. Exist")            { state.header.hasFileNo = cols[1] || "Yes"; continue; }
        if (cols[0] === "Note Para")                 { state.header.noteParaNo = cols[1] || ""; state.header.letterPageNo = cols[3] || ""; state.header.bepzaRecNo = cols[5] || ""; continue; }
        if (cols[0] === "Sl. No" || cols[0] === "ক্র. নং" || (parsedHeader && isNaN(parseInt(cols[0])))) continue;

        if (cols.length >= 10 && !isNaN(parseInt(cols[0]))) {
          const rowId = "row_" + Date.now() + "_" + Math.floor(Math.random() * 1000) + "_" + i;
          const row = {
            id: rowId,
            approveCode: cols[1] || "", description: cols[2] || "",
            unitPrice: parseFloat(cols[3]) || 0, unit: cols[4] || "kg",
            quantity: parseFloat(cols[5]) || 0,
            totalPrice: 0, insurance: 0, landing: 0, assessableValue: 0,
            cdRate: state.defaultRates.cd, rdRate: state.defaultRates.rd,
            sdRate: state.defaultRates.sd, vatRate: state.defaultRates.vat,
            aitRate: state.defaultRates.ait, atRate: state.defaultRates.at,
            cd: 0, rd: 0, sd: 0, vat: 0, ait: 0, at: 0, totalDutyTax: 0
          };
          calculateRow(row);
          newRows.push(row);
        }
      }

      if (newRows.length > 0) {
        state.assessmentRows = newRows;
        saveState();
        renderCompanyOptions();
        if (document.getElementById("header-hasFileNo"))   document.getElementById("header-hasFileNo").value   = state.header.hasFileNo;
        if (document.getElementById("header-filePageNo"))  document.getElementById("header-filePageNo").value  = state.header.filePageNo  || "";
        if (document.getElementById("header-noteParaNo"))  document.getElementById("header-noteParaNo").value  = state.header.noteParaNo  || "";
        if (document.getElementById("header-letterPageNo")) document.getElementById("header-letterPageNo").value = state.header.letterPageNo || "";
        if (document.getElementById("header-bepzaRecNo"))  document.getElementById("header-bepzaRecNo").value  = state.header.bepzaRecNo  || "";
        updateUI();
        showToast(state.language === "bn" ? "সফলভাবে ডাটা ইমপোর্ট করা হয়েছে!" : "Data imported successfully!", "success");
      } else {
        showToast(state.language === "bn" ? "কোন ডাটা রো পাওয়া যায়নি।" : "No data rows found in the file.", "warning");
      }
    } catch (err) {
      console.error(err);
      showToast(state.language === "bn" ? "ইমপোর্ট ফাইল প্রসেস করতে ত্রুটি হয়েছে।" : "Error parsing the import CSV file.", "error");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
}

// === SUPABASE UI HANDLERS ===
function updateSupabaseUI() {
  const urlEl = document.getElementById("supabaseUrlInput");
  const keyEl = document.getElementById("supabaseKeyInput");
  const statusEl = document.getElementById("supabaseStatusBadge");
  if (!urlEl || !keyEl || !statusEl) return;

  const creds = getSupabaseCredentials();
  urlEl.value = creds.url;
  keyEl.value = creds.key;

  const isConnected = !!getSupabaseClient();
  statusEl.innerHTML = isConnected
    ? `স্ট্যাটাস: <span style="font-weight:600; color:#2ecc71;">⚡ সংযুক্ত (Connected to Supabase Cloud)</span>`
    : `স্ট্যাটাস: <span style="font-weight:600; color:#e74c3c;">সংযুক্ত নয় (Not Connected)</span>`;
}

function handleSaveSupabaseCredentials() {
  const url = document.getElementById("supabaseUrlInput").value;
  const key = document.getElementById("supabaseKeyInput").value;

  if (saveSupabaseCredentials(url, key)) {
    updateSupabaseUI();
    showToast(state.language === "bn" ? "Supabase সংযোগ সফলভাবে সেভ হয়েছে!" : "Supabase credentials saved & connected!", "success");
  } else {
    updateSupabaseUI();
    if (!url || !key) {
      showToast(state.language === "bn" ? "Supabase সংযোগ মুছে ফেলা হয়েছে।" : "Supabase disconnected.", "info");
    } else {
      showToast(state.language === "bn" ? "Supabase সংযোগ ব্যর্থ হয়েছে। URL ও Key পরীক্ষা করুন।" : "Supabase connection failed.", "error");
    }
  }
}

async function handleTestSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    showToast(state.language === "bn" ? "প্রথমে Supabase URL ও Key ইনপুট দিয়ে সেভ করুন।" : "Please enter Supabase URL and Key first.", "warning");
    return;
  }
  showToast(state.language === "bn" ? "Supabase সংযোগ পরীক্ষা করা হচ্ছে..." : "Testing Supabase connection...", "info");
  try {
    const res = await fetchCompaniesFromSupabaseCloud();
    if (res.success) {
      updateSupabaseUI();
      showToast(state.language === "bn" ? "Supabase ক্লাউড ডেটাবেজ সফলভাবে সংযুক্ত হয়েছে! ⚡" : "Connected to Supabase Cloud successfully!", "success");
    } else {
      showToast(state.language === "bn" ? "সংযুক্তিতে সমস্যা: " + res.message : "Connection issue: " + res.message, "error");
    }
  } catch (err) {
    showToast("Supabase Test Error: " + err.message, "error");
  }
}

function handleCopySqlSchema() {
  const sql = `-- Supabase Migration Schema
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    assessment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    rows_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_assessable_value NUMERIC(15, 2) DEFAULT 0,
    total_duty_tax NUMERIC(15, 2) DEFAULT 0,
    header_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.companies (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    circle TEXT,
    status TEXT DEFAULT 'Active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
CREATE TABLE IF NOT EXISTS public.materials (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0,
    unit TEXT DEFAULT 'kg',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public all access on assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on materials" ON public.materials FOR ALL USING (true) WITH CHECK (true);`;

  navigator.clipboard.writeText(sql).then(() => {
    showToast(state.language === "bn" ? "Supabase SQL Schema ক্লিপবোর্ডে কপি হয়েছে!" : "Supabase SQL Schema copied to clipboard!", "success");
  }).catch(() => {
    showToast("Unable to copy SQL script.", "error");
  });
}

async function handleSyncAllToCloud() {
  if (!getSupabaseClient()) {
    showToast(state.language === "bn" ? "প্রথমে Supabase সংযোগ প্রস্তুত করুন।" : "Supabase client not connected.", "warning");
    return;
  }
  showToast(state.language === "bn" ? "সকল ডেটা ক্লাউডে সিঙ্ক হচ্ছে..." : "Syncing all data to Supabase Cloud...", "info");

  try {
    let compRes = await syncCompaniesToSupabaseCloud(state.companies);
    let matRes  = await syncMaterialsToSupabaseCloud(state.materials);

    if (compRes.success && matRes.success) {
      showToast(state.language === "bn" ? "কোম্পানি ও মালামালের ডেটা Supabase ক্লাউডে সিঙ্ক হয়েছে! ☁️" : "Companies & Materials synced to Supabase Cloud!", "success");
    } else {
      showToast(state.language === "bn" ? "সিঙ্ক করার সময় কিছু সমস্যা হয়েছে।" : "Sync partial error.", "warning");
    }
  } catch (err) {
    showToast("Cloud Sync Error: " + err.message, "error");
  }
}

// ===================================================================
// SUPABASE AUTH MODAL HANDLERS
// ===================================================================

let _authTab = "login"; // "login" | "signup"

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.add("active");
  updateAuthUI();
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) return;
  modal.classList.remove("active");
  clearAuthError();
}

function switchAuthTab(tab) {
  _authTab = tab;
  document.getElementById("loginTabBtn").classList.toggle("active", tab === "login");
  document.getElementById("signupTabBtn").classList.toggle("active", tab === "signup");
  document.getElementById("authSubmitIcon").textContent = tab === "login" ? "🔑" : "📝";
  document.getElementById("authSubmitLabel").textContent = tab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন";
  document.getElementById("authModalTitle").textContent = tab === "login" ? "Supabase লগইন" : "নতুন অ্যাকাউন্ট";
  clearAuthError();
}

function clearAuthError() {
  const el = document.getElementById("authError");
  if (el) { el.style.display = "none"; el.textContent = ""; }
}

function showAuthError(msg) {
  const el = document.getElementById("authError");
  if (el) { el.style.display = "block"; el.textContent = msg; }
}

function togglePasswordVisibility() {
  const inp = document.getElementById("authPasswordInput");
  const btn = document.getElementById("passwordToggleBtn");
  if (!inp) return;
  if (inp.type === "password") {
    inp.type = "text";
    btn.textContent = "🙈";
  } else {
    inp.type = "password";
    btn.textContent = "👁";
  }
}

async function handleAuthSubmit() {
  const email    = (document.getElementById("authEmailInput")?.value || "").trim();
  const password = document.getElementById("authPasswordInput")?.value || "";
  clearAuthError();

  if (!email || !password) {
    showAuthError("ইমেইল ও পাসওয়ার্ড দিন।");
    return;
  }
  if (!getSupabaseClient()) {
    showAuthError("প্রথমে Settings থেকে Supabase URL ও Anon Key সেভ করুন।");
    return;
  }

  const btn = document.getElementById("authSubmitBtn");
  btn.disabled = true;
  const origLabel = document.getElementById("authSubmitLabel").textContent;
  document.getElementById("authSubmitLabel").textContent = "অপেক্ষা করুন...";

  try {
    let result;
    if (_authTab === "login") {
      result = await supabaseLogin(email, password);
    } else {
      result = await supabaseSignUp(email, password);
    }

    if (result.success) {
      updateAuthUI();
      if (_authTab === "signup" && !result.session) {
        showToast("নিবন্ধন সফল! ইমেইল যাচাই করুন (confirm email)।", "success");
      } else {
        showToast(_authTab === "login" ? "Supabase লগইন সফল হয়েছে! ✅" : "অ্যাকাউন্ট তৈরি ও লগইন সফল!", "success");
      }
      closeAuthModal();
    } else {
      showAuthError(result.message || "লগইন/নিবন্ধন ব্যর্থ হয়েছে।");
    }
  } finally {
    btn.disabled = false;
    document.getElementById("authSubmitLabel").textContent = origLabel;
  }
}

async function handleSupabaseLogout() {
  const result = await supabaseLogout();
  if (result.success) {
    updateAuthUI();
    closeAuthModal();
    showToast("লগআউট সফল হয়েছে।", "info");
  } else {
    showToast("লগআউট করতে সমস্যা হয়েছে: " + result.message, "error");
  }
}

async function handleAuthSyncAll() {
  showToast("ক্লাউডে সব ডেটা সিঙ্ক হচ্ছে...", "info");
  try {
    const [compRes, matRes] = await Promise.all([
      syncCompaniesToSupabaseCloud(state.companies),
      syncMaterialsToSupabaseCloud(state.materials)
    ]);
    if (compRes.success && matRes.success) {
      showToast("কোম্পানি ও মালামাল ক্লাউডে সিঙ্ক হয়েছে! ☁️", "success");
    } else {
      showToast("সিঙ্ক আংশিক সম্পন্ন হয়েছে।", "warning");
    }
  } catch (err) {
    showToast("সিঙ্ক ত্রুটি: " + err.message, "error");
  }
}

function updateAuthUI() {
  const cloudUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  const localUser = typeof authCurrentUser === "function" ? authCurrentUser() : null;
  const user = cloudUser || localUser;
  const btn  = document.getElementById("authBtn");
  const lblBtn = document.getElementById("authBtnLabel");
  const loggedOutView = document.getElementById("authLoggedOutView");
  const loggedInView  = document.getElementById("authLoggedInView");
  const userEmailEl   = document.getElementById("authUserEmail");

  if (user) {
    // Logged in
    if (btn) {
      btn.className = "btn btn-ghost btn-sm auth-btn-loggedin";
      if (lblBtn) lblBtn.textContent = user.email ? user.email.split("@")[0] : "লগড ইন";
    }
    if (loggedOutView) loggedOutView.style.display = "none";
    if (loggedInView)  loggedInView.style.display  = "block";
    if (userEmailEl)   userEmailEl.textContent = user.email || "—";
  } else {
    // Guest
    if (btn) {
      btn.className = "btn btn-ghost btn-sm auth-btn-guest";
      if (lblBtn) lblBtn.textContent = "লগইন";
    }
    if (loggedOutView) loggedOutView.style.display = "block";
    if (loggedInView)  loggedInView.style.display  = "none";
  }

  // Also update supabase settings badge if present
  if (typeof updateSupabaseUI === "function") updateSupabaseUI();
}

// Close auth modal on overlay click / Escape

// ===================================================================
// MANUAL AUTH HANDLERS — Login Gate & User Modal
// ===================================================================

function showLoginGate() {
  const gate = document.getElementById("loginGate");
  if (gate) gate.classList.remove("hidden");
  // Focus username field
  setTimeout(() => { const u = document.getElementById("lgUsername"); if (u) u.focus(); }, 100);
}

function hideLoginGate() {
  const gate = document.getElementById("loginGate");
  if (gate) gate.classList.add("hidden");
}

function toggleLoginPwd() {
  const inp = document.getElementById("lgPassword");
  if (!inp) return;
  inp.type = inp.type === "password" ? "text" : "password";
}
// ensure global access for inline handlers
if (typeof window !== 'undefined') window.toggleLoginPwd = toggleLoginPwd;

function resetLocalLogin() {
  if (!window.confirm("Reset saved local login information?")) return;
  if (typeof authResetDefaultUsers === "function") authResetDefaultUsers();

  const errorEl = document.getElementById("lgError");
  if (errorEl) {
    errorEl.textContent = "Local login has been reset. Use your default login credentials.";
    errorEl.style.display = "block";
  }
  const password = document.getElementById("lgPassword");
  if (password) password.value = "";
}
if (typeof window !== 'undefined') window.resetLocalLogin = resetLocalLogin;

function handleLoginGate() {
  const username = (document.getElementById("lgUsername")?.value || "").trim();
  const password  = document.getElementById("lgPassword")?.value || "";
  const remember  = document.getElementById("lgRemember")?.checked || false;
  const errorEl   = document.getElementById("lgError");
  const btn       = document.getElementById("lgSubmitBtn");

  errorEl.style.display = "none";

  if (!username || !password) {
    errorEl.textContent = "ব্যবহারকারীর নাম ও পাসওয়ার্ড দিন।";
    errorEl.style.display = "block";
    return;
  }

  btn.disabled = true;
  btn.textContent = "যাচাই করা হচ্ছে...";

  setTimeout(() => {
    const result = authLogin(username, password, remember);
    btn.disabled = false;
    btn.innerHTML = "<span>🔑</span> প্রবেশ করুন";

    if (result.success) {
      hideLoginGate();
      bootApp();
      showToast(`স্বাগতম, ${result.user.displayName}! 👋`, "success");
    } else {
      errorEl.textContent = result.message;
      errorEl.style.display = "block";
      document.getElementById("lgPassword").value = "";
      document.getElementById("lgPassword").focus();
    }
  }, 200);
}
if (typeof window !== 'undefined') window.handleLoginGate = handleLoginGate;

function updateTopbarUser() {
  const user   = authCurrentUser();
  const btn    = document.getElementById("authBtn");
  const lbl    = document.getElementById("authBtnLabel");
  if (!btn || !lbl) return;

  if (user) {
    btn.className = "btn btn-ghost btn-sm auth-btn-loggedin";
    lbl.textContent = user.displayName || user.username;
  } else {
    btn.className = "btn btn-ghost btn-sm auth-btn-guest";
    lbl.textContent = "লগইন";
  }
}

function openUserModal() {
  const user = authCurrentUser();
  if (!user) { showLoginGate(); return; }

  document.getElementById("userModalName").textContent = user.displayName || user.username;
  document.getElementById("userModalRole").textContent =
    user.role === "admin" ? "🔑 Admin (অ্যাডমিন)" : "👁 Viewer";

  // Show change-password only for users logged in
  document.getElementById("userModal").classList.add("active");
}

function closeUserModal() {
  document.getElementById("userModal").classList.remove("active");
  // Clear change pwd fields
  const o = document.getElementById("oldPwdInput"); if (o) o.value = "";
  const n = document.getElementById("newPwdInput"); if (n) n.value = "";
}

function handleManualLogout() {
  authLogout();
  closeUserModal();
  updateTopbarUser();
  showToast("লগআউট সফল হয়েছে।", "info");
  // Reload page to show login gate cleanly
  setTimeout(() => location.reload(), 600);
}

function handleChangePwd() {
  const user   = authCurrentUser();
  const oldPwd = document.getElementById("oldPwdInput")?.value || "";
  const newPwd = document.getElementById("newPwdInput")?.value || "";

  if (!user) return;
  const result = authChangePassword(user.username, oldPwd, newPwd);
  if (result.success) {
    showToast("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! 🔒", "success");
    closeUserModal();
  } else {
    showToast(result.message, "error");
  }
}


// Expose a few handlers to the global window for inline onclick attributes
try {
  if (typeof window !== 'undefined') {
    window.toggleLoginPwd = typeof toggleLoginPwd === 'function' ? toggleLoginPwd : undefined;
    window.handleLoginGate = typeof handleLoginGate === 'function' ? handleLoginGate : undefined;
    window.resetLocalLogin = typeof resetLocalLogin === 'function' ? resetLocalLogin : undefined;
    window.openUserModal = typeof openUserModal === 'function' ? openUserModal : undefined;
    window.handleChangePwd = typeof handleChangePwd === 'function' ? handleChangePwd : undefined;
    window.handleManualLogout = typeof handleManualLogout === 'function' ? handleManualLogout : undefined;
    window.saveNewCompany = typeof saveNewCompany === 'function' ? saveNewCompany : undefined;
  }
} catch (e) {
  // ignore in non-browser environments
}


