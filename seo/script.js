/**
 * ============================================================
 *  Astrology Website – Main Script
 *  Vanilla ES6+ · No external dependencies
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ──────────────────────────────────────────────
   *  0. UTILITY HELPERS
   * ────────────────────────────────────────────── */

  /** Ease-out quad curve for counter animation */
  const easeOutQuad = (t) => t * (2 - t);

  /** Throttle helper – fires at most once per `limit` ms */
  const throttle = (fn, limit = 100) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  };

  /** Shorthand selectors */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ──────────────────────────────────────────────
   *  1. PAGE LOAD ANIMATION
   * ────────────────────────────────────────────── */

  document.body.classList.add('loaded');

  /* ──────────────────────────────────────────────
   *  2. STICKY HEADER
   * ────────────────────────────────────────────── */

  const header = $('header') || $('.header');

  if (header) {
    const SCROLL_THRESHOLD = 100;

    const handleHeaderScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', throttle(handleHeaderScroll, 50), { passive: true });
    handleHeaderScroll(); // Set correct state on load
  }

  /* ──────────────────────────────────────────────
   *  3. MOBILE MENU TOGGLE
   * ────────────────────────────────────────────── */

  const mobileToggle =
    $('#mobileMenuToggle') || $('.mobile-menu-toggle');
  const navMenu = $('.nav-menu');

  if (mobileToggle && navMenu) {
    /** Open / close the mobile nav */
    const toggleMenu = (forceClose = false) => {
      const shouldOpen = forceClose ? false : !navMenu.classList.contains('active');

      navMenu.classList.toggle('active', shouldOpen);
      mobileToggle.classList.toggle('active', shouldOpen);

      // Prevent body scroll while the menu is open
      document.body.style.overflow = shouldOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close when clicking a nav link inside the menu
    $$('a', navMenu).forEach((link) => {
      link.addEventListener('click', () => toggleMenu(true));
    });

    // Close when clicking outside the menu
    document.addEventListener('click', (e) => {
      if (
        navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        toggleMenu(true);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        toggleMenu(true);
      }
    });
  }

  /* ──────────────────────────────────────────────
   *  4. SMOOTH SCROLL FOR ANCHOR LINKS
   * ────────────────────────────────────────────── */

  const HEADER_OFFSET = 80; // px – accounts for sticky header height

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;

      const targetEl = $(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const top =
        targetEl.getBoundingClientRect().top +
        window.pageYOffset -
        HEADER_OFFSET;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────────────
   *  5. SERVICES DROPDOWN (Desktop hover + Mobile click)
   * ────────────────────────────────────────────── */

  const dropdowns = $$('.dropdown');

  dropdowns.forEach((dropdown) => {
    const menu = $('.dropdown-menu', dropdown);
    if (!menu) return;

    const trigger = dropdown.querySelector(':scope > a, :scope > button, :scope > .dropdown-toggle');

    // Mobile: toggle on click
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        // Only intercept on mobile-sized screens
        if (window.innerWidth <= 992) {
          e.preventDefault();
          e.stopPropagation();

          // Close other open dropdowns first
          dropdowns.forEach((d) => {
            if (d !== dropdown) d.classList.remove('active');
          });

          dropdown.classList.toggle('active');
        }
      });
    }

    // Desktop: show on hover
    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 992) dropdown.classList.add('active');
    });

    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 992) dropdown.classList.remove('active');
    });
  });

  /* ──────────────────────────────────────────────
   *  6. ZODIAC SIGNS CAROUSEL
   * ────────────────────────────────────────────── */

  const zodiacCarousel = $('.zodiac-carousel') || $('.zodiac-signs-carousel');
  const zodiacContainer = zodiacCarousel
    ? $('.zodiac-carousel-inner', zodiacCarousel) ||
      $('.carousel-track', zodiacCarousel) ||
      zodiacCarousel
    : null;

  if (zodiacContainer) {
    const prevBtn =
      $('.carousel-prev', zodiacCarousel) ||
      $('.arrow-left', zodiacCarousel);
    const nextBtn =
      $('.carousel-next', zodiacCarousel) ||
      $('.arrow-right', zodiacCarousel);

    let autoScrollInterval = null;
    const AUTO_SCROLL_DELAY = 3000; // ms

    /** Scroll the container by one card width in the given direction */
    const scrollByCard = (direction = 1) => {
      const card = zodiacContainer.querySelector(
        '.zodiac-card, .zodiac-sign, .zodiac-item'
      );
      const scrollAmount = card
        ? card.offsetWidth + parseInt(getComputedStyle(card).marginRight || 0, 10) + parseInt(getComputedStyle(card).marginLeft || 0, 10)
        : 200;

      zodiacContainer.scrollBy({
        left: scrollAmount * direction,
        behavior: 'smooth',
      });
    };

    /** Wrap-around: if at the end, jump back to start (and vice versa) */
    const handleEdgeScroll = (direction) => {
      const { scrollLeft, scrollWidth, clientWidth } = zodiacContainer;

      if (direction === 1 && scrollLeft + clientWidth >= scrollWidth - 10) {
        // At the end – loop back to start
        zodiacContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (direction === -1 && scrollLeft <= 10) {
        // At the start – loop to end
        zodiacContainer.scrollTo({
          left: scrollWidth,
          behavior: 'smooth',
        });
      } else {
        scrollByCard(direction);
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => handleEdgeScroll(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => handleEdgeScroll(1));
    }

    // Auto-scroll
    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(() => handleEdgeScroll(1), AUTO_SCROLL_DELAY);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    };

    // Pause on hover / touch
    zodiacContainer.addEventListener('mouseenter', stopAutoScroll);
    zodiacContainer.addEventListener('mouseleave', startAutoScroll);
    zodiacContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
    zodiacContainer.addEventListener('touchend', () => {
      // Resume after a brief pause so touch-scroll feels natural
      setTimeout(startAutoScroll, 2000);
    });

    startAutoScroll();
  }

  /* ──────────────────────────────────────────────
   *  7. ANIMATED COUNTERS
   * ────────────────────────────────────────────── */

  const counterEls = $$('[data-target]');

  if (counterEls.length) {
    const COUNTER_DURATION = 2000; // ms

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / COUNTER_DURATION, 1);
        const value = Math.round(easeOutQuad(progress) * target);

        el.textContent = value.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Ensure final value is exact
          el.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target); // Fire only once
          }
        });
      },
      { threshold: 0.3 }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
  }

  /* ──────────────────────────────────────────────
   *  8. SCROLL REVEAL ANIMATIONS
   * ────────────────────────────────────────────── */

  const revealEls = $$('.reveal');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');

            // Stagger child elements
            const children = $$('.reveal-child', entry.target);
            children.forEach((child, i) => {
              child.style.transitionDelay = `${i * 100}ms`;
              child.classList.add('revealed');
            });

            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ──────────────────────────────────────────────
   *  9. FAQ ACCORDION
   * ────────────────────────────────────────────── */

  const faqItems = $$('.faq-item');

  faqItems.forEach((item) => {
    const question = $('.faq-question', item);
    const answer = $('.faq-answer', item);
    if (!question || !answer) return;

    // Set initial collapsed state
    answer.style.maxHeight = item.classList.contains('active')
      ? `${answer.scrollHeight}px`
      : '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.4s ease';

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other FAQ items first
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('active')) {
          other.classList.remove('active');
          const otherAnswer = $('.faq-answer', other);
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('active');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });

  /* ──────────────────────────────────────────────
   *  10. CONTACT FORM VALIDATION
   * ────────────────────────────────────────────── */

  const contactForm =
    $('#contactForm') || $('form.contact-form') || $('form');

  if (contactForm) {
    const validators = {
      name: {
        test: (v) => v.trim().length > 0,
        msg: 'Please enter your name.',
      },
      phone: {
        test: (v) => /\d{10,}/.test(v.replace(/\D/g, '')),
        msg: 'Please enter a valid phone number (10+ digits).',
      },
      email: {
        test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        msg: 'Please enter a valid email address.',
      },
      message: {
        test: (v) => v.trim().length > 0,
        msg: 'Please enter your message.',
      },
    };

    /** Show or clear an inline error for a field */
    const setFieldError = (field, message) => {
      // Remove existing error
      const existing = field.parentElement.querySelector('.field-error');
      if (existing) existing.remove();

      if (message) {
        field.classList.add('error');
        const errEl = document.createElement('span');
        errEl.className = 'field-error';
        errEl.textContent = message;
        errEl.style.cssText =
          'color:#e74c3c;font-size:0.82rem;display:block;margin-top:4px;';
        field.parentElement.appendChild(errEl);
      } else {
        field.classList.remove('error');
      }
    };

    /** Show a toast notification */
    const showToast = (message, type = 'success') => {
      // Remove any existing toast
      const old = $('.toast-notification');
      if (old) old.remove();

      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: #fff;
        padding: 14px 28px;
        border-radius: 8px;
        font-size: 1rem;
        font-family: 'Philosopher', serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.4s ease, transform 0.4s ease;
      `;

      document.body.appendChild(toast);

      // Trigger entrance
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
      });

      // Auto-dismiss after 4s
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 400);
      }, 4000);
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      Object.entries(validators).forEach(([fieldName, rule]) => {
        const field =
          contactForm.querySelector(`[name="${fieldName}"]`) ||
          contactForm.querySelector(`#${fieldName}`) ||
          contactForm.querySelector(`.${fieldName}`);

        if (!field) return;

        if (!rule.test(field.value)) {
          setFieldError(field, rule.msg);
          isValid = false;
        } else {
          setFieldError(field, null);
        }
      });

      if (isValid) {
        showToast('Thank you! Your message has been sent successfully. 🌟');
        contactForm.reset();
      }
    });

    // Live clear errors on input
    contactForm.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea')) {
        setFieldError(e.target, null);
      }
    });
  }

  /* ──────────────────────────────────────────────
   *  11. BACK TO TOP BUTTON
   * ────────────────────────────────────────────── */

  const backToTop =
    $('.back-to-top') || $('#backToTop');

  if (backToTop) {
    const BTT_THRESHOLD = 500;

    const handleBTTVisibility = () => {
      if (window.scrollY > BTT_THRESHOLD) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', throttle(handleBTTVisibility, 100), {
      passive: true,
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    handleBTTVisibility();
  }

  /* ──────────────────────────────────────────────
   *  12. FLOATING BUTTONS – BOUNCE ON HOVER
   * ────────────────────────────────────────────── */

  const floatingBtns = $$('.floating-btn, .float-btn, .whatsapp-btn, .phone-btn, .floating-phone, .floating-whatsapp');

  floatingBtns.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.3s cubic-bezier(.34,1.56,.64,1)';
      btn.style.transform = 'scale(1.15)';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });

  /* ──────────────────────────────────────────────
   *  13. TESTIMONIAL CAROUSEL
   * ────────────────────────────────────────────── */

  const testimonialCarousel =
    $('.testimonial-carousel') || $('.testimonials-slider');

  if (testimonialCarousel) {
    const slides =
      $$('.testimonial-card, .testimonial-slide, .testimonial-item', testimonialCarousel);

    if (slides.length > 1) {
      let currentSlide = 0;
      let autoRotateTimer = null;
      const ROTATE_INTERVAL = 4000;

      // Build indicator dots
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots';
      dotsContainer.style.cssText =
        'display:flex;justify-content:center;gap:8px;margin-top:20px;';

      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
        dot.style.cssText = `
          width: 12px; height: 12px;
          border-radius: 50%;
          border: 2px solid #72001B;
          background: ${i === 0 ? '#72001B' : 'transparent'};
          cursor: pointer;
          transition: background 0.3s ease;
          padding: 0;
        `;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });

      testimonialCarousel.appendChild(dotsContainer);

      const dots = $$('.carousel-dot', dotsContainer);

      /** Show a specific slide */
      const goToSlide = (index) => {
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) {
          dots[currentSlide].style.background = 'transparent';
        }

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) {
          dots[currentSlide].style.background = '#72001B';
        }
      };

      // Initialise – make sure only the first slide is visible
      slides.forEach((s, i) => {
        if (i !== 0) s.classList.remove('active');
        else s.classList.add('active');
      });

      // Auto-rotation
      const startRotation = () => {
        stopRotation();
        autoRotateTimer = setInterval(
          () => goToSlide(currentSlide + 1),
          ROTATE_INTERVAL
        );
      };

      const stopRotation = () => {
        if (autoRotateTimer) {
          clearInterval(autoRotateTimer);
          autoRotateTimer = null;
        }
      };

      testimonialCarousel.addEventListener('mouseenter', stopRotation);
      testimonialCarousel.addEventListener('mouseleave', startRotation);

      startRotation();
    }
  }

  /* ──────────────────────────────────────────────
   *  14. ACTIVE NAVIGATION HIGHLIGHTING
   * ────────────────────────────────────────────── */

  const sections = $$('section[id]');
  const navLinks = $$('.nav-menu a[href^="#"]');

  if (sections.length && navLinks.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      {
        rootMargin: `-${HEADER_OFFSET}px 0px -40% 0px`,
        threshold: 0.15,
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ──────────────────────────────────────────────
   *  15. PRELOADER (if present)
   * ────────────────────────────────────────────── */

  const preloader = $('.preloader') || $('#preloader');

  if (preloader) {
    window.addEventListener('load', () => {
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => preloader.remove(), 600);
    });
  }

  /* ──────────────────────────────────────────────
   *  CONSOLE GREETING 🌟
   * ────────────────────────────────────────────── */
  console.log(
    '%c✨ Astrology Website Loaded Successfully ✨',
    'color:#72001B;font-size:14px;font-weight:bold;'
  );
});
