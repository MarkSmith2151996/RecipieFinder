document.addEventListener('DOMContentLoaded', () => {
    const ingredients = [
        "Tomato", "Cheese", "Chicken", "Spinach", "Carrot", "Lettuce", "Onion", "Garlic", "Olive Oil", "Salt", "Pepper", "Basil", "Cucumber", "Potato", "Eggplant", "Zucchini", "Peppers", "Mushrooms", "Rice", "Pasta"
    ];
    const ingredientsList = document.getElementById('ingredients-list');
    const ingredientSearch = document.getElementById('ingredient-search');
    const ingredientsDropdown = document.getElementById('ingredients-dropdown');
    const findRecipeBtn = document.getElementById('find-recipe-btn');
    const pageNavigation = document.getElementById('page-navigation');
    const recipeDisplay = document.getElementById('recipe-display');

    let currentPage = 0;
    const itemsPerPage = 10;
    let selectedIngredients = [];

    // Function to update ingredients list based on the current page
    function updateIngredientsList() {
        ingredientsList.innerHTML = '';
        const startIdx = currentPage * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, ingredients.length);
        const pageIngredients = ingredients.slice(startIdx, endIdx);

        pageIngredients.forEach(ingredient => {
            const ingredientItem = document.createElement('div');
            ingredientItem.classList.add('ingredient-item');
            ingredientItem.innerHTML = `
                <input type="checkbox" class="ingredient-checkbox" id="${ingredient}" />
                <label for="${ingredient}" class="ingredient-label">${ingredient}</label>
            `;
            ingredientsList.appendChild(ingredientItem);
        });

        const totalPages = Math.ceil(ingredients.length / itemsPerPage);
        pageNavigation.innerHTML = ` 
            <button ${currentPage === 0 ? 'disabled' : ''} onclick="changePage(-1)">Previous</button>
            <button ${currentPage === totalPages - 1 ? 'disabled' : ''} onclick="changePage(1)">Next</button>
        `;
    }

    // Function to change page
    window.changePage = function(direction) {
        currentPage += direction;
        updateIngredientsList();
    };

    // Function to filter ingredients based on search input
    function filterIngredients(query) {
        const filteredIngredients = ingredients.filter(ingredient =>
            ingredient.toLowerCase().includes(query.toLowerCase())
        );
        ingredientsDropdown.innerHTML = '';
        filteredIngredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');
            item.textContent = ingredient;
            ingredientsDropdown.appendChild(item);
        });
        ingredientsDropdown.classList.add('active');
    }

    // Event listener for search input
    ingredientSearch.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            filterIngredients(query);
        } else {
            ingredientsDropdown.classList.remove('active');
        }
    });

    // Event listener for selecting an ingredient from the dropdown
    ingredientsDropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('dropdown-item')) {
            ingredientSearch.value = e.target.textContent;
            ingredientsDropdown.classList.remove('active');
        }
    });

    // Event listener for the find recipe button
    findRecipeBtn.addEventListener('click', async () => {
        // Gather selected ingredients
        selectedIngredients = [];
        document.querySelectorAll('.ingredient-checkbox:checked').forEach(checkbox => {
            selectedIngredients.push(checkbox.id);
        });

        // If no ingredients selected, show an alert
        if (selectedIngredients.length === 0) {
            alert('Please select at least one ingredient.');
            return;
        }

        // Call OpenAI API to generate the recipe and image
        await generateRecipeAndImage(selectedIngredients);
    });

    // Function to display the generated recipe
    function displayRecipe(recipeName, recipeSteps, imageUrl) {
        recipeDisplay.innerHTML = `
            <div class="recipe-header">
                <h2>${recipeName}</h2>
            </div>
            <div class="recipe-image">
                <img src="${imageUrl}" alt="${recipeName}" />
            </div>
            <div class="recipe-steps">
                <h3>Instructions:</h3>
                <p>${recipeSteps}</p>
            </div>
        `;
    }

    // Function to generate the recipe and image using OpenAI API
    async function generateRecipeAndImage(ingredients) {
        try {
            // Prepare prompt for OpenAI recipe generation
            const recipePrompt = `Create a recipe based on the following ingredients: ${ingredients.join(', ')}. Include the recipe name and detailed instructions.`;

            // Call OpenAI API for recipe generation
            const recipeResponse = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: recipePrompt }),
            });
            const recipeData = await recipeResponse.json();

            const recipeName = recipeData.recipeName;
            const recipeSteps = recipeData.recipeSteps;

            // Call OpenAI API (DALL·E) for image generation
            const imageResponse = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: `Image of a delicious dish made with ingredients like ${ingredients.join(', ')}` }),
            });
            const imageData = await imageResponse.json();
            const imageUrl = imageData.imageUrl;

            // Display the generated recipe and image
            displayRecipe(recipeName, recipeSteps, imageUrl);

        } catch (error) {
            console.error('Error generating recipe and image:', error);
        }
    }

    // Initial update of the ingredients list
    updateIngredientsList();
});
