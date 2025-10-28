const KEY = "ticketapp_tickets";

export function loadTickets() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTickets(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9);
}

export function createTicket(newTicket) {
  const list = loadTickets();
  const ticket = {
    ...newTicket,
    id: cryptoRandomId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  list.unshift(ticket);
  saveTickets(list);
  return ticket;
}

export function updateTicket(updated) {
  const list = loadTickets();
  const idx = list.findIndex((t) => t.id === updated.id);
  if (idx === -1) throw new Error("Ticket not found");
  updated.updatedAt = new Date().toISOString();
  list[idx] = updated;
  saveTickets(list);
  return updated;
}

export function deleteTicket(id) {
  const list = loadTickets();
  const newList = list.filter((t) => t.id !== id);
  saveTickets(newList);
}
