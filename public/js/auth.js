/* ═══════════════════════════════════════════════════════════════
   auth.js — Authentification (Login + Register)
   Responsable : Oumayma
   Phase 1 : données statiques
   Phase 2 : remplacer par les vrais fetch()
   ═══════════════════════════════════════════════════════════════ */

/* ─── Données statiques Phase 1 ─────────────────────────────── */
const FAKE_USERS = [
  {
    id: 1,
    email: "admin@ridewave.com",
    password: "admin123",
    role: "admin",
    nom: "Admin RideWave",
  },
  {
    id: 2,
    email: "ahmed@email.com",
    password: "client123",
    role: "client",
    nom: "Ahmed Ben Ali",
  },
  {
    id: 3,
    email: "sana@email.com",
    password: "client123",
    role: "client",
    nom: "Sana Trabelsi",
  },
];

/* ─── Utilitaires ────────────────────────────────────────────── */
function showMessage(boxId, textId, message, type) {
  const box = document.getElementById(boxId);
  const text = document.getElementById(textId);
  if (!box || !text) return;
  box.className = "login-message " + type;
  text.textContent = message;
}

function hideMessageAfter(boxId, delay) {
  setTimeout(() => {
    const box = document.getElementById(boxId);
    if (box) box.className = "login-message";
  }, delay);
}

function setLoading(btnId, innerId, spinnerId, loading) {
  const btn = document.getElementById(btnId);
  const inner = document.getElementById(innerId);
  const spinner = document.getElementById(spinnerId);
  if (!btn) return;
  btn.disabled = loading;
  if (inner) inner.style.display = loading ? "none" : "flex";
  if (spinner) spinner.style.display = loading ? "block" : "none";
}

function redirectAfterLogin(user) {
  const voitureId = sessionStorage.getItem("voiture_id");
  if (user.role === "admin") {
    localStorage.setItem("adminToken", "fake-token-phase1");
    localStorage.setItem("adminUser", JSON.stringify(user));
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

/* ─── Toggle password visibility ────────────────────────────── */
function setupTogglePassword(btnId, fieldId, iconId) {
  const btn = document.getElementById(btnId);
  const field = document.getElementById(fieldId);
  const icon = document.getElementById(iconId);
  if (!btn || !field || !icon) return;

  btn.addEventListener("click", () => {
    const isPassword = field.type === "password";
    field.type = isPassword ? "text" : "password";
    icon.innerHTML = isPassword
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  });
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════════ */
function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  setupTogglePassword("login-eye-btn", "login-password", "login-eye-icon");

  /* Mot de passe oublié → message temporaire */
  const forgotLink = document.getElementById("forgot-link");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      showMessage(
        "login-msg",
        "login-msg-text",
        "Contactez l'administrateur : admin@ridewave.com",
        "info"
      );
      hideMessageAfter("login-msg", 3000);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    /* Validation */
    if (!email || !password) {
      showMessage(
        "login-msg",
        "login-msg-text",
        "Veuillez remplir tous les champs.",
        "error"
      );
      return;
    }

    setLoading("login-btn", "login-btn-inner", "login-spinner", true);
    document.getElementById("login-msg").className = "login-message";

    /* ── PHASE 1 — données statiques ── */
    setTimeout(() => {
      const user = FAKE_USERS.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        showMessage(
          "login-msg",
          "login-msg-text",
          "Identifiants incorrects.",
          "error"
        );
        setLoading("login-btn", "login-btn-inner", "login-spinner", false);
        return;
      }

      localStorage.setItem("token", "fake-token-phase1");
      localStorage.setItem("user", JSON.stringify(user));
      redirectAfterLogin(user);
    }, 800);
    /* ── FIN PHASE 1 ──
           PHASE 2 : remplacer le setTimeout par :
           const res  = await fetch('/api/users/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
           const data = await res.json();
           if (!res.ok) { showMessage(..., data.message, 'error'); setLoading(..., false); return; }
           localStorage.setItem('token', data.token);
           localStorage.setItem('user',  JSON.stringify(data.user));
           redirectAfterLogin(data.user);
        */
  });
}

/* ═══════════════════════════════════════════════════════════════
   REGISTER
   ═══════════════════════════════════════════════════════════════ */
function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  setupTogglePassword(
    "register-eye-btn1",
    "register-password",
    "register-eye-icon1"
  );
  setupTogglePassword(
    "register-eye-btn2",
    "register-password2",
    "register-eye-icon2"
  );

  /* Password strength */
  const passField = document.getElementById("register-password");
  if (passField) {
    passField.addEventListener("input", updateStrength);
  }

  /* Confirm password live check */
  const pass2 = document.getElementById("register-password2");
  if (pass2 && passField) {
    pass2.addEventListener("input", () => {
      const hint = document.getElementById("register-hint-pass2");
      if (!hint) return;
      if (!pass2.value) {
        hint.className = "register-hint";
        return;
      }
      if (pass2.value === passField.value) {
        hint.textContent = "✓ Mots de passe identiques";
        hint.className = "register-hint visible success";
      } else {
        hint.textContent = "✕ Mots de passe différents";
        hint.className = "register-hint visible error";
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nom = document.getElementById("register-nom").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = passField ? passField.value : "";
    const pass2Val = pass2 ? pass2.value : "";
    const cgu = document.getElementById("register-cgu")?.checked;

    /* Validations */
    if (!nom) {
      showMessage(
        "register-msg",
        "register-msg-text",
        "Le nom est requis.",
        "error"
      );
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showMessage(
        "register-msg",
        "register-msg-text",
        "Adresse email invalide.",
        "error"
      );
      return;
    }
    if (password.length < 8) {
      showMessage(
        "register-msg",
        "register-msg-text",
        "Minimum 8 caractères requis.",
        "error"
      );
      return;
    }
    if (password !== pass2Val) {
      showMessage(
        "register-msg",
        "register-msg-text",
        "Les mots de passe ne correspondent pas.",
        "error"
      );
      return;
    }
    if (!cgu) {
      showMessage(
        "register-msg",
        "register-msg-text",
        "Vous devez accepter les CGU.",
        "error"
      );
      return;
    }

    setLoading("register-btn", "register-btn-inner", "register-spinner", true);
    document.getElementById("register-msg").className = "login-message";

    /* ── PHASE 1 — simulation inscription ── */
    setTimeout(() => {
      const existingUser = FAKE_USERS.find((u) => u.email === email);
      if (existingUser) {
        showMessage(
          "register-msg",
          "register-msg-text",
          "Cet email est déjà utilisé.",
          "error"
        );
        setLoading(
          "register-btn",
          "register-btn-inner",
          "register-spinner",
          false
        );
        return;
      }

      const newUser = { id: Date.now(), nom, email, role: "client" };
      localStorage.setItem("token", "fake-token-phase1");
      localStorage.setItem("user", JSON.stringify(newUser));

      showMessage(
        "register-msg",
        "register-msg-text",
        "Compte créé avec succès ! Redirection...",
        "success"
      );
      setTimeout(() => redirectAfterLogin(newUser), 1200);
    }, 800);
    /* ── FIN PHASE 1 ──
           PHASE 2 : remplacer le setTimeout par le vrai fetch('/api/users/register')
        */
  });
}

/* ─── Password strength ──────────────────────────────────────── */
function updateStrength() {
  const val = document.getElementById("register-password")?.value || "";
  const wrap = document.getElementById("register-strength-wrap");
  if (!wrap) return;

  wrap.style.display = val.length > 0 ? "block" : "none";

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;

  const cls = ["", "weak", "medium", "strong"];
  const txts = ["", "Faible", "Moyen", "Fort"];
  const clrs = ["", "#ef4444", "#f59e0b", "#0d9488"];

  for (let i = 1; i <= 3; i++) {
    const seg = document.getElementById("register-seg" + i);
    if (seg)
      seg.className = "register-strength-seg " + (i <= score ? cls[score] : "");
  }

  const txt = document.getElementById("register-strength-text");
  if (txt) {
    txt.textContent = txts[score];
    txt.style.color = clrs[score];
  }
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initRegister();
});
