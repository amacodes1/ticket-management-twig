export function loadTickets() {
  return JSON.parse(localStorage.getItem("tickets") || "[]");
}

export function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}
