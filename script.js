(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Persist the selected theme between pages.
  const themeButton = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  try {
    if (localStorage.getItem("portfolio-theme") === "light") body.classList.add("light-theme");
  } catch (error) {
    console.warn("Theme preference could not be loaded.", error);
  }

  function updateThemeButton() {
    if (!themeButton || !themeIcon) return;
    const light = body.classList.contains("light-theme");
    themeIcon.textContent = light ? "🌙" : "☀️";
    themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = light ? "#fff8f0" : "#0b1026";
  }

  updateThemeButton();
  themeButton?.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    try {
      localStorage.setItem("portfolio-theme", body.classList.contains("light-theme") ? "light" : "dark");
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
    updateThemeButton();
  });

  // Mobile navigation closes after choosing a destination or pressing Escape.
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  function closeMenu() {
    navLinks?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
  }
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
    navLinks?.classList.toggle("is-open", !open);
  });
  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  // Keep the chain intro local to index.html; all other pages simply fade in.
  const intro = document.getElementById("intro");
  const site = document.getElementById("site");
  const enterButton = document.getElementById("enter-button");
  let introClosed = false;
  let introTimer;
  function enterPortfolio() {
    if (!intro || introClosed) return;
    introClosed = true;
    window.clearTimeout(introTimer);
    intro.classList.add("is-leaving");
    if (site) {
      site.inert = false;
      site.classList.add("is-visible");
    }
    body.classList.remove("intro-active");
    window.setTimeout(() => intro.remove(), 900);
  }
  if (intro) {
    enterButton?.addEventListener("click", enterPortfolio);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !introClosed) enterPortfolio();
    });
    introTimer = window.setTimeout(enterPortfolio, 3800);

    const card = intro.querySelector(".id-card");
    card?.addEventListener("click", () => {
      card.classList.remove("swing-burst");
      void card.offsetWidth;
      card.classList.add("swing-burst");
    });
    card?.addEventListener("animationend", () => card.classList.remove("swing-burst"));
    card?.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        card.click();
      }
    });
  } else {
    body.classList.add("page-enter");
    window.setTimeout(() => body.classList.remove("page-enter"), 550);
  }

  // Typing headline is used on home only.
  const typingTarget = document.getElementById("typing-text");
  if (typingTarget && !reducedMotion) {
    const phrases = ["Frontend Developer", "Pixel Perfectionist-ish", "Professional Bug Negotiator"];
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    function typePhrase() {
      const phrase = phrases[phraseIndex];
      typingTarget.textContent = phrase.slice(0, characterIndex);
      if (!deleting && characterIndex < phrase.length) {
        characterIndex += 1;
        window.setTimeout(typePhrase, 76);
      } else if (!deleting) {
        deleting = true;
        window.setTimeout(typePhrase, 1250);
      } else if (characterIndex > 0) {
        characterIndex -= 1;
        window.setTimeout(typePhrase, 36);
      } else {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(typePhrase, 260);
      }
    }
    typePhrase();
  } else if (typingTarget) {
    typingTarget.textContent = "Frontend Developer";
  }

  // Reveal on scroll; if observers are unavailable, leave content visible.
  const revealElements = document.querySelectorAll(".reveal, .skill-grid");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("revealed"));
  }

  // Animate visible counters without replaying them when scrolling back up.
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const counter = entry.target;
        const target = Number(counter.dataset.count);
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / 1000, 1);
          counter.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
          if (progress < 1) window.requestAnimationFrame(update);
        }
        window.requestAnimationFrame(update);
        observer.unobserve(counter);
      });
    }, { threshold: 0.65 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
  }

  // Add a restrained 3D pointer tilt to project and bento cards on mouse devices.
  if (window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.transform = `rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 8}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
    document.querySelectorAll("[data-magnetic]").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const bounds = button.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * .12;
        const y = (event.clientY - bounds.top - bounds.height / 2) * .12;
        button.style.translate = `${x}px ${y}px`;
      });
      button.addEventListener("pointerleave", () => { button.style.translate = ""; });
    });
  }

  // Follow the pointer with a soft glow and small cursor dot on precise-pointer devices.
  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches && !reducedMotion) {
    const cursorDot = document.createElement("span");
    cursorDot.className = "cursor-dot";
    cursorDot.setAttribute("aria-hidden", "true");
    body.append(cursorDot);
    let pointerX = 0;
    let pointerY = 0;
    let glowX = 0;
    let glowY = 0;
    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursorDot.style.transform = `translate(${pointerX}px,${pointerY}px)`;
    }, { passive: true });
    function moveGlow() {
      glowX += (pointerX - glowX) * .14;
      glowY += (pointerY - glowY) * .14;
      cursorGlow.style.transform = `translate(${glowX}px,${glowY}px) translate(-50%,-50%)`;
      window.requestAnimationFrame(moveGlow);
    }
    moveGlow();
  }

  // Cross-page links fade out before navigating. Modified clicks remain native.
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute("download")) return;
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || !/\.html$/.test(target.pathname) || target.pathname === window.location.pathname) return;
    event.preventDefault();
    if (reducedMotion) {
      window.location.href = target.href;
      return;
    }
    body.classList.add("page-leave");
    window.setTimeout(() => { window.location.href = target.href; }, 220);
  });

  // The contact form prepares an email; replace this address with your own.
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const subject = `Portfolio hello from ${data.get("name")}`;
    const message = `${data.get("message")}\n\nReply to: ${data.get("email")}`;
    if (formStatus) formStatus.textContent = "Opening your email app — your message is ready to send.";
    window.location.href = `mailto:hello@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  });

  // Tiny, deliberately low-stakes easter egg.
  const eggButton = document.getElementById("easter-egg");
  const eggMessage = document.getElementById("egg-message");
  const eggMessages = ["Plot twist: the real bug was the friends we made along the way. 🐛", "Achievement unlocked: you clicked the thing. 🏆", "This portfolio runs on chai and positive console messages. ☕"];
  eggButton?.addEventListener("click", () => {
    if (eggMessage) eggMessage.textContent = eggMessages[Math.floor(Math.random() * eggMessages.length)];
  });
})();
