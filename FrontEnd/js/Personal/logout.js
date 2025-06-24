document.getElementById('logout').addEventListener('click', function(e) {
    e.preventDefault();
    
    // 1. Redirigir a la página de login (o la que corresponda)
    window.location.href = 'login.html';
    
    // 2. Limpiar el historial de navegación para evitar que retroceda
    history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function() {
        history.go(1);
        // Opcional: Redirigir a login si intenta retroceder
        window.location.href = 'login.html';
    });
    
    // 3. También puedes limpiar datos de sesión/localStorage si es necesario
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. Forzar recarga sin caché (opcional)
    fetch(window.location.href, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
});


// Ejemplo en el botón de cerrar sesión
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    sessionStorage.clear();
    window.location.replace('login.html'); // no deja volver con 'atrás'
});
