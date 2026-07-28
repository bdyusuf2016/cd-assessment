/**
 * Customs Assessment Manager — Supabase Integration & Authentication Module
 * Developed by: Md. Yusuf Ali
 */

const SUPABASE_CONFIG = {
  urlKey: "customs_supabase_url",
  anonKey: "customs_supabase_anon_key",
  client: null,
  currentUser: null
};

// Initialize Supabase client
function initSupabase() {
  const url = localStorage.getItem(SUPABASE_CONFIG.urlKey) || "";
  const key = localStorage.getItem(SUPABASE_CONFIG.anonKey) || "";

  if (url && key && typeof supabase !== "undefined") {
    try {
      SUPABASE_CONFIG.client = supabase.createClient(url, key);
      console.log("Supabase Client initialized successfully.");

      // Check current session
      SUPABASE_CONFIG.client.auth.getSession().then(({ data }) => {
        SUPABASE_CONFIG.currentUser = data.session ? data.session.user : null;
        if (typeof updateAuthUI === "function") updateAuthUI();
      });

      // Listen to auth state changes
      SUPABASE_CONFIG.client.auth.onAuthStateChange((event, session) => {
        SUPABASE_CONFIG.currentUser = session ? session.user : null;
        if (typeof updateAuthUI === "function") updateAuthUI();
      });

      return true;
    } catch (e) {
      console.error("Failed to initialize Supabase:", e);
    }
  }
  SUPABASE_CONFIG.client = null;
  SUPABASE_CONFIG.currentUser = null;
  return false;
}

// Get current Supabase client
function getSupabaseClient() {
  if (!SUPABASE_CONFIG.client) {
    initSupabase();
  }
  return SUPABASE_CONFIG.client;
}

// Save Credentials
function saveSupabaseCredentials(url, key) {
  if (!url || !key) {
    localStorage.removeItem(SUPABASE_CONFIG.urlKey);
    localStorage.removeItem(SUPABASE_CONFIG.anonKey);
    SUPABASE_CONFIG.client = null;
    SUPABASE_CONFIG.currentUser = null;
    return false;
  }
  localStorage.setItem(SUPABASE_CONFIG.urlKey, url.trim());
  localStorage.setItem(SUPABASE_CONFIG.anonKey, key.trim());
  return initSupabase();
}

// Get saved Credentials
function getSupabaseCredentials() {
  return {
    url: localStorage.getItem(SUPABASE_CONFIG.urlKey) || "",
    key: localStorage.getItem(SUPABASE_CONFIG.anonKey) || ""
  };
}

// --- AUTHENTICATION API ---

// 1. Login with Email & Password
async function supabaseLogin(email, password) {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: "Supabase client not connected. Configure credentials in Settings." };

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    SUPABASE_CONFIG.currentUser = data.user;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.error("Supabase Login Error:", err);
    return { success: false, message: err.message };
  }
}

// 2. Sign Up new user
async function supabaseSignUp(email, password) {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: "Supabase client not connected. Configure credentials in Settings." };

  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    SUPABASE_CONFIG.currentUser = data.user;
    return { success: true, user: data.user, session: data.session };
  } catch (err) {
    console.error("Supabase SignUp Error:", err);
    return { success: false, message: err.message };
  }
}

// 3. Logout user
async function supabaseLogout() {
  const client = getSupabaseClient();
  if (!client) {
    SUPABASE_CONFIG.currentUser = null;
    return { success: true };
  }

  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    SUPABASE_CONFIG.currentUser = null;
    return { success: true };
  } catch (err) {
    console.error("Supabase Logout Error:", err);
    return { success: false, message: err.message };
  }
}

// Get current active user
function getCurrentUser() {
  return SUPABASE_CONFIG.currentUser;
}

// --- CLOUD SYNC OPERATIONS ---

// 1. Sync Assessment to Supabase Cloud
async function syncAssessmentToSupabaseCloud(assessment) {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: "Supabase not connected" };

  try {
    const user = getCurrentUser();
    const payload = {
      id: assessment.id,
      company_name: assessment.companyName || "",
      assessment_date: assessment.date || new Date().toISOString(),
      rows_data: JSON.stringify(assessment.rows || []),
      total_assessable_value: assessment.totalAssessableValue || 0,
      total_duty_tax: assessment.totalDutyTax || 0,
      header_info: JSON.stringify(assessment.header || {}),
      created_at: new Date().toISOString(),
      ...(user ? { user_id: user.id } : {})
    };

    const { data, error } = await client
      .from('assessments')
      .upsert([payload], { onConflict: 'id' });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Supabase syncAssessment error:", err);
    return { success: false, message: err.message };
  }
}

// 2. Fetch Assessments from Supabase Cloud
async function fetchAssessmentsFromSupabaseCloud() {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [] };

  try {
    const { data, error } = await client
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map(item => ({
      id: item.id,
      companyName: item.company_name,
      date: item.assessment_date,
      rows: typeof item.rows_data === 'string' ? JSON.parse(item.rows_data) : item.rows_data,
      totalAssessableValue: item.total_assessable_value,
      totalDutyTax: item.total_duty_tax,
      header: typeof item.header_info === 'string' ? JSON.parse(item.header_info) : item.header_info
    }));

    return { success: true, data: formatted };
  } catch (err) {
    console.error("Supabase fetchAssessments error:", err);
    return { success: false, message: err.message, data: [] };
  }
}

// 3. Sync Companies to Supabase Cloud
async function syncCompaniesToSupabaseCloud(companies) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(companies)) return { success: false };

  try {
    const user = getCurrentUser();
    const payload = companies.map(c => ({
      name: c.name,
      circle: c.circle || "",
      status: c.status || "Active",
      updated_at: new Date().toISOString(),
      ...(user ? { user_id: user.id } : {})
    }));

    const { data, error } = await client
      .from('companies')
      .upsert(payload, { onConflict: 'name' });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Supabase syncCompanies error:", err);
    return { success: false, message: err.message };
  }
}

// 4. Fetch Companies from Supabase Cloud
async function fetchCompaniesFromSupabaseCloud() {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [] };

  try {
    const { data, error } = await client
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error("Supabase fetchCompanies error:", err);
    return { success: false, message: err.message, data: [] };
  }
}

// 5. Sync Materials to Supabase Cloud
async function syncMaterialsToSupabaseCloud(materials) {
  const client = getSupabaseClient();
  if (!client || !Array.isArray(materials)) return { success: false };

  try {
    const user = getCurrentUser();
    const payload = materials.map(m => ({
      code: m.code,
      description: m.description || "",
      price: m.price || 0,
      unit: m.unit || "kg",
      updated_at: new Date().toISOString(),
      ...(user ? { user_id: user.id } : {})
    }));

    const { data, error } = await client
      .from('materials')
      .upsert(payload, { onConflict: 'code' });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Supabase syncMaterials error:", err);
    return { success: false, message: err.message };
  }
}

// Initialize on script load
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
});
