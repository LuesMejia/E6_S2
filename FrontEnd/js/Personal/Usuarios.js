// Constantes y variables globales
const API_URL = "http://localhost:3000/Usuarios";
let usuario = [];
let usuarioAEliminar = null;

// Elementos del DOM
const elements = {
    usuarioForm: document.getElementById("usuarioForm"),
    usuarioTabla: document.getElementById("usuarioTabla"),
    buscador: document.getElementById("buscador"),
    crearProductoBtn: document.getElementById("crearProductoBtn"),
    gurdarProductoBtn: document.getElementById("gurdarProductoBtn"),
    buscadorBtn: document.getElementById("buscadorBtn"),
    productoModal: document.getElementById("productoModal"),
    cerrarproductoModal: document.getElementById("cerrarproductoModal"),
    cancelarproductoModal: document.getElementById("cancelarproductoModal"),
    eliminarModal: document.getElementById("eliminarModal"),
    cerrarEliminarModal: document.getElementById("cerrarEliminarModal"),
    confirmarEliminarBtn: document.getElementById("confirmarEliminarBtn"),
    alertaContainer: document.getElementById("alertaContainer"),
};

const prevProductBtn = document.getElementById("prevProductBtn");
const nextProductBtn = document.getElementById("nextProductBtn");
const totalCount = document.getElementById("totalCount");
const pageNumber = document.getElementById("pageNumber");

let currentPage = 1;
const limit = 5;
let totalItems = 0;

// Utilidades
const formatPrice = (price) => parseFloat(price).toFixed(2);

const showAlert = (type, message, duration = 5000) => {
    const previousAlerts = document.querySelectorAll(`.custom-alert.alert-${type}`);
    previousAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    alertDiv.innerHTML = `
        <i class="fa ${iconClass}"></i>
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;

    const container = document.querySelector('.container');
    alertaContainer.appendChild(alertDiv);

    alertDiv.querySelector('.alert-close').addEventListener('click', () => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 300);
    });

    setTimeout(() => {
        alertDiv.classList.add('fade-out');
        setTimeout(() => alertDiv.remove(), 300);
    }, duration);
};

// Cargar y renderizar productos
const cargarUsuario = async (page = 1, limit = 5) => {
    try {
        const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();

        usuario = Array.isArray(data.data) ? data.data : [];
        totalItems = data.total || 0;
        currentPage = page;

        renderProducts(usuario);


        pageNumber.textContent = `Página ${currentPage}`;
        totalCount.textContent = `Total de productos: ${totalItems}`;
        prevProductBtn.disabled = currentPage === 1;
        nextProductBtn.disabled = currentPage * limit >= totalItems;
    } catch (err) {
        console.error(err);
        showAlert("error", "No se pudieron cargar los productos");
        elements.usuarioTabla.innerHTML = `<tr><td colspan="5">Error al cargar productos</td></tr>`;
    }
};

const renderProducts = (usuariosLista) => {
    elements.usuarioTabla.innerHTML = "";
    if (!Array.isArray(usuariosLista) || usuariosLista.length === 0) {
        elements.usuarioTabla.innerHTML = '<tr><td colspan="5">No se encontraron productos</td></tr>';
        return;
    }

    usuariosLista.forEach(usuario => {
        const row = document.createElement("tr");
        row.innerHTML = `
        
            <td>${usuario.usuario}</td>
             <td>${usuario.rol}</td>
            <td>${usuario.estado}</td>
    
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${usuario._id}"><i class="fa fa-edit"></i> Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${usuario._id}"><i class="fa fa-trash"></i> Eliminar</button>
            </td>
        `;
        elements.usuarioTabla.appendChild(row);
    });

    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => datosDelUsuario(btn.dataset.id))
    );

    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => {
            usuarioAEliminar = btn.dataset.id;
            showModal("eliminarModal");
        })
    );
};


// Crear usuario
const crearUsuario = async () => {

    const usuarioData = {
        usuario: document.getElementById('addUsuario').value.trim(),
        rol: document.getElementById('addRol').value,
        estado: document.getElementById('addEstado').value,
        contrasenia: document.getElementById('addContrasenia').value,
    };

    if (!usuarioData.usuario || usuarioData.usuario.length > 15) {
        showAlert('error', 'El usuario es requerido (máx. 15 caracteres)');
        return;
    }

    if (!usuarioData.contrasenia || usuarioData.contrasenia.length > 15) {
        showAlert('error', 'El contraseña es requerido (máx. 15 caracteres)');
        return;
    }


    try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'x-role': role
            },
            body: JSON.stringify(usuarioData)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Error al crear usuario');

        hideModal('addproductoModal');
        await cargarUsuario();
        showAlert('success', result.message || 'Producto creado exitosamente');
    } catch (error) {
        showAlert('error', error.message.includes('Failed to fetch') ? 'Error de conexión con el servidor' : error.message);
    }
};

// Editar usuario
const datosDelUsuario = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const usuario = await response.json();

        document.getElementById("actualizarUsuarioId").value = usuario._id;
        document.getElementById("updateUsuario").value = usuario.usuario;
         document.getElementById("updateContrasenia").value = usuario.contrasenia;
        document.getElementById("updateEstado").value = usuario.estado;
        document.getElementById("updateRol").value = usuario.rol;
       
        showModal("actualizarProductoModal");
    } catch {
        showAlert("error", "No se pudo cargar el usuario");
    }
};

// Actualizar usuario
const actualiarProducto = async () => {
    const usuarioId = document.getElementById("actualizarUsuarioId").value;

     const usuarioData = {
        usuario: document.getElementById('updateUsuario').value.trim(),
        rol: document.getElementById('updateRol').value,
        estado: document.getElementById('updateEstado').value,
    };

    try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        const response = await fetch(`${API_URL}/${usuarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
                'x-role': role
            },
          body: JSON.stringify(usuarioData)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Error al actualizar usuario');

        hideModal("actualizarProductoModal");
        await cargarUsuario();
        showAlert("success", result.message || "Producto actualizado correctamente");
    } catch (err) {
        showAlert("error", err.message.includes('Failed to fetch') ? 'Error de conexión con el servidor' : err.message);
    }
};

// Eliminar usuario
const deleteProduct = async () => {
    if (!usuarioAEliminar) return showAlert("error", "No hay usuario seleccionado");

    try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        const res = await fetch(`${API_URL}/${usuarioAEliminar}`, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "x-role": role,
                "Content-Type": "application/json"
            }
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        hideModal("eliminarModal");
        await cargarUsuario();
        showAlert("success", result.message || "Producto eliminado");
        usuarioAEliminar = null;
    } catch (err) {
        showAlert("error", err.message);
        hideModal("eliminarModal");
    }
};

// Filtro
const filterProducts = () => {
    const term = elements.buscador.value.toLowerCase();
    const filtered = usuario.filter(p =>
        p.usuario.toLowerCase().includes(term) ||
        p.contrasenia.toLowerCase().includes(term) ||
        p.estado.toLowerCase().includes(term) ||
        p.precio.toString().includes(term)
    );
    renderProducts(filtered);
};

// Modales
const showModal = (id) => {
    const modal = document.getElementById(id);
    modal.style.display = "block";
    modal.classList.add("show");
    document.body.classList.add("modal-open");
};

const hideModal = (id) => {
    const modal = document.getElementById(id);
    modal.style.display = "none";
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
};

// Eventos
const setupEventListeners = () => {
    elements.crearProductoBtn.addEventListener("click", () => {
        document.getElementById("InsertusuarioForm").reset();
        showModal("addproductoModal");
    });

    document.getElementById("gurdarProductoBtn").addEventListener("click", crearUsuario);
    document.getElementById("actualizarProductBtn").addEventListener("click", actualiarProducto);

    elements.buscadorBtn.addEventListener("click", filterProducts);
    elements.buscador.addEventListener("keyup", e => {
        if (e.key === "Enter") filterProducts();
    });

    document.getElementById("cerrarInsertproductoModal").addEventListener("click", () => hideModal("addproductoModal"));
    document.getElementById("cancelAddProduct").addEventListener("click", () => hideModal("addproductoModal"));

    document.getElementById("cerrarActualizarProductoModal").addEventListener("click", () => hideModal("actualizarProductoModal"));
    document.getElementById("cancelUpdateProduct").addEventListener("click", () => hideModal("actualizarProductoModal"));

    elements.cerrarEliminarModal.addEventListener("click", () => hideModal("eliminarModal"));
    elements.cerrarEliminarModal.addEventListener("click", () => hideModal("eliminarModal"));
    elements.confirmarEliminarBtn.addEventListener("click", deleteProduct);

    window.addEventListener("click", (e) => {
        if (e.target.id === "addproductoModal") hideModal("addproductoModal");
        if (e.target.id === "actualizarProductoModal") hideModal("actualizarProductoModal");
        if (e.target.id === "eliminarModal") hideModal("eliminarModal");
    });
};


// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    cargarUsuario();
});

prevProductBtn.addEventListener("click", () => {
    if (currentPage > 1) cargarUsuario(currentPage - 1, limit);
});

nextProductBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalItems / limit);
    if (currentPage < totalPages) cargarUsuario(currentPage + 1, limit);
});
