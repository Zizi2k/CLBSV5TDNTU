/**
 * Quản lý thông báo: thêm, sửa, xóa, ghim
 */
const AnnouncementCRUD = {
  modalId: 'announcementAdminModal',

  renderTable(items) {
    const rows = items.length ? items.map(n => `
      <div class="d-flex justify-content-between align-items-start border-bottom py-3 gap-2">
        <div class="flex-grow-1">
          ${n.pinned ? '<span class="badge bg-warning text-dark me-1"><i class="bi bi-pin-angle"></i> Ghim</span>' : ''}
          ${n.important ? '<span class="badge bg-danger me-1">Quan trọng</span>' : ''}
          <strong>${Utils.escapeHtml(n.title)}</strong>
          <p class="text-muted small mb-1 mt-1">${Utils.escapeHtml((n.content || '').substring(0, 120))}${n.content?.length > 120 ? '...' : ''}</p>
          <small class="text-muted">${Utils.escapeHtml(n.author || '')} · ${Utils.timeAgo(n.createdAt)}</small>
        </div>
        <div class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary btn-edit-ann" data-id="${n.id}" title="Sửa"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-warning btn-pin-ann" data-id="${n.id}" title="Ghim/bỏ ghim"><i class="bi bi-pin"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-delete-ann" data-id="${n.id}" title="Ẩn"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('') : '<div class="empty-state py-4"><p>Chưa có thông báo</p></div>';

    return `
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Quản lý thông báo (${items.length})</h5>
          <button class="btn btn-sm btn-primary" id="btnAddAnnouncement"><i class="bi bi-plus-lg me-1"></i>Đăng thông báo</button>
        </div>
        <div class="card-body">${rows}</div>
      </div>
    `;
  },

  ensureModal() {
    if (document.getElementById(this.modalId)) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="${this.modalId}" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <form id="announcementAdminForm">
              <div class="modal-header">
                <h5 class="modal-title" id="announcementAdminTitle">Đăng thông báo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <input type="hidden" id="announcementEditId">
                <div class="mb-3">
                  <label class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" name="title" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nội dung <span class="text-danger">*</span></label>
                  <textarea class="form-control" name="content" rows="5" required></textarea>
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" name="important" id="annAdminImportant">
                  <label class="form-check-label" for="annAdminImportant">Đánh dấu quan trọng</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" name="pinned" id="annAdminPinned">
                  <label class="form-check-label" for="annAdminPinned">Ghim thông báo</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `);

    document.getElementById('announcementAdminForm').addEventListener('submit', (e) => this.handleSubmit(e));
  },

  bindEvents(container, reloadFn) {
    this.ensureModal();
    this._reloadFn = reloadFn;
    this._items = [];

    container.querySelector('#btnAddAnnouncement')?.addEventListener('click', () => this.openAdd());

    container.querySelectorAll('.btn-edit-ann').forEach(btn => {
      btn.addEventListener('click', () => this.openEdit(btn.dataset.id));
    });

    container.querySelectorAll('.btn-pin-ann').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.togglePinAnnouncement(btn.dataset.id);
          Utils.showToast('Đã cập nhật ghim', 'success');
          if (this._reloadFn) await this._reloadFn();
        } catch (err) { /* handled */ }
      });
    });

    container.querySelectorAll('.btn-delete-ann').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Ẩn thông báo này?')) return;
        try {
          await API.deleteAnnouncement(btn.dataset.id);
          Utils.showToast('Đã ẩn thông báo', 'success');
          if (this._reloadFn) await this._reloadFn();
        } catch (err) { /* handled */ }
      });
    });
  },

  openAdd() {
    const form = document.getElementById('announcementAdminForm');
    form.reset();
    document.getElementById('announcementEditId').value = '';
    document.getElementById('announcementAdminTitle').textContent = 'Đăng thông báo mới';
    new bootstrap.Modal(document.getElementById(this.modalId)).show();
  },

  async openEdit(id) {
    const items = await API.getAnnouncements();
    const n = items.find(x => x.id === id);
    if (!n) return;

    const form = document.getElementById('announcementAdminForm');
    form.reset();
    document.getElementById('announcementEditId').value = id;
    document.getElementById('announcementAdminTitle').textContent = 'Sửa thông báo';
    form.title.value = n.title;
    form.content.value = n.content;
    form.important.checked = !!n.important;
    form.pinned.checked = !!n.pinned;
    new bootstrap.Modal(document.getElementById(this.modalId)).show();
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = document.getElementById('announcementEditId').value;
    const data = {
      title: form.title.value.trim(),
      content: form.content.value.trim(),
      important: form.important.checked,
      pinned: form.pinned.checked
    };

    try {
      if (id) {
        await API.updateAnnouncement(id, data);
        Utils.showToast('Đã cập nhật thông báo', 'success');
      } else {
        await API.addAnnouncement(data);
        Utils.showToast('Đã đăng thông báo', 'success');
      }
      bootstrap.Modal.getInstance(document.getElementById(this.modalId))?.hide();
      if (this._reloadFn) await this._reloadFn();
    } catch (err) { /* handled */ }
  },

  async loadInto(container) {
    const items = await API.getAnnouncements({}, { silent: true });
    container.innerHTML = this.renderTable(items);
    this.bindEvents(container, () => this.loadInto(container));
  }
};
