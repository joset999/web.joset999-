const STORAGE_KEY = 'stream_home_data';

const INITIAL_DATA = {
    movies: [
        {
            id: 'm1',
            title: 'Inception',
            image: 'https://image.tmdb.org/t/p/w500/9gk7admal4zl67YtJC1ssq0beoh.jpg',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
            url: 'https://www.youtube.com/embed/YoHD9XEInc0',
            category: 'Sci-Fi'
        },
        {
            id: 'm2',
            title: 'Interstellar',
            image: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E8AHtMY4kRFSvQchjc.jpg',
            description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
            url: 'https://www.youtube.com/embed/zSWdZVtXT7E',
            category: 'Sci-Fi'
        },
        {
            id: 'm3',
            title: 'The Dark Knight',
            image: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
            description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
            url: 'https://www.youtube.com/embed/EXeTwQWrcwY',
            category: 'Action'
        }
    ],
    series: [
        {
            id: 's1',
            title: 'Breaking Bad',
            image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
            description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
            episodes: [
                { title: 'Pilot', url: 'https://www.youtube.com/embed/HhesaQXLuRY' },
                { title: 'Cat\'s in the Bag...', url: 'https://www.youtube.com/embed/HhesaQXLuRY' }
            ]
        },
        {
            id: 's2',
            title: 'Stranger Things',
            image: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
            description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
            episodes: [
                { title: 'Chapter One', url: 'https://www.youtube.com/embed/b9EkMc79ZSU' }
            ]
        }
    ],
    live: [
        {
            id: 'l1',
            title: 'NASA Live',
            image: 'https://image.tmdb.org/t/p/w500/j5eB667Gq3cE5W9tq5h5e5e5e5.jpg', // Placeholder
            description: 'Live stream from the International Space Station.',
            url: 'https://www.youtube.com/embed/21X5lGlDOfg',
            isLive: true
        }
    ]
};

class Store {
    constructor() {
        this.data = this.load();
    }

    load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        this.save(INITIAL_DATA);
        return INITIAL_DATA;
    }

    save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.data = data;
    }

    getAll() {
        return this.data;
    }

    addContent(type, item) {
        if (!this.data[type]) return;
        this.data[type].push(item);
        this.save(this.data);
    }

    updateContent(type, id, updatedItem) {
        if (!this.data[type]) return;
        const index = this.data[type].findIndex(item => item.id === id);
        if (index !== -1) {
            this.data[type][index] = { ...this.data[type][index], ...updatedItem };
            this.save(this.data);
        }
    }

    deleteContent(type, id) {
        if (!this.data[type]) return;
        this.data[type] = this.data[type].filter(item => item.id !== id);
        this.save(this.data);
    }
}

const store = new Store();
