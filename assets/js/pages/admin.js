Pages.admin = async function(container) {
  const defaults = { totalMembers: 0, pendingMembers: 0, totalActivities: 0, activeMembers: 0 };

  const [dashboard, pendingList] = await Promise.all([
    API.getDashboard({ silent: true }).catch(() => defaults),
    API.getPendingMembers({ silent: true }).catch(() => [])
  ]);

  const defaultTab = pendingList.length > 0 ? 'pending' : 'members';
  const user = Auth.getUser();
  const today = Utils.formatLongDate(new Date());
  const logoUrl = Utils.clubLogoUrl();
  const pendingBadge = pendingList.length
    ? `<span class="sidebar-badge">${pendingList.length}</span>`
    : '';

  const sidebarNav = (tab, icon, label, extra = '') =>
    `<a class="sidebar-nav-link${defaultTab === tab ? ' active' : ''}" href="#" data-tab="${tab}">
      <i class="bi bi-${icon}"></i><span>${label}</span>${extra}
    </a>`;

  container.innerHTML = `
    <div class="dashboard-layout page-enter">
      <aside class="dashboard-sidebar" id="dashboardSidebar">
        <div class="sidebar-brand">
          <img src="${logoUrl}" alt="" class="sidebar-logo club-logo" width="40" height="40">
          <span>${Utils.escapeHtml(CONFIG.CLUB_SHORT)}</span>
        </div>
        <nav class="sidebar-nav" id="adminNav">
          ${sidebarNav('members', 'people-fill', 'Thành viên')}
          ${sidebarNav('pending', 'person-check-fill', 'Duyệt tài khoản', pendingBadge)}
          ${sidebarNav('activities', 'calendar-event-fill', 'Hoạt động')}
          ${sidebarNav('announcements', 'megaphone-fill', 'Thông báo')}
          ${sidebarNav('executive', 'diagram-3-fill', 'Ban Chủ nhiệm')}
          ${sidebarNav('audit', 'journal-text', 'Nhật ký')}
          ${sidebarNav('settings', 'gear-fill', 'Cài đặt')}
        </nav>
        <div class="sidebar-footer-card">
          <img src="${logoUrl}" alt="" class="club-logo" width="36" height="36">
          <strong>${Utils.escapeHtml(CONFIG.CLUB_SHORT)}</strong>
          <p>${Utils.escapeHtml(CONFIG.CLUB_TAGLINE)}</p>
          <div class="sidebar-social">
            <a href="${CONFIG.FACEBOOK_URL}" target="_blank" rel="noopener" title="Facebook"><i class="bi bi-facebook"></i></a>
            <a href="mailto:${CONFIG.CONTACT_EMAIL}" title="Email"><i class="bi bi-envelope-fill"></i></a>
          </div>
        </div>
      </aside>

      <div class="dashboard-body">
        <header class="dashboard-topbar">
          <button type="button" class="btn sidebar-toggle d-lg-none" id="sidebarToggle" aria-label="Menu">
            <i class="bi bi-list"></i>
          </button>
          <nav class="dashboard-topnav d-none d-md-flex">
            <a href="#home">Trang chủ</a>
            <a href="#members">Thành viên</a>
            <a href="#activities">Hoạt động</a>
            <a href="#executive-board">Ban Chủ nhiệm</a>
            <a href="#announcements">Thông báo</a>
            <a href="#contact">Liên hệ</a>
          </nav>
          <div class="dashboard-topbar-actions">
            <a href="#admin" class="btn-admin-pill active"><i class="bi bi-gear-fill"></i><span class="d-none d-sm-inline">Quản trị</span></a>
            <a href="#my-profile" class="dashboard-user-chip">
              <img src="${Utils.avatarUrl(user?.avatar, user?.name)}" alt="" class="dashboard-user-avatar">
              <div class="dashboard-user-meta d-none d-md-block">
                <strong>${Utils.escapeHtml(user?.name || 'Admin')}</strong>
                <small>${Utils.escapeHtml(CONFIG.ROLES[user?.role] || 'Admin')}</small>
              </div>
            </a>
            <button type="button" class="btn btn-logout-pill" id="dashboardLogout">
              <i class="bi bi-box-arrow-right"></i><span class="d-none d-sm-inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <div class="dashboard-content">
          <div class="dashboard-page-header">
            <div>
              <h1>Bảng điều khiển Admin</h1>
              <p>Tổng quan hệ thống và quản lý thành viên</p>
            </div>
            <div class="dashboard-date-card">
              <div class="date-icon"><i class="bi bi-calendar3"></i></div>
              <div>
                <strong>${today}</strong>
                <span>Chào mừng quay trở lại!</span>
              </div>
            </div>
          </div>

          <div class="row g-3 g-xl-4 dashboard-stats mb-4">
            <div class="col-6 col-xl-3">
              <div class="stat-card-pro stat-blue">
                <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
                <div class="stat-value">${dashboard.totalMembers}</div>
                <div class="stat-title">Thành viên</div>
                <div class="stat-sub">Tổng số thành viên</div>
              </div>
            </div>
            <div class="col-6 col-xl-3">
              <div class="stat-card-pro stat-orange">
                <div class="stat-icon"><i class="bi bi-person-plus-fill"></i></div>
                <div class="stat-value">${dashboard.pendingMembers}</div>
                <div class="stat-title">Chờ duyệt</div>
                <div class="stat-sub">Thành viên mới</div>
              </div>
            </div>
            <div class="col-6 col-xl-3">
              <div class="stat-card-pro stat-purple">
                <div class="stat-icon"><i class="bi bi-calendar-event-fill"></i></div>
                <div class="stat-value">${dashboard.totalActivities}</div>
                <div class="stat-title">Hoạt động</div>
                <div class="stat-sub">Sự kiện sắp tới</div>
              </div>
            </div>
            <div class="col-6 col-xl-3">
              <div class="stat-card-pro stat-green">
                <div class="stat-icon"><i class="bi bi-broadcast"></i></div>
                <div class="stat-value">${dashboard.activeMembers}</div>
                <div class="stat-title">Đang hoạt động</div>
                <div class="stat-sub">Thành viên tích cực</div>
              </div>
            </div>
          </div>

          <div id="adminContent"></div>
        </div>
      </div>
      <div class="sidebar-backdrop d-lg-none" id="sidebarBackdrop"></div>
    </div>
  `;

  Utils.bindImageFallback(container.querySelector('.sidebar-brand .club-logo'));
  Utils.bindImageFallback(container.querySelector('.sidebar-footer-card .club-logo'));

  document.getElementById('dashboardLogout')?.addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
  });

  const sidebar = document.getElementById('dashboardSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const toggleSidebar = (open) => {
    sidebar?.classList.toggle('open', open);
    backdrop?.classList.toggle('show', open);
  };
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    toggleSidebar(!sidebar?.classList.contains('open'));
  });
  backdrop?.addEventListener('click', () => toggleSidebar(false));

  const content = document.getElementById('adminContent');

  async function loadTab(tab) {
    switch (tab) {
      case 'members': await MemberCRUD.loadInto(content); break;
      case 'pending': await PendingCRUD.loadInto(content); break;
      case 'activities': await ActivityCRUD.loadInto(content); break;
      case 'announcements': await AnnouncementCRUD.loadInto(content); break;
      case 'executive': content.innerHTML = await renderAdminExecutive(); break;
      case 'audit': content.innerHTML = await renderAdminAudit(); break;
      case 'settings': content.innerHTML = await renderAdminSettings(); bindAdminSettings(); break;
    }
  }

  document.getElementById('adminNav').addEventListener('click', async (e) => {
    const link = e.target.closest('[data-tab]');
    if (!link) return;
    e.preventDefault();
    document.querySelectorAll('#adminNav .sidebar-nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    toggleSidebar(false);
    Utils.showInlineLoading(content, 'Đang tải...');
    await loadTab(link.dataset.tab);
  });

  if (defaultTab === 'pending') {
    PendingCRUD.renderInto(content, pendingList);
    PendingCRUD.bindEvents(content, () => PendingCRUD.loadInto(content));
  } else {
    await MemberCRUD.loadInto(content);
  }
};

async function renderAdminExecutive() {
  const board = await API.getExecutiveBoard({ silent: true });
  return `
    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h5><i class="bi bi-diagram-3-fill me-2 text-primary"></i>Ban Chủ nhiệm (${board.length})</h5>
      </div>
      <div class="admin-panel-body">
        <div class="row g-3">
          ${board.map(m => `
            <div class="col-md-4">
              <div class="exec-mini-card">
                <strong>${Utils.escapeHtml(m.name)}</strong>
                <span class="text-primary">${Utils.escapeHtml(m.position)}</span>
                ${m.email ? `<p class="small text-muted mt-2 mb-0">${Utils.escapeHtml(m.email)}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <p class="text-muted small mt-3 mb-0">Chỉnh sửa Ban Chủ nhiệm trực tiếp trên Google Sheet <strong>ExecutiveBoard</strong>.</p>
      </div>
    </div>
  `;
}

async function renderAdminAudit() {
  let logs = [];
  try { logs = await API.getAuditLog({ silent: true }); } catch { logs = []; }
  return `
    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h5><i class="bi bi-journal-text me-2 text-primary"></i>Nhật ký hoạt động</h5>
      </div>
      <div class="admin-panel-body">
        ${logs.length ? logs.map(l => `
          <div class="audit-row">
            <strong>${Utils.escapeHtml(l.action)}</strong> — ${Utils.escapeHtml(l.user)} — ${Utils.formatDateTime(l.timestamp)}
            ${l.details ? `<br><span class="text-muted">${Utils.escapeHtml(l.details)}</span>` : ''}
          </div>
        `).join('') : '<p class="text-muted mb-0">Chưa có nhật ký hoạt động</p>'}
      </div>
    </div>
  `;
}

async function renderAdminSettings() {
  let settings = {};
  try { settings = await API.getSettings({ silent: true }); } catch { settings = {}; }
  const logoUrl = Utils.clubLogoUrl(settings.club_logo);
  return `
    <div class="admin-panel-card">
      <div class="admin-panel-header">
        <h5><i class="bi bi-gear-fill me-2 text-primary"></i>Cài đặt CLB</h5>
      </div>
      <div class="admin-panel-body">
        <div class="row g-4 align-items-center">
          <div class="col-md-4 text-center">
            <img src="${logoUrl}" alt="Logo CLB" class="club-logo-preview" id="adminClubLogoPreview">
          </div>
          <div class="col-md-8">
            <h6>Logo CLB</h6>
            <p class="text-muted small mb-3">Logo hiển thị trên thanh điều hướng, chân trang và trang đăng nhập. Khuyến nghị ảnh vuông PNG/JPG, tối đa 5MB.</p>
            <button type="button" class="btn btn-primary" id="btnChangeClubLogo">
              <i class="bi bi-image me-1"></i>Đổi logo CLB
            </button>
          </div>
        </div>
        <hr>
        <div class="small text-muted">
          <strong>Tên CLB:</strong> ${Utils.escapeHtml(settings.club_name || CONFIG.CLUB_NAME)}<br>
          <strong>Email liên hệ:</strong> ${Utils.escapeHtml(settings.contact_email || CONFIG.CONTACT_EMAIL)}
        </div>
      </div>
    </div>
  `;
}

function bindAdminSettings() {
  Utils.bindImageFallback(document.getElementById('adminClubLogoPreview'));
  document.getElementById('btnChangeClubLogo')?.addEventListener('click', async () => {
    try {
      await Utils.uploadClubLogoFile((result) => {
        const preview = document.getElementById('adminClubLogoPreview');
        if (preview) {
          preview.src = Utils.clubLogoUrl(result.url);
          Utils.bindImageFallback(preview);
        }
        document.querySelectorAll('.dashboard-sidebar .club-logo').forEach(img => {
          img.src = Utils.clubLogoUrl(result.url);
          Utils.bindImageFallback(img);
        });
        Utils.showToast('Đã cập nhật logo CLB', 'success');
      });
    } catch (err) { /* handled */ }
  });
}
