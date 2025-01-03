const API_URL = "https://api.spoonacular.com/recipes/findByIngredients";
const API_KEY = "Yf83fb2d554b34fbeb1d7ba06863bc085";

// DOM Elements
const ingredientSearch = document.getElementById('ingredient-search');
const ingredientsDropdown = document.getElementById('ingredients-dropdown');
const ingredientsList = document.getElementById('ingredients-list');
const recipeTitle = document.getElementById('recipe-title');
const recipeImage = document.getElementById('recipe-image');
const recipeSteps = document.getElementById('recipe-steps');

// Expanded ingredients database
const ingredients = [
    "Apple", "Banana", "Orange", "Lemon", "Lime", "Strawberry", "Blueberry", "Raspberry", "Blackberry", "Grape", 
    "Pineapple", "Mango", "Peach", "Pear", "Plum", "Kiwi", "Watermelon", "Cantaloupe", "Honeydew", "Coconut",
    "Carrot", "Broccoli", "Spinach", "Lettuce", "Tomato", "Potato", "Sweet Potato", "Bell Pepper", "Cucumber", 
    "Zucchini", "Eggplant", "Onion", "Garlic", "Mushroom", "Celery", "Asparagus", "Green Beans", "Peas", "Corn", 
    "Cauliflower", "Chicken", "Beef", "Pork", "Turkey", "Fish", "Shrimp", "Tofu", "Eggs", "Salmon", "Tuna", 
    "Lamb", "Duck", "Beans", "Lentils", "Chickpeas", "Ground Beef", "Chicken Breast", "Bacon", "Ham", "Sausage",
    "Milk", "Cheese", "Butter", "Yogurt", "Cream", "Sour Cream", "Cream Cheese", "Mozzarella", "Cheddar", 
    "Parmesan", "Almond Milk", "Soy Milk", "Oat Milk", "Coconut Milk", "Heavy Cream", "Rice", "Pasta", "Bread", 
    "Flour", "Quinoa", "Oats", "Barley", "Couscous", "Tortilla", "Noodles", "Brown Rice", "White Rice", "Bread Crumbs", 
    "Cornmeal", "Salt", "Pepper", "Basil", "Oregano", "Thyme", "Rosemary", "Cumin", "Paprika", "Cinnamon", 
    "Nutmeg", "Ginger", "Turmeric", "Curry Powder", "Chili Powder", "Cayenne Pepper", "Bay Leaves", "Sage", 
    "Mint", "Coriander", "Dill", "Olive Oil", "Vegetable Oil", "Soy Sauce", "Vinegar", "Mustard", "Mayonnaise", 
    "Ketchup", "Hot Sauce", "BBQ Sauce", "Honey", "Maple Syrup", "Worcestershire Sauce", "Fish Sauce", 
    "Teriyaki Sauce", "Sesame Oil", "Almonds", "Walnuts", "Peanuts", "Cashews", "Sesame Seeds", "Sunflower Seeds", 
    "Pumpkin Seeds", "Pine Nuts", "Chia Seeds", "Flax Seeds"
];

let selectedIngredients = new Set();

// Initialize ingredients list with checkboxes
function initializeIngredientsList() {
    ingredientsList.innerHTML = ingredients
        .sort()
        .map(ing => `
            <div class="ingredient-item">
                <input type="checkbox" 
                       id="check-${ing.toLowerCase().replace(/\s+/g, '-')}" 
                       class="ingredient-checkbox">
                <label class="ingredient-label" 
                       for="check-${ing.toLowerCase().replace(/\s+/g, '-')}">
                    ${ing}
                </label>
            </div>
        `).join('');

    // Add event listeners to checkboxes
    document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const ingredient = e.target.nextElementSibling.textContent.trim();
            if (e.target.checked) {
                selectedIngredients.add(ingredient);
            } else {
                selectedIngredients.delete(ingredient);
            }
            fetchRecipes();
        });
    });
}

// Create background stars
function createStars() {
    const starsContainer = document.querySelector('.background-stars');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }
}

// Search and filter ingredients
ingredientSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filteredIngredients = ingredients.filter(ing => ing.toLowerCase().includes(searchTerm));
    
    displayDropdown(filteredIngredients);

    document.querySelectorAll('.ingredient-item').forEach(item => {
        const label = item.querySelector('.ingredient-label');
        item.style.backgroundColor = searchTerm && label.textContent.toLowerCase().includes(searchTerm)
            ? 'rgba(255, 255, 255, 0.1)' 
            : '';
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        ingredientsDropdown.className = 'ingredients-dropdown';
    }
});

function displayDropdown(items) {
    ingredientsDropdown.innerHTML = '';
    ingredientsDropdown.className = 'ingredients-dropdown' + (items.length ? ' active' : '');
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.textContent = item;
        div.onclick = () => {
            addIngredient(item);
            ingredientSearch.value = '';
            ingredientsDropdown.className = 'ingredients-dropdown';
            document.querySelectorAll('.ingredient-item').forEach(item => {
                item.style.backgroundColor = '';
            });
        };
        ingredientsDropdown.appendChild(div);
    });
}

function addIngredient(ingredient) {
    selectedIngredients.add(ingredient);
    const checkbox = document.querySelector(`#check-${ingredient.toLowerCase().replace(/\s+/g, '-')}`);
    if (checkbox) checkbox.checked = true;
    fetchRecipes();
}

// Fetch recipes
async function fetchRecipes() {
    if (selectedIngredients.size === 0) {
        recipeTitle.textContent = 'Please select ingredients';
        recipeImage.innerHTML = '';
        recipeSteps.innerHTML = '';
        return;
    }

    const ingredients = Array.from(selectedIngredients).join(',');
    recipeTitle.textContent = 'Searching for recipes...';
    
    try {
        const response = await fetch(`${API_URL}?ingredients=${ingredients}&number=1&apiKey=${API_KEY}`);
        const data = await response.json();
        
        if (data.length > 0) {
            const recipe = data[0];
            recipeTitle.textContent = recipe.title;
            recipeImage.innerHTML = `<img src="${recipe.image}" alt="${recipe.title}">`;
            recipeSteps.innerHTML = `
                <h3>Recipe Details</h3>
                <p><strong>Used Ingredients:</strong> ${recipe.usedIngredients?.map(i => i.name).join(', ') || 'Not specified'}</p>
                <p><strong>Missing Ingredients:</strong> ${recipe.missedIngredients?.map(i => i.name).join(', ') || 'None'}</p>
                <p><strong>Likes:</strong> ${recipe.likes || 0}</p>
                <a href="https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/\s+/g, '-')}-${recipe.id}" 
                   target="_blank" class="view-recipe-btn">View Full Recipe</a>
            `;
        } else {
            recipeTitle.textContent = 'No recipes found with these ingredients';
            recipeImage.innerHTML = '';
            recipeSteps.innerHTML = '<p>Try selecting different ingredients</p>';
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipeTitle.textContent = 'Error fetching recipes';
        recipeSteps.innerHTML = '<p>Please try again later</p>';
    }
}

// Initialize
initializeIngredientsList();
createStars();
