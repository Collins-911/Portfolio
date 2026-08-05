// ── THEME ──
const themeBtn = document.getElementById('themeBtn');
const html = document.documentElement;
const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);
themeBtn.innerHTML = saved === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

themeBtn.addEventListener('click', function () {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeBtn.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// ── NAVIGATION ──
function showSection(id) {
  document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
  document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
  var sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  document.querySelectorAll('[data-section="' + id + '"]').forEach(function (l) { l.classList.add('active'); });
  document.getElementById('sidebar').classList.remove('open');
}

document.querySelectorAll('.nav-link').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    var target = this.getAttribute('data-section');
    if (target) showSection(target);
  });
});

// ── MOBILE MENU ──
document.getElementById('menuBtn').addEventListener('click', function () {
  document.getElementById('sidebar').classList.toggle('open');
});

// ── TOAST ──
function showToast(msg, success) {
  if (success === undefined) success = true;
  var toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.querySelector('i').className = success ? 'fas fa-check-circle' : 'fas fa-times-circle';
  toast.style.borderColor = success ? 'var(--accent)' : '#f87171';
  toast.querySelector('i').style.color = success ? 'var(--accent)' : '#f87171';
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 3500);
}

// ── SKILL BARS (auto-updated from progress.json) ──
async function loadSkillBars() {
  const skillElements = document.querySelectorAll('[data-skill]');
  if (!skillElements.length) return;

  let data;
  try {
    const response = await fetch('progress.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`status ${response.status}`);
    data = await response.json();
  } catch (err) {
    console.warn('progress.json not loaded, keeping static bar values:', err);
    return; // bars stay at whatever hardcoded % is in the HTML
  }

  skillElements.forEach(function (el) {
    const key = el.dataset.skill;
    const percent = data[key];
    if (percent === undefined) return; // e.g. "react" won't be in the JSON — leave it as-is

    const fill = el.querySelector('.skill-fill');
    const label = el.querySelector('.skill-percent');

    requestAnimationFrame(function () {
      if (fill) fill.style.width = percent + '%';
      if (label) label.textContent = percent + '%';
    });
  });
}

document.addEventListener('DOMContentLoaded', loadSkillBars);

// ── CONTACT FORM ──
var form = document.getElementById('contactForm');
try { emailjs.init("Z6lDo9ObQinqBwv_z"); } catch (e) { }

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var btn = form.querySelector('.submit-btn');
  var original = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  var data = Object.fromEntries(new FormData(form));

  if (!navigator.onLine) {
    setTimeout(function () {
      btn.innerHTML = original;
      btn.disabled = false;
      showToast("You're offline. Email me directly!", false);
    }, 600);
    return;
  }

  emailjs.send("service_vm3xitm", "template_a58fy07", data)
    .then(function () {
      form.reset();
      btn.innerHTML = original;
      btn.disabled = false;
      showToast("Message sent! I'll reply soon.");
    })
    .catch(function () {
      btn.innerHTML = original;
      btn.disabled = false;
      showToast("Failed to send. Email me directly!", false);
    });
});
