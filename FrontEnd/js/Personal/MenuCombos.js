const API_URL = "http://localhost:3000/Combos";
const URL_FOTO = "http://localhost:3000/uploads"

const prevProductBtn = document.getElementById("prevProductBtn");
const nextProductBtn = document.getElementById("nextProductBtn");
const totalCount = document.getElementById("totalCount");
const pageNumber = document.getElementById("pageNumber");

let currentPage = 1;
const limit = 8;
let totalItems = 0;
const formatPrice = (price) => parseFloat(price).toFixed(2);
const cargarCombos = async (page = 1, limit = 8) => {
    try {
        const res = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error("Error al cargar Combos");
        const data = await res.json();

        combo = Array.isArray(data.data) ? data.data : [];
        totalItems = data.total || 0;
        currentPage = page;

        renderProducts(combo);

        pageNumber.textContent = `Página ${currentPage}`;
        totalCount.textContent = `Total de Combos: ${totalItems}`;
        prevProductBtn.disabled = currentPage === 1;
        nextProductBtn.disabled = currentPage * limit >= totalItems;
    } catch (err) {
        console.error(err);
        showAlert("error", "No se pudieron cargar los Combos");

        const container = document.getElementById("Combos-container");
        container.innerHTML = '<p>Error al cargar Combos</p>';
    }

};


const renderProducts = (CombosLista) => {
    const container = document.getElementById("Combos-container");
    container.innerHTML = "";

    if (!Array.isArray(CombosLista) || CombosLista.length === 0) {
        container.innerHTML = '<p>No se encontraron Combos</p>';
        return;
    }

    container.innerHTML = CombosLista.map(combo => `
      <div class="estilo-card">
       <img src="${URL_FOTO}/${combo.foto_combo}" alt="${combo.nombre}">

        <h4>${combo.nombre}</h4>
        <p><span class="etiqueta">Días Disponibles:</span>  ${combo.dias_disponible}</p>
        <p><span class="etiqueta">Popularidad:</span>  ${combo.popularidad}</p>
        <p> <span class="etiqueta">Precio Final:</span> Lps.${formatPrice(combo.precio_final)}</p>
      </div>
    `).join("");

    // Agregar eventos a los botones
    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => datosDelcombo(btn.dataset.id))
    );

    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => {
            prodctoAEliminar = btn.dataset.id;
            showModal("eliminarModal");
        })
    );
};


document.addEventListener("DOMContentLoaded", () => {

    cargarCombos();
});

prevProductBtn.addEventListener("click", () => {
    if (currentPage > 1) cargarCombos(currentPage - 1, limit);
});

nextProductBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(totalItems / limit);
    if (currentPage < totalPages) cargarCombos(currentPage + 1, limit);
});
