document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.navbar-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }
});
