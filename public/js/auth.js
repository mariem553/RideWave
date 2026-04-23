/* ===============================================================
   auth.js - Authentification (Login + Register)
   Responsable : Oumayma
   Phase 2 : vrais fetch() vers l'API
   =============================================================== */

/* ===============================================================
   UTILITAIRES COMMUNS
   =============================================================== */

function showMessage(boxId, textId, message, type) {
  const box  = document.getElementById(boxId);
  const text = document.getElementById(textId);
  if (!box || !text) return;
  box.className    = "login-message " + type;
  text.textContent = message;
}

function hideMessageAfter(boxId, delay) {
  setTimeout(() => {
    const box = document.getElementById(boxId);
    if (box) box.className = "login-message";
  }, delay);
}

function showFieldError(inputId, hintId, message) {
  const input = document.getElementById(inputId);
  const hint  = document.getElementById(hintId);
  if (input) {
    input.style.borderColor = "rgba(239,68,68,0.6)";
    input.style.background  = "rgba(239,68,68,0.04)";
    input.style.boxShadow   = "0 0 0 3px rgba(239,68,68,0.07)";
  }
  if (hint) {
    hint.textContent = "✕  " + message;
    hint.className   = "register-hint visible error";
  }
}

function clearFieldError(inputId, hintId) {
  const input = document.getElementById(inputId);
  const hint  = document.getElementById(hintId);
  if (!input) return;
  input.addEventListener("input", () => {
    input.style.borderColor = "";
    input.style.background  = "";
    input.style.boxShadow   = "";
    if (hint) { hint.className = "register-hint"; hint.textContent = ""; }
  });
}

function resetAllRegisterErrors() {
  const fields = [
    { input: "register-nom",       hint: "register-hint-nom"   },
    { input: "register-email",     hint: "register-hint-email" },
    { input: "register-password",  hint: "register-hint-pass"  },
    { input: "register-password2", hint: "register-hint-pass2" },
  ];
  fields.forEach(({ input, hint }) => {
    const el  = document.getElementById(input);
    const hEl = document.getElementById(hint);
    if (el)  { el.style.borderColor = ""; el.style.background = ""; el.style.boxShadow = ""; }
    if (hEl) { hEl.className = "register-hint"; hEl.textContent = ""; }
  });
}

function setLoading(btnId, innerId, spinnerId, loading) {
  const btn     = document.getElementById(btnId);
  const inner   = document.getElementById(innerId);
  const spinner = document.getElementById(spinnerId);
  if (!btn) return;
  btn.disabled = loading;
  if (inner)   inner.style.display   = loading ? "none"  : "flex";
  if (spinner) spinner.style.display = loading ? "block" : "none";
}

function redirectAfterLogin(user) {
  const voitureId = sessionStorage.getItem("voiture_id");
  if (user.role === "admin") {
    localStorage.setItem("adminToken", localStorage.getItem("token") || "");
    localStorage.setItem("adminUser",  JSON.stringify(user));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/views/admin/dashboard.html";
  } else {
    if (voitureId) {
      sessionStorage.removeItem("voiture_id");
      window.location.href = "/views/reservation.html?voiture_id=" + voitureId;
    } else {
      window.location.href = "/views/profile.html";
    }
  }
}

function setupTogglePassword(btnId, fieldId, iconId) {
  const btn   = document.getElementById(btnId);
  const field = document.getElementById(fieldId);
  const icon  = document.getElementById(iconId);
  if (!btn || !field || !icon) return;
  btn.addEventListener("click", () => {
    const isPassword = field.type === "password";
    field.type = isPassword ? "text" : "password";
    icon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}

/* ===============================================================
   LOGIN
   =============================================================== */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  setupTogglePassword("login-eye-btn", "login-password", "login-eye-icon");

  /* Efface erreur quand l'utilisateur retape */
  ["login-email", "login-password"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", () => {
      el.style.borderColor = "";
      el.style.background  = "";
      el.style.boxShadow   = "";
      const msg = document.getElementById("login-msg");
      if (msg) msg.className = "login-message";
    });
  });

  /* Mot de passe oublie */
  const forgotLink = document.getElementById("forgot-link");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage("login-msg", "login-msg-text", "Contactez l'administrateur : admin@ridewave.com", "info");
      hideMessageAfter("login-msg", 3000);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    document.getElementById("login-msg").className = "login-message";

    if (!email) {
      showMessage("login-msg", "login-msg-text", "L'adresse email est requise.", "error");
      document.getElementById("login-email").style.borderColor = "rgba(239,68,68,0.6)";
      document.getElementById("login-email").style.background  = "rgba(239,68,68,0.04)";
      return;
    }
    if (!password) {
      showMessage("login-msg", "login-msg-text", "Le mot de passe est requis.", "error");
      document.getElementById("login-password").style.borderColor = "rgba(239,68,68,0.6)";
      document.getElementById("login-password").style.background  = "rgba(239,68,68,0.04)";
      return;
    }

    setLoading("login-btn", "login-btn-inner", "login-spinner", true);

    try {
      const res  = await fetch('/api/users/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage("login-msg", "login-msg-text", data.message || "Identifiants incorrects.", "error");
        document.getElementById("login-email").style.borderColor    = "rgba(239,68,68,0.6)";
        document.getElementById("login-password").style.borderColor = "rgba(239,68,68,0.6)";
        setLoading("login-btn", "login-btn-inner", "login-spinner", false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      redirectAfterLogin(data.user);

    } catch (err) {
      showMessage("login-msg", "login-msg-text", "Erreur serveur. Réessayez.", "error");
      setLoading("login-btn", "login-btn-inner", "login-spinner", false);
    }
  });
}

/* ===============================================================
   REGISTER
   =============================================================== */
function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  setupTogglePassword("register-eye-btn1", "register-password",  "register-eye-icon1");
  setupTogglePassword("register-eye-btn2", "register-password2", "register-eye-icon2");

  clearFieldError("register-nom",       "register-hint-nom");
  clearFieldError("register-email",     "register-hint-email");
  clearFieldError("register-password",  "register-hint-pass");
  clearFieldError("register-password2", "register-hint-pass2");

  const passField = document.getElementById("register-password");
  if (passField) passField.addEventListener("input", updateStrength);

  const pass2 = document.getElementById("register-password2");
  if (pass2 && passField) {
    pass2.addEventListener("input", () => {
      const hint = document.getElementById("register-hint-pass2");
      if (!hint) return;
      if (!pass2.value) { hint.className = "register-hint"; return; }
      if (pass2.value === passField.value) {
        hint.textContent = "Mots de passe identiques";
        hint.className   = "register-hint visible success";
        pass2.style.borderColor = "rgba(13,148,136,0.5)";
        pass2.style.background  = "";
        pass2.style.boxShadow   = "";
      } else {
        hint.textContent = "Mots de passe differents";
        hint.className   = "register-hint visible error";
        pass2.style.borderColor = "rgba(239,68,68,0.6)";
      }
    });
  }

  const cguCheck = document.getElementById("register-cgu");
  if (cguCheck) {
    cguCheck.addEventListener("change", () => {
      const hint = document.getElementById("register-hint-cgu");
      if (hint) { hint.className = "register-hint"; hint.textContent = ""; }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nom      = document.getElementById("register-nom").value.trim();
    const email    = document.getElementById("register-email").value.trim();
    const password = passField ? passField.value : "";
    const pass2Val = pass2 ? pass2.value : "";
    const cgu      = document.getElementById("register-cgu")?.checked;

    resetAllRegisterErrors();

    let hasError = false;

    if (!nom) {
      showFieldError("register-nom", "register-hint-nom", "Le nom complet est requis.");
      hasError = true;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showFieldError("register-email", "register-hint-email", "Adresse email invalide.");
      hasError = true;
    }
    if (password.length < 8) {
      showFieldError("register-password", "register-hint-pass", "Minimum 8 caracteres requis.");
      hasError = true;
    }
    if (pass2Val && password !== pass2Val) {
      showFieldError("register-password2", "register-hint-pass2", "Les mots de passe ne correspondent pas.");
      hasError = true;
    }
    if (!pass2Val) {
      showFieldError("register-password2", "register-hint-pass2", "Veuillez confirmer le mot de passe.");
      hasError = true;
    }
    if (!cgu) { hasError = true; }

    if (hasError) return;

    setLoading("register-btn", "register-btn-inner", "register-spinner", true);

    try {
      const res  = await fetch('/api/users/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nom, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showFieldError("register-email", "register-hint-email", data.message || "Erreur lors de l'inscription.");
        setLoading("register-btn", "register-btn-inner", "register-spinner", false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      redirectAfterLogin(data.user);

    } catch (err) {
      showFieldError("register-email", "register-hint-email", "Erreur serveur. Réessayez.");
      setLoading("register-btn", "register-btn-inner", "register-spinner", false);
    }
  });
}

/* --- Password strength ---------------------------------------- */
function updateStrength() {
  const val  = document.getElementById("register-password")?.value || "";
  const wrap = document.getElementById("register-strength-wrap");
  if (!wrap) return;

  wrap.style.display = val.length > 0 ? "block" : "none";

  let score = 0;
  if (val.length >= 8)   score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;

  const cls  = ["", "weak", "medium", "strong"];
  const txts = ["", "Faible", "Moyen", "Fort"];
  const clrs = ["", "#ef4444", "#f59e0b", "#0d9488"];

  for (let i = 1; i <= 3; i++) {
    const seg = document.getElementById("register-seg" + i);
    if (seg) seg.className = "register-strength-seg " + (i <= score ? cls[score] : "");
  }

  const txt = document.getElementById("register-strength-text");
  if (txt) {
    txt.textContent = txts[score];
    txt.style.color = clrs[score];
  }
}

/* --- Init ----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initRegister();
});