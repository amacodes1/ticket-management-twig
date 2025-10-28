export const SESSION_KEY = "ticketapp_session";

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getSession();
}

export async function mockRegister(email, password, name = "") {
  await new Promise((r) => setTimeout(r, 350));
  const usersRaw = localStorage.getItem("ticketapp_users") || "[]";
  const users = JSON.parse(usersRaw);
  if (users.find((u) => u.email === email)) {
    throw new Error("Email already registered");
  }
  users.push({ email, password, name });
  localStorage.setItem("ticketapp_users", JSON.stringify(users));
  const session = { token: btoa(email + ":" + Date.now()), email, name };
  saveSession(session);
  return session;
}

export async function mockLogin(email, password) {
  await new Promise((r) => setTimeout(r, 300));
  const usersRaw = localStorage.getItem("ticketapp_users") || "[]";
  const users = JSON.parse(usersRaw);
  const found = users.find((u) => u.email === email && u.password === password);
  if (!found) throw new Error("Invalid email or password");
  const session = {
    token: btoa(email + ":" + Date.now()),
    email,
    name: found.name || "",
  };
  saveSession(session);
  return session;
}
