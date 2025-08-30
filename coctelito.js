document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector(".search-button");
    const resultsContainer = document.getElementById("results-container");
    const favoritesContainer = document.getElementById("favorites-container");


    // Estado inicial - cargar favoritos
    loadFavoritesList();

    // Loader para resultados
    const showLoader = (container) => {
        container.innerHTML = `<div class="loader">Buscando...</div>`;
    };

    // Mostrar cóctel en pantalla
    const renderCocktail = (drink) => {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];
            if (ingredient) {
                ingredients.push(`${measure ? measure : ""} ${ingredient}`);
            }
        }

        // Verificar si ya está en favoritos
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const isFavorite = favorites.some((fav) => fav.id === drink.idDrink);
        const buttonText = isFavorite ? "✓ En Favoritos" : "⭐ Guardar en Favoritos";
        const buttonClass = isFavorite ? "already-favorite" : "save-favorite";

        resultsContainer.innerHTML = `
            <div class="card">
                <h2>${drink.strDrink}</h2>
                <img src="${drink.strDrinkThumb}" alt="Imagen de ${drink.strDrink}" />
                <p><strong>ID:</strong> ${drink.idDrink}</p>
                <p><strong>Categoría:</strong> ${drink.strCategory}</p>
                <p><strong>Ingredientes:</strong></p>
                <ul>
                    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
                </ul>
                <p><strong>Instrucciones:</strong> ${drink.strInstructions}</p>
                <button class="${buttonClass}" data-id="${drink.idDrink}" data-name="${drink.strDrink}">${buttonText}</button>
            </div>
        `;

        // Manejar el evento de guardar en favoritos
        document.querySelector(`.${buttonClass}`).addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;

            if (!isFavorite) {
                saveFavorite(id, name);
                e.target.textContent = "✓ En Favoritos";
                e.target.classList.replace("save-favorite", "already-favorite");
            } else {
                // Si ya está en favoritos, podríamos permitir quitarlo
                removeFavorite(id);
                e.target.textContent = "⭐ Guardar en Favoritos";
                e.target.classList.replace("already-favorite", "save-favorite");
            }
        });
    };

    // Mostrar detalles de un cóctel favorito
    const renderFavoriteDetails = (drink) => {
        const ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = drink[`strIngredient${i}`];
            const measure = drink[`strMeasure${i}`];
            if (ingredient) {
                ingredients.push(`${measure ? measure : ""} ${ingredient}`);
            }
        }

        favoritesContainer.innerHTML = `
            <div class="card">
                <h2>${drink.strDrink}</h2>
                <img src="${drink.strDrinkThumb}" alt="Imagen de ${drink.strDrink}" />
                <p><strong>ID:</strong> ${drink.idDrink}</p>
                <p><strong>Categoría:</strong> ${drink.strCategory}</p>
                <p><strong>Ingredientes:</strong></p>
                <ul>
                    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
                </ul>
                <p><strong>Instrucciones:</strong> ${drink.strInstructions}</p>
                <button id="back-to-favorites">← Volver a Favoritos</button>
                <button id="remove-from-favorites" data-id="${drink.idDrink}">❌ Eliminar de Favoritos</button>
            </div>
        `;

        // Botón para volver a la lista de favoritos
        document.getElementById("back-to-favorites").addEventListener("click", () => {
            loadFavoritesList();
        });

        // Botón para eliminar de favoritos
        document.getElementById("remove-from-favorites").addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            removeFavorite(id);
            loadFavoritesList();
        });
    };

    // Guardar en favoritos
    const saveFavorite = (id, name) => {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        if (!favorites.some((fav) => fav.id === id)) {
            favorites.push({ id, name });
            localStorage.setItem("favorites", JSON.stringify(favorites));

            // Mostrar mensaje en favoritos
            const message = document.createElement("div");
            message.className = "success-message";
            message.textContent = `¡${name} añadido a favoritos!`;
            message.style.padding = "10px";
            message.style.marginBottom = "10px";
            message.style.backgroundColor = "#4CAF50";
            message.style.color = "white";
            message.style.borderRadius = "5px";
            message.style.textAlign = "center";
            message.style.animation = "slideIn 0.3s forwards";

            favoritesContainer.insertBefore(message, favoritesContainer.firstChild);

            // Actualizar la lista de favoritos
            setTimeout(() => {
                loadFavoritesList();
            }, 1500);
        }
    };

    // Eliminar de favoritos
    const removeFavorite = (id) => {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favorites = favorites.filter((fav) => fav.id !== id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    };

    // Cargar lista de favoritos
    function loadFavoritesList() {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

        if (favorites.length === 0) {
            favoritesContainer.innerHTML = `
                <div class="no-favorites">
                    <p>Aún no tienes cócteles favoritos</p>
                    <p>Usa el botón de búsqueda para encontrar cócteles y guardarlos aquí</p>
                </div>
            `;
            return;
        }

        let html = `<div class="cards-grid">`;

        favorites.forEach((fav) => {
            html += `
                <div class="card">
                    <h3>${fav.name}</h3>
                    <p><strong>ID:</strong> ${fav.id}</p>
                    <button class="ver-detalle" data-id="${fav.id}">Ver detalles</button>
                    <button class="eliminar-favorito" data-id="${fav.id}">Eliminar</button>
                </div>
            `;
        });

        html += `</div>`;
        favoritesContainer.innerHTML = html;

        // Agregar eventos a los botones
        document.querySelectorAll(".ver-detalle").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.dataset.id;
                showLoader(favoritesContainer);
                try {
                    const res = await fetch(
                        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
                    );
                    const data = await res.json();
                    renderFavoriteDetails(data.drinks[0]);
                } catch (error) {
                    favoritesContainer.innerHTML = `<p>Error al cargar el cóctel</p>`;
                }
            });
        });

        document.querySelectorAll(".eliminar-favorito").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = e.target.dataset.id;
                removeFavorite(id);
                loadFavoritesList();
            });
        });
    }

    // Buscar cóctel aleatorio
    searchButton.addEventListener("click", async () => {
        showLoader(resultsContainer);
        try {
            const res = await fetch(
                "https://www.thecocktaildb.com/api/json/v1/1/random.php"
            );
            const data = await res.json();
            renderCocktail(data.drinks[0]);
        } catch (error) {
            resultsContainer.innerHTML = `<p>Error al obtener el cóctel</p>`;
        }
    });

});
