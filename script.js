document.addEventListener('DOMContentLoaded', () => {
    const ingredients = [
        "Tomato", "Cheese", "Chicken", "Spinach", "Carrot", "Lettuce", "Onion", "Garlic", "Olive Oil", "Salt", "Pepper", "Basil", "Cucumber", "Potato", "Eggplant", "Zucchini", "Peppers", "Mushrooms", "Rice", "Pasta"
    ];

    const selectedIngredientsList = document.getElementById('selected-ingredients-list');
    const ingredientSearch = document.getElementById('ingredient-search');
    const addIngredientButton = document.getElementById('add-ingredient');
    const generateRecipeButton = document.getElementById('generate-recipe');

    let selectedIngredients = [];

    // Search for ingredients dynamically
    ingredientSearch.addEventListener('input', () => {
        const query = ingredientSearch.value.toLowerCase();
        const matchingIngredients = ingredients.filter(ingredient => ingredient.toLowerCase().includes(query));
        
        // Create dynamic dropdown list
        const dropdown = document.createElement('div');
        dropdown.classList.add('ingredients-dropdown');
        matchingIngredients.forEach(ingredient => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');
            item.textContent = ingredient;
            item.addEventListener('click', () => {
                addIngredient(ingredient);
                ingredientSearch.value = '';
                dropdown.innerHTML = ''; // Clear dropdown after selection
            });
            dropdown.appendChild(item);
        });
        
        // Add the dropdown to the DOM
        document.body.appendChild(dropdown);
        dropdown.style.top = `${ingredientSearch.getBoundingClientRect().bottom + window.scrollY}px`;
    });

    // Add selected ingredient to the list
    const addIngredient = (ingredient) => {
        if (!selectedIngredients.includes(ingredient)) {
            selectedIngredients.push(ingredient);
            updateSelectedIngredients();
        }
    };

    // Update the selected ingredients display
    const updateSelectedIngredients = () => {
        selectedIngredientsList.innerHTML = '';
        selectedIngredients.forEach(ingredient => {
            const ingredientItem = document.createElement('div');
            ingredientItem.classList.add('ingredient-item');
            ingredientItem.textContent = ingredient;
            selectedIngredientsList.appendChild(ingredientItem);
        });
    };

    // Handle the "Add" button click
    addIngredientButton.addEventListener('click', () => {
        const ingredient = ingredientSearch.value.trim();
        if (ingredient && !selectedIngredients.includes(ingredient)) {
            addIngredient(ingredient);
            ingredientSearch.value = ''; // Reset the search field
        }
    });

    // Handle the "Generate Recipe" button click
    generateRecipeButton.addEventListener('click', () => {
        if (selectedIngredients.length === 0) {
            alert('Please select at least one ingredient');
            return;
        }
        
        // Call the API to generate a recipe
        fetch('/api/generate-recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: selectedIngredients })
        })
        .then(response => response.json())
        .then(data => {
            const recipeTitle = document.getElementById('recipe-title');
            const recipeImage = document.getElementById('recipe-image');
            const recipeContent = document.getElementById('recipe-content');

            recipeTitle.textContent = data.recipeName;
            recipeContent.querySelector('#recipe-ingredients').innerHTML = data.ingredients;
            recipeContent.querySelector('#recipe-instructions').innerHTML = data.instructions;

            // Optional: Display an image (if returned by API)
            if (data.imageUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = data.imageUrl;
                imgElement.alt = data.recipeName;
                recipeImage.innerHTML = '';
                recipeImage.appendChild(imgElement);
            }
        })
        .catch(error => {
            console.error('Error generating recipe:', error);
            alert('Failed to generate recipe');
        });
    });
});
