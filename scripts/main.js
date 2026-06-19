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
      // Loader bar: 2.2s delay + 2.2s fill = 4.4s total
      // +800ms buffer for comfortable reading time after text appears
      setTimeout(dismissIntro, 5200);
    }
  }

  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  const themeIconDark = document.getElementById('theme-icon-dark');
  const themeIconLight = document.getElementById('theme-icon-light');
  
  // Always prefer localStorage — this keeps theme consistent across pages
  const savedTheme = localStorage.getItem('theme');
  const htmlTheme = document.documentElement.getAttribute('data-theme');
  const currentTheme = savedTheme || htmlTheme || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  // Also persist so next page load is consistent
  localStorage.setItem('theme', currentTheme);

  const updateThemeIcon = (theme) => {
    if (!themeIconDark || !themeIconLight) return;
    if (theme === 'dark') {
      themeIconDark.style.display = 'block';
      themeIconLight.style.display = 'none';
    } else {
      themeIconDark.style.display = 'none';
      themeIconLight.style.display = 'block';
    }
  };
  
  updateThemeIcon(currentTheme);

  const toggleTheme = () => {
    // Close mobile menu first to avoid mixed-state visual glitch
    const mobileMenuEl = document.getElementById('mobile-menu');
    const menuIconOpenEl = document.getElementById('menu-icon-open');
    const menuIconCloseEl = document.getElementById('menu-icon-close');
    if (mobileMenuEl && mobileMenuEl.classList.contains('is-open')) {
      mobileMenuEl.classList.remove('is-open');
      if (menuIconOpenEl) menuIconOpenEl.style.display = 'block';
      if (menuIconCloseEl) menuIconCloseEl.style.display = 'none';
      document.body.style.overflow = '';
    }

    // Add the global transition class BEFORE changing the theme
    // so every element cross-fades its colors simultaneously
    document.documentElement.classList.add('theme-transitioning');

    // rAF ensures the class is painted before we flip the theme
    requestAnimationFrame(() => {
      let theme = document.documentElement.getAttribute('data-theme');
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(theme);

      // Remove the class after the transition finishes (350ms + buffer)
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 400);
    });
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Mobile Theme Toggle
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', toggleTheme);
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
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
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
