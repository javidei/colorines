const search = document.querySelector("#catalog-search");
const filters = [...document.querySelectorAll(".filter")];
const cards = [...document.querySelectorAll(".product-card")];
const result = document.querySelector("#catalog-result");
const empty = document.querySelector("#catalog-empty");

let activeFilter = "all";

const normalize = (value) => String(value)
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

function updateCatalog() {
  const query = normalize(search.value);
  let visible = 0;

  cards.forEach((card) => {
    const categories = card.dataset.category.split(" ");
    const matchesCategory = activeFilter === "all" || categories.includes(activeFilter);
    const matchesSearch = !query || normalize(`${card.dataset.name} ${card.textContent}`).includes(query);
    const isVisible = matchesCategory && matchesSearch;

    card.hidden = !isVisible;
    if (isVisible) visible += 1;
  });

  result.textContent = `${visible} ${visible === 1 ? "categoría" : "categorías"}`;
  empty.hidden = visible !== 0;
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    updateCatalog();
  });
});

search.addEventListener("input", updateCatalog);
updateCatalog();
