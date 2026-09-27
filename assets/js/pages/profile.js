Pages.profile = async function(container, params) {
  const member = await API.getMember(params.id);
  const hobbies = Utils.parseTags(member.hobbies);
  const skills = Utils.parseTags(member.skills);

  container.innerHTML = `
    <div class="profile-header">
      <div class="container">
        <img src="${Utils.avatarUrl(member.avatar, member.name)}" alt="${Utils.escapeHtml(member.name)}" class="profile-avatar" id="publicProfileAvatar">
        <h2 class="mb-1">${Utils.escapeHtml(member.name)}</h2>
        <p class="lead mb-0">${Utils.escapeHtml(member.role)}</p>
        ${member.titles ? `<span class="badge bg-warning text-dark mt-2">${Utils.escapeHtml(member.titles)}</span>` : ''}
      </div>
    </div>

    <div class="container" style="margin-top:-40px; position:relative; z-index:1">
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="profile-section">
            <h5><i class="bi bi-person-lines-fill me-2"></i>Giới thiệu</h5>
            <p>${Utils.escapeHtml(member.bio || member.reason || 'Chưa cập nhật')}</p>
            ${member.quote ? `<blockquote class="blockquote border-start border-warning border-4 ps-3 mt-3"><p class="mb-0 fst-italic">"${Utils.escapeHtml(member.quote)}"</p></blockquote>` : ''}
          </div>

          ${hobbies.length ? `
            <div class="profile-section">
              <h5><i class="bi bi-heart me-2"></i>Sở thích</h5>
              <div>${Utils.tagsToHtml(hobbies, 'tag tag-hobby')}</div>
            </div>
          ` : ''}

          ${skills.length ? `
            <div class="profile-section">
              <h5><i class="bi bi-tools me-2"></i>Kỹ năng</h5>
              <div>${Utils.tagsToHtml(skills, 'tag tag-skill')}</div>
            </div>
          ` : ''}
        </div>

        <div class="col-lg-4">
          <div class="profile-section">
            <h5><i class="bi bi-info-circle me-2"></i>Thông tin</h5>
            <ul class="list-unstyled mb-0">
              ${member.email ? `<li class="mb-2"><i class="bi bi-envelope text-primary me-2"></i>${Utils.escapeHtml(member.email)}</li>` : ''}
              ${member.phone ? `<li class="mb-2"><i class="bi bi-telephone text-primary me-2"></i>${Utils.escapeHtml(member.phone)}</li>` : ''}
              ${member.facebook ? `<li class="mb-2"><i class="bi bi-facebook text-primary me-2"></i><a href="${Utils.escapeHtml(member.facebook)}" target="_blank">Facebook</a></li>` : ''}
              ${member.zalo ? `<li class="mb-2"><i class="bi bi-chat-dots text-primary me-2"></i>Zalo: ${Utils.escapeHtml(member.zalo)}</li>` : ''}
              ${member.school ? `<li class="mb-2"><i class="bi bi-building text-primary me-2"></i>${Utils.escapeHtml(member.school)}</li>` : ''}
              ${member.faculty ? `<li class="mb-2"><i class="bi bi-book text-primary me-2"></i>${Utils.escapeHtml(member.faculty)}</li>` : ''}
              ${member.joinDate ? `<li class="mb-2"><i class="bi bi-calendar-check text-primary me-2"></i>Tham gia: ${Utils.formatDate(member.joinDate)}</li>` : ''}
            </ul>
          </div>

          ${Auth.isExecutive() ? `
            <div class="profile-section text-center">
              <h5><i class="bi bi-qr-code me-2"></i>Mã QR thành viên</h5>
              <p class="text-muted small">Chỉ Admin và Ban Chủ nhiệm được xem mã QR để hỗ trợ điểm danh.</p>
              <button type="button" class="btn btn-outline-primary" id="showMemberQr">Xem mã QR</button>
              <div id="memberQrContent" class="d-none mt-3">
                <div id="memberQrImage" class="d-flex justify-content-center"></div>
                <div class="small text-muted mt-2" id="memberQrId"></div>
              </div>
            </div>
          ` : ''}

          <div class="profile-section text-center">
            <h5><i class="bi bi-trophy me-2"></i>Điểm hoạt động</h5>
            <div class="display-4 text-primary fw-bold">${member.totalScore || 0}</div>
            <p class="text-muted">điểm tích lũy</p>
          </div>
        </div>
      </div>
    </div>
  `;

  Utils.bindImageFallback(document.getElementById('publicProfileAvatar'));

  container.querySelector('#showMemberQr')?.addEventListener('click', async e => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const qr = await API.getMemberQr(member.id);
      const content = container.querySelector('#memberQrContent');
      const image = container.querySelector('#memberQrImage');
      await Utils.renderQrCode(image, qr.memberId, 180);
      container.querySelector('#memberQrId').textContent = 'Mã thành viên: ' + qr.memberId;
      content.classList.remove('d-none');
      button.classList.add('d-none');
    } catch (err) {
      button.disabled = false;
      Utils.showToast(err.message || 'Không tải được mã QR', 'danger');
    }
  });
};
