'use strict';

// The blueprint is an explorable summary of documented projects, not live telemetry.
(() => {
  const figure = document.querySelector('.system-figure');
  const selector = document.querySelector('#blueprint-project');
  const controls = document.querySelector('.system-controls');
  if (!figure || !selector || !controls) return;

  const projects = {
    interview: {
      name: 'Interview Intelligence',
      target: '#interview-intelligence',
      systems: ['Modular .NET 10', 'PostgreSQL, Redis, and background jobs support structured interview workflows.'],
      interfaces: ['Next.js', 'Candidate workflows, scheduling, roles, dashboards, and interview templates.'],
      intelligence: ['Provider-agnostic AI', 'Transcription, résumé matching, and evidence-backed evaluation with human oversight.'],
    },
    leadatlas: {
      name: 'LeadAtlas',
      target: '#leadatlas',
      systems: ['.NET + PostgreSQL', 'A modular backend, EF Core, and a normalized data model for company intelligence.'],
      interfaces: ['React + Vite', 'Company discovery by geography and attributes, enrichment, and import workflows.'],
      intelligence: ['Structured intelligence', 'Company attributes, geographic search, and contact enrichment turn raw records into sales context.'],
    },
    deflex: {
      name: 'DefleX',
      target: '#deflex',
      systems: ['ASP.NET Core + PostgreSQL', 'A backend stack paired with SignalR for the customer-support product.'],
      interfaces: ['Next.js 14', 'The frontend of an AI-powered customer-support deflection platform.'],
      intelligence: ['AI + retrieval', 'Classify inbound requests, retrieve knowledge, draft responses, and resolve eligible cases.'],
    },
  };

  const layerNames = { interfaces: 'Interfaces', intelligence: 'Intelligence', systems: 'Systems' };
  const buttons = [...controls.querySelectorAll('button')];
  const context = document.querySelector('#blueprint-context');
  const technology = document.querySelector('#blueprint-technology');
  const description = document.querySelector('#layer-description');
  const projectLink = document.querySelector('.blueprint-link');
  let activeLayer = 'systems';

  function updateBlueprint() {
    const project = projects[selector.value];
    const [stack, explanation] = project[activeLayer];
    figure.dataset.layer = activeLayer;
    figure.dataset.project = selector.value;
    context.textContent = `${project.name} / ${layerNames[activeLayer]}`;
    technology.textContent = stack;
    description.textContent = explanation;
    projectLink.href = project.target;
    projectLink.setAttribute('aria-label', `Explore ${project.name} engineering notes`);
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.layer === activeLayer)));
  }

  selector.closest('.blueprint-selector').hidden = false;
  controls.hidden = false;
  selector.addEventListener('change', updateBlueprint);
  buttons.forEach((button) => button.addEventListener('click', () => {
    activeLayer = button.dataset.layer;
    updateBlueprint();
  }));

  projectLink.addEventListener('click', () => {
    // Unhide filtered projects before native anchor navigation resolves its target.
    document.querySelector('[data-filter="all"]')?.click();
    const target = document.querySelector(projectLink.hash);
    const notes = target?.querySelector('details');
    if (notes) notes.open = true;
  });
  updateBlueprint();
})();
