'use strict';

(() => {
  const activity = document.querySelector('#github-activity');
  if (!activity) return;
  const status = document.querySelector('#activity-status');
  const list = document.querySelector('#activity-list');
  const eventLabels = {
    PushEvent: 'Pushed code to',
    CreateEvent: 'Created a branch, tag, or repository in',
    WatchEvent: 'Starred',
    ForkEvent: 'Forked',
    PullRequestEvent: 'Pull request activity in',
    IssuesEvent: 'Issue activity in',
    IssueCommentEvent: 'Commented in',
    ReleaseEvent: 'Release activity in',
    PublicEvent: 'Made a repository public:',
  };

  async function githubRequest(path) {
    const response = await fetch(`https://api.github.com/users/ahmed1v0${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error('Public GitHub data is unavailable');
    return response.json();
  }

  async function loadActivity() {
    status.textContent = 'Loading…';
    const [profileResult, eventsResult] = await Promise.allSettled([
      githubRequest(''),
      githubRequest('/events/public?per_page=5'),
    ]);
    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value;
      document.querySelector('#repos').textContent = Number.isInteger(profile.public_repos) ? profile.public_repos : '—';
      document.querySelector('#followers').textContent = Number.isInteger(profile.followers) ? profile.followers : '—';
    }
    if (eventsResult.status === 'rejected' || !Array.isArray(eventsResult.value)) {
      status.textContent = 'Unavailable';
      list.replaceChildren();
      const fallback = document.createElement('li');
      fallback.textContent = 'Live activity is unavailable right now. Visit GitHub for the full contribution history.';
      list.append(fallback);
      return;
    }

    list.replaceChildren();
    eventsResult.value.forEach((event) => {
      const repository = event.repo?.name;
      const date = new Date(event.created_at);
      // Validate third-party data before creating a link; never inject response HTML.
      if (typeof repository !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(repository) || !Number.isFinite(date.getTime())) return;
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = eventLabels[event.type] ?? 'Public activity in';
      const link = document.createElement('a');
      link.href = `https://github.com/${repository}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = repository;
      const time = document.createElement('time');
      time.dateTime = date.toISOString();
      time.textContent = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
      item.append(label, link, time);
      list.append(item);
    });
    if (!list.children.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No recent public events returned. Explore the full contribution history on GitHub.';
      list.append(empty);
    }
    status.textContent = profileResult.status === 'fulfilled' ? 'Updated from GitHub' : 'Activity updated · counts unavailable';
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      loadActivity();
    }, { rootMargin: '200px' });
    observer.observe(activity);
  } else {
    loadActivity();
  }

  const snapshots = document.querySelector('.profile-snapshots');
  snapshots?.addEventListener('toggle', () => {
    if (!snapshots.open) return;
    snapshots.querySelectorAll('img[data-src]').forEach((image) => {
      const message = image.nextElementSibling;
      message.textContent = 'Loading profile statistics…';
      // A failed or stalled optional service must not leave an empty panel.
      const timeout = setTimeout(() => {
        message.textContent = 'Statistics are taking longer to load. Open the profile for current results.';
      }, 8000);
      image.addEventListener('load', () => {
        clearTimeout(timeout);
        image.hidden = false;
        message.hidden = true;
      }, { once: true });
      image.addEventListener('error', () => {
        clearTimeout(timeout);
        image.hidden = true;
        message.textContent = 'Statistics are unavailable. Open the profile for current results.';
      }, { once: true });
      image.src = image.dataset.src;
      delete image.dataset.src;
    });
  });
})();
