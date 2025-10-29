const KEY = "ticketapp_tickets";

// Load all tickets from localStorage
export function loadTickets() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save tickets to localStorage
export function saveTickets(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// Get single ticket by ID
export function getTicketById(id) {
  const tickets = loadTickets();
  return tickets.find(t => t.id === id) || null;
}

// Create new ticket
export function createTicket(ticketData) {
  const tickets = loadTickets();
  const ticket = {
    id: generateId(),
    title: ticketData.title,
    description: ticketData.description || '',
    status: ticketData.status || 'open',
    priority: ticketData.priority || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  return ticket;
}

// Update existing ticket
export function updateTicket(id, updates) {
  const tickets = loadTickets();
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Ticket not found');
  
  tickets[index] = {
    ...tickets[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveTickets(tickets);
  return tickets[index];
}

// Delete ticket
export function deleteTicket(id) {
  const tickets = loadTickets();
  const filtered = tickets.filter(t => t.id !== id);
  saveTickets(filtered);
  return filtered.length < tickets.length;
}

// Search tickets
export function searchTickets(query) {
  const tickets = loadTickets();
  if (!query) return tickets;
  
  const lowercaseQuery = query.toLowerCase();
  return tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(lowercaseQuery) ||
    ticket.description.toLowerCase().includes(lowercaseQuery)
  );
}

// Filter tickets by status
export function filterTicketsByStatus(status) {
  const tickets = loadTickets();
  return status ? tickets.filter(t => t.status === status) : tickets;
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
