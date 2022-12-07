import '../style/RadioButtons.scss'

import { useEffect,
            useState } from 'react'

export default function RadioButtonLargeSquare(props){
    return (
        <div>
        <label>
            <input value={props.value} type="radio" name={props.name} id={props.id} onChange={props.onChange}/>
            <div className={`${props.class} box`}>
                <span>{props.text}</span>
            </div>
        </label>
        </div>
    )
}

export function SliderRange(props){
    var value = props.value;
    var [currentLegend, setCurrentLegend] = useState('');

    useEffect (() => {
        if (props.legendList){
            const legendIndex = parseInt(value/props.stepAmt) - parseInt(props.min/props.stepAmt); 
            setCurrentLegend (props.legendList[legendIndex]);
            console.log(currentLegend);
        }
    }, [value])

    if (props.stepAmt){
        const stepList = props.stepList.map((value) => {
            <option>{value}</option>
        })
        return (
            <div className='slide-container'>
                <legend>{props.legend}</legend>
                <input name={props.name} type="range" min={props.min} max={props.max} onChange={props.onChange} value={value} step={props.stepAmt} list={props.listName}/>
                <datalist id="steplist">
                    {stepList}
                </datalist> <br></br>
                {currentLegend}
            </div>
        )
    }
    else {
        return (
            <div className="slide-container">
                <legend>{props.legend}</legend>
                <input name={props.name} type="range" min={props.min} max={props.max} onChange={props.onChange} value={value}></input> <br></br>
                <input name={props.name} type="number" min={props.min} max={props.max} onChange={props.onChange} value={value}></input>
            </div>
        )
    }

} 

export function LargeOutputResult(props){
    if (props.positiveOnly){
        if (props.value <= 0){
            return (
                <div class="large-output invalid">
                    <span>
                        {props.name}
                    </span> 
                    <div>
                        <p>{props.name} must be positive!</p>
                    </div>
                </div>
            )
        }
    }

    return (
        <div class="large-output">
            <span>
                {props.name}
            </span>
            <div>
                <p class={`large-text ${props.color}`} > {props.value}{props.suffix}</p>
            </div>
        </div>
    )
}

export function Button(props){
    return (
        <button class={`button-${props.size}`}id={props.id} disabled={props.disableCondition} onClick={props.onClick} >
            {props.innerText}
        </button>
    )
}