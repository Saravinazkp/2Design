document.getElementById('login-btn').addEventListener('click', () => {
    window.location.href = '/login'; // Redirect ke rute login
});

document.getElementById('signup-btn').addEventListener('click', () => {
    event.preventDefault();
    window.location.href = '/signup'; // Redirect ke rute signup
});