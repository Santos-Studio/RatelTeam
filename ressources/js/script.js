const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

const navbar = document.querySelector('.navbar');
const hero = document.querySelector('.hero');

function updateNavbar() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    if (hero) {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        navbar.classList.toggle('blurred', currentScroll > heroBottom - 150);
    } else {
        navbar.classList.toggle('blurred', currentScroll > 100);
    }
}

window.addEventListener('scroll', updateNavbar);
window.addEventListener('load', updateNavbar);

const skipFeaturesClass = 'skip-features-pin';
let skipFeaturesTimer = null;
const pendingScrollKey = 'pendingNavScroll';

function normalizePath(path) {
    if (!path) return '/';
    return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function pathsMatch(pathA, pathB) {
    const normalizedA = normalizePath(pathA);
    const normalizedB = normalizePath(pathB);
    if (normalizedA === normalizedB) return true;
    const normalizeIndex = (p) => (p === '/' ? '/index.html' : p);
    return normalizeIndex(normalizedA) === normalizeIndex(normalizedB);
}

function enableSkipFeatures() {
    document.body.classList.add(skipFeaturesClass);
    if (skipFeaturesTimer) clearTimeout(skipFeaturesTimer);
    skipFeaturesTimer = setTimeout(() => {
        document.body.classList.remove(skipFeaturesClass);
        skipFeaturesTimer = null;
    }, 1500);
}

function getOffsetForHash(hash) {
    if (hash === '#pricing') return -40;
    if (hash === '#locations') return -20;
    if (hash === '#about') return -290;
    return -100;
}

function scrollToHash(hash, { skipFeatures = false } = {}) {
    const target = document.querySelector(hash);
    if (!target) return false;
    const offset = getOffsetForHash(hash);
    const performScroll = () => {
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    };
    if (skipFeatures) {
        enableSkipFeatures();
        requestAnimationFrame(() => requestAnimationFrame(performScroll));
    } else {
        performScroll();
    }
    return true;
}

function handlePendingScroll() {
    const pending = sessionStorage.getItem(pendingScrollKey);
    if (!pending) return;
    try {
        const data = JSON.parse(pending);
        if (data?.hash && pathsMatch(data.path, window.location.pathname)) {
            sessionStorage.removeItem(pendingScrollKey);
            scrollToHash(data.hash, { skipFeatures: data.skipFeatures });
        }
    } catch (error) {
        sessionStorage.removeItem(pendingScrollKey);
    }
}

document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const rawHref = this.getAttribute('href');
        if (!rawHref) return;
        let url;
        try {
            url = new URL(rawHref, window.location.href);
        } catch (err) {
            return;
        }
        const hash = url.hash;
        if (!hash) return;

        const isSamePage = pathsMatch(url.pathname, window.location.pathname);
        const isNavLink = this.classList.contains('nav-link') || this.classList.contains('btn-nav') || this.closest('.logo');
        const skipPin = isNavLink && hash !== '#features';

        if (isSamePage) {
            e.preventDefault();
            scrollToHash(hash, { skipFeatures: skipPin });
        } else {
            sessionStorage.setItem(pendingScrollKey, JSON.stringify({
                path: url.pathname,
                hash,
                skipFeatures: skipPin
            }));
        }
    });
});

window.addEventListener('load', handlePendingScroll);

const sections = document.querySelectorAll('section[id]');

function activateNavLink() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            navLink?.classList.add('active');
        }
    });
}

window.addEventListener('scroll', activateNavLink);

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            message: document.getElementById('message')?.value || ''
        };
        
        showFormMessage("Message envoyé ! Nous vous répondrons rapidement.", 'success');
        contactForm.reset();
    });
}

function showFormMessage(message, type) {
    if (!contactForm) return;
    
    const existingMessage = document.querySelector('.form-message');
    existingMessage?.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    
    const isSuccess = type === 'success';
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 4px;
        text-align: center;
        font-weight: 500;
        background: ${isSuccess ? 'rgba(200, 16, 46, 0.2)' : 'rgba(255, 0, 0, 0.2)'};
        color: ${isSuccess ? '#C8102E' : '#ff4444'};
        border: 1px solid ${isSuccess ? '#C8102E' : '#ff4444'};
    `;
    
    contactForm.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 5000);
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .class-card, .instructor-card, .testimonial-card, .pricing-card, .contact-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    activateNavLink();
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.animation = 'fadeInUp 1s ease';
    }

    const classCards = document.querySelectorAll('.class-card');

    classCards.forEach((card) => {
        const desc = card.querySelector('.class-description');
        if (!desc) return;

        const updateDescHeight = () => {
            const h = desc.scrollHeight || desc.offsetHeight || 0;
            card.style.setProperty('--desc-h', `${h}px`);
        };

        updateDescHeight();

        if (window.ResizeObserver) {
            new ResizeObserver(updateDescHeight).observe(card);
        } else {
            window.addEventListener('resize', updateDescHeight);
        }

        card.addEventListener('mouseenter', () => {
            updateDescHeight();
            requestAnimationFrame(updateDescHeight);
            setTimeout(updateDescHeight, 600);
        });
    });
});

(() => {
    const badgeWrapper = document.querySelector('.about-badge-wrapper');
    const badgeTrack = document.querySelector('.about-badge-scroll');
    if (!badgeWrapper || !badgeTrack) return;

    badgeTrack.style.willChange = 'transform';

    let wrapperTop = 0;
    let speed = 1.5;
    const initialOffset = 575;

    function computeWrapperTop() {
        const rect = badgeWrapper.getBoundingClientRect();
        wrapperTop = (window.scrollY || window.pageYOffset) + rect.top;
    }

    let ticking = false;
    
    function update() {
        const y = window.scrollY || window.pageYOffset;
        const tx = initialOffset - Math.round(y * speed);
        badgeTrack.style.transform = `translate3d(${tx}px, 0, 0)`;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                onScroll();
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });
    io.observe(badgeWrapper);

    window.addEventListener('load', () => {
        computeWrapperTop();
        update();
        onScroll();
    });
    window.addEventListener('resize', () => {
        computeWrapperTop();
        update();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
})();

(() => {
	const pin = document.querySelector('.features-pin');
	const stage = document.querySelector('.features-stage');
	const imageEls = document.querySelectorAll('.features-images .feature-image');
	const textEls = document.querySelectorAll('.feature-texts .feature-text');
	if (!pin || !stage || imageEls.length === 0 || textEls.length === 0) return;

	const totalFeatures = Math.min(imageEls.length, textEls.length);
	let totalScroll = 500;
	let pinStart = 0;
	let ticking = false;

	function setActiveIndex(idx) {
		imageEls.forEach((img, i) => {
			if (i < idx) {
				const stackPos = idx - i;
				img.style.setProperty('--stacki', stackPos.toString());
				img.style.setProperty('--z', String(50 - stackPos));
				img.classList.add('stacked');
				img.classList.remove('visible');
			} else if (i === idx) {
				img.style.removeProperty('--stacki');
				img.style.setProperty('--z', '100');
				img.classList.add('visible');
				img.classList.remove('stacked');
			} else {
				img.style.removeProperty('--stacki');
				img.style.setProperty('--z', '1');
				img.classList.remove('visible');
				img.classList.remove('stacked');
			}
		});
		textEls.forEach((tx, i) => {
			tx.classList.toggle('active', i === idx);
		});
	}

	function parseScrollSpec(spec) {
		if (!spec) return 500;
		const s = String(spec).trim().toLowerCase();
		if (s.endsWith('vh')) {
			const n = parseFloat(s.slice(0, -2));
			return Math.max(1, Math.round(window.innerHeight * (n / 100)));
		}
		if (s.endsWith('vw')) {
			const n = parseFloat(s.slice(0, -2));
			return Math.max(1, Math.round(window.innerWidth * (n / 100)));
		}
		if (s.endsWith('x')) {
			const n = parseFloat(s.slice(0, -1));
			return Math.max(1, Math.round(window.innerHeight * n));
		}
		const n = parseFloat(s);
		return isNaN(n) ? 500 : Math.max(1, Math.round(n));
	}

	function compute() {
		totalScroll = parseScrollSpec(pin.getAttribute('data-scroll'));
		pin.style.setProperty('--features-scroll', `${totalScroll}px`);
		pinStart = pin.getBoundingClientRect().top + window.scrollY;
		update();
	}

	function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

	function update() {
		const y = window.scrollY;
		const progress = clamp((y - pinStart) / totalScroll, 0, 1);
		textEls.forEach((el, i) => {
			const segStart = i / totalFeatures;
			const segEnd = (i + 1) / totalFeatures;
			const denom = Math.max(1e-6, (segEnd - segStart));
			let p = (progress - segStart) / denom;
			if (totalFeatures === 1) p = progress;
			p = Math.max(0, Math.min(1, p));
			el.style.setProperty('--p', p.toFixed(3));
		});
		if (progress <= 0) {
			setActiveIndex(0);
		} else {
			const newIndex = Math.min(totalFeatures - 1, Math.ceil(progress * totalFeatures) - 1);
			setActiveIndex(newIndex);
		}
		ticking = false;
	}

	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(update);
		}
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', compute);
	window.addEventListener('load', compute);

	compute();
})();

(() => {
    const sliderTrack = document.getElementById('sliderTrack');
    const slides = sliderTrack ? sliderTrack.querySelectorAll('.slider-slide') : [];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const sliderDots = document.getElementById('sliderDots');
    
    if (!sliderTrack || slides.length === 0 || !prevBtn || !nextBtn || !sliderDots) {
        return;
    }
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    const dots = [];
    
    sliderDots.innerHTML = '';
    
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', `Aller au slide ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        sliderDots.appendChild(dot);
        dots.push(dot);
    });
    
    function updateSlider() {
        sliderTrack.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        currentSlide = index;
        updateSlider();
    }
    
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
    });
    
    document.addEventListener('keydown', (e) => {
        const membersSection = document.querySelector('.members-slider');
        if (membersSection?.offsetParent) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        }
    });
    
    window.addEventListener('resize', () => {
        updateSlider();
    });
    
    updateSlider();
})();

(() => {
    const sliderTrack = document.getElementById('dojosSliderTrack');
    const slides = sliderTrack ? sliderTrack.querySelectorAll('.slider-slide') : [];
    const prevBtn = document.getElementById('dojosPrevBtn');
    const nextBtn = document.getElementById('dojosNextBtn');
    const sliderDots = document.getElementById('dojosSliderDots');
    
    if (!sliderTrack || slides.length === 0 || !prevBtn || !nextBtn || !sliderDots) {
        return;
    }
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    const dots = [];
    
    sliderDots.innerHTML = '';
    
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot';
        dot.setAttribute('aria-label', `Aller au dojo ${index + 1}`);
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        sliderDots.appendChild(dot);
        dots.push(dot);
    });
    
    function updateSlider() {
        sliderTrack.style.transform = `translate3d(-${currentSlide * 100}%, 0, 0)`;
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentSlide);
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
        
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    function goToSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        currentSlide = index;
        updateSlider();
    }
    
    function nextSlide() {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            updateSlider();
        }
    }
    
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    }
    
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
    });
    
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
    });
    
    document.addEventListener('keydown', (e) => {
        const dojosSection = document.querySelector('.dojos-slider');
        if (dojosSection?.offsetParent) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        }
    });
    
    window.addEventListener('resize', () => {
        updateSlider();
    });
    
    updateSlider();
})();
