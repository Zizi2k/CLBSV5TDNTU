const Pages = {};

Pages.home = async function(container, params, { signal } = {}) {
  const data = await API.getHomeData({ silent: true });
  const activities = data.activities || [];
  const announcements = data.announcements || [];
  const members = data.members || [];

  if (data.settings) {
    Utils.applyClubLogos((data.settings.club_logo || '').trim());
  }

  const ongoing = activities.filter(a => a.status === 'ongoing' || Utils.getActivityStatus(a.startDate, a.endDate) === 'ongoing');
  const upcoming = activities.filter(a => a.status === 'upcoming' || Utils.getActivityStatus(a.startDate, a.endDate) === 'upcoming');
  const featured = members.slice(0, 4);
  const carouselMembers = members.filter(m => m && m.id && m.name);
  const memberSlides = [];
  for (let i = 0; i < carouselMembers.length; i += 3) memberSlides.push(carouselMembers.slice(i, i + 3));
  const latestNews = announcements.slice(0, 3);

  container.innerHTML = `
    <section class="hero-banner">
      <div class="container text-center position-relative">
        <span class="hero-eyebrow"><i class="bi bi-stars me-1"></i> CỘNG ĐỒNG SINH VIÊN 5 TỐT</span>
        <h1>Những gương mặt tạo nên <em>${CONFIG.CLUB_NAME}</em></h1>
        <p class="lead mt-3">${CONFIG.CLUB_TAGLINE}. Cùng gặp gỡ những thành viên đang góp sức xây dựng một cộng đồng năng động và gắn kết.</p>
        <div class="hero-actions mt-4 d-flex gap-3 justify-content-center flex-wrap">
          ${!Auth.isLoggedIn() ? `
            <a href="#login" class="btn btn-warning btn-lg px-4"><i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</a>
            <a href="#register" class="btn btn-outline-light btn-lg px-4"><i class="bi bi-person-plus me-2"></i>Đăng ký</a>
          ` : `
            <a href="#activities" class="btn btn-warning btn-lg px-4"><i class="bi bi-calendar-event me-2"></i>Xem hoạt động</a>
            <a href="#my-profile" class="btn btn-outline-light btn-lg px-4"><i class="bi bi-person me-2"></i>Hồ sơ cá nhân</a>
          `}
        </div>
        <div class="hero-member-carousel" aria-label="Hình ảnh thành viên CLB">
          ${memberSlides.length ? `
            <div class="hero-member-stage" id="homeMemberCarousel" aria-live="off">
              ${memberSlides.map((slide, index) => `
                <div class="hero-member-slide ${index === 0 ? 'is-active' : ''}" aria-hidden="${index !== 0}">
                  ${slide.map(m => `
                    <a class="hero-member-tile" href="#profile/${encodeURIComponent(m.id)}" aria-label="Xem hồ sơ ${Utils.escapeHtml(m.name)}">
                      <img src="${Utils.avatarUrl(m.avatar, m.name)}" alt="Ảnh thành viên ${Utils.escapeHtml(m.name)}" loading="${index ? 'lazy' : 'eager'}">
                      <span class="hero-member-caption"><strong>${Utils.escapeHtml(m.name)}</strong><small>${Utils.escapeHtml(m.role || 'Thành viên')}</small></span>
                    </a>
                  `).join('')}
                  ${Array.from({ length: 3 - slide.length }, () => '<div class="hero-member-tile hero-member-empty" aria-hidden="true"><i class="bi bi-person-plus"></i><span>Thành viên CLB</span></div>').join('')}
                </div>
              `).join('')}
            </div>
            ${memberSlides.length > 1 ? `
              <div class="hero-carousel-controls">
                <button type="button" class="hero-carousel-arrow" data-carousel-step="-1" aria-label="Xem nhóm thành viên trước"><i class="bi bi-chevron-left"></i></button>
                <div class="hero-carousel-dots" aria-label="Chọn nhóm thành viên">
                  ${memberSlides.map((_, i) => `<button type="button" class="hero-carousel-dot ${i === 0 ? 'is-active' : ''}" data-carousel-index="${i}" aria-label="Nhóm ${i + 1}" aria-current="${i === 0 ? 'true' : 'false'}"></button>`).join('')}
                </div>
                <button type="button" class="hero-carousel-arrow" data-carousel-step="1" aria-label="Xem nhóm thành viên tiếp theo"><i class="bi bi-chevron-right"></i></button>
              </div>
            ` : ''}
          ` : Auth.isLoggedIn()
            ? '<p class="hero-carousel-empty">Hình ảnh thành viên sẽ xuất hiện khi CLB cập nhật hồ sơ.</p>'
            : `<div class="hero-guest-brand">
                <div class="hero-guest-logo-ring">
                  <img class="club-logo hero-guest-logo" src="${Utils.escapeHtml(Utils.clubLogoUrl((data.settings?.club_logo || '').trim()))}" alt="Logo CLB SV5T DNTU">
                </div>
                <p>Sống chuẩn 5 tốt - sáng tương lai</p>
              </div>`}
        </div>
      </div>
    </section>

    <div class="container py-5 page-enter">
      ${ongoing.length ? renderActivitySection('Hoạt động đang diễn ra', ongoing, 'ongoing') : ''}
      ${upcoming.length ? renderActivitySection('Hoạt động sắp diễn ra', upcoming, 'upcoming') : ''}

      <section class="mb-5">
        <h3 class="section-title">Tin mới</h3>
        <div class="row g-3">
          ${latestNews.map(n => `
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-body">
                  ${(() => {
                    const author = members.find(m => m.name === n.author);
                    const name = n.author || 'Ban Chủ nhiệm';
                    return `<div class="home-news-author"><img src="${Utils.avatarUrl(author?.avatar, name)}" alt="Avatar ${Utils.escapeHtml(name)}" loading="lazy"><span><strong>${Utils.escapeHtml(name)}</strong><small>Thông báo CLB</small></span></div>`;
                  })()}
                  ${n.pinned ? '<span class="badge bg-warning text-dark mb-2"><i class="bi bi-pin-angle"></i> Ghim</span>' : ''}
                  ${n.important ? '<span class="badge bg-danger mb-2"><i class="bi bi-exclamation-circle"></i> Quan trọng</span>' : ''}
                  <h5 class="card-title">${Utils.escapeHtml(n.title)}</h5>
                  <p class="card-text text-muted small">${Utils.escapeHtml(n.content.substring(0, 100))}...</p>
                  <small class="text-muted">${Utils.timeAgo(n.createdAt)}</small>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="text-center mt-3">
          <a href="#announcements" class="btn btn-outline-primary">Xem tất cả thông báo</a>
        </div>
      </section>

      ${Auth.isLoggedIn() ? `
        <section class="mb-5">
          <h3 class="section-title">Thành viên tiêu biểu</h3>
          <div class="row g-4">
            ${featured.map(m => renderMemberCard(m)).join('')}
          </div>
          <div class="text-center mt-3">
            <a href="#members" class="btn btn-outline-primary">Xem tất cả thành viên</a>
          </div>
        </section>
      ` : ''}
    </div>
  `;

  const carousel = container.querySelector('#homeMemberCarousel');
  if (carousel && memberSlides.length > 1) {
    const slides = [...carousel.querySelectorAll('.hero-member-slide')];
    const dots = [...container.querySelectorAll('.hero-carousel-dot')];
    const wrapper = carousel.closest('.hero-member-carousel');
    let current = 0;
    let timer;

    const show = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === current);
        slide.setAttribute('aria-hidden', String(i !== current));
        slide.querySelectorAll('a').forEach(link => { link.tabIndex = i === current ? 0 : -1; });
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-current', String(i === current));
      });
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(() => {
        if (!carousel.isConnected) { stop(); return; }
        show(current + 1);
      }, 5000);
    };
    wrapper.querySelectorAll('[data-carousel-step]').forEach(button =>
      button.addEventListener('click', () => { show(current + Number(button.dataset.carouselStep)); start(); }));
    dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.carouselIndex)); start(); }));
    wrapper.addEventListener('mouseenter', stop);
    wrapper.addEventListener('mouseleave', start);
    wrapper.addEventListener('focusin', stop);
    wrapper.addEventListener('focusout', e => { if (!wrapper.contains(e.relatedTarget)) start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start(), { signal });
    signal?.addEventListener('abort', stop, { once: true });
    show(0);
    start();
  }

  const guestLogo = container.querySelector('.hero-guest-logo');
  if (guestLogo) Utils.bindImageFallback(guestLogo);

  const homeActivities = [...ongoing.slice(0, 3), ...upcoming.slice(0, 3)];
  container.querySelectorAll('.activity-cover').forEach(img => {
    const actId = img.dataset.activityId;
    const activity = homeActivities.find(a => a.id === actId) || activities.find(a => a.id === actId);
    if (activity) Utils.renderActivityCover(img, activity);
  });
};

function renderActivitySection(title, items, status) {
  return `
    <section class="mb-5">
      <h3 class="section-title">${title}</h3>
      <div class="row g-4">
        ${items.slice(0, 3).map(a => renderActivityCard(a, status)).join('')}
      </div>
    </section>
  `;
}

function renderActivityCard(a, status) {
  const st = status || a.status || Utils.getActivityStatus(a.startDate, a.endDate);
  let timeInfo = '';
  if (st === 'ongoing') timeInfo = `Còn ${Utils.daysRemaining(a.endDate)} ngày`;
  else if (st === 'upcoming') timeInfo = `Bắt đầu sau ${Utils.daysUntil(a.startDate)} ngày`;

  return `
    <div class="col-md-4">
      <div class="card activity-card h-100">
        <img data-activity-id="${a.id}" class="card-img-top activity-cover" alt="${Utils.escapeHtml(a.name)}">
        <span class="status-badge ${Utils.statusClass(st)}">${Utils.statusLabel(st)}</span>
        <div class="card-body">
          <h5 class="card-title">${Utils.escapeHtml(a.name)}</h5>
          <p class="card-text text-muted small">${Utils.escapeHtml(a.description || '')}</p>
          ${a.criterion ? `<p class="mb-2"><span class="criterion-badge"><i class="bi bi-award me-1"></i>${Utils.escapeHtml(a.criterion)}</span></p>` : ''}
          <p class="text-primary fw-semibold small mb-2"><i class="bi bi-clock me-1"></i>${timeInfo}</p>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted"><i class="bi bi-people me-1"></i>${a.participants || 0} người</small>
            <a href="#activities/${a.id}" class="btn btn-sm btn-primary">Chi tiết</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderMemberCard(m) {
  return `
    <div class="col-sm-6 col-lg-3">
      <div class="card member-card h-100">
        <div class="bg-primary" style="height:60px"></div>
        <img src="${Utils.avatarUrl(m.avatar, m.name)}" alt="${Utils.escapeHtml(m.name)}" class="avatar">
        <div class="card-body">
          <span class="role-badge">${Utils.escapeHtml(m.role)}</span>
          <h5 class="card-title mb-1">${Utils.escapeHtml(m.name)}</h5>
          <p class="text-muted small mb-2">${Utils.escapeHtml(m.faculty || '')}</p>
          <p class="text-muted small mb-3">${Utils.escapeHtml(m.school || '')}</p>
          <a href="#profile/${m.id}" class="btn btn-sm btn-outline-primary">Xem hồ sơ</a>
        </div>
      </div>
    </div>
  `;
}

Pages.renderMemberCard = renderMemberCard;
Pages.renderActivityCard = renderActivityCard;
