const form = document.getElementById('loginForm');



form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const contrasenia = document.getElementById('contrasenia').value;

    if (!usuario || !contrasenia) {
        Swal.fire({
            title: "Advertencia!",
            icon: "warning",
            text: "Por favor complete todos los campos",
            draggable: true
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                usuario,
                contrasenia
            })
        });

        const data = await response.json();

        if (response.ok) {
       
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.usuario.rol);




      
            window.location.href = data.usuario.rol === 'Administrador' ? './Inventario.html' : './Menu.html';
         
        } else {
            Swal.fire({
                title: "Error!",
                icon: "error",
                text: data.message,
                draggable: true
            })
        }


    } catch (error) {
        Swal.fire({
            title: "Error!",
            icon: "error",
            text: 'Hubo un problema al iniciar sesión. Intenta de nuevo.',
            draggable: true
        })
        console.error('Error al iniciar sesión:', error);

    }
});

