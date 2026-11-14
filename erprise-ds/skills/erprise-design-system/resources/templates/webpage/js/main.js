/**
 * ERPRISE Attendance — Sitio Web Comercial
 * main.js — Interactividad y comportamientos dinámicos
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Año dinámico en Footer
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // 2. Menú Hamburguesa para Móvil (Task 4.1)
  const hamburger = document.querySelector('.header__hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', !isExpanded);
      document.body.style.overflow = isExpanded ? '' : 'hidden';
    });
  }

  // 3. Smooth scroll y cierre de navegación móvil al hacer clic (Task 4.2)
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();

        // Cerrar menú móvil si está abierto
        if (mobileNav && mobileNav.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileNav.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        // Desplazamiento suave considerando el alto del header sticky
        const headerOffset = 76;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Actualizar URL sin salto brusco
        history.pushState(null, null, targetId);
      }
    });
  });

  // 4. Acordeón FAQ: cerrar otros al abrir uno (Task 4.3)
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.open) {
            otherItem.removeAttribute('open');
          }
        });
      }
    });
  });

  // 5. Validación del formulario de contacto (Task 4.4)
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;

      // Campo Nombre
      const nameInput = document.getElementById('contact-name');
      const nameGroup = nameInput.closest('.form-group');
      if (!nameInput.value.trim()) {
        nameGroup.classList.add('error');
        hasErrors = true;
      } else {
        nameGroup.classList.remove('error');
      }

      // Campo Correo Electrónico
      const emailInput = document.getElementById('contact-email');
      const emailGroup = emailInput.closest('.form-group');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
        emailGroup.classList.add('error');
        hasErrors = true;
      } else {
        emailGroup.classList.remove('error');
      }

      // Campo Mensaje
      const messageInput = document.getElementById('contact-message');
      const messageGroup = messageInput.closest('.form-group');
      if (!messageInput.value.trim()) {
        messageGroup.classList.add('error');
        hasErrors = true;
      } else {
        messageGroup.classList.remove('error');
      }

      if (!hasErrors) {
        // Extraer valores ingresados
        const name = nameInput.value.trim();
        const company = document.getElementById('contact-company')?.value.trim() || 'No especificada';
        const email = emailInput.value.trim();
        const phone = document.getElementById('contact-phone')?.value.trim() || 'No especificado';
        const message = messageInput.value.trim();

        // Estructurar el mensaje para WhatsApp
        const waText = `¡Hola! Me comunico desde el sitio web de Erprise Attendance y solicito información:

*Nombre:* ${name}
*Empresa:* ${company}
*Correo:* ${email}
*Teléfono:* ${phone}

*Mensaje:*
${message}`;

        // Construir la URL hacia WhatsApp (México +52)
        const waUrl = `https://wa.me/522451022064?text=${encodeURIComponent(waText)}`;

        // Actualizar botón de respaldo en la vista de confirmación
        const fallbackBtn = document.getElementById('wa-fallback-btn');
        if (fallbackBtn) {
          fallbackBtn.setAttribute('href', waUrl);
        }

        // Ocultar formulario y mostrar confirmación
        contactForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.add('active');
        }

        // Abrir WhatsApp en nueva pestaña
        window.open(waUrl, '_blank');
      }
    });

    // Limpieza de errores en tiempo real al escribir
    contactForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('error')) {
          if (input.type === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailPattern.test(input.value.trim())) {
              group.classList.remove('error');
            }
          } else if (input.value.trim()) {
            group.classList.remove('error');
          }
        }
      });
    });
  }

  // 6. Efecto de header al hacer scroll (Task 4.5)
  const header = document.getElementById('header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 7. ScrollSpy para navegación activa (Task 4.6)
  const sections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.header__nav a');

  // Mapeo de subsecciones a su enlace principal de navegación
  const navSectionMap = {
    'inicio': 'inicio',
    'funciones': 'funciones',
    'feature-facial': 'funciones',
    'feature-turnos': 'funciones',
    'feature-vacaciones': 'funciones',
    'feature-telegram': 'funciones',
    'feature-reportes': 'funciones',
    'precios': 'precios',
    'faq': 'faq',
    'cta-final': 'contacto',
    'contacto': 'contacto'
  };

  const updateActiveNavLink = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');
      const mappedNavId = navSectionMap[sectionId] || sectionId;

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        desktopNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${mappedNavId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();

  // 8. Animación Fade-in al scroll
  const fadeElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback si no hay IntersectionObserver
    fadeElements.forEach(el => el.classList.add('visible'));
  }
});
