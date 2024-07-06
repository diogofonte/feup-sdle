const fs = require('fs');

class AddWinSet {
  constructor(elements = {}, vectorClock = 0) {
    this.elements = elements;
    this.vectorClock = vectorClock;
  }

  add(item, quantityToAdd = 1) {
    const updatedVectorClock = this.vectorClock + 1;
    const newSet = new AddWinSet({ ...this.elements }, updatedVectorClock);

    if (newSet.contains(item)) {
      newSet.elements[item] += quantityToAdd;
    } else {
      newSet.elements[item] = quantityToAdd;
    }

    return newSet;
  }

  remove(item, quantityToRemove = 1) {
    const updatedVectorClock = this.vectorClock + 1;
    const newSet = new AddWinSet({ ...this.elements }, updatedVectorClock);
  
    if (newSet.contains(item)) {
      newSet.elements[item] = Math.max(0, newSet.elements[item] - quantityToRemove);
      // we don't delete the items with zero quantity, to have our ever-increasing lattice
    }
  
    return newSet;
  }

  contains(item) {
    return item in this.elements;
  }

  merge(otherSet) {
    let updatedVectorClock = this.vectorClock + 1;
    if (otherSet.vectorClock > this.vectorClock) {
      updatedVectorClock = otherSet.vectorClock + 1;
    }

    const mergedElements = { ...this.elements };

    for (const item in otherSet.elements) {
      const quantity = otherSet.elements[item];
      if (this.contains(item)) {
        if (quantity !== mergedElements[item] && otherSet.vectorClock > this.vectorClock) {
          mergedElements[item] = quantity;
        }
      } else {
          mergedElements[item] = quantity;
      }
    }

    return new AddWinSet(mergedElements, updatedVectorClock);
  }
  
  saveToFile(filename) {
    const jsonContent = JSON.stringify(this.elements, null, 2);
    fs.writeFileSync(filename, jsonContent);
    console.log(`Set saved to ${filename}`);
  }
}

module.exports = AddWinSet;