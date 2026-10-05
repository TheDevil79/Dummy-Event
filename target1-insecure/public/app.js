// EventPulse Interactive Client Logic
document.addEventListener('DOMContentLoaded', () => {
  let allEvents = [];
  let currentCategory = 'all';
  let activeEvent = null;

  const eventsGrid = document.getElementById('eventsGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilters = document.getElementById('categoryFilters');
  const bookingModal = document.getElementById('bookingModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const bookingForm = document.getElementById('bookingForm');
  const ticketTier = document.getElementById('ticketTier');
  const ticketQuantity = document.getElementById('ticketQuantity');
  const summaryTier = document.getElementById('summaryTier');
  const summaryTotal = document.getElementById('summaryTotal');
  const toastContainer = document.getElementById('toastContainer');
  const newsletterForm = document.getElementById('newsletterForm');

  // Fetch events from Express API
  async function fetchEvents() {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        allEvents = data.data;
        renderEvents();
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      eventsGrid.innerHTML = `<div class="error-msg">Could not load summits. Ensure backend is running.</div>`;
    }
  }

  // Render event cards
  function renderEvents() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filtered = allEvents.filter(event => {
      const matchesCategory = currentCategory === 'all' || event.category.toLowerCase() === currentCategory.toLowerCase();
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm) || 
        event.description.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      eventsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <h3>No summits found matching your criteria</h3>
          <p>Try searching for different keywords or reset the category filter.</p>
        </div>
      `;
      return;
    }

    eventsGrid.innerHTML = filtered.map(event => `
      <article class="event-card" data-id="${event.id}">
        <div class="card-media">
          <img src="${event.image}" alt="${event.title}" loading="lazy">
          <span class="card-badge">${event.badge}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span>${event.date}</span>
            <span>${event.location.split('&')[0]}</span>
          </div>
          <h3 class="card-title">${event.title}</h3>
          <p class="card-desc">${event.description}</p>
          <div class="card-footer">
            <div class="price-box">
              <span class="price-val">${event.price}</span>
              <span class="seats-badge ${event.seatsLeft < 30 ? 'low' : ''}">
                ${event.seatsLeft} passes left
              </span>
            </div>
            <button class="btn btn-outline book-trigger-btn" data-id="${event.id}">
              Book Pass &rarr;
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click listeners to book buttons
    document.querySelectorAll('.book-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openBookingModal(id);
      });
    });
  }

  // Filter Buttons
  categoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      renderEvents();
    }
  });

  // Search input debounced
  searchInput.addEventListener('input', () => {
    renderEvents();
  });

  // Modal open & close
  function openBookingModal(eventId) {
    activeEvent = allEvents.find(e => e.id === eventId);
    if (!activeEvent) return;

    document.getElementById('modalBadge').textContent = activeEvent.badge;
    document.getElementById('modalEventTitle').textContent = activeEvent.title;
    document.getElementById('modalEventMeta').textContent = `${activeEvent.date} • ${activeEvent.location}`;
    document.getElementById('bookEventId').value = activeEvent.id;
    ticketQuantity.max = activeEvent.seatsLeft;
    ticketQuantity.value = 1;

    updatePricingSummary();
    bookingModal.classList.add('active');
  }

  function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingForm.reset();
    activeEvent = null;
  }

  modalCloseBtn.addEventListener('click', closeBookingModal);
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });

  // Pricing calculation
  function updatePricingSummary() {
    if (!activeEvent) return;
    const selectedOption = ticketTier.options[ticketTier.selectedIndex];
    const multiplier = parseFloat(selectedOption.dataset.multiplier) || 1;
    const qty = parseInt(ticketQuantity.value, 10) || 1;
    
    summaryTier.textContent = selectedOption.value;

    if (activeEvent.price.toLowerCase() === 'free') {
      summaryTotal.textContent = 'Free RSVP';
    } else {
      const basePrice = parseFloat(activeEvent.price.replace('$', '')) || 100;
      const total = Math.round(basePrice * multiplier * qty);
      summaryTotal.textContent = `$${total}`;
    }
  }

  ticketTier.addEventListener('change', updatePricingSummary);
  ticketQuantity.addEventListener('input', updatePricingSummary);

  // Form submission: Book Ticket
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = document.getElementById('bookEventId').value;
    const attendeeName = document.getElementById('attendeeName').value.trim();
    const email = document.getElementById('attendeeEmail').value.trim();
    const tier = ticketTier.value;
    const qty = parseInt(ticketQuantity.value, 10);

    try {
      const res = await fetch('/api/tickets/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          attendeeName,
          email,
          ticketType: tier,
          quantity: qty
        })
      });

      const result = await res.json();
      if (result.success) {
        showToast(`🎉 Booking confirmed! Confirmation ID: ${result.booking.bookingId}`);
        closeBookingModal();
        // Refresh event seats
        await fetchEvents();
      } else {
        showToast(`⚠️ Booking failed: ${result.error || 'Server error'}`);
      }
    } catch (err) {
      showToast(`❌ Connection error: Could not reach booking API.`);
    }
  });

  // Newsletter Form
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    showToast(`✨ Thanks for subscribing! VIP announcements will be sent to ${emailInput.value}`);
    emailInput.value = '';
  });

  // Toast Helper
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Initial fetch
  fetchEvents();
});
