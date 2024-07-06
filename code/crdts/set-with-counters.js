const fs = require('fs');

class SetWithCounters {
  constructor(elements = {}) {
    this.elements = elements;
    // each item is going to be composed by two counters: add and remove counters
    // this.elements = {
    //   item1: {
    //     add: 1,
    //     remove: 0,
    //   },
    //   item2: {
    //     add: 1,
    //     remove: 0,
    //   },
    // }
    // The quantity of an elements["banana"] is going to be elements["banana"][0] - elements["banana"][1]
    // elements["item"][0] is the add counter
    // elements["item"][1] is the remove counter
  }

  add(item, quantityToAdd = 1) {
    const newSet = new SetWithCounters({ ...this.elements });

    if (newSet.contains(item)) {
      newSet.elements[item]["add"] += quantityToAdd;
    } else {
      newSet.elements[item] = {
        add: quantityToAdd,
        remove: 0,
      };
    }

    return newSet;
  }

  remove(item, quantityToRemove = 1) {
    const newSet = new SetWithCounters({ ...this.elements });
  
    if (newSet.contains(item)) {
      newSet.elements[item]["remove"] += quantityToRemove;
    }
  
    return newSet;
  }

  contains(item) {
    return item in this.elements;
  }

  merge(otherSet) {
    const mergedElements = { ...this.elements };

    for (const item in otherSet.elements) {
      if (this.contains(item)) {
        // updates add set
        if (otherSet.elements[item]["add"] > mergedElements[item]["add"]) {
          mergedElements[item]["add"] = otherSet.elements[item]["add"];
        }
        // updates remove set
        if (otherSet.elements[item]["remove"] > mergedElements[item]["remove"]) {
          mergedElements[item]["remove"] = otherSet.elements[item]["remove"];
        }
      } else {
        mergedElements[item] = {
          add: otherSet.elements[item]["add"],
          remove: otherSet.elements[item]["remove"],
        };
      }
    }

    return new SetWithCounters(mergedElements);
  }
  
  saveToFile(filename) {
    const jsonContent = JSON.stringify(this.elements, null, 2);
    fs.writeFileSync(filename, jsonContent);
    console.log(`Set saved to ${filename}`);
  }
}

module.exports = SetWithCounters;