const Admin = (() => {
  const PASSWORD = '20151588jose';
  let isAuthenticated = false;
  let currentView = 'dashboard'; // dashboard, movies, series, live

  function openAuthModal() {
    if (isAuthenticated) {
      openAdminPanel();
      return;
    }
    // Auth Modal remains the same
    const modalHTML = `
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <h2 class="section-title">Acceso Administrativo</h2>
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input type="password" id="admin-password" class="form-input" placeholder="Ingrese contraseña">
        </div>
        <button class="btn btn-primary" onclick="Admin.checkPassword()">Entrar</button>
      </div>
    `;
    showModal(modalHTML);
  }

  function checkPassword() {
    const input = document.getElementById('admin-password');
    const entered = input.value.trim();
    console.log('Input:', entered, 'Expected:', PASSWORD);

    if (entered === PASSWORD) {
      isAuthenticated = true;
      closeModal();
      openAdminPanel();
      showNotification('🔓 Acceso concedido', 'success');
    } else {
      showNotification('❌ Contraseña incorrecta', 'error');
    }
  }

  function openAdminPanel() {
    renderAdminLayout();
  }

  function renderAdminLayout() {
    const data = store.getAll();
    const totalMovies = data.movies ? data.movies.length : 0;
    const totalSeries = data.series ? data.series.length : 0;
    const totalLive = data.live ? data.live.length : 0;

    const layoutHTML = `
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <div class="admin-brand">Stream <span>Admin</span></div>
          <nav class="admin-nav">
            <div class="admin-nav-item ${currentView === 'dashboard' ? 'active' : ''}" onclick="Admin.switchView('dashboard')">📊 Dashboard</div>
            <div class="admin-nav-item ${currentView === 'movies' ? 'active' : ''}" onclick="Admin.switchView('movies')">🎬 Películas</div>
            <div class="admin-nav-item ${currentView === 'series' ? 'active' : ''}" onclick="Admin.switchView('series')">📺 Series</div>
            <div class="admin-nav-item ${currentView === 'live' ? 'active' : ''}" onclick="Admin.switchView('live')">📡 En Vivo</div>
          </nav>
          <div style="margin-top: auto;">
            <button class="btn btn-danger" style="width: 100%;" onclick="Admin.logout()">Cerrar Sesión</button>
          </div>
        </aside>
        
        <main class="admin-content">
          ${renderCurrentView(data, totalMovies, totalSeries, totalLive)}
        </main>
      </div>
    `;

    // We replace the entire body content or overlay it? 
    // Best to overlay it on top of everything
    let container = document.getElementById('admin-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-container';
      document.body.appendChild(container);
    }
    container.innerHTML = layoutHTML;
  }

  function switchView(view) {
    currentView = view;
    renderAdminLayout();
  }

  function renderCurrentView(data, tM, tS, tL) {
    if (currentView === 'dashboard') {
      return `
        <div class="admin-header">
          <h2>Dashboard General</h2>
          <button class="btn btn-danger" onclick="Admin.deleteAll()">🗑️ Eliminar Todo</button>
        </div>
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-value">${tM}</div>
            <div class="stat-label">Películas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${tS}</div>
            <div class="stat-label">Series</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${tL}</div>
            <div class="stat-label">En Vivo</div>
          </div>
        </div>
        <h3>Actividad Reciente</h3>
        <p style="color: var(--color-text-muted);">El sistema está funcionando correctamente.</p>
      `;
    } else {
      // List View for Movies/Series/Live
      const type = currentView;
      const items = data[type] || [];
      return `
        <div class="admin-header">
          <h2>Gestionar ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <button class="btn btn-primary" onclick="Admin.openAddModal('${type}')">+ Nuevo</button>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Título</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td><img src="${item.image}" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
                <td>${item.title}</td>
                <td>
                  <button class="btn btn-danger" style="padding: 0.3rem 0.8rem;" onclick="Admin.deleteItem('${type}', '${item.id}')">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${items.length === 0 ? '<p style="text-align:center; padding: 2rem; color: var(--color-text-muted);">No hay contenido.</p>' : ''}
      `;
    }
  }

  function openAddModal(type) {
    const modalHTML = `
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <h2 class="section-title">Agregar ${type}</h2>
        <div class="form-group">
          <label class="form-label">Título</label>
          <input type="text" id="new-title" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">URL Imagen</label>
          <input type="text" id="new-image" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">URL Video (Embed)</label>
          <input type="text" id="new-url" class="form-input">
        </div>
        <div class="form-group">
          <label class="form-label">Descripción</label>
          <textarea id="new-desc" class="form-input" rows="3"></textarea>
        </div>
        <button class="btn btn-primary" onclick="Admin.addItem('${type}')">Guardar</button>
      </div>
    `;
    showModal(modalHTML);
  }

  function addItem(type) {
    const title = document.getElementById('new-title').value;
    const image = document.getElementById('new-image').value;
    const url = document.getElementById('new-url').value;
    const desc = document.getElementById('new-desc').value;

    if (!title || !url) {
      showNotification('⚠️ Título y URL son obligatorios', 'error');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      title,
      image,
      description: desc,
      url,
      episodes: type === 'series' ? [{ title: 'Episode 1', url }] : undefined
    };

    store.addContent(type, newItem);
    closeModal();
    renderAdminLayout(); // Refresh Admin UI
    window.renderHome(); // Refresh Main UI
    showNotification('✅ Contenido agregado', 'success');
  }

  function deleteItem(type, id) {
    if (confirm('¿Eliminar este elemento?')) {
      store.deleteContent(type, id);
      renderAdminLayout();
      window.renderHome();
      showNotification('🗑️ Eliminado', 'success');
    }
  }

  function deleteAll() {
    if (confirm('ADVERTENCIA: ¿ELIMINAR TODO?')) {
      store.save({ movies: [], series: [], live: [] });
      renderAdminLayout();
      window.renderHome();
      showNotification('🗑️ Todo eliminado', 'success');
    }
  }

  function logout() {
    isAuthenticated = false;
    document.getElementById('admin-container').innerHTML = '';
    showNotification('👋 Sesión cerrada');
  }

  // Helpers
  function showModal(html) {
    const container = document.getElementById('modals');
    container.innerHTML = html;
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.style.zIndex = '3000'; // Higher than admin layout
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = html;
    const modal = modalWrapper.firstElementChild;
    modal.style.zIndex = '3001';
    modal.onclick = (e) => e.stopPropagation();
    overlay.innerHTML = '';
    overlay.appendChild(modal);
    container.appendChild(overlay);
  }

  // Notification (Same as before)
  function showNotification(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 4000; display: flex; flex-direction: column; gap: 15px;`;
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background: #000; color: #fff; padding: 1rem 2rem; border-radius: 1rem; box-shadow: 0 0 10px rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.3); backdrop-filter: blur(10px); transform: translateX(100%); transition: all 0.4s ease; font-weight: 600; min-width: 300px; display: flex; align-items: center; gap: 10px; font-size: 1.1rem;`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.style.transform = 'translateX(0)');
    setTimeout(() => {
      toast.style.transform = 'translateX(130%)';
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 400);
    }, 4000);
  }

  return {
    openAuthModal,
    checkPassword,
    switchView,
    openAddModal,
    addItem,
    deleteItem,
    deleteAll,
    logout
  };
})();
