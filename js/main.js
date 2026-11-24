(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  var year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setMenu(false);
  });

  var navLinks = document.querySelectorAll(".nav-list a");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 960) setMenu(false);
  });

  var sections = document.querySelectorAll("main section[id]");
  function markCurrent() {
    var current = "";
    sections.forEach(function (section) {
      var top = section.getBoundingClientRect().top;
      if (top < 140) current = section.id;
    });
    navLinks.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      if (id && id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }
  markCurrent();
  window.addEventListener("scroll", markCurrent, { passive: true });

  if ("IntersectionObserver" in window) {
    var reveals = document.querySelectorAll(".reveal");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  var WEB3FORMS_URL = "https://api.web3forms.com/submit";
  var WEB3FORMS_KEY = "72d9ac92-8478-41fb-931c-32b8d7ca5053";
  var inquiryForms = document.getElementById("inquiry-forms");
  var success = document.getElementById("form-success");
  var successSummary = document.getElementById("success-summary");
  var successTitle = document.getElementById("success-title");
  var successCopy = document.getElementById("success-copy");
  var successReset = document.getElementById("success-reset");
  var lastTab = "client";
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[role='tab']"));
  var panels = {
    client: document.getElementById("panel-client"),
    freelancer: document.getElementById("panel-freelancer")
  };

  function showForms() {
    if (inquiryForms) inquiryForms.hidden = false;
    if (success) success.hidden = true;
  }

  function openTab(name, focusTab) {
    if (!panels[name]) return;
    lastTab = name;
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== name;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      openTab(tab.getAttribute("data-tab"), false);
    });
    tab.addEventListener("keydown", function (event) {
      var next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      if (!next) return;
      event.preventDefault();
      openTab(next.getAttribute("data-tab"), true);
    });
  });

  document.querySelectorAll("a[data-tab]").forEach(function (link) {
    link.addEventListener("click", function () {
      openTab(link.getAttribute("data-tab"), false);
      showForms();
    });
  });

  if (successReset) {
    successReset.addEventListener("click", function () {
      showForms();
      openTab(lastTab, true);
    });
  }

  function fieldError(id, message) {
    var input = document.getElementById(id);
    var error = document.getElementById("err-" + id);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (!error) return !message;
    error.hidden = !message;
    error.textContent = message || "";
    return !message;
  }

  function clearFormErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.setAttribute("aria-invalid", "false");
    });
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function clearFormStatus(form) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.hidden = true;
    status.textContent = "";
  }

  function showFormError(form) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.hidden = false;
    status.textContent = "We couldn’t send that. Please try again.";
  }

  function valueOf(form, name) {
    var el = form.elements[name];
    return (el && el.value ? el.value : "").trim();
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    var digits = (value.match(/\d/g) || []).length;
    return digits >= 8 && digits <= 15 && /^[+()\d\s.-]+$/.test(value);
  }

  function isPortfolio(value) {
    if (!value) return true;
    if (/^@[\w.]{1,30}$/.test(value)) return true;
    var candidate = /^https?:\/\//i.test(value) ? value : "https://" + value;
    try {
      return new URL(candidate).hostname.indexOf(".") !== -1;
    } catch (err) {
      return false;
    }
  }

  function showSent(title, copy, rows) {
    if (successTitle) successTitle.textContent = title;
    if (successCopy) successCopy.textContent = copy;
    if (successSummary) {
      successSummary.replaceChildren();
      rows.forEach(function (row) {
        var wrap = document.createElement("div");
        var dt = document.createElement("dt");
        var dd = document.createElement("dd");
        dt.textContent = row[0];
        dd.textContent = row[1];
        wrap.append(dt, dd);
        successSummary.append(wrap);
      });
    }
    if (inquiryForms) inquiryForms.hidden = true;
    if (success) {
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus();
    }
  }

  function sendToDesk(form, fields) {
    var button = form.querySelector("[type='submit']");
    var bot = form.querySelector("[name='botcheck']");
    clearFormStatus(form);
    if (button) {
      button.disabled = true;
      if (!button.dataset.label) button.dataset.label = button.textContent;
      button.textContent = "Sending…";
    }
    var payload = {
      access_key: WEB3FORMS_KEY,
      botcheck: bot && bot.checked ? "on" : ""
    };
    Object.keys(fields).forEach(function (key) {
      payload[key] = fields[key];
    });

    return fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    }).then(function (response) {
      return response.json().catch(function () { return null; }).then(function (data) {
        if (response.ok && data && data.success === true) return;
        throw new Error("send failed");
      });
    }).catch(function () {
      showFormError(form);
      return Promise.reject(new Error("send failed"));
    }).finally(function () {
      if (button) {
        button.disabled = false;
        button.textContent = button.dataset.label || button.textContent;
      }
    });
  }

  function isoToday() {
    var now = new Date();
    var month = String(now.getMonth() + 1);
    var day = String(now.getDate());
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return now.getFullYear() + "-" + month + "-" + day;
  }

  function formatEventDate(iso) {
    var parts = (iso || "").split("-");
    if (parts.length !== 3) return iso;
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var year = Number(parts[0]);
    var month = Number(parts[1]);
    var day = Number(parts[2]);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return iso;
    return day + " " + months[month - 1] + " " + year;
  }

  var dateInput = document.getElementById("client-date");
  if (dateInput) dateInput.min = isoToday();

  var clientForm = document.getElementById("client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(clientForm);
      var company = valueOf(clientForm, "company");
      var contact = valueOf(clientForm, "contact");
      var talent = valueOf(clientForm, "talent");
      var eventDate = valueOf(clientForm, "eventDate");
      var location = valueOf(clientForm, "location");
      var brief = valueOf(clientForm, "brief");
      var readableDate = formatEventDate(eventDate);
      var ok = true;

      if (company.length < 2) ok = fieldError("client-company", "Enter a company or your name.") && ok;
      else fieldError("client-company", "");
      if (!isEmail(contact) && !isPhone(contact)) ok = fieldError("client-contact", "Enter a WhatsApp number or email address.") && ok;
      else fieldError("client-contact", "");
      if (!talent) ok = fieldError("client-talent", "Choose the talent you need.") && ok;
      else fieldError("client-talent", "");
      if (!eventDate) ok = fieldError("client-date", "Choose an event date.") && ok;
      else if (dateInput && dateInput.min && eventDate < dateInput.min) ok = fieldError("client-date", "Choose today or a later date.") && ok;
      else fieldError("client-date", "");
      if (location.length < 2) ok = fieldError("client-location", "Add the location.") && ok;
      else fieldError("client-location", "");
      if (brief.length < 12) ok = fieldError("client-brief", "Add a short brief.") && ok;
      else fieldError("client-brief", "");
      if (!ok) {
        var bad = clientForm.querySelector("[aria-invalid='true']");
        if (bad) bad.focus();
        return;
      }

      var fields = {
        subject: "Ingenious client request",
        name: company,
        from_name: company,
        message: [
          "Company / Name: " + company,
          "WhatsApp / Email: " + contact,
          "Talent Needed: " + talent,
          "Event date: " + readableDate,
          "Location: " + location,
          "Brief: " + brief
        ].join("\n")
      };
      if (isEmail(contact)) fields.email = contact;

      sendToDesk(clientForm, fields).then(function () {
        showSent("Your talent request has been sent.", "The Ingenious desk has it and will follow up.", [
          ["Company / Name", company],
          ["WhatsApp / Email", contact],
          ["Talent Needed", talent],
          ["Event date", readableDate],
          ["Location", location],
          ["Brief", brief]
        ]);
      }).catch(function () {});
    });
  }

  var freelancerForm = document.getElementById("freelancer-form");
  if (freelancerForm) {
    freelancerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(freelancerForm);
      var name = valueOf(freelancerForm, "name");
      var whatsapp = valueOf(freelancerForm, "whatsapp");
      var portfolio = valueOf(freelancerForm, "portfolio");
      var availability = valueOf(freelancerForm, "availability");
      var skills = Array.prototype.slice.call(freelancerForm.querySelectorAll("input[name='skills']:checked")).map(function (box) {
        return box.value;
      });
      var ok = true;
      if (name.length < 2) ok = fieldError("free-name", "Enter your full name.") && ok;
      else fieldError("free-name", "");
      if (!isPhone(whatsapp)) ok = fieldError("free-whatsapp", "Enter a WhatsApp number.") && ok;
      else fieldError("free-whatsapp", "");
      var skillsError = document.getElementById("err-free-skills");
      if (!skills.length) {
        ok = false;
        if (skillsError) {
          skillsError.hidden = false;
          skillsError.textContent = "Select at least one skill.";
        }
      } else if (skillsError) {
        skillsError.hidden = true;
        skillsError.textContent = "";
      }
      if (!isPortfolio(portfolio)) ok = fieldError("free-portfolio", "Use a link or an @handle.") && ok;
      else fieldError("free-portfolio", "");
      if (availability.length < 3) ok = fieldError("free-availability", "Tell us when you can work.") && ok;
      else fieldError("free-availability", "");
      if (!ok) {
        var bad = freelancerForm.querySelector("[aria-invalid='true']");
        if (bad) bad.focus();
        else if (!skills.length) {
          var firstSkill = freelancerForm.querySelector("input[name='skills']");
          if (firstSkill) firstSkill.focus();
        }
        return;
      }

      sendToDesk(freelancerForm, {
        subject: "Ingenious freelancer registration",
        name: name,
        from_name: name,
        message: [
          "Full Name: " + name,
          "WhatsApp: " + whatsapp,
          "Skills: " + skills.join(", "),
          "Portfolio / IG: " + (portfolio || "—"),
          "Availability: " + availability
        ].join("\n")
      }).then(function () {
        showSent("Your registration has been sent.", "The Ingenious desk has it and will follow up.", [
          ["Full Name", name],
          ["WhatsApp", whatsapp],
          ["Skills", skills.join(", ")],
          ["Portfolio / IG", portfolio || "—"],
          ["Availability", availability]
        ]);
      }).catch(function () {});
    });
  }
})();
