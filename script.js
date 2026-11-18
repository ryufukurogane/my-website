/* =========================================================
   Ryufu Kurogane — 黒金 龍風 | Ryunax
   Vanilla JS: loader, i18n, theme, sakura, reveal, cursor, tilt, form
   ========================================================= */
(function () {
  "use strict";

  // Real contact email used for the mail action
  var CONTACT_EMAIL = "hello@ryunax.example";

  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };
  var store = {
    get: function (k) {
      try {
        return localStorage.getItem(k);
      } catch (e) {
        return null;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem(k, v);
      } catch (e) {
        /* ignore */
      }
    },
  };
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------- Loader ---------- */
  var loader = $("#loader"),
    bar = $("#loaderBar");
  var pct = 0;
  var loadTimer = setInterval(function () {
    pct = Math.min(pct + Math.random() * 18, 92);
    bar.style.width = pct + "%";
  }, 140);
  function hideLoader() {
    clearInterval(loadTimer);
    bar.style.width = "100%";
    setTimeout(function () {
      loader.classList.add("done");
      document.body.classList.remove("no-scroll");
      revealHero();
    }, 450);
  }
  document.body.classList.add("no-scroll");
  if (document.readyState === "complete") hideLoader();
  else window.addEventListener("load", hideLoader);
  setTimeout(function () {
    if (!loader.classList.contains("done")) hideLoader();
  }, 4000);

  /* ---------- Language (EN / 日本語) ---------- */
  var langBtn = $("#langBtn");
  var titles = {
    en: "Ryufu Kurogane — Founder of Ryunax",
    ja: "黒金 龍風 — Ryunax創業者",
  };
  // Save English originals once
  $$("[data-ja]").forEach(function (el) {
    el.setAttribute("data-en", el.innerHTML);
  });
  $$("[data-ja-placeholder]").forEach(function (el) {
    el.setAttribute("data-en-placeholder", el.getAttribute("placeholder"));
  });

  function setLang(lang) {
    var ja = lang === "ja";
    $$("[data-ja]").forEach(function (el) {
      el.innerHTML = ja
        ? el.getAttribute("data-ja")
        : el.getAttribute("data-en");
    });
    $$("[data-ja-placeholder]").forEach(function (el) {
      el.setAttribute(
        "placeholder",
        ja
          ? el.getAttribute("data-ja-placeholder")
          : el.getAttribute("data-en-placeholder"),
      );
    });
    document.documentElement.lang = ja ? "ja" : "en";
    document.title = titles[lang];
    langBtn.textContent = ja ? "日 / EN" : "EN / 日";
    store.set("rk-lang", lang);
  }
  langBtn.addEventListener("click", function () {
    setLang(document.documentElement.lang === "ja" ? "en" : "ja");
  });
  var savedLang = store.get("rk-lang");
  if (savedLang === "ja") setLang("ja");

  /* ---------- Theme (Night 夜 / Day 昼) ---------- */
  var themeBtn = $("#themeBtn"),
    themeIcon = $("#themeIcon");
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    themeIcon.textContent = t === "dark" ? "☾" : "☀";
    var meta = $('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", t === "dark" ? "#0b0b0d" : "#f3ecdd");
    store.set("rk-theme", t);
  }
  var savedTheme = store.get("rk-theme");
  if (savedTheme) setTheme(savedTheme);
  else if (window.matchMedia("(prefers-color-scheme: light)").matches)
    setTheme("light");
  themeBtn.addEventListener("click", function () {
    setTheme(
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark",
    );
  });

  /* ---------- Header, burger, progress, active nav ---------- */
  var header = $("#header"),
    burger = $("#burger"),
    nav = $("#nav"),
    progress = $("#progress");
  function closeMenu() {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  var sections = $$("main section[id]");
  var links = $$("a", nav);
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";

    var current = "home";
    sections.forEach(function (s) {
      if (y + window.innerHeight * 0.35 >= s.offsetTop) current = s.id;
    });
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });

    if (!reduceMotion) {
      var vn = $(".vertical-name");
      if (vn && y < window.innerHeight)
        vn.style.transform = "translateY(" + y * 0.12 + "px)";
    }
  }
  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$(".reveal");
  function revealHero() {
    $$(".hero .reveal").forEach(function (el, i) {
      setTimeout(function () {
        el.classList.add("in");
      }, 120 * i);
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            if (!en.target.closest(".hero")) {
              var sibs = en.target.parentElement
                ? $$(".reveal", en.target.parentElement)
                : [];
              var idx = Math.max(sibs.indexOf(en.target), 0);
              en.target.style.transitionDelay = Math.min(idx * 80, 400) + "ms";
              en.target.classList.add("in");
            }
            if (en.target.querySelector("[data-count]")) runCounters(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
    runCounters(document);
  }

  /* ---------- Counters ---------- */
  function runCounters(scope) {
    $$("[data-count]", scope).forEach(function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target = parseInt(el.getAttribute("data-count"), 10);
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1200, 1);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- Custom cursor + tilt (fine pointers only) ---------- */
  var finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;
  if (finePointer && !reduceMotion) {
    var dot = $("#cursorDot"),
      ring = $("#cursorRing");
    var mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      document.body.classList.add("has-cursor");
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle(
        "hover",
        !!e.target.closest("a, button, input, textarea, .tilt"),
      );
    });
    document.addEventListener("mouseleave", function () {
      document.body.classList.remove("has-cursor");
    });

    $$(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateX(" +
          (-y * 7).toFixed(2) +
          "deg) rotateY(" +
          (x * 7).toFixed(2) +
          "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Sakura petals ---------- */
  var canvas = $("#sakura");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var W = 0,
      H = 0,
      petals = [],
      running = true;
    var COUNT = window.innerWidth < 700 ? 14 : 30;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function makePetal(initial) {
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -20,
        s: 5 + Math.random() * 7,
        vy: 0.5 + Math.random() * 0.9,
        vx: -0.2 + Math.random() * 0.7,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.03,
        sway: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.45,
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
      g.addColorStop(0, "#ffd7e2");
      g.addColorStop(1, "#f28aa8");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s, -p.s * 0.6, p.s * 0.8, p.s * 0.8, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.8, -p.s, -p.s * 0.6, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * 0.5;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 20 || p.x > W + 30) petals[i] = makePetal(false);
        drawPetal(p);
      }
      requestAnimationFrame(tick);
    }
    resize();
    for (var i = 0; i < COUNT; i++) petals.push(makePetal(true));
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(tick);
    });
    requestAnimationFrame(tick);
  }

  /* ---------- Contact form (opens mail client) ---------- */
  var form = $("#contactForm"),
    msg = $("#formMsg");
  function say(text, cls) {
    msg.textContent = text;
    msg.className = "form-msg " + (cls || "");
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ja = document.documentElement.lang === "ja";
    var name = form.name.value.trim(),
      email = form.email.value.trim(),
      message = form.message.value.trim();
    var ok = true;
    [form.name, form.email, form.message].forEach(function (f) {
      f.classList.remove("invalid");
    });
    if (!name) {
      form.name.classList.add("invalid");
      ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.email.classList.add("invalid");
      ok = false;
    }
    if (message.length < 5) {
      form.message.classList.add("invalid");
      ok = false;
    }
    if (!ok) {
      say(
        ja
          ? "入力内容をご確認ください。"
          : "Please check the highlighted fields.",
        "err",
      );
      return;
    }

    var subject = encodeURIComponent(
      (ja ? "ポートフォリオからのお問い合わせ: " : "Portfolio inquiry from ") +
        name,
    );
    var body = encodeURIComponent(
      message + "\n\n— " + name + " (" + email + ")",
    );
    window.location.href =
      "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    say(
      ja
        ? "メールアプリを開いています…ありがとうございます。"
        : "Opening your mail app… thank you.",
      "ok",
    );
    form.reset();
  });

  /* ---------- Misc ---------- */
  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
