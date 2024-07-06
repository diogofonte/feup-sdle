document.addEventListener("DOMContentLoaded", function() {
    // Get references to the HTML elements
    const shoppingList = document.getElementById("shopping-list");
    const addItemButton = document.getElementById("add");
    const nameInput = document.getElementById("name");
    const desiredQuantityInput = document.getElementById("desired-quantity");
    const title = document.getElementById("title");
    const mergeButton = document.getElementById("merge");

    mergeButton.addEventListener("click", function() {
        fetch('/merge-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = '/shopping-list.html';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Add an event listener for click
    title.addEventListener("click", function() {
        window.location.href = '/';
    });

    document.getElementById('desired-quantity').addEventListener('input', function() {
        // Replace any non-digit characters with an empty string
        this.value = this.value.replace(/\D/g, '');
    });

    function addListItem(name, desiredQuantity) {
        // Convert the name to lowercase for comparison
        const lowercaseName = name.toLowerCase();
    
        // Check if an item with the same name already exists
        const existingItem = Array.from(shoppingList.children).find(item => item.dataset.name.toLowerCase() === lowercaseName);
    
        if (existingItem) {
            // If an item with the same name exists, update its quantity
            const existingQuantity = parseInt(existingItem.dataset.quantity);
            const newQuantity = existingQuantity + desiredQuantity;
            const quantityDifference = newQuantity - existingQuantity;
            existingItem.dataset.quantity = newQuantity;
            existingItem.querySelector(".quantity").textContent = newQuantity; // Update the quantity in the span
            updateQuantity(lowercaseName, quantityDifference);
        } else {
            // If no item with the same name exists, create a new list item
            const listItem = document.createElement("li");
            listItem.dataset.name = lowercaseName; // Save the lowercase name in the dataset
            listItem.dataset.quantity = desiredQuantity;
            updateQuantity(lowercaseName, desiredQuantity);
    
            // Create a span to display the quantity
            const quantitySpan = document.createElement("span");
            quantitySpan.textContent = desiredQuantity;
            quantitySpan.className = "quantity";
    
            const capitalizedDisplayName = capitalizeFirstLetter(name);
            listItem.textContent = `${capitalizedDisplayName} (Desired Quantity: `;
    
            // Create buttons to update the quantity
            const increaseButton = document.createElement("button");
            increaseButton.textContent = "+";
            const decreaseButton = document.createElement("button");
            decreaseButton.textContent = "-";
    
            // Add event listeners to the buttons
            increaseButton.addEventListener("click", function() {
                desiredQuantity++;
                listItem.dataset.quantity = desiredQuantity;
                quantitySpan.textContent = desiredQuantity; // Update the quantity in the span
                updateQuantity(lowercaseName, 1);
            });
    
            decreaseButton.addEventListener("click", function() {
                desiredQuantity--;
                listItem.dataset.quantity = desiredQuantity;
    
                if (desiredQuantity === 0) {
                    shoppingList.removeChild(listItem); // Remove item if quantity is 0
                    updateQuantity(lowercaseName, -1);
                } else {
                    quantitySpan.textContent = desiredQuantity; // Update the quantity in the span
                    updateQuantity(lowercaseName, -1);
                }
            });
    
            // Append the span and buttons to the list item
            listItem.appendChild(quantitySpan);
            listItem.appendChild(increaseButton);
            listItem.appendChild(decreaseButton);
            shoppingList.appendChild(listItem);
        }
    }   

    function createListItem(name, desiredQuantity) {
        const lowercaseName = name.toLowerCase();
        const listItem = document.createElement("li");
        listItem.dataset.name = lowercaseName; // Save the lowercase name in the dataset
        listItem.dataset.quantity = desiredQuantity;
        updateQuantity(lowercaseName, 0);

        // Create a span to display the quantity
        const quantitySpan = document.createElement("span");
        quantitySpan.textContent = desiredQuantity;
        quantitySpan.className = "quantity";

        const capitalizedDisplayName = capitalizeFirstLetter(name);
        listItem.textContent = `${capitalizedDisplayName} (Desired Quantity: `;

        // Create buttons to update the quantity
        const increaseButton = document.createElement("button");
        increaseButton.textContent = "+";
        const decreaseButton = document.createElement("button");
        decreaseButton.textContent = "-";

        // Add event listeners to the buttons
        increaseButton.addEventListener("click", function() {
            desiredQuantity++;
            listItem.dataset.quantity = desiredQuantity;
            quantitySpan.textContent = desiredQuantity; // Update the quantity in the span
            updateQuantity(lowercaseName, 1);
        });
    
        decreaseButton.addEventListener("click", function() {
            desiredQuantity--;
            listItem.dataset.quantity = desiredQuantity;

            if (desiredQuantity === 0) {
                shoppingList.removeChild(listItem); // Remove item if quantity is 0
                updateQuantity(lowercaseName, -1);
            } else {
                quantitySpan.textContent = desiredQuantity; // Update the quantity in the span
                updateQuantity(lowercaseName, -1);
            }
        });

        // Append the span and buttons to the list item
        quantitySpan.textContent += ") ";
        listItem.appendChild(quantitySpan);
        listItem.appendChild(increaseButton);
        listItem.appendChild(decreaseButton);
        shoppingList.appendChild(listItem);
    }
    

    // Function to update the quantity on the server
    function updateQuantity(name, quantityDifference) {
        // Send a POST request to update the JSON file on the server
        fetch('/update-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, quantityDifference}),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // Log the response from the server
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Function to handle the "Enter" key event
    function handleEnterKey(event) {
        if (event.key === "Enter") {
            addItemButton.click();
        }
    }

    // Add event listener to the "Add" button
    addItemButton.addEventListener("click", function() {
        const name = nameInput.value.trim();
        let desiredQuantity = desiredQuantityInput.value.trim();

        if (name !== "") {
            // Set quantity to 1 if it's empty
            if (desiredQuantity === "") {
                desiredQuantity = 1;
                addListItem(name, desiredQuantity);
            } else {
                desiredQuantity = parseInt(desiredQuantity);
                if (desiredQuantity >0) {
                    addListItem(name, desiredQuantity);
                }
            }
            // Clear the input fields
            nameInput.value = "";
            desiredQuantityInput.value = "";
        }
    });

    function fetchInitialData() {
        fetch('/api/shopping-list')
            .then(response => {
                if (response.redirected) {
                    // Handle redirection
                    window.location.href = response.url;
                    return Promise.reject('Redirection occurred');
                } else {
                    return response.json();
                }
            })
            .then(data => {
                title.textContent = `Shopping List ${data.code}`;

                for (const itemName in data.itemsList) {
                    const quantity = data.itemsList[itemName]["add"] - data.itemsList[itemName]["remove"];
                    if(quantity>0){createListItem(itemName, quantity);}
                }
            })
            .catch(error => {
                console.error('Error fetching initial data:', error);
            });
    }
    
    
    function capitalizeFirstLetter(str) {
        // Check if str is defined
        if (str) {
            // Convert special characters to their standard counterparts
            const normalizedStr = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // Capitalize the first letter of each word
            const capitalizedStr = normalizedStr.replace(/\b\w/g, c => c.toUpperCase());

            return capitalizedStr;
        } else {
            // If str is not defined, return an empty string or handle it as needed
            return '';
        }
    }

    
    
    

    // Call the function to fetch and display the initial data when the page loads
    fetchInitialData();

    // Add event listener to the input fields for pressing Enter key
    nameInput.addEventListener("keypress", handleEnterKey);
    desiredQuantityInput.addEventListener("keypress", handleEnterKey);
});
