// NYU Sound Forum - Client-side JavaScript
// v3.1: Dark mode, reply forms, confirmations

// Dark mode toggle
document.addEventListener('DOMContentLoaded', () => {
  const darkModeToggle = document.getElementById('darkModeToggle');
  
  if (darkModeToggle) {
    // Set initial button text
    updateToggleButton();
    
    darkModeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleButton();
    });
  }
  
  function updateToggleButton() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (darkModeToggle) {
      darkModeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
      darkModeToggle.title = currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }
});

// Reply threading
function showReplyForm(replyId) {
  const form = document.getElementById(`reply-form-${replyId}`);
  if (form) {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }
}

// Confirm delete actions
document.addEventListener('DOMContentLoaded', () => {
  const deleteForms = document.querySelectorAll('form[method="post"][action*="delete"]');
  
  deleteForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });
});
