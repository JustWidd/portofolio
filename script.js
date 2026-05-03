// ===== CUSTOM CURSOR + MAGNETIC RING (LERP-BASED) =====
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

// Posisi & ukuran saat ini (diinterpolasi setiap frame)
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let ringW = 36, ringH = 36;

// Posisi & ukuran TARGET yang ingin dicapai
let targetX = 0, targetY = 0;
let targetW = 36, targetH = 36;

// Scale klik: mengecil saat mousedown, kembali saat mouseup
let ringScale = 1, targetScale = 1;

let isOnTarget = false;
let isBoxTarget = false;

// Lacak posisi kursor — update target setiap saat jika tidak di atas box interaktif
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
    if (!isBoxTarget) {
        targetX = mouseX;
        targetY = mouseY;
    }
});



// Loop animasi: lerp semua properti menuju target setiap frame
function animRing() {
    const lp = 0.13; // kecepatan lerp posisi
    const ls = 0.10; // kecepatan lerp ukuran

    ringX += (targetX - ringX) * lp;
    ringY += (targetY - ringY) * lp;
    ringW += (targetW - ringW) * ls;
    ringH += (targetH - ringH) * ls;
    ringScale += (targetScale - ringScale) * 0.18; // lerp scale

    ring.style.left      = ringX + 'px';
    ring.style.top       = ringY + 'px';
    ring.style.width     = ringW + 'px';
    ring.style.height    = ringH + 'px';
    ring.style.transform = `translate(-50%, -50%) scale(${ringScale.toFixed(3)})`;

    requestAnimationFrame(animRing);
}
animRing();

// Efek klik: ring mengecil saat mousedown, kembali saat mouseup
document.addEventListener('mousedown', () => { targetScale = 0.65; });
document.addEventListener('mouseup',   () => { targetScale = 1; });
// Jaga-jaga jika mouseup terjadi di luar window
document.addEventListener('mouseleave', () => { targetScale = 1; });

// Helper: ambil border-radius elemen
function getRadius(el) {
    return window.getComputedStyle(el).borderRadius || '50%';
}

// Elemen interaktif yang akan dikelilingi ring
const TARGETS_TEXT = 'a';
const TARGETS_BOX = [
    'button',
    '.skill-card', '.project-card', '.exp-card',
    '.hero-photo-frame', '.contact-card', '.stat-card',
    '.footer-form input'
].join(', ');

document.querySelectorAll(TARGETS_TEXT).forEach(el => {
    el.addEventListener('mouseenter', () => {
        isOnTarget = true;
        ring.style.transition  = 'border-color 0.25s ease';
        ring.style.borderColor  = 'rgba(0, 174, 255, 0.8)';
    });

    el.addEventListener('mouseleave', () => {
        isOnTarget = false;
        ring.style.transition  = 'border-color 0.25s ease';
        ring.style.borderColor  = 'rgba(0, 174, 255, 0.5)';
    });
});

document.querySelectorAll(TARGETS_BOX).forEach(el => {
    el.addEventListener('mouseenter', () => {
        isOnTarget = true;
        isBoxTarget = true;

        const r   = el.getBoundingClientRect();
        const pad = 10; // jarak ring dari tepi elemen

        // Update target posisi & ukuran → lerp akan menggerakkan ring ke sana
        targetX = r.left + r.width  / 2;
        targetY = r.top  + r.height / 2;
        targetW = r.width  + pad * 2;
        targetH = r.height + pad * 2;

        // Border-radius & warna cukup pakai CSS transition (tidak di-lerp)
        ring.style.transition  = 'border-radius 0.3s ease, border-color 0.25s ease';
        ring.style.borderRadius = getRadius(el);
        ring.style.borderColor  = 'rgba(0, 174, 255, 0.8)';
    });

    el.addEventListener('mouseleave', () => {
        isOnTarget = false;
        isBoxTarget = false;

        // Kembalikan target ke posisi & ukuran kursor
        targetX = mouseX;
        targetY = mouseY;
        targetW = 36;
        targetH = 36;

        ring.style.transition  = 'border-radius 0.3s ease, border-color 0.25s ease';
        ring.style.borderRadius = '50%';
        ring.style.borderColor  = 'rgba(0, 174, 255, 0.5)';
    });
});

// Atur ulang kursor saat scroll jika kursor tidak lagi di atas elemen interaktif
window.addEventListener('scroll', () => {
    if (!isOnTarget) return;

    // Elemen yang saat ini berada di bawah kursor
    const hoveredEl = document.elementFromPoint(mouseX, mouseY);
    const targetBoxEl = hoveredEl ? hoveredEl.closest(TARGETS_BOX) : null;
    const targetTextEl = hoveredEl ? hoveredEl.closest(TARGETS_TEXT) : null;

    if (!targetBoxEl && !targetTextEl) {
        // Keluar dari elemen interaktif karena scroll
        isOnTarget = false;
        isBoxTarget = false;
        targetX = mouseX;
        targetY = mouseY;
        targetW = 36;
        targetH = 36;

        ring.style.transition  = 'border-radius 0.3s ease, border-color 0.25s ease';
        ring.style.borderRadius = '50%';
        ring.style.borderColor  = 'rgba(0, 174, 255, 0.5)';
    } else if (targetBoxEl) {
        // Masih di atas box interaktif, update posisi (elemen bisa bergeser saat scroll)
        const r = targetBoxEl.getBoundingClientRect();
        const pad = 10;
        targetX = r.left + r.width  / 2;
        targetY = r.top  + r.height / 2;
        targetW = r.width  + pad * 2;
        targetH = r.height + pad * 2;
    }
});

// Back to Top
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
    updateActiveNav();
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));



// Active Nav
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.getAttribute('id');
    });
    links.forEach(link => {
        link.classList.toggle('active', link.dataset.section === current);
    });
}

// Smooth nav clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.getElementById(link.dataset.section);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    nav.style.background = window.scrollY > 60
        ? 'rgba(10,10,10,0.6)'
        : 'rgba(15,15,15,0.4)';
});

// Hero title typewriter effect
const heroTitle = document.querySelector('.hero-title');
if (heroTitle) {
    heroTitle.style.opacity = '0';
    heroTitle.style.transform = 'translateY(40px)';
    setTimeout(() => {
        heroTitle.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
    }, 200);
}

// Stagger hero elements
const heroEls = document.querySelectorAll('.status-badge,.hero-desc,.hero-actions,.hero-tags');
heroEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    setTimeout(() => {
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 400 + i * 150);
});

const heroPhoto = document.querySelector('.hero-photo-wrap');
if (heroPhoto) {
    heroPhoto.style.opacity = '0';
    heroPhoto.style.transform = 'translateX(40px)';
    setTimeout(() => {
        heroPhoto.style.transition = 'opacity 1s ease, transform 1s ease';
        heroPhoto.style.opacity = '1';
        heroPhoto.style.transform = 'translateX(0)';
    }, 300);
}

// ===== HAMBURGER MENU =====
(function () {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks     = document.getElementById('navLinks');
    const navOverlay   = document.getElementById('navOverlay');

    if (!hamburgerBtn || !navLinks || !navOverlay) return;

    function openMenu() {
        navLinks.classList.add('open');
        hamburgerBtn.classList.add('active');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        navOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });

    // Tutup saat klik overlay
    navOverlay.addEventListener('click', closeMenu);

    // Tutup saat klik link navigasi
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Tutup otomatis saat resize ke desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMenu();
    });
})();

// ===== EXPERIENCE PHOTO MODAL =====
(function () {
    const modal      = document.getElementById('expModal');
    const backdrop   = document.getElementById('expModalBackdrop');
    const closeBtn   = document.getElementById('expModalClose');
    const modalImg   = document.getElementById('expModalImg');
    const modalCap   = document.getElementById('expModalCaption');
    const loader     = modal ? modal.querySelector('.exp-modal-loader') : null;

    if (!modal) return;

    function openModal(imgSrc, caption) {
        // Reset state gambar
        modalImg.classList.remove('loaded');
        loader.classList.remove('hidden');
        modalImg.src = '';

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        modalCap.textContent = caption || '';

        // Load gambar
        const tmp = new Image();
        tmp.onload = () => {
            modalImg.src = imgSrc;
            modalImg.alt = caption || '';
            // Beri sedikit delay agar transisi terasa
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modalImg.classList.add('loaded');
                    loader.classList.add('hidden');
                });
            });
        };
        tmp.onerror = () => {
            modalImg.src = imgSrc; // tetap tampilkan meski error
            loader.classList.add('hidden');
        };
        tmp.src = imgSrc;
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Klik kartu experience untuk membuka modal
    document.querySelectorAll('.exp-card[data-img]').forEach(card => {
        card.addEventListener('click', () => {
            const imgSrc  = card.dataset.img;
            const caption = card.dataset.caption || '';
            if (imgSrc) openModal(imgSrc, caption);
        });
    });

    // Tutup modal
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
})();

let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkmode = () => {
    document.body.classList.add('darkmode');
    localStorage.setItem('darkmode', 'active');
}

const disableDarkmode = () => {
    document.body.classList.remove('darkmode');
    localStorage.setItem('darkmode', 'null');
}

if (darkmode === 'active') enableDarkmode();

themeSwitch.addEventListener('click', () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== 'active' ? enableDarkmode() : disableDarkmode();
});
