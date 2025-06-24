document.getElementById("logout").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    // 1. Limpiar almacenamiento local PRIMERO (acción inmediata)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Bloquear historial ANTES de redirigir
    history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", function (e) {
      history.pushState(null, null, window.location.href);
      window.location.replace("./Login.html"); // Fuerza redirección
    });

    // 3. Llamar al endpoint de logout (puede ser asíncrono)
    const response = await fetch("http://localhost:3000/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Error en servidor");

    // 4. Redirigir SIN historial (usa URL absoluta para mayor seguridad)
    window.location.replace(window.location.origin + "/Login.html");
  } catch (error) {
    console.error("Logout fallido:", error);
    // Redirigir igualmente aunque falle el API
    window.location.replace("./Login.html");
  }
});
