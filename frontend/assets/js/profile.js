function initProfileTabs() {
  const tabs = document.querySelectorAll('[data-profile-tab]');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-profile-tab');
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[data-profile-panel]').forEach((panel) => {
        panel.hidden = panel.getAttribute('data-profile-panel') !== key;
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', initProfileTabs);
