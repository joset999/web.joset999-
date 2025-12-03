document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const contentArea = document.getElementById('content-area');
    const adminTrigger = document.getElementById('admin-trigger');
    const modalsContainer = document.getElementById('modals');

    // Initial Render
    renderHome();

    // Admin Trigger
    adminTrigger.addEventListener('click', () => {
        // Check if Admin module is loaded
        if (typeof Admin !== 'undefined') {
            Admin.openAuthModal();
        } else {
            console.error('Admin module not loaded');
        }
    });

    function renderHome() {
        const data = store.getAll();
        contentArea.innerHTML = '';

        // Render Movies
        if (data.movies && data.movies.length > 0) {
            contentArea.appendChild(createSection('Películas', data.movies, 'movies'));
        }

        // Render Series
        if (data.series && data.series.length > 0) {
            contentArea.appendChild(createSection('Series', data.series, 'series'));
        }

        // Render Live
        if (data.live && data.live.length > 0) {
            contentArea.appendChild(createSection('En Vivo', data.live, 'live'));
        }
    }

    function createSection(title, items, type) {
        const section = document.createElement('section');
        section.className = 'category-section';

        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `<h2 class="section-title">${title}</h2>`;
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'content-grid';

        items.forEach(item => {
            const card = createCard(item, type);
            grid.appendChild(card);
        });

        section.appendChild(grid);
        return section;
    }

    function createCard(item, type) {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => openDetailModal(item);

        const img = document.createElement('img');
        img.src = item.image || 'https://via.placeholder.com/300x450?text=No+Image';
        img.alt = item.title;
        img.loading = 'lazy';

        const info = document.createElement('div');
        info.className = 'card-info';
        info.innerHTML = `
      <div class="card-title">${item.title}</div>
      <div class="card-meta">${item.category || (type === 'series' ? item.episodes.length + ' Episodios' : '')}</div>
    `;

        card.appendChild(img);
        card.appendChild(info);
        return card;
    }

    function openDetailModal(item) {
        const modalHTML = `
      <div class="detail-modal">
        <div class="detail-hero" style="background-image: url('${item.image || 'https://via.placeholder.com/800x400'}')">
          <div class="modal-close" onclick="closeModal()">&times;</div>
        </div>
        <div class="detail-content">
          <h2 class="detail-title">${item.title}</h2>
          <div class="detail-meta">
            <span>${item.category || 'General'}</span>
            ${item.episodes ? `<span>${item.episodes.length} Episodios</span>` : ''}
          </div>
          <p class="detail-desc">${item.description || 'Sin descripción disponible.'}</p>
          
          <div class="flex">
            <button class="play-btn-large" onclick="playContentById('${item.id}')">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" />
              </svg>
              Reproducir
            </button>
          </div>
        </div>
      </div>
    `;

        showModal(modalHTML);
    }

    window.playContentById = function (id) {
        const data = store.getAll();
        let item;
        ['movies', 'series', 'live'].forEach(type => {
            if (data[type]) {
                const found = data[type].find(i => i.id === id);
                if (found) item = found;
            }
        });

        if (item) {
            closeModal();
            if (typeof Wellbeing !== 'undefined' && Wellbeing.shouldCheck()) {
                Wellbeing.showReminder(() => playContent(item));
                return;
            }
            playContent(item);
        }
    };

    function playContent(item) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const playerContainer = document.createElement('div');
        playerContainer.className = 'player-container';

        let url = item.url;
        if (item.episodes && item.episodes.length > 0) {
            url = item.episodes[0].url;
        }

        playerContainer.innerHTML = `<iframe src="${url}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            document.body.removeChild(overlay);
            if (typeof Wellbeing !== 'undefined') Wellbeing.stopSession();
        };

        overlay.appendChild(closeBtn);
        overlay.appendChild(playerContainer);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                if (typeof Wellbeing !== 'undefined') Wellbeing.stopSession();
            }
        });

        document.body.appendChild(overlay);
        if (typeof Wellbeing !== 'undefined') Wellbeing.startSession();
    }

    function showModal(html) {
        const container = document.getElementById('modals');
        container.innerHTML = html;

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.style.zIndex = '999';
        overlay.onclick = (e) => {
            if (e.target === overlay) closeModal();
        };

        const modalWrapper = document.createElement('div');
        modalWrapper.innerHTML = html;
        const modal = modalWrapper.firstElementChild;
        modal.style.zIndex = '1000';
        modal.onclick = (e) => e.stopPropagation();

        overlay.innerHTML = '';
        overlay.appendChild(modal);
        container.appendChild(overlay);
    }

    window.closeModal = function () {
        document.getElementById('modals').innerHTML = '';
    };

    // Expose renderHome for Admin updates
    window.renderHome = renderHome;
});
