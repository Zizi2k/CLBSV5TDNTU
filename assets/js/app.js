/**
 * Khởi tạo SPA — shell cố định, nội dung tải qua AJAX
 */
document.addEventListener('DOMContentLoaded', () => {
  applySiteBranding();

  try {
    Utils.applyClubLogos((localStorage.getItem('club_logo') || '').trim());
  } catch { /* ignore */ }

  const verEl = document.getElementById('appVersion');
  if (verEl && CONFIG.APP_VERSION) {
    verEl.textContent = `v${CONFIG.APP_VERSION} · SPA`;
  }

  initSpaNavigation();
  Auth.updateNavbar();

  const defer = window.requestIdleCallback || ((cb) => setTimeout(cb, 300));
  defer(() => {
    Utils.loadClubBranding();
    API.warmupConnection();
  });

  Router.register('home', Pages.home);
  Router.register('login', Pages.login);
  Router.register('register', Pages.register);
  Router.register('members', Pages.members);
  Router.register('profile', Pages.profile);
  Router.register('activities', Pages.activities);
  Router.register('checkin', Pages.checkin);
  Router.register('announcements', Pages.announcements);
  Router.register('executive-board', Pages.executiveBoard);
  Router.register('contact', Pages.contact);
  Router.register('my-profile', Pages.myProfile, { auth: true, roles: ['admin', 'executive', 'member'] });
  Router.register('manage', Pages.manage, { auth: true, roles: ['admin', 'executive'] });
  Router.register('admin', Pages.admin, { auth: true, roles: ['admin'] });

  Router.init();
});

function applySiteBranding() {
  if (typeof CONFIG === 'undefined') return;

  const { CLUB_NAME, CLUB_SHORT, CLUB_TAGLINE, CLUB_ADDRESS, CONTACT_EMAIL, FACEBOOK_URL, FACEBOOK_LABEL, COLORS } = CONFIG;

  if (COLORS) {
    if (COLORS.primary) document.documentElement.style.setProperty('--primary', COLORS.primary);
    if (COLORS.primaryDark) document.documentElement.style.setProperty('--primary-dark', COLORS.primaryDark);
    if (COLORS.primaryLight) document.documentElement.style.setProperty('--primary-light', COLORS.primaryLight);
  }

  document.title = CLUB_SHORT;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `${CLUB_NAME} - Hệ thống quản lý thành viên và hoạt động`;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el && text) el.textContent = text;
  };

  setText('navbarBrandText', CLUB_SHORT);
  setText('footerClubName', CLUB_SHORT);
  setText('footerTagline', CLUB_TAGLINE);
  setText('footerCopyright', CLUB_NAME);

  const footerEmail = document.getElementById('footerEmail');
  if (footerEmail && CONTACT_EMAIL) {
    footerEmail.innerHTML = `<i class="bi bi-envelope me-2"></i><a href="mailto:${CONTACT_EMAIL}" class="text-secondary text-decoration-none">${CONTACT_EMAIL}</a>`;
  }

  const footerFacebook = document.getElementById('footerFacebook');
  if (footerFacebook && FACEBOOK_URL) {
    footerFacebook.innerHTML = `<i class="bi bi-facebook me-2"></i><a href="${FACEBOOK_URL}" class="text-secondary text-decoration-none" target="_blank" rel="noopener">${FACEBOOK_LABEL || CLUB_SHORT}</a>`;
  }

  const footerAddress = document.getElementById('footerAddress');
  if (footerAddress && CLUB_ADDRESS) {
    footerAddress.innerHTML = `<i class="bi bi-geo-alt me-2"></i>${CLUB_ADDRESS}`;
  }
}

/**
 * Bắt mọi link nội bộ (#) — không reload trang
 */
function initSpaNavigation() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('data-bs-toggle')) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    e.preventDefault();
    const target = href.slice(1);
    if (!target) return;

    if (window.location.hash === href) {
      Router.navigate(target, {}, { force: true });
    } else {
      window.location.hash = target;
    }
  });

  // Ngăn form GET submit gây reload (nếu có)
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.tagName === 'FORM' && !form.hasAttribute('data-ajax')) {
      const method = (form.getAttribute('method') || 'get').toLowerCase();
      if (method === 'get' && !form.hasAttribute('action')) {
        e.preventDefault();
      }
    }
  });
}
