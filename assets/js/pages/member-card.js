/** Trang giới thiệu công khai khi quét QR thành viên. */
Pages.memberCard = async function(container, params) {
  try {
    const member = await API.getPublicMember(params.id);
    const hobbies = Utils.parseTags(member.hobbies);
    const skills = Utils.parseTags(member.skills);
    container.innerHTML = `
      <div class="profile-header">
        <div class="container text-center">
          <img src="${Utils.avatarUrl(member.avatar, member.name)}" alt="${Utils.escapeHtml(member.name)}" class="profile-avatar" id="publicMemberCardAvatar">
          <h1 class="h2 mb-1">${Utils.escapeHtml(member.name)}</h1>
          <p class="lead mb-0">${Utils.escapeHtml(member.role || 'Thành viên CLB')}</p>
          ${member.titles ? `<span class="badge bg-warning text-dark mt-2">${Utils.escapeHtml(member.titles)}</span>` : ''}
        </div>
      </div>
      <div class="container py-4" style="max-width:900px">
        <div class="profile-section">
          <h2 class="h5"><i class="bi bi-person-lines-fill me-2"></i>Giới thiệu</h2>
          <p style="white-space:pre-wrap;overflow-wrap:anywhere">${Utils.escapeHtml(member.bio || 'Chưa cập nhật giới thiệu')}</p>
          ${member.quote ? `<blockquote class="blockquote border-start border-warning border-4 ps-3"><p class="mb-0 fst-italic">“${Utils.escapeHtml(member.quote)}”</p></blockquote>` : ''}
        </div>
        ${hobbies.length ? `<div class="profile-section"><h2 class="h5"><i class="bi bi-heart me-2"></i>Sở thích</h2><div>${Utils.tagsToHtml(hobbies, 'tag tag-hobby')}</div></div>` : ''}
        ${skills.length ? `<div class="profile-section"><h2 class="h5"><i class="bi bi-tools me-2"></i>Kỹ năng</h2><div>${Utils.tagsToHtml(skills, 'tag tag-skill')}</div></div>` : ''}
      </div>`;
    Utils.bindImageFallback(document.getElementById('publicMemberCardAvatar'));
  } catch (err) {
    container.innerHTML = `<div class="container py-5 text-center"><h1 class="h4">Không tìm thấy hồ sơ thành viên</h1><p>${Utils.escapeHtml(err.message || '')}</p></div>`;
  }
};
