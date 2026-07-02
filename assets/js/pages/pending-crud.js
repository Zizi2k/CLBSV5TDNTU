/**
 * Duyệt / từ chối thành viên chờ phê duyệt
 */
const PendingCRUD = {
  renderTable(pending) {
    const body = pending.length ? `
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Họ tên</th><th>MSSV</th><th>Email</th><th>Trường</th><th>Ngày đăng ký</th><th></th></tr>
          </thead>
          <tbody>
            ${pending.map(p => `
              <tr>
                <td>${Utils.escapeHtml(p.name)}</td>
                <td>${Utils.escapeHtml(p.mssv)}</td>
                <td>${Utils.escapeHtml(p.email)}</td>
                <td>${Utils.escapeHtml(p.school)}</td>
                <td>${Utils.formatDate(p.registeredAt)}</td>
                <td class="text-nowrap">
                  <button class="btn btn-sm btn-success btn-approve" data-id="${p.id}">Duyệt</button>
                  <button class="btn btn-sm btn-danger btn-reject" data-id="${p.id}">Từ chối</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '<div class="empty-state py-4"><p>Không có đơn chờ duyệt</p></div>';

    return `
      <div class="card">
        <div class="card-header bg-white"><h5 class="mb-0">Duyệt tài khoản (${pending.length})</h5></div>
        <div class="card-body p-0">${body}</div>
      </div>
    `;
  },

  bindEvents(container, reloadFn) {
    this._reloadFn = reloadFn;

    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.approveMember(btn.dataset.id);
          Utils.showToast('Đã duyệt thành viên', 'success');
          if (this._reloadFn) await this._reloadFn();
        } catch (err) { /* handled */ }
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Từ chối đơn đăng ký này?')) return;
        try {
          await API.deleteMember(btn.dataset.id);
          Utils.showToast('Đã từ chối đơn đăng ký', 'info');
          if (this._reloadFn) await this._reloadFn();
        } catch (err) { /* handled */ }
      });
    });
  },

  async loadInto(container) {
    const pending = await API.getPendingMembers();
    container.innerHTML = this.renderTable(pending);
    this.bindEvents(container, () => this.loadInto(container));
  }
};
