document.addEventListener('DOMContentLoaded', () => {
  // ═══════════════════════════════════════════
  //  0. MOBILE MENU TOGGLE + DROPDOWN CLICK FIX
  // ═══════════════════════════════════════════
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Click-toggle for "Explore" dropdown (fixes hover gap inaccessibility)
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const trigger = dropdown.querySelector(':scope > a');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      // Close all other open dropdowns
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
  });

  // Close dropdown when clicking anywhere outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // ═══════════════════════════════════════════
  //  1. SCROLL REVEAL ANIMATION
  // ═══════════════════════════════════════════
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.style.getPropertyValue('--reveal-delay') || '0s';
          setTimeout(() => {
            entry.target.classList.add('active');
          }, parseFloat(delay) * 1000);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ═══════════════════════════════════════════
  //  2. NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const SCROLL_THRESHOLD = 80;
    function onNavScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll(); // run once on load
  }

  // ═══════════════════════════════════════════
  //  3. CINEMATIC HERO SLIDESHOW + PROGRESS BARS
  // ═══════════════════════════════════════════
  const heroSlides = document.querySelectorAll('.hero-slide');
  const progressBars = document.querySelectorAll('.hero-progress-bar');
  const SLIDE_DURATION = 5000; // ms — keep in sync with setInterval

  if (heroSlides.length > 0) {
    let currentHeroSlide = 0;
    let slideTimer = null;

    function setProgressBar(index) {
      progressBars.forEach((bar, i) => {
        bar.classList.remove('active', 'done');
        // Force-reflow so the CSS animation restarts cleanly
        const fill = bar.querySelector('.hero-progress-fill');
        if (fill) {
          fill.style.animation = 'none';
          // eslint-disable-next-line no-unused-expressions
          fill.offsetWidth; // trigger reflow
          fill.style.animation = '';
        }
        if (i < index)  bar.classList.add('done');
        if (i === index) bar.classList.add('active');
      });
    }

    function goToSlide(index) {
      heroSlides[currentHeroSlide].classList.remove('active');
      currentHeroSlide = index;
      heroSlides[currentHeroSlide].classList.add('active');
      setProgressBar(currentHeroSlide);

      // Restart the auto-advance timer
      clearInterval(slideTimer);
      slideTimer = setInterval(advanceHeroSlide, SLIDE_DURATION);
    }

    function advanceHeroSlide() {
      const next = (currentHeroSlide + 1) % heroSlides.length;
      heroSlides[currentHeroSlide].classList.remove('active');
      currentHeroSlide = next;
      heroSlides[currentHeroSlide].classList.add('active');
      setProgressBar(currentHeroSlide);
    }

    // Make progress bars clickable
    progressBars.forEach((bar, i) => {
      bar.style.setProperty('--slide-duration', `${SLIDE_DURATION}ms`);
      bar.addEventListener('click', () => goToSlide(i));
    });

    // Kick off
    setProgressBar(0);
    slideTimer = setInterval(advanceHeroSlide, SLIDE_DURATION);
  }

  // ═══════════════════════════════════════════
  //  4. GUEST COUNTER
  // ═══════════════════════════════════════════
  const guestCountEl = document.getElementById('guestCount');
  const plusBtn = document.getElementById('guestPlus');
  const minusBtn = document.getElementById('guestMinus');
  let guests = 2;

  // Set today as min date for both date inputs
  const checkinInput  = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  const today = new Date().toISOString().split('T')[0];
  if (checkinInput)  checkinInput.min  = today;
  if (checkoutInput) checkoutInput.min = today;

  // Enforce check-out must be after check-in
  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', () => {
      if (checkinInput.value) {
        // min checkout = day after checkin
        const nextDay = new Date(checkinInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkoutInput.min = nextDay.toISOString().split('T')[0];
        // If checkout is now invalid, clear it
        if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
          checkoutInput.value = '';
        }
      }
    });
  }

  function updateGuestButtons() {
    if (minusBtn) minusBtn.disabled = guests <= 1;
    if (plusBtn)  plusBtn.disabled  = guests >= 30;
  }

  function bumpCount() {
    if (!guestCountEl) return;
    guestCountEl.classList.remove('bump');
    // Force reflow so animation restarts even for repeated presses
    void guestCountEl.offsetWidth;
    guestCountEl.classList.add('bump');
    setTimeout(() => guestCountEl.classList.remove('bump'), 200);
  }

  if (guestCountEl && plusBtn && minusBtn) {
    plusBtn.addEventListener('click', () => {
      if (guests < 30) {
        guests++;
        guestCountEl.textContent = guests;
        bumpCount();
        updateGuestButtons();
      }
    });

    minusBtn.addEventListener('click', () => {
      if (guests > 1) {
        guests--;
        guestCountEl.textContent = guests;
        bumpCount();
        updateGuestButtons();
      }
    });

    updateGuestButtons(); // initialise state
  }

  // ═══════════════════════════════════════════
  //  5. TESTIMONIAL SLIDER
  // ═══════════════════════════════════════════
  const slides = document.querySelectorAll('.test-slide');
  const dots = document.querySelectorAll('.test-dot');
  let currentSlide = 0;

  if (slides.length > 0 && dots.length > 0) {
    function showSlide(index) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        showSlide(parseInt(dot.dataset.idx));
      });
    });

    // Auto slide
    setInterval(() => {
      let next = (currentSlide + 1) % slides.length;
      showSlide(next);
    }, 6000);
  }

  // ═══════════════════════════════════════════
  //  6. BOOKING ACTION (HOMEPAGE)
  // ═══════════════════════════════════════════
  const checkAvailBtn = document.getElementById('checkAvailBtn');
  const bookingToast  = document.getElementById('bookingToast');

  function showBookingToast(msg, type = 'error') {
    if (!bookingToast) return;
    bookingToast.textContent = msg;
    bookingToast.className = `booking-toast ${type} visible`;
    clearTimeout(bookingToast._timer);
    bookingToast._timer = setTimeout(() => {
      bookingToast.classList.remove('visible');
    }, 3500);
  }

  if (checkAvailBtn) {
    checkAvailBtn.addEventListener('click', () => {
      const checkin  = document.getElementById('checkin').value;
      const checkout = document.getElementById('checkout').value;

      if (!checkin) {
        showBookingToast('⚠️  Please select a check-in date.', 'error');
        return;
      }
      if (!checkout) {
        showBookingToast('⚠️  Please select a check-out date.', 'error');
        return;
      }
      if (checkout <= checkin) {
        showBookingToast('⚠️  Check-out must be after check-in.', 'error');
        return;
      }

      showBookingToast('✓  Redirecting to booking…', 'success');
      setTimeout(() => {
        window.location.href = `booking.html?checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
      }, 600);
    });
  }

  // ═══════════════════════════════════════════
  //  7. SMOOTH SCROLL ANCHORS
  // ═══════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // ═══════════════════════════════════════════
  //  8. FAQ ACCORDION
  // ═══════════════════════════════════════════
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isOpen = item.classList.contains('open');
          // Close all — only remove .open, never touch .active (used by scroll-reveal)
          faqItems.forEach(i => i.classList.remove('open'));
          if (!isOpen) {
            item.classList.add('open');
          }
        });
      }
    });
  }

  // ═══════════════════════════════════════════
  //  9. EVENT FORM SUBMISSION
  // ═══════════════════════════════════════════
  const eventForm = document.getElementById('eventForm');
  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = eventForm.querySelector('.form-submit');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Sending...';
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        alert('Thank you for your inquiry! Our team will contact you shortly.');
        eventForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
      }, 2000);
    });
  }
});
