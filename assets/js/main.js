/* ==========================================================================
   Geo&Land — interactions
   Hairline grid overlay, sticky nav, dropdowns, mobile menu, project
   filtering, services scrollspy, reveal animations, contact form.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. Hairline grid overlay (matches the reference page grid)
  ------------------------------------------------------------------ */
  document.querySelectorAll("[data-grid]").forEach(function (section) {
    var grid = document.createElement("div");
    grid.className = "gridlines";
    grid.setAttribute("aria-hidden", "true");
    [0, 25, 50, 75, 100].forEach(function (pct) {
      var line = document.createElement("span");
      line.className = "gl";
      line.style.left = pct + "%";
      grid.appendChild(line);
    });
    section.insertBefore(grid, section.firstChild);
  });

  /* ------------------------------------------------------------------
     2. Sticky navigation state
  ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------
     2b. Projects — render from published data (projects-data.js) or from
         the admin's local edits (localStorage via GeoLandStore).
         Without JavaScript the static fallback markup stays visible.
  ------------------------------------------------------------------ */
  (function renderProjects() {
    var grid = document.getElementById("projectGrid");
    var store = window.GeoLandStore;
    if (!grid || !store) return;

    function paint(list) {
      grid.innerHTML = list && list.length
        ? list.map(store.cardHTML).join("")
        : '<p class="projects__empty mono">No projects published yet.</p>';
      if (window.__geolandInitReveal) window.__geolandInitReveal(grid);
      if (window.__geolandReapplyFilter) window.__geolandReapplyFilter();
    }

    /* Instant paint — Supabase cache or local edits, falling back to defaults */
    var initial;
    if (store.dbMode()) {
      initial = store.cached() || store.defaults();
    } else {
      initial = store.load();
      if (initial === null) initial = store.defaults();
    }
    paint(initial);

    /* Live refresh from the Supabase database once the page is ready
       (the client library is loaded with defer, so it is available here) */
    if (store.dbMode()) {
      document.addEventListener("DOMContentLoaded", function () {
        store.listPublic()
          .then(function (list) { paint(list); })
          .catch(function () { /* offline / error — keep the cached list */ });
      });
    }
  })();

  var nav = document.getElementById("nav");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     3. Desktop dropdowns (click/keyboard support on top of hover)
  ------------------------------------------------------------------ */
  var dropItems = document.querySelectorAll(".nav__item--has-drop");

  function closeDrops(except) {
    dropItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove("is-open");
      var btn = item.querySelector(".nav__link--btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  dropItems.forEach(function (item) {
    var btn = item.querySelector(".nav__link--btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      closeDrops(item);
    });
  });

  document.addEventListener("click", function () {
    closeDrops(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDrops(null);
      closeMobileMenu();
    }
  });

  /* ------------------------------------------------------------------
     4. Mobile menu
  ------------------------------------------------------------------ */
  var burger = document.querySelector(".nav__burger");
  var mobileMenu = document.getElementById("mobileMenu");

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  if (burger && mobileMenu) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (mobileMenu.classList.contains("is-open")) closeMobileMenu();
      else openMobileMenu();
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    mobileMenu.querySelectorAll(".mobile-menu__toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function () {
        var group = toggle.parentElement;
        var open = group.classList.toggle("is-open");
        toggle.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  /* ------------------------------------------------------------------
     5. Project filtering
  ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll(".filter");
  var currentFilter = "all";

  function applyFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-filter") === filter);
    });

    document.querySelectorAll(".project").forEach(function (card, i) {
      var cats = (card.getAttribute("data-category") || "").split(" ");
      var show = filter === "all" || cats.indexOf(filter) !== -1;
      card.classList.remove("is-shown");
      if (show) {
        card.classList.remove("is-hidden");
        if (!prefersReduced) {
          void card.offsetWidth; /* restart animation */
          card.style.animationDelay = Math.min(i * 45, 320) + "ms";
          card.classList.add("is-shown");
        }
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  /* Nav / dropdown / footer links that pre-select a project category */
  document.querySelectorAll("[data-project-filter]").forEach(function (link) {
    link.addEventListener("click", function () {
      applyFilter(link.getAttribute("data-project-filter"));
      closeMobileMenu();
    });
  });

  /* Re-apply the active filter when the grid is re-rendered from the database */
  window.__geolandReapplyFilter = function () {
    applyFilter(currentFilter);
  };

  /* ------------------------------------------------------------------
     6. Services scrollspy
  ------------------------------------------------------------------ */
  var railItems = document.querySelectorAll(".services__rail-item");
  var serviceRows = document.querySelectorAll(".service-row");

  if ("IntersectionObserver" in window && serviceRows.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          railItems.forEach(function (item) {
            item.classList.toggle("is-active", item.getAttribute("data-spy") === id);
          });
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0 }
    );
    serviceRows.forEach(function (row) { spy.observe(row); });
  }

  /* ------------------------------------------------------------------
     7. Reveal on scroll
  ------------------------------------------------------------------ */
  var revealObserver = null;

  function initReveal(root) {
    var scope = root || document;
    var els = scope.querySelectorAll("[data-reveal]:not([data-rv])");
    if (!els.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.setAttribute("data-rv", "1");
        el.classList.add("in-view");
      });
      return;
    }

    els.forEach(function (el) {
      el.setAttribute("data-rv", "1");
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [el];
      var index = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = (Math.max(index, 0) % 5) * 80 + "ms";
    });

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }

    els.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Also used to reveal cards that were re-rendered from the database */
  window.__geolandInitReveal = initReveal;
  initReveal(document);

  /* ------------------------------------------------------------------
     8. Contact form — composes an email to Geo&Land
  ------------------------------------------------------------------ */
  var form = document.getElementById("contactForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#f-name").value.trim();
      var email = form.querySelector("#f-email").value.trim();
      var subject = form.querySelector("#f-subject").value.trim();
      var message = form.querySelector("#f-message").value.trim();

      var body =
        "Name: " + name + "\r\n" +
        "Email: " + email + "\r\n\r\n" +
        message;

      var href =
        "mailto:info@geoland-kosova.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;
    });
  }
})();
