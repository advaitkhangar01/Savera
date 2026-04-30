/* ═══════════════════════════════════════════
   PAGES SPECIFIC JAVASCRIPT (Phase 1)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Carousel Logic (Stays Page)
  const track = document.querySelector('.carousel-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  let currentSlide = 0;
  const totalSlides = dots.length;

  function goToSlide(index) {
    // Clamp index
    currentSlide = (index + totalSlides) % totalSlides;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(d => d.classList.remove('active'));
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
  }

  if (track && totalSlides > 0) {
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => goToSlide(index));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Auto-play carousel every 4s
    setInterval(() => goToSlide(currentSlide + 1), 4000);
  }

  // 2. Booking Calculations & Add-ons
  const addonCards    = document.querySelectorAll('.addon-card');
  const summaryAddons = document.getElementById('summary-addons');
  const summaryTotal  = document.getElementById('summary-total');
  const summaryBase   = document.getElementById('summary-base');  // we'll add this below

  const NIGHTLY_RATE = 25000;
  let selectedAddonsTotal = 0;

  /** Returns number of nights between two date strings, or 1 if invalid */
  function calcNights() {
    const bCheckin  = document.getElementById('b-checkin');
    const bCheckout = document.getElementById('b-checkout');
    if (!bCheckin || !bCheckout || !bCheckin.value || !bCheckout.value) return 1;
    const diff = (new Date(bCheckout.value) - new Date(bCheckin.value)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 1;
  }

  /** Rebuild the entire summary (called on date change OR add-on toggle) */
  function recalcSummary() {
    if (!summaryTotal) return;

    const nights   = calcNights();
    const baseTotal = NIGHTLY_RATE * nights;

    // Update the base-rate line label to show × nights
    const baseLineSpan = document.getElementById('summary-base-label');
    const baseLineAmt  = document.getElementById('summary-base-amount');
    if (baseLineSpan) baseLineSpan.textContent = nights === 1
      ? 'Villa Base Rate'
      : `Villa Base Rate (₹25,000 × ${nights} nights)`;
    if (baseLineAmt)  baseLineAmt.textContent  = `₹${baseTotal.toLocaleString()}`;

    // Rebuild add-ons HTML
    selectedAddonsTotal = 0;
    let addonsHtml = '';
    document.querySelectorAll('.addon-card.selected').forEach(card => {
      const price = parseInt(card.dataset.price);
      const name  = card.dataset.name;
      selectedAddonsTotal += price;
      addonsHtml += `
        <div class="summary-line">
          <span>+ ${name}</span>
          <span>₹${price.toLocaleString()}</span>
        </div>`;
    });
    if (summaryAddons) summaryAddons.innerHTML = addonsHtml;

    const total = baseTotal + selectedAddonsTotal;
    summaryTotal.textContent = `₹${total.toLocaleString()}`;

    // Keep mock modal amount in sync
    const modalAmount = document.getElementById('modal-amount');
    if (modalAmount) modalAmount.textContent = `₹${total.toLocaleString()}`;
  }

  // Listen for date changes to update totals live
  const bCheckinEl  = document.getElementById('b-checkin');
  const bCheckoutEl = document.getElementById('b-checkout');
  if (bCheckinEl)  bCheckinEl.addEventListener('change',  recalcSummary);
  if (bCheckoutEl) bCheckoutEl.addEventListener('change', recalcSummary);

  // Add-on toggle
  if (addonCards.length > 0 && summaryTotal) {
    addonCards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        recalcSummary();
      });
    });
  }

  // Run once on load (in case dates were pre-filled from URL params)
  // Small delay so the inline script in booking.html can set the values first
  setTimeout(recalcSummary, 50);

  // 3. Mock Payment Modal Trigger
  const bookNowBtn = document.getElementById('bookNowBtn');
  const paymentOverlay = document.getElementById('paymentOverlay');
  const closeModal = document.getElementById('closeModal');
  const mockPayBtn = document.getElementById('mockPayBtn');
  const bookingSuccess = document.getElementById('bookingSuccess');
  const bookingFormFields = document.getElementById('bookingFormFields');

  if (bookNowBtn && paymentOverlay) {
    bookNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Ensure required dates are set
      const bCheckin = document.getElementById('b-checkin');
      const bCheckout = document.getElementById('b-checkout');
      
      if (bCheckin && bCheckin.value === "" || bCheckout && bCheckout.value === "") {
         alert('Please select your check-in and check-out dates.');
         return;
      }
      paymentOverlay.classList.add('active');
    });

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        paymentOverlay.classList.remove('active');
      });
    }

    if (mockPayBtn) {
      mockPayBtn.addEventListener('click', () => {
        mockPayBtn.textContent = 'Processing...';
        mockPayBtn.disabled = true;

        setTimeout(() => {
          paymentOverlay.classList.remove('active');
          if (bookingFormFields) bookingFormFields.style.display = 'none';
          if (bookingSuccess) bookingSuccess.style.display = 'block';
          
          // Scroll to top of section
          const section = document.querySelector('.booking-page-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 2000);
      });
    }
  }

  // 4. Contact/Inquiry Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  if (tabBtns.length > 0 && tabPanes.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = document.getElementById(targetTab);
        if (activePane) activePane.classList.add('active');
      });
    });
  }
});
