// Constantes y variables globales
const URL_API = "http://localhost:3000/Combos";
let combo = [];
let comboAElim = null;

// Elementos del DOM
const elements = {
  comboForm: document.getElementById("comboForm"),
  comboTabla: document.getElementById("comboTabla"),
  buscador: document.getElementById("buscador"),
  crearComboBtn: document.getElementById("crearComboBtn"),
  gurdarComboBtn: document.getElementById("gurdarComboBtn"),
  buscadorBtn: document.getElementById("buscadorBtn"),
  comboModal: document.getElementById("comboModal"),
  cerrarcomboModal: document.getElementById("cerrarcomboModal"),
  cancelarcomboModal: document.getElementById("cancelarcomboModal"),
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

const cargarOpcionesProductos = async () => {
  try {
    const response = await fetch("http://localhost:3000/ProductosSelect");
    const result = await response.json();

    const select = document.getElementById("addProductos");
    
    select.innerHTML = "";

    result.forEach((producto) => {
      const option = document.createElement("option");
      option.value = producto._id;
      option.textContent = producto.nombre;
      select.appendChild(option);
    });
    console.log(producto);
    
  } catch (error) {
    console.error("Error al cargar productos:", error);
    // showAlert("error", "No se pudieron cargar los productos");
  }
};


const cargarOpcionesProductosParaUpdate = async () => {
  try {
    const response = await fetch("http://localhost:3000/ProductosSelect");
    const result = await response.json();

    const select = document.getElementById("updateProductos");
    
    select.innerHTML = "";

    result.forEach((producto) => {
      const option = document.createElement("option");
      option.value = producto._id;
      option.textContent = producto.nombre;
      select.appendChild(option);
    });
    console.log(producto);
    
  } catch (error) {
    console.error("Error al cargar productos:", error);
    // showAlert("error", "No se pudieron cargar los productos");
  }
};


const cargarCombo = async (page = 1, limit = 5) => {
  try {
    const res = await fetch(`${URL_API}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Error al cargar productos");
    const data = await res.json();

    combo = Array.isArray(data.data) ? data.data : [];
    totalItems = data.total || 0;
    currentPage = page;

    renderProducts(combo);

    pageNumber.textContent = `Página ${currentPage}`;
    totalCount.textContent = `Total de productos: ${totalItems}`;
    prevProductBtn.disabled = currentPage === 1;
    nextProductBtn.disabled = currentPage * limit >= totalItems;
  } catch (err) {
    console.error(err);
    showAlert("error", "No se pudieron cargar los productos");
    elements.comboTabla.innerHTML = `<tr><td colspan="5">Error al cargar productos</td></tr>`;
  }
};

const renderProducts = (combosLista) => {
  elements.comboTabla.innerHTML = "";
  if (!Array.isArray(combosLista) || combosLista.length === 0) {
    elements.comboTabla.innerHTML =
      '<tr><td colspan="5">No se encontraron productos</td></tr>';
    return;
  }

  combosLista.forEach((combo) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${combo.foto_combo}</td>
            <td>${combo.nombre}</td>
            <td>${combo.descripcion}</td>
            <td>${combo.productos}</td>
            <td>${combo.estado}</td>
            <td>${combo.dias_disponible}</td>
            <td>${combo.restricciones}</td>
            <td>${combo.popularidad}</td>
            <td>${combo.descuento}</td>
             <td>${combo.precio_completo}</td>
            <td>${combo.precio_final}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${combo._id}"><i class="fa fa-edit"></i> Editar</button>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${combo._id}"><i class="fa fa-trash"></i> Eliminar</button>
            </td>
        `;
    elements.comboTabla.appendChild(row);
  });

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => datosDelCombo(btn.dataset.id))
    );

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      comboAElim = btn.dataset.id;
      showModal("eliminarModal");
    })
  );
};

// Crear combo
const crearCombos = async () => {
  const nombre = document.getElementById("addNombre").value.trim();
  const descripcion = document.getElementById("addDescripcion").value;
  const estado = document.getElementById("addEstado").value;

const diasSelect = document.getElementById("addDiasDisponible");
const dias_disponible = Array.from(diasSelect.selectedOptions)
  .map(option => option.value.trim()) // por si hay espacios
  .filter(value => value !== "")      // elimina vacíos
  .join(",");


  const restricciones = document.getElementById("addRestricciones").value;
  const popularidad = document.getElementById("addPopularidad").value.trim();
  const descuento = document.getElementById("addDescuento").value;

  const foto_combo = document.getElementById("addImagen");
  const productosSelect = document.getElementById("addProductos");

  const productosSeleccionados = Array.from(productosSelect.selectedOptions).map(option => option.value);

  // Validaciones básicas
  if (!nombre || nombre.length > 100) {
    showAlert("error", "El nombre es requerido (máx. 100 caracteres)");
    return;
  }

  if (productosSeleccionados.length === 0) {
    showAlert("error", "Debes seleccionar al menos un producto para el combo.");
    return;
  }

  if (!dias_disponible) {
    showAlert("error", "Debes seleccionar al menos un día disponible.");
    return;
  }

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("descripcion", descripcion);
  formData.append("estado", estado);
  formData.append("dias_disponible", dias_disponible);
  formData.append("restricciones", restricciones);
  formData.append("popularidad", popularidad);
  formData.append("descuento", descuento);

  // Enviar productos como array de IDs
  productosSeleccionados.forEach(id => {
    formData.append("productos[]", id);
  });

  if (foto_combo.files[0]) {
    formData.append("foto_combo", foto_combo.files[0]);
  }

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const response = await fetch(URL_API, {
      method: "POST",
      headers: {
        Authorization: token,
        "x-role": role,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Error al crear combo");

    hideModal("addComboModal");
    await cargarCombo();
    showAlert("success", result.message || "Producto creado exitosamente");
  } catch (error) {
  const mensaje = error.message.includes("E11000 duplicate key error")
    ? "Ya existe un combo con ese nombre. Por favor, elige otro nombre."
    : error.message.includes("Failed to fetch")
    ? "Error de conexión con el servidor"
    : error.message;

  showAlert("error", mensaje);
}

};


// Editar combo
const datosDelCombo = async (id) => {
  try {
    const response = await fetch(`${URL_API}/${id}`);
    const combo = await response.json();

    document.getElementById("actualizarComboId").value = combo._id;
    document.getElementById("updateNombre").value = combo.nombre;
    document.getElementById("updateDescripcion").value = combo.descripcion;
    document.getElementById("updateEstado").value = combo.estado;
    document.getElementById("updateRestricciones").value = combo.restricciones;
    document.getElementById("updatePopularidad").value = combo.popularidad;
    document.getElementById("updateDescuento").value = combo.descuento;

    // Imagen
    const nombreArchivoSpan = document.getElementById("updateImagenNombre");
    if (combo.foto_combo) {
      nombreArchivoSpan.textContent = `Archivo actual: ${combo.foto_combo}`;
    } else {
      nombreArchivoSpan.textContent = "No hay imagen asignada";
    }

    // Días disponibles (convertir string a selección múltiple)
    const diasDisponibleSelect = document.getElementById("updateDiasDisponible");
    const dias = combo.dias_disponible ? combo.dias_disponible.split(",") : [];
    Array.from(diasDisponibleSelect.options).forEach(option => {
      option.selected = dias.includes(option.value);
    });

    // Productos seleccionados (IDs)
    const productosSelect = document.getElementById("updateProductos");
    const productosCombo = combo.productos || [];

    Array.from(productosSelect.options).forEach(option => {
      option.selected = productosCombo.includes(option.value);
    });

    showModal("actualizarComboModal");
  } catch (error) {
    console.error(error);
    showAlert("error", "No se pudo cargar el combo");
  }
};


// Actualizar combo
const actualizarCombo = async () => {
  const comboId = document.getElementById("actualizarComboId").value;

  const formData = new FormData();
  formData.append("nombre", document.getElementById("updateNombre").value.trim());
  formData.append("descripcion", document.getElementById("updateDescripcion").value.trim());
  formData.append("estado", document.getElementById("updateEstado").value);
  formData.append("restricciones", document.getElementById("updateRestricciones").value.trim());
  formData.append("popularidad", parseFloat(document.getElementById("updatePopularidad").value));
  formData.append("descuento", parseFloat(document.getElementById("updateDescuento").value));

  // Días disponibles
  const diasSelect = document.getElementById("updateDiasDisponible");
  const diasSeleccionados = Array.from(diasSelect.selectedOptions).map(option => option.value);
  formData.append("dias_disponible", diasSeleccionados.join(","));

  // Productos
  const productosSelect = document.getElementById("updateProductos");
  const productosSeleccionados = Array.from(productosSelect.selectedOptions).map(option => option.value);
  productosSeleccionados.forEach(id => formData.append("productos", id));

  // Imagen (si se actualiza)
  const foto_combo = document.getElementById("updateImagen");
  if (foto_combo.files[0]) {
    formData.append("foto_combo", foto_combo.files[0]); // Este nombre debe coincidir con el que espera tu backend
  }

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const response = await fetch(`${URL_API}/${comboId}`, {
      method: "PUT",
      headers: {
        Authorization: token,
        "x-role": role,
        // No pongas Content-Type, fetch lo gestiona automáticamente con FormData
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Error al actualizar el combo");
    }

    hideModal("actualizarComboModal");
    await cargarCombo(); // Asumo que esta función refresca la lista
    showAlert("success", result.message || "Combo actualizado correctamente");
  } catch (err) {
    console.error("Error al actualizar:", err);
    showAlert(
      "error",
      err.message.includes("Failed to fetch")
        ? "Error de conexión con el servidor"
        : err.message
    );
  }
};


// Eliminar combo
const deleteCombo = async () => {
  if (!comboAElim) return showAlert("error", "No hay combo seleccionado");

  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const res = await fetch(`${URL_API}/${comboAElim}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "x-role": role,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message);

    hideModal("eliminarModal");
    await cargarCombo();
    showAlert("success", result.message || "Producto eliminado");
    comboAElim = null;
  } catch (err) {
    showAlert("error", err.message);
    hideModal("eliminarModal");
  }
};

// Filtro
const filterProducts = () => {
  const term = elements.buscador.value.toLowerCase();
  const filtered = combo.filter(
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
  elements.crearComboBtn.addEventListener("click", () => {
    document.getElementById("InsertproductoForm").reset();
    showModal("addComboModal");
  });

  document
    .getElementById("gurdarComboBtn")
    .addEventListener("click", crearCombos);
  document
    .getElementById("actualizarComboBtn")
    .addEventListener("click", actualizarCombo);

  elements.buscadorBtn.addEventListener("click", filterProducts);
  elements.buscador.addEventListener("keyup", (e) => {
    if (e.key === "Enter") filterProducts();
  });

  document
    .getElementById("cerrarInsertcomboModal")
    .addEventListener("click", () => hideModal("addComboModal"));
  document
    .getElementById("cancelAddProduct")
    .addEventListener("click", () => hideModal("addComboModal"));

  document
    .getElementById("cerrarActualizarComboModal")
    .addEventListener("click", () => hideModal("actualizarComboModal"));
  document
    .getElementById("cancelUpdateProduct")
    .addEventListener("click", () => hideModal("actualizarComboModal"));

  elements.cerrarEliminarModal.addEventListener("click", () =>
    hideModal("eliminarModal")
  );
  elements.confirmarEliminarBtn.addEventListener("click", deleteCombo);

  window.addEventListener("click", (e) => {
    if (e.target.id === "addComboModal") hideModal("addComboModal");
    if (e.target.id === "actualizarComboModal")
      hideModal("actualizarComboModal");
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
  cargarCombo();
  cargarOpcionesProductos();
  cargarOpcionesProductosParaUpdate();
});

prevProductBtn.addEventListener("click", () => {
  if (currentPage > 1) cargarCombo(currentPage - 1, limit);
});

nextProductBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(totalItems / limit);
  if (currentPage < totalPages) cargarCombo(currentPage + 1, limit);
});
