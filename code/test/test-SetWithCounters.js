const SetWithCounters = require('../crdts/set-with-counters.js');

const json1 = { "banana": {"add": 4, "remove": 1}, "grape": {"add": 2, "remove": 0}, "orange": {"add": 6, "remove": 0} };
const json2 = { "banana": {"add": 1, "remove": 0}, "grape": {"add": 5, "remove": 1}, "orange": {"add": 6, "remove": 1} ,"watermelon": {"add": 4, "remove": 2} };

// expectedResult = { "banana": {"add": 4, "remove": 1}, "grape": {"add": 5, "remove": 1}, "orange": {"add": 6, "remove": 1} ,"watermelon": {"add": 4, "remove": 2} };

const set1 = new SetWithCounters(json1);
const set2 = new SetWithCounters(json2);

const mergedSet = set1.merge(set2);
mergedSet.saveToFile('newApproachMergeTest.json');

// Test with add and remove operations
let set3 = mergedSet.add('banana', 2);
set3 = set3.add('apple', 2);
// expected result = 
//{ "banana": {"add": 6, "remove": 1}, "grape": {"add": 5, "remove": 1}, "orange": {"add": 6, "remove": 1} ,"watermelon": {"add": 4, "remove": 2}, "apple": {"add": 2, "remove": 0} };
set3.saveToFile('addTwoBananasAndTwoApples.json')

const json4 = { "banana": {"add": 4, "remove": 1}, "grape": {"add": 5, "remove": 1}, "orange": {"add": 6, "remove": 1} ,"watermelon": {"add": 4, "remove": 2} };
let set4 = new SetWithCounters(json4);
set4 = set4.remove('banana', 2);
// expected result = { "banana": {"add": 4, "remove": 3}, "grape": {"add": 5, "remove": 1}, "orange": {"add": 6, "remove": 1} ,"watermelon": {"add": 4, "remove": 2} };
set4.saveToFile('removeTwoBananas.json');