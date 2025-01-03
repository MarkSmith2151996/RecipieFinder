// API Details
const API_URL = "https://api.spoonacular.com/recipes/findByIngredients";
const API_KEY = "Yf83fb2d554b34fbeb1d7ba06863bc085"; // Replace with your API key

// DOM Elements
const searchBtn = document.getElementById("search-btn");
const ingredientInput = document.getElementById("ingredient-input");
const recipeResults = document.getElementById("recipe-results");
const leftShuffler = document.querySelector(".image-shuffler.left");
const rightShuffler = document.querySelector(".image-shuffler.right");

// Sample Food Images
const foodImages = [
  "food1.jpg", "food2.jpg", "food3.jpg", // Replace with actual image URLs
  "food4.jpg", "food5.jpg", "food6.jpg"
];

// Initialize Image Shufflers
function startShufflingImages(shufflerElement) {
  let index = 0;
  setInterval(() => {
    shufflerElement.innerHTML = `<img src="${foodImages[index]}" alt="Food Image" />`;
    index = (index + 1) % foodImages.length;
  }, 2000); // Change image every 2 seconds
}

startShufflingImages(leftShuffler);
startShufflingImages(rightShuffler);

// Event Listener for Search Button
searchBtn.addEventListener("click", () => {
  const ingredients = ingredientInput.value.trim();
  if (ingredients) {
    fetchRecipes(ingredients);
  } else {
    alert("Please enter some ingredients!");
  }
});

// Fetch Recipes from API
async function fetchRecipes(ingredients) {
  recipeResults.innerHTML = "<p>Loading recipes...</p>";
  try {
    const response = await fetch(
      `${API_URL}?ingredients=${ingredients}&number=10&apiKey=${API_KEY}`
    );
    const data = await response.json();
    displayRecipes(data);
  } catch (error) {
    recipeResults.innerHTML = "<p>Failed to fetch recipes. Try again later.</p>";
    console.error("Error fetching recipes:", error);
  }
}

// Display Recipes
function displayRecipes(recipes) {
  recipeResults.innerHTML = "";
  if (recipes.length === 0) {
    recipeResults.innerHTML = "<p>No recipes found. Try different ingredients.</p>";
    return;
  }
  recipes.forEach(recipe => {
    const recipeCard = document.createElement("div");
    recipeCard.className = "recipe-card";
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <h3>${recipe.title}</h3>
      <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">View Recipe</a>
    `;
    recipeResults.appendChild(recipeCard);
  });
}
