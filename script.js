/* ============================================================
   STACKLY E-LEARNING PLATFORM — MAIN SCRIPT
   Handles: Login, Modal, Dashboard navigation, Sidebar, Toast
   ============================================================ */

'use strict';

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function isValidEmail(email) {
  return email.includes('@') && email.toLowerCase().includes('.com');
}

/* ── Toast ───────────────────────────────────────────────── */
function showToast(msg, icon = '✅') {
  const toast = $('#toast');
  if (!toast) return;
  $('#toastMsg').textContent = msg;
  toast.querySelector('.toast-icon').textContent = icon;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}
// Expose globally for inline onclick attributes
window.showToast = showToast;

/* ═══════════════════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════════════════ */
(function loginPage() {
  const form = $('#loginForm');
  if (!form) return; // not on login page

  const emailEl    = $('#loginEmail');
  const passEl     = $('#loginPassword');
  const roleEl     = $('#loginRole');
  const emailErr   = $('#emailError');
  const passErr    = $('#passError');
  const roleErr    = $('#roleError');
  const loginBtn   = $('#loginBtn');

  /* Inline validation on blur */
  emailEl.addEventListener('blur', () => validateEmail(emailEl, emailErr));
  passEl.addEventListener('blur',  () => validatePass(passEl,   passErr));
  roleEl.addEventListener('blur',  () => validateRole(roleEl,   roleErr));

  /* Clear error on input */
  emailEl.addEventListener('input', () => clearError(emailEl, emailErr));
  passEl.addEventListener('input',  () => clearError(passEl,  passErr));
  roleEl.addEventListener('change', () => clearError(roleEl,  roleErr));

  function validateEmail(el, errEl) {
    if (!el.value.trim() || !isValidEmail(el.value.trim())) {
      setError(el, errEl);
      return false;
    }
    clearError(el, errEl);
    return true;
  }

  function validatePass(el, errEl) {
    if (!el.value) {
      setError(el, errEl);
      return false;
    }
    clearError(el, errEl);
    return true;
  }

  function validateRole(el, errEl) {
    if (!el.value) {
      setError(el, errEl);
      return false;
    }
    clearError(el, errEl);
    return true;
  }

  function setError(el, errEl) {
    el.classList.add('error-field');
    errEl.classList.add('show');
  }

  function clearError(el, errEl) {
    el.classList.remove('error-field');
    errEl.classList.remove('show');
  }

  /* Form submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const v1 = validateEmail(emailEl, emailErr);
    const v2 = validatePass(passEl, passErr);
    const v3 = validateRole(roleEl, roleErr);

    if (!v1 || !v2 || !v3) return;

    const role = roleEl.value;

    /* Show loading state */
    loginBtn.innerHTML = '<span class="spinner"></span> Signing in…';
    loginBtn.disabled = true;

    /* Save session data */
    const name = emailEl.value.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    sessionStorage.setItem('stackly_name', displayName);
    sessionStorage.setItem('stackly_role', role);

    /* Redirect after brief delay */
    setTimeout(() => {
      if (role === 'student') {
        window.location.href = 'dashboard-student.html';
      } else {
        window.location.href = 'dashboard-instructor.html';
      }
    }, 900);
  });

  /* ── Create Account Modal ──────────────────────────────── */
  const modal        = $('#createModal');
  const openBtn      = $('#openCreateAccount');
  const closeBtn     = $('#closeModal');
  const signupForm   = $('#signupForm');
  const formView     = $('#signupFormView');
  const successView  = $('#signupSuccess');
  const backToLogin  = $('#backToLoginBtn');

  openBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Reset
    setTimeout(() => {
      formView.style.display = '';
      successView.classList.remove('show');
      signupForm.reset();
    }, 300);
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  backToLogin.addEventListener('click', closeModal);

  /* Sign-up form submit */
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const nameEl     = $('#signupName');
    const emailEl2   = $('#signupEmail');
    const passEl2    = $('#signupPassword');
    const roleEl2    = $('#signupRole');
    const nameErr    = $('#signupNameError');
    const emailErr2  = $('#signupEmailError');
    const passErr2   = $('#signupPassError');
    const roleErr2   = $('#signupRoleError');

    let ok = true;

    if (!nameEl.value.trim()) {
      nameEl.classList.add('error-field'); nameErr.classList.add('show'); ok = false;
    } else {
      nameEl.classList.remove('error-field'); nameErr.classList.remove('show');
    }

    if (!isValidEmail(emailEl2.value.trim())) {
      emailEl2.classList.add('error-field'); emailErr2.classList.add('show'); ok = false;
    } else {
      emailEl2.classList.remove('error-field'); emailErr2.classList.remove('show');
    }

    if (!passEl2.value) {
      passEl2.classList.add('error-field'); passErr2.classList.add('show'); ok = false;
    } else {
      passEl2.classList.remove('error-field'); passErr2.classList.remove('show');
    }

    if (!roleEl2.value) {
      roleEl2.classList.add('error-field'); roleErr2.classList.add('show'); ok = false;
    } else {
      roleEl2.classList.remove('error-field'); roleErr2.classList.remove('show');
    }

    if (!ok) return;

    /* Show success animation */
    formView.style.display = 'none';
    successView.classList.add('show');
  });
})();

/* ═══════════════════════════════════════════════════════════
   DASHBOARD (Student + Instructor)
   ═══════════════════════════════════════════════════════════ */
(function dashboardInit() {
  const sidebar        = $('#sidebar');
  const hamburger      = $('#hamburger');
  const overlay        = $('#sidebarOverlay');
  const logoutBtn      = $('#logoutBtn');
  const pageTitle      = $('#pageTitle');
  const navItems       = $$('.nav-item[data-section]');

  if (!sidebar) return; // not on a dashboard page

  /* ── Restore user name ───────────────────────────────── */
  const storedName = sessionStorage.getItem('stackly_name') || 'User';
  const storedRole = sessionStorage.getItem('stackly_role') || 'student';

  const userNameTop  = $('#userNameTop');
  const userAvTop    = $('#userAvatarTop');
  const welcomeHead  = $('#welcomeHeading');
  const profileName  = $('#profileFullName');
  const profileInp   = $('#profileNameInput');
  const profileAvLg  = $('#profileAvatarLarge');

  if (userNameTop) userNameTop.textContent = storedName;
  const initials = storedName.slice(0, 2).toUpperCase();
  if (userAvTop) userAvTop.textContent = initials;
  if (profileAvLg) profileAvLg.textContent = initials;

  if (welcomeHead) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const emoji = storedRole === 'instructor' ? '🧑‍🏫' : '👋';
    welcomeHead.textContent = `${greeting}, ${storedName}! ${emoji}`;
  }

  if (profileName) profileName.textContent = storedName;
  if (profileInp)  profileInp.value         = storedName;

  /* ── Sidebar toggle (mobile) ─────────────────────────── */
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);

  /* ── Section switching ───────────────────────────────── */
  const sections = $$('[id^="section"]');

  function switchSection(name) {
    sections.forEach(s => s.classList.add('hidden'));
    const target = $(`#section${capitalize(name)}`);
    if (target) {
      target.classList.remove('hidden');
      // Re-trigger animations
      target.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = '';
      });
    }
    navItems.forEach(n => {
      n.classList.toggle('active', n.dataset.section === name);
    });
    if (pageTitle) {
      pageTitle.textContent = capitalize(name).replace(/([A-Z])/g, ' $1').trim();
    }
    closeSidebar();
  }

  // Expose globally for dashboard HTML onclick handlers
  window.switchSection = switchSection;

  navItems.forEach(item => {
    item.addEventListener('click', () => switchSection(item.dataset.section));
  });

  /* ── Logout ──────────────────────────────────────────── */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('stackly_name');
      sessionStorage.removeItem('stackly_role');
      window.location.href = 'index.html';
    });
  }

  /* ── Animate progress bars on load ──────────────────── */
  window.addEventListener('load', () => {
    $$('.progress-fill').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = target;
        });
      });
    });
  });
})();

/* ── Utility ─────────────────────────────────────────────── */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
