// Constantes y variables globales
const API_URL = "http://localhost:3000/Productos";
let producto = [];
let prodctoAElim = null;

// Elementos del DOM
const elements = {
  productoForm: document.getElementById("productoForm"),
  productosTabla: document.getElementById("productosTabla"),
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
  const previousAlerts = document.querySelectorAll(
    `.custom-alert.alert-${type}`
  );
  previousAlerts.forEach((alert) => alert.remove());

  const alertDiv = document.createElement("div");
  alertDiv.className = `custom-alert alert-${type}`;
  const iconClass =
    type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  alertDiv.innerHTML = `
        <i class="fa ${iconClass}"></i>
        <span>${message}</span>
        <button class="alert-close">&times;</button>
    `;

  const container = document.querySelector(".container");
  alertaContainer.appendChild(alertDiv);

  alertDiv.querySelector(".alert-close").addEventListener("click", () => {
    alertDiv.classList.add("fade-out");
    setTimeout(() => alertDiv.remove(), 500);
  });

  setTimeout(() => {
    alertDiv.classList.add("fade-out");
    setTimeout(() => alertDiv.remove(), 500);
  }, duration);
};

// Cargar y renderizar productos
const cargarProductos = async (page = 1, limit = 5) => {
  try {
    const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Error al cargar productos");
    const data = await res.json();

    producto = Array.isArray(data.data) ? data.data : [];
    totalItems = data.total || 0;
    currentPage = page;

    renderProducts(producto);

    pageNumber.textContent = `Página ${currentPage}`;
    totalCount.textContent = `Total de productos: ${totalItems}`;
    prevProductBtn.disabled = currentPage === 1;
    nextProductBtn.disabled = currentPage * limit >= totalItems;
  } catch (err) {
    console.error(err);
    showAlert("error", "No se pudieron cargar los productos");
    elements.productosTabla.innerHTML = `<tr><td colspan="5">Error al cargar productos</td></tr>`;
  }
};

const renderProducts = (productosLista) => {
  elements.productosTabla.innerHTML = "";
  if (!Array.isArray(productosLista) || productosLista.length === 0) {
    elements.productosTabla.innerHTML =
      '<tr><td colspan="5">No se encontraron productos</td></tr>';
    return;
  }

  productosLista.forEach((producto) => {
    const row = document.createElement("tr");
    row.innerHTML = `
         <td>${producto.foto_producto}</td>
            <td>${producto.nombre}</td>
            <td>Lps.${formatPrice(producto.precio)}</td>
            <td>${producto.estado}</td>
            <td>${producto.categoria}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${
                  producto._id
                }"><i class="fa fa-edit"></i> Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${
                  producto._id
                }"><i class="fa fa-trash"></i> Eliminar</button>
            </td>
        `;
    elements.productosTabla.appendChild(row);
  });

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => datosDelProducto(btn.dataset.id))
    );

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      prodctoAElim = btn.dataset.id;
      showModal("eliminarModal");
    })
  );
};

// Crear producto
const crearProductos = async () => {
  const nombre = document.getElementById("addNombre").value.trim();
  const precio = parseFloat(document.getElementById("addPrecio").value);
  const estado = document.getElementById("addEstado").value;
  const categoria = document.getElementById("addCategoria").value;
  const foto_producto = document.getElementById("addImagen");

  if (!nombre || nombre.length > 100) {
    showAlert("error", "El nombre es requerido (máx. 100 caracteres)");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("precio", precio);
  formData.append("estado", estado);
  formData.append("categoria", categoria);

  if (foto_producto.files[0]) {
    formData.append("foto_producto", foto_producto.files[0]); // Este campo debe coincidir con el esperado en tu backend
  }
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Error al crear producto");

    hideModal("addproductoModal");
    await cargarProductos();
    showAlert("success", result.message || "Producto creado exitosamente");
  } catch (error) {
    showAlert(
      "error",
      error.message.includes("Failed to fetch")
        ? "Error de conexión con el servidor"
        : error.message
    );
  }
};

// Editar producto
const datosDelProducto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const producto = await response.json();

    document.getElementById("actualizarProductoId").value = producto._id;
    document.getElementById("updateNombre").value = producto.nombre;
    document.getElementById("updatePrecio").value = producto.precio;
    document.getElementById("updateEstado").value = producto.estado;
    document.getElementById("updateCategoria").value = producto.categoria;
    const nombreArchivoSpan = document.getElementById("updateImagenNombre");
    if (producto.foto_producto) {
      nombreArchivoSpan.textContent = `Archivo actual: ${producto.foto_producto}`;
    } else {
      nombreArchivoSpan.textContent = "No hay imagen asignada";
    }
    showModal("actualizarProductoModal");
  } catch {
    showAlert("error", "No se pudo cargar el producto");
  }
};

// Actualizar producto
const actualizarPoducto = async () => {
  const productId = document.getElementById("actualizarProductoId").value;

  const formData = new FormData();
  formData.append(
    "nombre",
    document.getElementById("updateNombre").value.trim()
  );
  formData.append(
    "precio",
    parseFloat(document.getElementById("updatePrecio").value)
  );
  formData.append("estado", document.getElementById("updateEstado").value);
  formData.append(
    "categoria",
    document.getElementById("updateCategoria").value
  );

  const foto_producto = document.getElementById("updateImagen");
  if (foto_producto.files[0]) {
    formData.append("foto_producto", foto_producto.files[0]); // Este nombre debe coincidir con el que espera tu backend
  }

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const response = await fetch(`${API_URL}/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Error al actualizar producto");

    hideModal("actualizarProductoModal");
    await cargarProductos();
    showAlert(
      "success",
      result.message || "Producto actualizado correctamente"
    );
  } catch (err) {
    showAlert(
      "error",
      err.message.includes("Failed to fetch")
        ? "Error de conexión con el servidor"
        : err.message
    );
  }
};

// Eliminar producto
const deleteProduct = async () => {
  if (!prodctoAElim) return showAlert("error", "No hay producto seleccionado");

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const res = await fetch(`${API_URL}/${prodctoAElim}`, {
      method: "DELETE",
      headers: {
        Authorization: token,

        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    hideModal("eliminarModal");
    await cargarProductos();
    showAlert("success", result.message || "Producto eliminado");
    prodctoAElim = null;
  } catch (err) {
    showAlert("error", err.message);
    hideModal("eliminarModal");
  }
};

// Filtro
const filterProducts = () => {
  const term = elements.buscador.value.toLowerCase();
  const filtered = producto.filter(
    (p) =>
      p.nombre.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term) ||
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
    document.getElementById("InsertproductoForm").reset();
    showModal("addproductoModal");
  });

  document
    .getElementById("gurdarProductoBtn")
    .addEventListener("click", crearProductos);
  document
    .getElementById("actualizarProductBtn")
    .addEventListener("click", actualizarPoducto);

  elements.buscadorBtn.addEventListener("click", filterProducts);
  elements.buscador.addEventListener("keyup", (e) => {
    if (e.key === "Enter") filterProducts();
  });

  document
    .getElementById("cerrarInsertproductoModal")
    .addEventListener("click", () => hideModal("addproductoModal"));
  document
    .getElementById("cancelAddProduct")
    .addEventListener("click", () => hideModal("addproductoModal"));

  document
    .getElementById("cerrarActualizarProductoModal")
    .addEventListener("click", () => hideModal("actualizarProductoModal"));
  document
    .getElementById("cancelUpdateProduct")
    .addEventListener("click", () => hideModal("actualizarProductoModal"));

  elements.cerrarEliminarModal.addEventListener("click", () =>
    hideModal("eliminarModal")
  );
  elements.confirmarEliminarBtn.addEventListener("click", deleteProduct);

  window.addEventListener("click", (e) => {
    if (e.target.id === "addproductoModal") hideModal("addproductoModal");
    if (e.target.id === "actualizarProductoModal")
      hideModal("actualizarProductoModal");
    if (e.target.id === "eliminarModal") hideModal("eliminarModal");
  });
};

document.getElementById("updateImagen").addEventListener("change", function () {
  const nombreArchivoSpan = document.getElementById("updateImagenNombre");
  if (this.files.length > 0) {
    nombreArchivoSpan.textContent = `Archivo seleccionado: ${this.files[0].name}`;
  } else {
    nombreArchivoSpan.textContent = "No hay imagen asignada";
  }
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  cargarProductos();
});

prevProductBtn.addEventListener("click", () => {
  if (currentPage > 1) cargarProductos(currentPage - 1, limit);
});

nextProductBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalItems / limit);
  if (currentPage < totalPages) cargarProductos(currentPage + 1, limit);
});
