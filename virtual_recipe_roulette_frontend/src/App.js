import React, { useState, useEffect } from "react";
import "./App.css";

// --- Color theme (matches requirements) ---
const RECIPE_COLORS = ["#4CAF50", "#FFC107", "#81D4FA", "#F06292", "#FFF176", "#AED581", "#FFD54F", "#E1BEE7", "#B0BEC5"];
const PRIMARY = "#4CAF50";
const ACCENT = "#FFC107";
const SECONDARY = "#FFFFFF";

// --- Mock recipe data ----
const MOCK_RECIPES = [
  {
    id: 1,
    name: "Avocado Toast",
    ingredients: ["Bread", "Avocado", "Salt", "Pepper", "Lemon"],
    steps: [
      "Toast the bread.",
      "Mash avocado with lemon, salt and pepper.",
      "Spread on toast.",
      "Serve and enjoy."
    ],
    nutrition: "220 kcal, 6g protein, 25g carbs",
    color: RECIPE_COLORS[0]
  },
  {
    id: 2,
    name: "Lemon Chicken",
    ingredients: ["Chicken Breast", "Lemon", "Olive Oil", "Garlic", "Thyme"],
    steps: [
      "Marinate chicken with lemon, oil, garlic, thyme.",
      "Pan fry each side until golden.",
      "Finish with lemon zest.",
      "Serve hot."
    ],
    nutrition: "380 kcal, 25g protein, 5g carbs",
    color: RECIPE_COLORS[1]
  },
  {
    id: 3,
    name: "Veggie Stir-Fry",
    ingredients: ["Broccoli", "Carrot", "Bell Pepper", "Soy Sauce", "Ginger"],
    steps: [
      "Chop veggies.",
      "Stir fry in oil with ginger.",
      "Add soy sauce and cook till crisp-tender.",
      "Serve with rice."
    ],
    nutrition: "190 kcal, 7g protein, 35g carbs",
    color: RECIPE_COLORS[2]
  },
  {
    id: 4,
    name: "Caprese Salad",
    ingredients: ["Tomato", "Mozzarella", "Basil", "Olive Oil", "Salt"],
    steps: [
      "Slice tomato and mozzarella.",
      "Layer with basil leaves.",
      "Drizzle olive oil and sprinkle salt.",
      "Serve."
    ],
    nutrition: "250 kcal, 9g protein, 6g carbs",
    color: RECIPE_COLORS[3]
  }
];

// --- Helper Functions ----
const getRandomInt = (max) => Math.floor(Math.random() * max);

/**
 * PUBLIC_INTERFACE
 * IngredientWheel - A more diverse and random ingredient spinner wheel.
 * Selects random non-repeating ingredients from all available recipes for each spin session.
 * On spin, returns the chosen ingredient to the parent (so the app can trigger a search or recipe suggestion using that ingredient).
 */
function IngredientWheel({ allIngredients, onSpinResult, spinning, setSpinning }) {
  const [rotation, setRotation] = useState(0);
  const [spinDisabled, setSpinDisabled] = useState(false);
  const [wheelIngredients, setWheelIngredients] = useState([]);

  // Generate new random, non-repeating wheel ingredients when the wheel mounts (or on demand)
  useEffect(() => {
    // Create a random selection of unique ingredients from allIngredients
    function getRandomSample(arr, n) {
      // Fisher-Yates shuffle for unbiased selection
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, Math.min(n, a.length));
    }
    setWheelIngredients(getRandomSample(allIngredients, 12)); // 12 segments, or less if too few ingredients
  }, [allIngredients, spinning]);

  // Initiate the spin
  const handleSpin = () => {
    if (spinning || !wheelIngredients.length) return;
    setSpinning(true);
    setSpinDisabled(true);

    // Select a random ingredient index
    const count = wheelIngredients.length;
    const targetIdx = getRandomInt(count);
    const baseRot = 1440;
    const slice = 360 / count;
    const targetAngle = (count - targetIdx) * slice + getRandomInt(slice);
    const finalRotation = baseRot + targetAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setSpinDisabled(false);
      onSpinResult(wheelIngredients[targetIdx]);
    }, 2000);
  };

  const wheelStyle = {
    transition: spinning ? 'transform 2s cubic-bezier(0.33, 1, 0.68, 1)' : 'none',
    transform: `rotate(${rotation}deg)`
  };

  return (
    <div className="roulette-wheel-container">
      <div className="roulette-wheel" style={wheelStyle}>
        {wheelIngredients.length === 0 ? (
          <div className="wheel-segment" style={{ color: PRIMARY }}>
            Add more recipes!
          </div>
        ) : (
          wheelIngredients.map((ingredient, idx) => {
            const angle = (360 / wheelIngredients.length) * idx;
            const itemStyle = {
              transform: `rotate(${angle}deg) translateY(-50%)`,
              backgroundColor: RECIPE_COLORS[idx % RECIPE_COLORS.length],
              color: PRIMARY,
            };
            return (
              <div key={idx} className="wheel-segment" style={itemStyle}>
                {ingredient}
              </div>
            );
          })
        )}
      </div>
      <div className="wheel-pointer" />
      <button
        className="spin-btn"
        style={{ background: PRIMARY, color: SECONDARY }}
        onClick={handleSpin}
        disabled={spinDisabled}
        aria-label="Spin for an ingredient"
      >
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </button>
    </div>
  );
}

// --- Recipe Details Component ---
function RecipeCard({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="recipe-card" style={{ borderColor: recipe.color || PRIMARY }}>
      <button className="close-btn" onClick={onClose} aria-label="Close details">&times;</button>
      <h2>{recipe.name}</h2>
      <h4>Ingredients</h4>
      <ul>
        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>
      <h4>Steps</h4>
      <ol>
        {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
      </ol>
      <div className="nutrition">{recipe.nutrition}</div>
    </div>
  );
}

// --- Ingredient Search Bar ---
function IngredientSearch({ onSearch }) {
  const [input, setInput] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim()) {
      onSearch(input.trim());
      setInput("");
    }
  };

  const handleSearchClick = () => {
    if (input.trim()) {
      onSearch(input.trim());
      setInput("");
    }
  };

  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        placeholder="Search by ingredient..."
        aria-label="Enter ingredient"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button
        className="search-btn"
        style={{ background: ACCENT, color: PRIMARY }}
        onClick={handleSearchClick}
        aria-label="Search for ingredient"
      >
        Search
      </button>
    </div>
  );
}

// --- Challenge Me Modal ---
function ChallengeMeModal({ open, onClose, onChallenge }) {
  const [leftover, setLeftover] = useState("");

  if (!open) return null;

  const handleChallenge = () => {
    if (leftover.trim()) {
      onChallenge(leftover.trim());
      setLeftover("");
      onClose();
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
        <h3>'Challenge Me' Mode</h3>
        <p>Enter your fridge leftovers (comma separated):</p>
        <input
          className="search-input"
          type="text"
          placeholder="e.g. eggs, cheese, spinach"
          value={leftover}
          onChange={e => setLeftover(e.target.value)}
        />
        <button
          className="challenge-submit-btn"
          style={{ background: PRIMARY, color: SECONDARY }}
          onClick={handleChallenge}
        >
          Find Recipes
        </button>
      </div>
    </div>
  );
}

// --- Recipe List/Grid ---
function RecipeResults({ recipes, onSelect }) {
  if (!recipes || recipes.length === 0) {
    return <div className="results-empty">No matching recipes found.</div>;
  }
  return (
    <div className="results-list">
      {recipes.map((recipe, idx) =>
        <div
          key={recipe.id}
          className="result-card"
          style={{ background: recipe.color || SECONDARY, borderColor: recipe.color || PRIMARY }}
          onClick={() => onSelect(recipe)}
        >
          <h3>{recipe.name}</h3>
          <div className="mini-ingredients">
            {recipe.ingredients.slice(0, 3).join(", ")}
            {recipe.ingredients.length > 3 ? "..." : ""}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * PUBLIC_INTERFACE
 * Main App Component - now passes all unique ingredients to the IngredientWheel.
 * When an ingredient is spun, triggers a search for recipes using that ingredient.
 */
function App() {
  const [recipes] = useState(MOCK_RECIPES);

  // Unique, deduplicated, alphabetized global ingredient pool from all recipes
  const ingredientPool = Array.from(
    new Set(recipes.flatMap(r => r.ingredients))
  ).sort((a, b) => a.localeCompare(b));

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [spinning, setSpinning] = useState(false);

  // Handler: Outcome when ingredient is spun
  const handleSpinResult = (ingredient) => {
    // Spin result now gives ingredient, not recipe object
    handleIngredientSearch(ingredient);
  };

  // Handler: Ingredient search (used by IngredientWheel, ingredient search bar)
  const handleIngredientSearch = (q) => {
    const searchTerm = q.toLowerCase();
    const matches = recipes.filter(r =>
      r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
    setSearchResults(matches);
    setShowResults(true);
    setSelectedRecipe(null);
  };

  /**
   * PUBLIC_INTERFACE
   * Handles the 'Challenge Me' mode by taking a comma-separated ingredient input,
   * and finding all recipes that can be fully made from those leftovers.
   * If no such recipe exists, shows closest matches (at least one leftover matches any recipe ingredient).
   * Sets results for display.
   *
   * @param {string} leftovers - Comma-separated string of user leftover ingredients.
   */
  const handleChallenge = (leftovers) => {
    const items = leftovers
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(s => !!s);

    // "Full match": can make recipe if ALL leftovers are present in the recipe's ingredients
    const fullMatches = recipes.filter(r =>
      items.length > 0 && items.every(item =>
        r.ingredients.map(x => x.toLowerCase()).includes(item)
      )
    );

    if (fullMatches.length > 0) {
      setSearchResults(fullMatches);
    } else {
      // If no full match, find "close matches": any overlap of leftovers with recipe ingredients
      const closeMatches = recipes
        .map(r => {
          const overlapCount = r.ingredients
            .map(x => x.toLowerCase())
            .filter(ing => items.includes(ing)).length;
          return { ...r, overlapCount };
        })
        .filter(r => r.overlapCount > 0)
        .sort((a, b) => b.overlapCount - a.overlapCount);
      setSearchResults(closeMatches);
    }
    setShowResults(true);
    setSelectedRecipe(null);
  };

  // Select recipe from search/challenge results
  const openRecipeFromResults = (recipe) => {
    setSelectedRecipe(recipe);
    setShowResults(false);
  };

  // App main render
  return (
    <div className="vrroul-app">
      <nav className="main-header" style={{ background: PRIMARY }}>
        <span className="logo" style={{ color: SECONDARY }}>🍳 Recipe Roulette</span>
        <button
          className="challenge-btn"
          style={{ background: ACCENT, color: PRIMARY }}
          onClick={() => setShowChallengeModal(true)}
        >
          Challenge Me
        </button>
      </nav>
      <main className="main-content">
        <section className="left-pane">
          <IngredientWheel
            allIngredients={ingredientPool}
            onSpinResult={handleSpinResult}
            spinning={spinning}
            setSpinning={setSpinning}
          />
          <div className="helper-text">
            Spin the wheel for a surprise ingredient!
          </div>
        </section>
        <section className="right-pane">
          <IngredientSearch onSearch={handleIngredientSearch} />
          {showResults && (
            <div>
              <h4 style={{ color: PRIMARY }}>Results</h4>
              <RecipeResults recipes={searchResults} onSelect={openRecipeFromResults} />
            </div>
          )}
          {!showResults && !selectedRecipe && (
            <div className="empty-state">
              <span>Or search for a recipe by ingredient 👆</span>
            </div>
          )}
          {selectedRecipe && (
            <RecipeCard recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
          )}
        </section>
        <ChallengeMeModal
          open={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          onChallenge={handleChallenge}
        />
      </main>
      <footer className="main-footer">
        <span>Made with <span style={{ color: ACCENT }}>♥</span> for foodies — Virtual Recipe Roulette</span>
      </footer>
    </div>
  );
}

export default App;
