function getRandomInt(max){
    return Math.floor(Math.random() * max)
}

export function getRandomEntryFromList(list){
    return list[getRandomInt(list.length)];
}