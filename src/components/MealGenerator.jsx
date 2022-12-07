import '../style/App.css';

import {
  useState,
  React,
  useEffect,
} from 'react';

import {
    getRandomEntryFromList,
}

from '../scripts/utils';

import {
    LargeOutputResult,
    Button
} from './Utils'

var accessToken = '';

// TODO: Only enable the meal generate button when macros are filled in to 100%
export default function MealGenerator(props) {

    // TODO: Display all meals in three columns for each time of day
    const [meals, setMeals] = useState([]);
    const [currentFood, setCurrentFood] = useState();
    const [mealPanels, setMealPanels] = useState([]);
    const [showMealDetails, setShowMealDetails] = useState(false);
    const [totalResults, setTotalResults] = useState({
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0
    });

    useEffect(() => {
        setMealPanels(meals.map((val, i) => (
            <MealPanel name={val.recipe_name} 
                        image={val.recipe_image} 
                            desc={val.recipe_description} 
                                nutrition={val.recipe_nutrition}
                                    ingredients={val.recipe_ingredients} />
        )));
    }, [meals]);

    const handleTotalResults = (calAmt, proteinAmt, carbsAmt, fatAmt) => {
        setTotalResults((prevInfo) => ({
            calories: Math.round(parseFloat(prevInfo.calories) + parseFloat(calAmt)),
            protein: Math.round(parseFloat(prevInfo.protein) + parseFloat(proteinAmt)),
            carbs: Math.round(parseFloat(prevInfo.carbs) + parseFloat(carbsAmt)),
            fat: Math.round(parseFloat(prevInfo.fat) + parseFloat(fatAmt)),
        }));
    }

    async function getFoodById(id) {
        try {
            await fetch(`/get_food/${id}`,
            {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                }
            })
            .then ((response) => response.json())
            .then ((foodInfo) => {
                console.log(foodInfo);
                //setCurrentFood(foodInfo.food);
            })
        }
        catch (e) {
            console.log(e)
        }
    }

    async function generateSingleMeal(mealMacros, mealCalories){
        try {
            return fetch(`/find_recipe/${mealMacros[0]}/${mealMacros[1]}/${mealMacros[2]}/${mealCalories}`, 
            {
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => response.json())
                .then((results) => {   
                    // Find a suitable meal with our meal macros and calories
                    return findSuitableMeal(results, mealMacros, mealCalories);
                })
        }
        catch(e){
            console.log(e);
        }
    }

    async function findSuitableMeal(results, mealMacros, mealCalories){
        const recipes = results.recipes.recipe;
        /*
        1. Look at recipe_nutrition
        2. Find percentage for macros with the nutrition
        3. Compare those to mealMacros
        4. Prioritize protein +- 2.5%, then calories +-50, then carbs +- 2.5 and fats..
        5. If it fits those macros, add it to a list of valid meals
        6. Return a random entry from that list of valid meals
        */
        var possibleMeals = [];

        
        for (const recipeNum in recipes){
            const recipe = recipes[recipeNum];
            const nutrition = recipe.recipe_nutrition;

            const macroPercentages = [4 * (nutrition.protein/nutrition.calories) * 100, 
                                            4 * (nutrition.carbohydrate/nutrition.calories) * 100,
                                                9 * (nutrition.fat/nutrition.calories) * 100];
            const diffInFoodAndDesiredMacroPercents = [Math.abs(mealMacros[0]- macroPercentages[0]), 
                                                            Math.abs(mealMacros[1]- macroPercentages[1]),
                                                                Math.abs(mealMacros[2]- macroPercentages[2])];
        
            const diffInFoodAndDesiredCalories = Math.abs(mealCalories - nutrition.calories);

            if (diffInFoodAndDesiredMacroPercents[0] <= 5){ // Protein is pretty spot on
                possibleMeals.push(recipe);
            }
            else if (diffInFoodAndDesiredMacroPercents[0] <= 4){ // We'll settle for a little less or more protein
                if (diffInFoodAndDesiredMacroPercents[1] < 5.0 // And the carbs/fats
                                            || diffInFoodAndDesiredMacroPercents[2] > 5.0){
                    possibleMeals.push(recipe);
                }
            }      
        }

        // TODO: Prevent copies?
        const randomMeal = getRandomEntryFromList(possibleMeals);

        return randomMeal;
    }

    async function generateAllMeals(){
        // Split macros into meal portions (3 for now, but can be customized)
        console.log(`Daily Calories: ${props.dailyCalories}\nP: ${props.macroPercentages[0]}\nC: ${props.macroPercentages[1]}\nF: ${props.macroPercentages[2]}`)

        // TODO: Set value based on user input, allow calories allotted for each meal to be split from user input
        // TODO: Fix issue where people with higher calories (2400) can't get meals (because last meal is too large)
        var mealCount = 5 + Math.ceil(Math.abs(props.dailyCalories-2000)/250);
        var caloriesAdded = 0;

        // Clear out the recipes & results
        setMeals(meals => []);
        setTotalResults(
            {
                protein: 0,
                carbs: 0,
                fat: 0,
                calories: 0
            }
        )


        // TODO: Change from # of meals to number of calories left?
        for (var i = 0; (i < mealCount && caloriesAdded < props.dailyCalories); i++){
            try {
                var mealCalories = (props.dailyCalories-caloriesAdded)/(mealCount-i);
                console.log(mealCalories);
                const meal = await generateSingleMeal(props.macroPercentages, mealCalories);
                
                if (meal){
                    console.log(`Cal: ${meal.recipe_nutrition.calories}\n Meal: ${JSON.stringify(meal)}`);
                    caloriesAdded += parseInt(meal.recipe_nutrition.calories);
                    setMeals(meals => [...meals, meal]);
                    handleTotalResults(meal.recipe_nutrition.calories,
                                            meal.recipe_nutrition.protein,
                                            meal.recipe_nutrition.carbohydrate,
                                            meal.recipe_nutrition.fat)
                }
                else {
                    
                }
            }
            catch (e){
                console.log(e);
            }

        }

    }
    
    function MealDetails(props){
        const nutrition = props.nutrition;

        const ingredients = props.ingredients['ingredient'];

        const hideDetails = () => {
            setShowMealDetails(false);
            setCurrentFood();
        }
    
        return (
            <div class="meal-details">
                <div id="header">
                    {props.name}
                    <button id="cancel" onClick={hideDetails}>X</button>
                </div>
                <div class="container">
                    <img src={props.image}></img>
                    <div class="meal-details-nutrition">
                        <div>
                            <h2>Nutrition</h2>
                        </div>
                        <div class="macros">
                            <li>Calories: {nutrition.calories}</li>
                            <li>Protein: {nutrition.protein}</li>
                            <li>Carbs: {nutrition.carbohydrate}</li>
                            <li>Fat: {nutrition.fat}</li>
                        </div>
                    </div>
                    <div>
                        <div>
                            <h2>Ingredients</h2>
                            <div>
                                <ol class="bulleted">
                                    {ingredients.map((item) => (
                                        <li>{item}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    
    function MealPanel(props){
        // TODO: Add ability to "lock in" choice?
        const nutrition = props.nutrition;
    
        const handleOnClick = () => {
            /* 
                1. Pop up information over the entire meal generator
                2. Show the macros, description, name, ingredients with image
                3. Have a button that will close the component/hide it
            */ 
            setCurrentFood(
                {
                    nutrition: props.nutrition,
                    name: props.name,
                    image: props.image,
                    desc: props.desc,
                    ingredients: props.ingredients,
                }
            )

            setShowMealDetails(true);
        } 
    
        return (
            <div class="meal-panel" onClick={handleOnClick}>
                <div class="meal-info">
                <h2>{props.name}</h2>
                <h3>Nutrition:</h3>
                <ul>
                    <li>Calories: {nutrition.calories}</li>
                    <li>Protein: {nutrition.protein}</li>
                    <li>Carbs: {nutrition.carbohydrate}</li>
                    <li>Fat: {nutrition.fat}</li>
                </ul>
                </div>
    
                <img src={props.image}></img>
            </div>
        )
    }


    return (
      <>
        <Button size='large' id="generate-meals-button" 
                            disableCondition={(props.macroPercentages[0] + props.macroPercentages[1] + props.macroPercentages[2] !== 100) || props.dailyCalories <= 0} 
                            onClick={async () => { setShowMealDetails(false); await generateAllMeals();  } } 
                            innerText={`Generate Meals`}/>
        {mealPanels.length > 0 && <div id="meal-generator" class="section transparent">
            {!showMealDetails ? mealPanels : <MealDetails name={currentFood.name} 
                                                            image={currentFood.image} 
                                                            nutrition={currentFood.nutrition} 
                                                            desc={currentFood.desc} 
                                                            ingredients={currentFood.ingredients}/>}
        </div> }
        <header className="sub-header">
            <h2>Total Meal Macros</h2>
        </header>
        <div id="total-details" class="section">
            <LargeOutputResult name={`Calories`} value={totalResults.calories} />
            <LargeOutputResult name={`Protein`} value={totalResults.protein} suffix="g" color="green"/>
            <LargeOutputResult name={`Carbs`} value={totalResults.carbs} suffix="g" color="blue"/>
            <LargeOutputResult name={`Fat`} value={totalResults.fat} suffix="g" color="red"/>
        </div>
      </>
    );

  }


function Food(props) {
    return (
        <p>{props.name}</p>
    )
}

