// =========================================================
// BRUNO PERSONAL — script.js
// Mobile menu, sticky header state, scroll reveal, and
// placeholder contact links (WhatsApp / Instagram / e-mail).
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('site-header');
  const setScrolled = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  const closeMenu = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  };

  const openMenu = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.service-card, .testimonial-card, .how-step, .about-content, .about-media, .app-content, .app-visual, .gallery-placeholder'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealTargets.forEach((el) => observer.observe(el));

  /* ---------------------------------------------------------
     PLACEHOLDER CONTACTS
     Substitua os valores abaixo pelos dados reais do Bruno.
     Assim que preenchidos, os cards de contato e o botão
     "Falar comigo" funcionam automaticamente.
     --------------------------------------------------------- */
  const CONTACT = {
    whatsappNumber: '', // ex: '5511999999999' (apenas números, com DDI e DDD)
    instagramUser: '',  // ex: 'brunopersonal'
    email: '',          // ex: 'contato@brunopersonal.com'
  };

  const whatsappUrl = CONTACT.whatsappNumber
    ? `https://wa.me/${CONTACT.whatsappNumber}`
    : '#contato';
  const instagramUrl = CONTACT.instagramUser
    ? `https://instagram.com/${CONTACT.instagramUser}`
    : '#contato';
  const emailUrl = CONTACT.email ? `mailto:${CONTACT.email}` : '#contato';

  const whatsappLink = document.getElementById('whatsapp-link');
  const instagramLink = document.getElementById('instagram-link');
  const emailLink = document.getElementById('email-link');
  const whatsappCta = document.getElementById('whatsapp-cta');

  if (whatsappLink) whatsappLink.href = whatsappUrl;
  if (instagramLink) instagramLink.href = instagramUrl;
  if (emailLink) emailLink.href = emailUrl;
  if (whatsappCta && CONTACT.whatsappNumber) whatsappCta.href = whatsappUrl;

});
