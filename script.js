'use strict';

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navlinks');
const navigationLinks = [...document.querySelectorAll('.navlinks a')];
const sections = [...document.querySelectorAll('main section[id]')];

function closeMenu({ restoreFocus = false } = {}) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu +';
  if (restoreFocus) menuButton.focus();
}

if (menuButton && navigation) {
  document.documentElement.classList.add('nav-ready');
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.textContent = expanded ? 'Close −' : 'Menu +';
    navigation.classList.toggle('is-open', expanded);
  });
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu({ restoreFocus: true });
    }
  });
  navigationLinks.forEach((link) => link.addEventListener('click', () => closeMenu()));
  matchMedia('(max-width: 760px)').addEventListener('change', () => closeMenu());
}

function updateNavigation() {
  let current = '';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= 160) current = section.id;
  }
  navigationLinks.forEach((link) => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

let scrollScheduled = false;
addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    updateNavigation();
    scrollScheduled = false;
  });
}, { passive: true });
updateNavigation();

const filterButtons = [...document.querySelectorAll('.filters button')];
const projects = [...document.querySelectorAll('.project')];
const filterStatus = document.querySelector('#filter-status');
filterButtons.forEach((button) => {
  button.setAttribute('aria-pressed', String(button.dataset.filter === 'all'));
  button.addEventListener('click', () => {
    filterButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    const filter = button.dataset.filter;
    projects.forEach((project) => {
      project.hidden = filter !== 'all' && !project.dataset.category.split(' ').includes(filter);
    });
    if (filterStatus) filterStatus.textContent = `${projects.filter((project) => !project.hidden).length} projects shown`;
    updateNavigation();
  });
});

async function loadGitHubStats() {
  const repos = document.querySelector('#repos');
  const followers = document.querySelector('#followers');
  if (!repos || !followers) return;
  try {
    const response = await fetch('https://api.github.com/users/ahmed1v0', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error('GitHub statistics unavailable');
    const profile = await response.json();
    repos.textContent = Number.isInteger(profile.public_repos) ? profile.public_repos : '—';
    followers.textContent = Number.isInteger(profile.followers) ? profile.followers : '—';
  } catch {
    repos.textContent = '—';
    followers.textContent = '—';
  }
}
loadGitHubStats();
