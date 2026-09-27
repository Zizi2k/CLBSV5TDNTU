/**
 * Giao diện xác thực dùng chung. Giữ chuyển động khi đổi giữa hai hash route.
 */
const AuthTransition = {
  go(page) {
    const card = document.querySelector('.auth-card');
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      Router.go(page);
      return;
    }
    if (card.classList.contains('auth-leaving')) return;
    card.classList.add('auth-leaving');
    setTimeout(() => Router.go(page), 260);
  }
};

Pages.login = async function(container) {
  if (Auth.isLoggedIn()) {
    Auth.redirectAfterLogin(Auth.getUser());
    return;
  }

  container.innerHTML = `
    <section class="auth-page" aria-labelledby="loginHeading">
      <div class="auth-card auth-login">
        <div class="auth-form-panel">
          <div class="auth-form-inner">
            <img src="${Utils.clubLogoUrl()}" alt="Logo CLB SV5T DNTU" width="58" height="58" class="club-logo auth-logo" id="loginClubLogo">
            <h1 id="loginHeading">Đăng nhập</h1>
            <p class="auth-subtitle">Chào mừng bạn quay lại với ${CONFIG.CLUB_SHORT}</p>
            <form id="loginForm">
              <label for="loginIdentifier">Email hoặc MSSV</label>
              <input id="loginIdentifier" class="auth-input" type="text" autocomplete="username" required placeholder="Nhập email hoặc MSSV">
              <label for="loginPassword">Mật khẩu</label>
              <div class="auth-password-wrap">
                <input id="loginPassword" class="auth-input" type="password" autocomplete="current-password" required placeholder="Nhập mật khẩu">
                <button type="button" id="togglePassword" class="auth-visibility" aria-label="Hiện mật khẩu" aria-pressed="false"><i class="bi bi-eye"></i></button>
              </div>
              <button type="submit" class="auth-primary-btn">Đăng nhập <i class="bi bi-arrow-right"></i></button>
            </form>
            <p class="auth-mobile-switch">Chưa có tài khoản? <a href="#register" data-auth-target="register">Đăng ký</a></p>
          </div>
        </div>
        <aside class="auth-side-panel">
          <div class="auth-side-inner">
            <span class="auth-side-mark"><i class="bi bi-stars"></i> SINH VIÊN 5 TỐT</span>
            <h2>Xin chào, bạn mới!</h2>
            <p>Đăng ký thành viên để kết nối, phát triển và cùng tham gia các hoạt động của CLB.</p>
            <a href="#register" data-auth-target="register" class="auth-outline-btn">Đăng ký <i class="bi bi-arrow-right"></i></a>
          </div>
        </aside>
      </div>
    </section>
  `;

  const logo = container.querySelector('#loginClubLogo');
  if (logo) Utils.bindImageFallback(logo, Utils.resolveAsset(Utils.DEFAULT_CLUB_LOGO));

  container.querySelectorAll('[data-auth-target]').forEach(link => link.addEventListener('click', e => {
    e.preventDefault();
    AuthTransition.go(link.dataset.authTarget);
  }));

  container.querySelector('#togglePassword').addEventListener('click', e => {
    const input = container.querySelector('#loginPassword');
    const button = e.currentTarget;
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(visible));
    button.setAttribute('aria-label', visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    button.querySelector('i').className = visible ? 'bi bi-eye-slash' : 'bi bi-eye';
  });

  container.querySelector('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    const identifier = form.querySelector('#loginIdentifier').value.trim();
    const password = form.querySelector('#loginPassword').value;
    try {
      const user = await Auth.login(identifier, password);
      Utils.showToast('Đăng nhập thành công!', 'success');
      Auth.redirectAfterLogin(user);
    } catch (err) {
      submit.disabled = false;
    }
  });
};
