const API_URL = "http://localhost:3000/Productos";
const URL_FOTO = "http://localhost:3000/uploads"

const prevProductBtn = document.getElementById("prevProductBtn");
const nextProductBtn = document.getElementById("nextProductBtn");
const totalCount = document.getElementById("totalCount");
const pageNumber = document.getElementById("pageNumber");

let currentPage = 1;
const limit = 8;
let totalItems = 0;
const formatPrice = (price) => parseFloat(price).toFixed(2);
const cargarProductos = async (page = 1, limit = 8) => {
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

    const container = document.getElementById("productos-container");
    container.innerHTML = '<p>Error al cargar productos</p>';
}

};


const renderProducts = (productosLista) => {
    const container = document.getElementById("productos-container");
    container.innerHTML = "";

    if (!Array.isArray(productosLista) || productosLista.length === 0) {
        container.innerHTML = '<p>No se encontraron productos</p>';
        return;
    }

    container.innerHTML = productosLista.map(producto => `
      <div class="estilo-card">
       <img src="${URL_FOTO}/${producto.foto_producto}" alt="${producto.nombre}">

        <h4>${producto.nombre}</h4>
        <p> <span class="etiqueta">Precio:</span> Lps.${formatPrice(producto.precio)}</p>
        <p><span class="etiqueta">Estado:</span>  ${producto.estado}</p>
        <p><span class="etiqueta">Categoría:</span>  ${producto.categoria}</p>
       
      </div>
    `).join("");

    // Agregar eventos a los botones
    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => datosDelProducto(btn.dataset.id))
    );

    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => {
            prodctoAEliminar = btn.dataset.id;
            showModal("eliminarModal");
        })
    );
};


document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();
});

prevProductBtn.addEventListener("click", () => {
    if (currentPage > 1) cargarProductos(currentPage - 1, limit);
});

nextProductBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalItems / limit);
    if (currentPage < totalPages) cargarProductos(currentPage + 1, limit);
});
