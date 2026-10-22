(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuToggle.focus();
      }
    });

    const desktopQuery = window.matchMedia("(min-width: 961px)");
    desktopQuery.addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  const revealElements = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("revealed"));
  }

  const navLinks = document.querySelectorAll(".site-nav a");
  const navSections = ["services", "results", "process", "pricing", "about", "faq", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    navSections.forEach((section) => sectionObserver.observe(section));
  }

  const faqButtons = document.querySelectorAll(".faq-question");

  const setFaqState = (button, open) => {
    const answer = document.getElementById(button.getAttribute("aria-controls"));
    if (!answer) return;
    button.setAttribute("aria-expanded", String(open));
    answer.style.maxHeight = open ? `${answer.scrollHeight}px` : "0px";
  };

  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      faqButtons.forEach((otherButton) => setFaqState(otherButton, false));
      if (!isOpen) setFaqState(button, true);
    });
  });

  window.addEventListener(
    "resize",
    () => {
      faqButtons.forEach((button) => {
        if (button.getAttribute("aria-expanded") === "true") {
          const answer = document.getElementById(button.getAttribute("aria-controls"));
          if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      });
    },
    { passive: true }
  );

  const form = document.getElementById("contact-form");

  if (form) {
    const status = document.getElementById("form-status");
    const phonePattern = /^\+?[\d\s()-]{7,20}$/;
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

    const fields = {
      name: document.getElementById("name"),
      phone: document.getElementById("phone"),
      website: document.getElementById("website"),
      goal: document.getElementById("goal")
    };

    const showError = (field, message) => {
      const wrapper = field.closest(".field");
      const error = document.getElementById(`${field.id}-error`);
      if (wrapper) wrapper.classList.add("is-invalid");
      field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    };

    const clearError = (field) => {
      const wrapper = field.closest(".field");
      const error = document.getElementById(`${field.id}-error`);
      if (wrapper) wrapper.classList.remove("is-invalid");
      field.removeAttribute("aria-invalid");
      if (error) error.textContent = "";
    };

    const validateField = (field) => {
      const value = field.value.trim();

      if (field === fields.name && value.length < 2) {
        showError(field, "Please share your name.");
        return false;
      }

      if (field === fields.phone) {
        const digits = value.replace(/\D/g, "");
        if (!phonePattern.test(value) || digits.length < 7) {
          showError(field, "Please enter a valid phone number.");
          return false;
        }
      }

      if (field === fields.website && value && !urlPattern.test(value)) {
        showError(field, "Please enter a valid website URL.");
        return false;
      }

      if (field === fields.goal && value.length < 10) {
        showError(field, "A little more detail, please — at least 10 characters.");
        return false;
      }

      clearError(field);
      return true;
    };

    Object.values(fields).forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => clearError(field));
      field.addEventListener("blur", () => {
        if (field.value.trim() || field.required) validateField(field);
      });
    });

    const setStatus = (message, type) => {
      if (!status) return;
      status.textContent = message;
      status.classList.remove("is-error", "is-success");
      if (type) status.classList.add(`is-${type}`);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const requiredFields = [fields.name, fields.phone, fields.goal].filter(Boolean);
      const fieldsValid = requiredFields.every((field) => validateField(field));
      const websiteValid = fields.website ? validateField(fields.website) : true;

      if (!fieldsValid || !websiteValid) {
        const firstInvalid = form.querySelector(".is-invalid input, .is-invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        setStatus("Please check the highlighted fields and try again.", "error");
        return;
      }

      const to = form.dataset.email;
      if (!to) {
        setStatus("Something went wrong. Please email me directly instead.", "error");
        return;
      }

      const name = fields.name.value.trim();
      const phone = fields.phone.value.trim();
      const website = fields.website ? fields.website.value.trim() : "";
      const goal = fields.goal.value.trim();
      const subject = `Free SEO audit request from ${name}`;
      const body = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Website: ${website || "Not provided"}`,
        "",
        "Main goal:",
        goal
      ].join("\n");

      setStatus("Opening your email app with your request…", "success");
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
