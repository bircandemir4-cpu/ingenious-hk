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

  var tabs = Array.prototype.slice.call(document.querySelectorAll("[role='tab']"));
  var panels = {
    client: document.getElementById("panel-client"),
    freelancer: document.getElementById("panel-freelancer")
  };

  function openTab(name, focusTab) {
    if (!panels[name]) return;
    tabs.forEach(function (tab) {
      var active = tab.getAttribute("data-tab") === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });
    Object.keys(panels).forEach(function (key) {
      if (!panels[key]) return;
      panels[key].hidden = key !== name;
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
      if (event.key === "Home") next = tabs[0];
      if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      openTab(next.getAttribute("data-tab"), true);
    });
  });

  document.querySelectorAll("[data-tab]").forEach(function (link) {
    if (link.getAttribute("role") === "tab") return;
    link.addEventListener("click", function () {
      openTab(link.getAttribute("data-tab"), false);
      showForms();
    });
  });

  var WEB3FORMS_URL = "https://api.web3forms.com/submit";
  var WEB3FORMS_KEY = "72d9ac92-8478-41fb-931c-32b8d7ca5053";

  var inquiryForms = document.getElementById("inquiry-forms");
  var success = document.getElementById("form-success");
  var successSummary = document.getElementById("success-summary");
  var successReset = document.getElementById("success-reset");
  var successTitle = document.getElementById("success-title");
  var successCopy = document.getElementById("success-copy");
  var successKicker = document.getElementById("success-kicker");
  var lastTab = "client";

  function showForms() {
    if (inquiryForms) inquiryForms.hidden = false;
    if (success) success.hidden = true;
  }

  function showSent(title, copy, rows) {
    lastTab = document.getElementById("panel-freelancer") && !document.getElementById("panel-freelancer").hidden
      ? "freelancer"
      : "client";
    if (successKicker) successKicker.textContent = "Sent";
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
      var contactSection = document.getElementById("contact");
      if (contactSection) contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      success.setAttribute("tabindex", "-1");
      success.focus();
    }
  }

  function showFormError(form, message) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.focus && status.setAttribute("tabindex", "-1");
    status.focus();
  }

  function clearFormStatus(form) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.hidden = true;
    status.textContent = "";
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
      return response.json().then(function (data) {
        if (!response.ok || !data || data.success !== true) {
          throw new Error("send failed");
        }
      });
    }).catch(function () {
      showFormError(form, "We couldn’t send that. Check your connection and try again.");
      return Promise.reject(new Error("send failed"));
    }).finally(function () {
      if (button) {
        button.disabled = false;
        button.textContent = button.dataset.label || button.textContent;
      }
    });
  }

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
    if (input && error) {
      if (message) input.setAttribute("aria-describedby", error.id);
      else input.removeAttribute("aria-describedby");
    }
    if (!error) return false;
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

  function valueOf(form, name) {
    var el = form.elements[name];
    return (el && el.value ? el.value : "").trim();
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function digitCount(value) {
    return (value.match(/\d/g) || []).length;
  }

  function isPhone(value) {
    return digitCount(value) >= 8 && digitCount(value) <= 15 && /^[+()\d\s.-]+$/.test(value);
  }

  function isPortfolio(value) {
    if (!value) return true;
    if (/^@[\w.]{1,30}$/.test(value)) return true;
    var candidate = /^https?:\/\//i.test(value) ? value : "https://" + value;
    try {
      var url = new URL(candidate);
      return url.hostname.indexOf(".") !== -1;
    } catch (err) {
      return false;
    }
  }

  function firstInvalid(form) {
    return form.querySelector("[aria-invalid='true']");
  }

  var clientForm = document.getElementById("client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFormErrors(clientForm);
      var company = valueOf(clientForm, "company");
      var contact = valueOf(clientForm, "contact");
      var talent = valueOf(clientForm, "talent");
      var eventWhen = valueOf(clientForm, "event");
      var brief = valueOf(clientForm, "brief");
      var ok = true;

      if (company.length < 2) ok = fieldError("client-company", "Enter a company or your name.") && ok;
      else fieldError("client-company", "");

      if (!isEmail(contact) && !isPhone(contact)) {
        ok = fieldError("client-contact", "Enter a WhatsApp number or email address.") && ok;
      } else fieldError("client-contact", "");

      if (!talent) ok = fieldError("client-talent", "Choose the talent you need.") && ok;
      else fieldError("client-talent", "");

      if (eventWhen.length < 3) ok = fieldError("client-event", "Add the event date and location.") && ok;
      else fieldError("client-event", "");

      if (brief.length < 12) ok = fieldError("client-brief", "Add a short brief — at least a sentence.") && ok;
      else fieldError("client-brief", "");

      if (!ok) {
        var bad = firstInvalid(clientForm);
        if (bad) bad.focus();
        return;
      }

      var clientFields = {
        subject: "Ingenious client request",
        from_name: company,
        "Company / Name": company,
        "WhatsApp / Email": contact,
        "Talent Needed": talent,
        "Event Date & Location": eventWhen,
        Brief: brief
      };
      if (isEmail(contact)) clientFields.email = contact;

      sendToDesk(clientForm, clientFields).then(function () {
        showSent(
          "Your talent request has been sent.",
          "The Ingenious desk has it and will follow up.",
          [
            ["Company / Name", company],
            ["WhatsApp / Email", contact],
            ["Talent Needed", talent],
            ["Event Date & Location", eventWhen],
            ["Brief", brief]
          ]
        );
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
      var skills = Array.prototype.slice.call(freelancerForm.querySelectorAll("input[name='skills']:checked"))
        .map(function (box) { return box.value; });
      var ok = true;

      if (name.length < 2) ok = fieldError("free-name", "Enter your full name.") && ok;
      else fieldError("free-name", "");

      if (!isPhone(whatsapp)) ok = fieldError("free-whatsapp", "Enter a WhatsApp number, including the country code.") && ok;
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

      if (!isPortfolio(portfolio)) {
        ok = fieldError("free-portfolio", "Use a full link or an @handle. Leave it blank if you prefer.") && ok;
      } else fieldError("free-portfolio", "");

      if (availability.length < 3) ok = fieldError("free-availability", "Tell us when you can work.") && ok;
      else fieldError("free-availability", "");

      if (!ok) {
        var bad = firstInvalid(freelancerForm);
        if (bad) bad.focus();
        else if (!skills.length) {
          var firstSkill = freelancerForm.querySelector("input[name='skills']");
          if (firstSkill) firstSkill.focus();
        }
        return;
      }

      sendToDesk(freelancerForm, {
        subject: "Ingenious freelancer registration",
        from_name: name,
        "Full Name": name,
        WhatsApp: whatsapp,
        Skills: skills.join(", "),
        "Portfolio / IG": portfolio || "—",
        Availability: availability
      }).then(function () {
        showSent(
          "Your registration has been sent.",
          "The Ingenious desk has it and will follow up.",
          [
            ["Full Name", name],
            ["WhatsApp", whatsapp],
            ["Skills", skills.join(", ")],
            ["Portfolio / IG", portfolio || "—"],
            ["Availability", availability]
          ]
        );
      }).catch(function () {});
    });
  }
})();
