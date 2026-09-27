/** Trang Sheet quản lý CLB dành cho tài khoản thành viên đã được duyệt. */
Pages.clubSheet = async function(container) {
  container.innerHTML = '<div class="container py-5 text-center"><div class="spinner-border text-primary" role="status"></div></div>';
  try {
    const result = await API.getClubSheetLink();
    const url = String(result.url || '').trim();
    const valid = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9_-]+(?:[/?#][^\s]*)?$/i.test(url);
    container.innerHTML = `
      <div class="container py-5 page-enter">
        <div class="card shadow-sm mx-auto" style="max-width:760px">
          <div class="card-body p-4 p-md-5 text-center">
            <i class="bi bi-file-earmark-spreadsheet text-success display-3"></i>
            <h1 class="h3 mt-3">Sheet quản lý CLB</h1>
            ${valid
              ? `<p class="text-muted">Nhấn nút bên dưới để mở Sheet quản lý CLB trong tab mới.</p>
                 <a class="btn btn-success btn-lg mt-2" href="${Utils.escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right me-2"></i>Mở Sheet quản lý CLB</a>`
              : '<p class="text-muted mb-0">CLB chưa cập nhật link Sheet quản lý. Vui lòng quay lại sau.</p>'}
          </div>
        </div>
      </div>`;
  } catch (err) {
    container.innerHTML = `<div class="container py-5 text-center"><h2 class="h4">Không tải được link Sheet</h2><p>${Utils.escapeHtml(err.message || 'Vui lòng thử lại')}</p></div>`;
  }
};
