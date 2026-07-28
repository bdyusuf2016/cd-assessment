/**
 * Customs Assessment Manager — Manual Authentication Module
 * Local username/password auth with sessionStorage session management.
 * No external dependencies. Developed by: Md. Yusuf Ali
 */

const AUTH = {
  SESSION_KEY: "customs_session",
  USERS_KEY:   "customs_users",

  // Default built-in admin — user can change password from Settings
  DEFAULT_USERS: [
    { username: "admin",   password: "admin123",  role: "admin",  displayName: "Admin" },
    { username: "yusuf",   password: "yusuf@123", role: "admin",  displayName: "Md. Yusuf Ali" }
  ]
};

/* ── helpers ── */
function authHash(str) {
  // Simple but consistent hash (not crypto-secure, adequate for local use)
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

/* ── User Store ── */
function authGetUsers() {
  try {
    const raw = localStorage.getItem(AUTH.USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  // Seed defaults on first run
  const defaults = AUTH.DEFAULT_USERS.map(u => ({
    username:    u.username,
    passwordHash: authHash(u.password),
    role:        u.role,
    displayName: u.displayName
  }));
  localStorage.setItem(AUTH.USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function authSaveUsers(users) {
  localStorage.setItem(AUTH.USERS_KEY, JSON.stringify(users));
}

/* ── Session ── */
function authGetSession() {
  try {
    const raw = sessionStorage.getItem(AUTH.SESSION_KEY) ||
                localStorage.getItem(AUTH.SESSION_KEY + "_remember");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

function authSetSession(user, remember = false) {
  const session = {
    username:    user.username,
    displayName: user.displayName,
    role:        user.role,
    loginAt:     Date.now()
  };
  sessionStorage.setItem(AUTH.SESSION_KEY, JSON.stringify(session));
  if (remember) {
    localStorage.setItem(AUTH.SESSION_KEY + "_remember", JSON.stringify(session));
  }
}

function authClearSession() {
  sessionStorage.removeItem(AUTH.SESSION_KEY);
  localStorage.removeItem(AUTH.SESSION_KEY + "_remember");
}

/* ── API ── */
function authLogin(username, password, remember = false) {
  const users = authGetUsers();
  const user  = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) return { success: false, message: "ব্যবহারকারীর নাম পাওয়া যায়নি।" };
  if (user.passwordHash !== authHash(password)) {
    return { success: false, message: "পাসওয়ার্ড সঠিক নয়।" };
  }
  authSetSession(user, remember);
  return { success: true, user: { username: user.username, displayName: user.displayName, role: user.role } };
}

function authResetDefaultUsers() {
  const defaults = AUTH.DEFAULT_USERS.map(u => ({
    username: u.username,
    passwordHash: authHash(u.password),
    role: u.role,
    displayName: u.displayName
  }));
  localStorage.setItem(AUTH.USERS_KEY, JSON.stringify(defaults));
  authClearSession();
}

function authLogout() {
  authClearSession();
}

function authCurrentUser() {
  return authGetSession();
}

function authIsLoggedIn() {
  return !!authGetSession();
}

function authChangePassword(username, oldPassword, newPassword) {
  const users = authGetUsers();
  const idx   = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
  if (idx === -1) return { success: false, message: "ব্যবহারকারী পাওয়া যায়নি।" };
  if (users[idx].passwordHash !== authHash(oldPassword)) {
    return { success: false, message: "পুরানো পাসওয়ার্ড সঠিক নয়।" };
  }
  if (newPassword.length < 6) return { success: false, message: "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" };
  users[idx].passwordHash = authHash(newPassword);
  authSaveUsers(users);
  return { success: true };
}

function authAddUser(username, password, displayName = "", role = "viewer") {
  if (!username || !password) return { success: false, message: "ব্যবহারকারীর নাম ও পাসওয়ার্ড দিন।" };
  if (password.length < 6) return { success: false, message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" };
  const users = authGetUsers();
  if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return { success: false, message: "এই নামের ব্যবহারকারী ইতিমধ্যে আছে।" };
  }
  users.push({
    username: username.trim(),
    passwordHash: authHash(password),
    role,
    displayName: displayName.trim() || username.trim()
  });
  authSaveUsers(users);
  return { success: true };
}

function authDeleteUser(username) {
  const session = authGetSession();
  if (session && session.username.toLowerCase() === username.toLowerCase()) {
    return { success: false, message: "নিজেকে মুছতে পারবেন না।" };
  }
  const users = authGetUsers().filter(u => u.username.toLowerCase() !== username.toLowerCase());
  authSaveUsers(users);
  return { success: true };
}
