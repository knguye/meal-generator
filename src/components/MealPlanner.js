import '../style/App.css';

import {
  useState,
  useEffect,
  React,
} from 'react';

import CircularSlider from '@fseehawer/react-circular-slider';

import MealGenerator from './MealGenerator'

import RadioButtonLargeSquare, { LargeOutputResult, SliderRange } from './Utils';

function MealPlanner() {
  async function wakeUpServerAPI() {
    try {
        await fetch(`${process.env.REACT_APP_PROXY_SERVER}/health`,
        {
            method: "GET",
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            }
        })
        .then ((response) => response.json())
        .then ((body) => {
            console.log("Waking up API");
        })
    }
    catch (e) {
        console.log(e)
    }
}
  useEffect(() => {
    wakeUpServerAPI();
  })

  return (
    <>
      <header class='main-header'>
        <h1>Meal Generator</h1>
      </header>
      <div id="app">
        <MacroCalculator/>
      </div>
    </>
  );
}


const MacroCalculator = () => {
  const [proteinPercentage, setProteinPercentage] = useState(0);
  const [carbsPercentage, setCarbsPercentage] = useState(0);
  const [fatPercentage, setFatPercentage] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);

  const [physicalInfo, setPhysicalInfo] = useState({
    sex: "male",
    age: 25,
    height: 172,
    weight: 80,
    offset: 0
  });

  const [matches, setMatches] = useState(
    window.matchMedia("(min-width: 768px)").matches
  )

  const handleProteinChange = (value) => {
    setProteinPercentage(value);
  }

  const handleCarbChange = (value) => {
    setCarbsPercentage(value);
  }

  const handleFatChange = (value) => {
    setFatPercentage(value);
  }

  const handleBodyChanges = (e) => {
    const { name, value } = e.target;
    var validatedValue = formValidation(e);
    
    setPhysicalInfo((prevInfo) => ({
      ...prevInfo, 
      [name]: validatedValue
    }));
    
  }

  const formValidation = (e) => {
    const value = e.target.value;
    var validatedValue = 0;

    if ((e.target.min || e.target.max)){
      const min = parseInt(e.target.min);
      const max = parseInt(e.target.max);

      if (value < min){
        validatedValue = e.target.min;
      }
      else if (value > max){
        validatedValue = e.target.max;
      }
      else {
        validatedValue = e.target.value;
      }
    }
    else {
      validatedValue = e.target.value;
    }

    return validatedValue;
  }

  useEffect( () => {
    calculateDailyCaloriesFromBMI();

    window
      .matchMedia("(min-width: 768px)")
      .addEventListener('change', e => setMatches( e.matches ));
    console.log(physicalInfo);
  }, [physicalInfo]);

  const calculateDailyCaloriesFromBMI = () => {
    // Get the weight, height and set calories
    var isMale = physicalInfo.sex === "male" ? true : false;
    var BMR = 0;

    if (isMale){
      BMR = 66.5 + ( 13.75 * physicalInfo.weight ) + (5.003 * physicalInfo.height) - (6.75 * physicalInfo.age);
    }
    else {
      BMR = 655.1 + (9.563 * physicalInfo.weight) + (1.850 * physicalInfo.height) - (4.676 * physicalInfo.age);
    }

    BMR = Math.floor(BMR);

    if (physicalInfo.offset !== 0){
      const offsetCaloriesPerDay = Math.floor((parseFloat(physicalInfo.offset) * 7700) / 7); 
      setDailyCalories(BMR + offsetCaloriesPerDay);
    }
    else {
      setDailyCalories(BMR);
    }

  }


  return (
    <>
    <div id="macro-calculator">
      <header className={"sub-header"}>
        <h2>Instructions</h2>
      </header>
      <div id="instructions" className="section">
        <ol>
          <li>Set your macros (in percentages) to total 100%</li>
          <li>Enter your physical info (height, weight, sex) and how much weight you want to lose per week.</li>
          <li>Click the Generate Meals button!</li>
          <li>Click each meal for more details.</li>
        </ol>
      </div>
    </div>
    <MacroSliders handleProteinChange={handleProteinChange} 
                  handleCarbChange={handleCarbChange} 
                  handleFatChange={handleFatChange} matches={matches}/>
    <MacroResults protein={proteinPercentage} 
                  carbs={carbsPercentage} 
                  fat={fatPercentage} 
                  dailyCalories={dailyCalories} 
                  isList={false}/>
    <BMIValues macroPercentages={[proteinPercentage, carbsPercentage, fatPercentage]} 
                physicalInfo={physicalInfo} 
                handleBodyChanges={handleBodyChanges} 
                dailyCalories={dailyCalories}/>
    <MealGenerator macroPercentages={[proteinPercentage, carbsPercentage, fatPercentage]} dailyCalories={dailyCalories}/>
    </>
  )
}

const BMIValues = (props) => {
  const physicalInfo = props.physicalInfo;

  const legendList = ["Lose 1kg/week", "Lose .75kg/week", "Lose .5kg/week", "Lose .25kg/week", 'Maintain (0kg)', 'Gain .25kg/week','Gain .5kg/week', 'Gain .75kg/week', 'Gain 1kg/week'];
  
  return (
    <>
      <header className="sub-header">
      <h2>BMI & Calorie Info</h2>
    </header>

    <div id="bmi-values" className="section">
      <form>
      <div class="form-container top">
        <div id="sex-buttons">
          <RadioButtonLargeSquare class="male" value="male" name="sex" id="sex-male" text="Male" onChange={props.handleBodyChanges}/>
          <RadioButtonLargeSquare class="female" value="female" name="sex" id="sex-female" text="Female" onChange={props.handleBodyChanges}/>
        </div>
        
        <SliderRange name={`weight`} legend={`Weight (kg)`} min={`0`} max={`300`} defaultValue={`70`}  units={`kg`}
                    onChange={props.handleBodyChanges} value={physicalInfo.weight} convertedUnits={`lbs`} convertedRatio={2.205}/>
        <SliderRange name={`height`} legend={`Height (cm)`} min={`0`} max={`220`} defaultValue={`170`} units={`cm`}
                    onChange={props.handleBodyChanges} value={physicalInfo.height} convertedUnits={`ft-in`} convertedRatio={1/2.54}/>
      </div>
    <div class="form-container bottom" >
        <SliderRange name={`age`} legend={`Age`} min={`0`} max={`100`} defaultValue={`25`} 
                      onChange={props.handleBodyChanges} value={physicalInfo.age}/>
        <SliderRange name={`offset`} legend={`How much weight would you like to lose/gain?`} 
                    min={`-1`} max={`1`} defaultValue={'0'} onChange={props.handleBodyChanges} 
                    value={physicalInfo.offset} stepAmt={.25} legendList={legendList} stepList={[-1, -0.75, -0.5, -0.25, 0, .25, .5, .75, 1]}/>
    </div>
    <div class="section">
      <LargeOutputResult name={`Calories`} value={props.dailyCalories} positiveOnly={true}/>
    </div>
    </form>  
    </div>



  </>
  )
}

const MacroWheel = (props) => {
  return (
    <CircularSlider 
        min={0}
        max={100}
        appendToValue={`%`}
        onChange={ value => props.onMacroChange(value) }
        label={props.label}
        labelColor={props.color}
        knobColor={props.color}
        progressColorFrom={props.progFromColor}
        progressColorTo={props.progToColor}
        progressSize={20}
        trackSize={15}
        width={200}/>
  )
}

const MacroResults = (props) => {
  const totalPercent = props.protein + props.carbs + props.fat; 

  if (totalPercent !== 100 && !props.isList){
    return (
      <div id="macro-results" className="invalid section">
        <p>All of your macros must equal 100% combined.</p>
        <p>Total %: {totalPercent}</p>
      </div>
    )
  }

  const totalProtein = Math.ceil(props.dailyCalories * (props.protein/100) / 4);
  const totalCarbs = Math.ceil(props.dailyCalories * (props.carbs/100) / 4);
  const totalFat = Math.ceil(props.dailyCalories * (props.fat/100) / 9);

  if (props.isList){
    return (
      <div class="col-container">
          <div class="macro-text">Protein: <b>{totalProtein}g</b></div>
          <div class="macro-text">Carbs: <b>{totalCarbs}g</b></div>
          <div class="macro-text">Fat: <b>{totalFat}g</b></div>
      </div>
    )
  }
  
  return (
      <div id="macro-results" className="section">
        <div class="green"><p>{`Protein: ${totalProtein}g`}</p></div>
        <div class="blue"><p>{`Carbs: ${totalCarbs}g`} </p></div>
        <div class="red"><p>{`Fat: ${totalFat}g`} </p> </div>
      </div>
  )
}

const MacroSliders = (props) => {
  return (
    <>
      <header class="sub-header">
        <h2>Macros</h2>
      </header>
     
        <div id="macro-values" className="section">
          <MacroWheel label={`Protein`} color={`#91C499`} progFromColor={`#5C9C65`} progToColor={`#7EDB8B`} onMacroChange={props.handleProteinChange}/>
          <MacroWheel label={`Carbs`} color={`#20A4F3`} progFromColor={`#3482AF`} progToColor={`#46B0EE`} onMacroChange={props.handleCarbChange}/>
          <MacroWheel label={`Fat`} color={`#CE2F2F`} progFromColor={`#A73B3B`} progToColor={`#E55151`} onMacroChange={props.handleFatChange}/>
        </div>

  </>
  )
}

export default MealPlanner;
