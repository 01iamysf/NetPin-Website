document.addEventListener('DOMContentLoaded', () => {
  // ── Intro / Splash Screen ──────────────────────────────────────────────────
  const introOverlay = document.getElementById('intro-overlay');

  const dismissIntro = () => { 
    document.body.classList.remove('intro-active');
    introOverlay.classList.add('is-hidden');
    // Remove from DOM after transition ends so it doesn't block interactions
    introOverlay.addEventListener('transitionend', () => {
      introOverlay.remove();
      // Remove the critical inline background override so theme takes over
      const criticalStyle = document.querySelector('head style');
      if (criticalStyle) criticalStyle.remove();
    }, { once: true });
  };

  if (introOverlay) {
    // Lock scroll during intro
    document.body.classList.add('intro-active');

    // Play once per session — skip on refresh
    if (sessionStorage.getItem('intro-played')) {
      dismissIntro();
    } else {
      sessionStorage.setItem('intro-played', '1');
      // Loader bar: 0.25s delay + 1.6s fill = 1.85s total
      // +550ms buffer for comfortable reading time after text appears
      setTimeout(dismissIntro, 2400);
    }
  }

  // Mobile Menu Logic
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    const toggleMobileMenu = () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        mobileMenu.classList.remove('is-open');
        menuIconOpen.style.display = 'block';
        menuIconClose.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
      } else {
        mobileMenu.classList.add('is-open');
        menuIconOpen.style.display = 'none';
        menuIconClose.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    };

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', toggleMobileMenu);
    });
  }

  // 1. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const summary = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    summary.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent native instant toggle
      
      const isOpen = item.hasAttribute('open');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.hasAttribute('open')) {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          otherAnswer.style.maxHeight = otherAnswer.scrollHeight + 'px';
          // Force reflow
          otherAnswer.offsetHeight;
          otherAnswer.style.maxHeight = '0px';
          otherItem.classList.remove('active');
          setTimeout(() => {
            if (!otherItem.classList.contains('active')) {
              otherItem.removeAttribute('open');
            }
          }, 350); // Match transition-normal (350ms)
        }
      });
      
      if (!isOpen) {
        // Open
        item.setAttribute('open', '');
        item.classList.add('active');
        answer.style.maxHeight = '0px';
        // Force reflow
        answer.offsetHeight;
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // Clean up maxHeight after transition to support responsive resizing
        setTimeout(() => {
          if (item.classList.contains('active')) {
            answer.style.maxHeight = 'none';
          }
        }, 350);
      } else {
        // Close
        // Ensure max-height has a concrete value before animating to 0
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // Force reflow
        answer.offsetHeight;
        answer.style.maxHeight = '0px';
        item.classList.remove('active');
        setTimeout(() => {
          if (!item.classList.contains('active')) {
            item.removeAttribute('open');
          }
        }, 350);
      }
    });
  });

  // 2. Fallback for CSS Scroll-driven animations (Intersection Observer)
  // If browser doesn't support view() timeline natively
  if (!CSS.supports('(animation-timeline: view()) and (animation-range: entry)')) {
    
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const scaleElementsToAnimate = document.querySelectorAll('.animate-on-scroll-scale');
    
    // Swap native animation classes with fallback initial hidden state
    elementsToAnimate.forEach(el => {
      el.classList.remove('animate-on-scroll');
      el.classList.add('js-fallback-hidden');
    });

    scaleElementsToAnimate.forEach(el => {
      el.classList.remove('animate-on-scroll-scale');
      el.classList.add('js-fallback-hidden-scale');
    });

    const staggerElements = document.querySelectorAll('.stagger-scroll > *');
    staggerElements.forEach(el => {
      el.classList.add('js-fallback-hidden');
    });

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% visible
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    document.querySelectorAll('.js-fallback-hidden, .js-fallback-hidden-scale').forEach(el => {
      observer.observe(el);
    });
  }

  // 3. Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Offset for sticky header
        const headerOffset = 72;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
