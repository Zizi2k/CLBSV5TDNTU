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
              <tr data-pending-id="${p.id}">
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

  renderInto(container, pending) {
    container.innerHTML = this.renderTable(pending);
  },

  _setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
    } else {
      btn.disabled = false;
      if (btn.dataset.originalHtml) btn.innerHTML = btn.dataset.originalHtml;
    }
  },

  _updatePendingBadge(delta) {
    document.querySelectorAll('#adminNav .badge, #pendingBadge').forEach(badge => {
      const n = Math.max(0, (parseInt(badge.textContent, 10) || 0) + delta);
      badge.textContent = n;
      badge.classList.toggle('d-none', n === 0);
    });
  },

  bindEvents(container, reloadFn) {
    this._reloadFn = reloadFn;

    container.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        this._setButtonLoading(btn, true);
        try {
          await API.approveMember(btn.dataset.id, { silent: true });
          row?.remove();
          this._updatePendingBadge(-1);
          const card = container.querySelector('.card-header h5');
          if (card) {
            const left = container.querySelectorAll('[data-pending-id]').length;
            card.textContent = `Duyệt tài khoản (${left})`;
            if (!left) {
              container.querySelector('.card-body').innerHTML = '<div class="empty-state py-4"><p>Không có đơn chờ duyệt</p></div>';
            }
          }
          Utils.showToast('Đã duyệt thành viên', 'success');
        } catch (err) {
          this._setButtonLoading(btn, false);
        }
      });
    });

    container.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Từ chối đơn đăng ký này?')) return;
        const row = btn.closest('tr');
        this._setButtonLoading(btn, true);
        try {
          await API.deleteMember(btn.dataset.id, { silent: true });
          row?.remove();
          this._updatePendingBadge(-1);
          Utils.showToast('Đã từ chối đơn đăng ký', 'info');
        } catch (err) {
          this._setButtonLoading(btn, false);
        }
      });
    });
  },

  async loadInto(container) {
    const pending = await API.getPendingMembers({ silent: true });
    this.renderInto(container, pending);
    this.bindEvents(container, () => this.loadInto(container));
  }
};
