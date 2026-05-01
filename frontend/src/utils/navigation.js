export function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("teamflow:navigate"));
}
