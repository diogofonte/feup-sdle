document.addEventListener("DOMContentLoaded", function() {
    const codeButton = document.getElementById("listCodeButton");
    const newCodeButton = document.getElementById("newListCodeButton");
    const codeInput = document.getElementById("listCode");
    
    function manageCode(code, message) {
        // Send a POST request to update the JSON file on the server
        fetch('/manage-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, message }),
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = '/shopping-list.html';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    codeButton.addEventListener("click", function() {
        const code = codeInput.value.trim();
        if (code !== "") {
            manageCode(code, null);
            codeInput.value = "";
        }
    });

    newCodeButton.addEventListener("click", function() {
        manageCode(null, "new list");
    });
});