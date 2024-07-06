const AddWinSet = require('../crdts/add-win-set.js');

const json1 = { "banana": 3, "grape": 2, "orange": 5 };
const json2 = { "banana": 1, "grape": 4, "watermelon": 2 };

// expectedResult = { "banana": 1, "grape": 4, "orange": 5, "watermelon": 2 };

const set1 = new AddWinSet(json1, 1);
const set2 = new AddWinSet(json2, 4);

const mergedSet = set1.merge(set2);
console.log("vector clock set 1: " + set1.vectorClock); // expected 1
console.log("vector clock set 2: " + set2.vectorClock); // expected 4
mergedSet.saveToFile('mergedSet.json');

//-------------------------------------------------------------------
console.log("Second test: check vector clocks")
const initialJson = { "apple": 3, "banana": 2, "orange": 5 };

let shoppingList = new AddWinSet(initialJson);
shoppingList = shoppingList.add('banana', 1)
console.log(shoppingList.vectorClock); // expected 1
shoppingList = shoppingList.add('grape', 4);
console.log(shoppingList.vectorClock); // expected 2
shoppingList = shoppingList.remove('orange', 5);
console.log(shoppingList.vectorClock); // expected 3
shoppingList.saveToFile('finalSet.json');

// expectedResult = { "apple": 3, "banana": 3, "orange": 0, "grape": 4 };