Pages.manage = async function(container) {
  let pending = [];
  try { pending = await API.getPendingMembers(); } catch { /* empty */ }

  container.innerHTML = `
    <div class="container py-4">
      <h2 class="section-title">Quản lý CLB</h2>
      <div class="row g-4">
        <div class="col-lg-3">
          <div class="admin-sidebar">
            <nav class="nav flex-column" id="manageNav">
              <a class="nav-link active" href="#" data-tab="pending"><i class="bi bi-person-check me-2"></i>Duyệt thành viên <span class="badge bg-danger ms-1" id="pendingBadge">${pending.length}</span></a>
              <a class="nav-link" href="#" data-tab="activities"><i class="bi bi-calendar-event me-2"></i>Hoạt động</a>
              <a class="nav-link" href="#" data-tab="announcements"><i class="bi bi-megaphone me-2"></i>Thông báo</a>
              <a class="nav-link" href="#" data-tab="scores"><i class="bi bi-trophy me-2"></i>Điểm hoạt động</a>
              <a class="nav-link" href="#" data-tab="attendance"><i class="bi bi-qr-code-scan me-2"></i>Điểm danh QR</a>
            </nav>
          </div>
        </div>
        <div class="col-lg-9">
          <div id="manageContent"></div>
        </div>
      </div>
    </div>
  `;

  const content = document.getElementById('manageContent');

  async function loadTab(tab) {
    switch (tab) {
      case 'pending':
        await PendingCRUD.loadInto(content);
        try {
          const p = await API.getPendingMembers();
          document.getElementById('pendingBadge').textContent = p.length;
        } catch { /* ignore */ }
        break;
      case 'activities':
        await ActivityCRUD.loadInto(content);
        break;
      case 'announcements':
        await AnnouncementCRUD.loadInto(content);
        break;
      case 'scores':
        content.innerHTML = renderScoresTab();
        bindScoresEvents(content);
        break;
      case 'attendance':
        content.innerHTML = renderAttendanceTab();
        bindAttendanceEvents(content);
        break;
    }
  }

  document.getElementById('manageNav').addEventListener('click', async (e) => {
    const link = e.target.closest('[data-tab]');
    if (!link) return;
    e.preventDefault();
    document.querySelectorAll('#manageNav .nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    await loadTab(link.dataset.tab);
  });

  await PendingCRUD.loadInto(content);
};

function renderScoresTab() {
  return `
    <div class="card">
      <div class="card-header bg-white"><h5 class="mb-0">Cộng điểm hoạt động</h5></div>
      <div class="card-body">
        <form id="addScoreForm" class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Mã thành viên <span class="text-danger">*</span></label>
            <input type="text" class="form-control" name="memberId" required placeholder="VD: M_xxx">
          </div>
          <div class="col-md-4">
            <label class="form-label">Hoạt động <span class="text-danger">*</span></label>
            <input type="text" class="form-control" name="activity" required>
          </div>
          <div class="col-md-2">
            <label class="form-label">Điểm <span class="text-danger">*</span></label>
            <input type="number" class="form-control" name="score" min="1" required>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button type="submit" class="btn btn-primary w-100">Cộng điểm</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function bindScoresEvents(container) {
  container.querySelector('#addScoreForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    try {
      await API.addScore(data);
      Utils.showToast('Đã cộng điểm thành công', 'success');
      form.reset();
    } catch (err) { /* handled */ }
  });
}

function renderAttendanceTab() {
  return `
    <div class="card">
      <div class="card-header bg-white"><h5 class="mb-0">Điểm danh bằng QR</h5></div>
      <div class="card-body">
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="form-label">Mã hoạt động</label>
            <input type="text" class="form-control" id="checkInActivityId" placeholder="VD: A_xxx hoặc A001">
          </div>
        </div>
        <div class="text-center py-3">
          <i class="bi bi-qr-code-scan text-primary" style="font-size:4rem"></i>
          <h5 class="mt-3">Nhập mã thành viên để điểm danh</h5>
          <div class="row justify-content-center mt-4">
            <div class="col-md-8">
              <div class="input-group">
                <input type="text" class="form-control" id="qrInput" placeholder="Mã thành viên / MSSV">
                <button class="btn btn-primary" id="btnCheckIn"><i class="bi bi-check-lg me-1"></i>Điểm danh</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindAttendanceEvents(container) {
  container.querySelector('#btnCheckIn')?.addEventListener('click', async () => {
    const activityId = container.querySelector('#checkInActivityId')?.value.trim();
    const qrCode = container.querySelector('#qrInput')?.value.trim();
    if (!activityId || !qrCode) {
      Utils.showToast('Vui lòng nhập mã hoạt động và mã thành viên', 'warning');
      return;
    }
    try {
      const result = await API.checkIn(activityId, qrCode);
      Utils.showToast(result.message || 'Điểm danh thành công', 'success');
      container.querySelector('#qrInput').value = '';
    } catch (err) { /* handled */ }
  });
}
