document.addEventListener('DOMContentLoaded', function() {
    // Tombol login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(event) {
            window.location.href = '/login'; // Redirect ke rute login
        });
    }

    // Tombol signup
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah aksi default dari button
            window.location.href = '/signup'; // Redirect ke rute signup
        });
    }

    // Tombol logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah aksi default dari button
            window.location.href = '/logout'; // Redirect ke rute logout
        });
    }

    //Tombol hire
    const hirebtn = document.getElementById('hire-btn');
    if (hirebtn) {
        hirebtn.addEventListener('click', function(event) {
            event.preventDefault(); // Mencegah aksi default dari button
            window.location.href = '/hirepage'; // Redirect ke rute hirepage
        });
    }
});
