var users;
var user; // Declare user as a global variable

// Function to read users from users.json
async function readUsers() {
    try {
        const response = await fetch('/users.json'); // Fetch the users.json file
        if (!response.ok) {
            throw new Error("Failed to fetch users.json");
        }
        return await response.json(); // Parse and return the JSON data
    } catch (error) {
        console.error("Error reading users.json:", error);
        return [];
    }
}

async function initializeUsers() {
    users = await readUsers(); // Call the new readUsers function
    console.log("Users loaded:", users); // Debugging
    window.users = users; // Expose users globally for iframe access
    startHome();
}

function startHome() {
    const username = localStorage.getItem("username") || "defaultUser"; // Fallback to "defaultUser"
    console.log("Retrieved username:", username);

    user = users.find(u => u.username === username); // Find the user by username

    if (user) {
        console.log("User found:", user);
        document.getElementById("sidebar-profile").innerHTML = `<p>Welcome ${user.username}!</p>`;
        window.currentUser = user; // Expose the user globally for iframe access
    } else {
        console.error("User not found in the users array!");
    }
}

// Function to add spending for the current user
async function addRecordtoDB(spendingObject, typeOfDB) {
    console.log("Adding record to DB:", spendingObject, typeOfDB); // Debugging
    try {
        // Access the current user from the parent window
        const user = window.parent.currentUser;
        const last_balance = user.balance[user.balance.length - 1];
        if (!user) {
            console.error("User is not available in the parent window.");
            return;
        }

        let tochange;

        // Determine which database to update based on typeOfDB
        if (typeOfDB === "addExpense") {
            let new_balance = last_balance - spendingObject.amount;
            if (new_balance < 0) {
                alert("Insufficient balance: "+spendingObject.amount+" is more than your current balance: "+last_balance);
                return; // Exit the function if balance goes negative
            }
            tochange = user.spendings;
        } else if (typeOfDB === "addIncome") {
            tochange = user.earnings;
        } else if (typeOfDB === "addBudget") {
            tochange = user.budget;
        } else {
            console.error(`Invalid typeOfDB: ${typeOfDB}`);
            return; // Exit the function if typeOfDB is invalid
        }

        // Ensure tochange is defined
        if (!tochange) {
            console.error("The target database (tochange) is undefined.");
            return;
        }

        // Get the last spending ID and calculate the next ID
        const toChangeIDs = Object.keys(tochange).map(id => parseInt(id, 10));
        const nextId = toChangeIDs.length > 0 ? Math.max(...toChangeIDs) + 1 : 1;

        // Add the new spending object with the calculated ID
        tochange[nextId] = spendingObject;

        console.log(`Record added successfully for user "${user.username}" with ID ${nextId}.`);
        console.log("Updated records:", tochange);

        // Update balance and display based on typeOfDB
        let new_balance;

        if (typeOfDB === "addExpense") {
            new_balance = last_balance - spendingObject.amount;
            user.balance.push(new_balance); // Update the balance
            console.log("Updated balance:", user.balance);
            displayExpenses();
        } else if (typeOfDB === "addIncome") {
            new_balance = last_balance + spendingObject.amount;
            user.balance.push(new_balance); // Update the balance
            console.log("Updated balance:", user.balance);
            displayIncomes();
        } else if (typeOfDB === "addBudget") {
            displayAllBudgets();
        }

        // Optionally, update the users.json file on the server (if applicable)
        await updateUsersOnServer(window.parent.users); // Use the parent window's users array
    } catch (error) {
        console.error("Error adding record:", error);
    }
}

// ...existing code...

// Example function to send updated users to the server (requires backend support)
async function updateUsersOnServer(updatedUsers) {
    try {
        const response = await fetch('http://localhost:3000/update-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUsers)
        });

        if (!response.ok) {
            throw new Error("Failed to update users on the server");
        }

        console.log("Users updated successfully on the server.");
    } catch (error) {
        console.error("Error updating users on the server:", error);
    }
}

// ...existing code...

// Display expenses in a table

function displayExpenses() {
    const user = window.parent.currentUser;
    const table = document.getElementById("expenses-table");
    table.innerHTML = ""; // Clear existing rows

    // Create table headers
    const headers = ["ID", "DATE", "CATEGORY", "AMOUNT"];
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate the table with expenses

    for (const id in user.spendings) {
        const spending = user.spendings[id];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${id}</td>
            <td>${spending.date}</td>
            <td>${spending.category}</td>
            <td>${spending.amount}</td>
        `;
        table.appendChild(row);
    }
}

// display incomes in a table
function displayIncomes() {
    const user = window.parent.currentUser;
    const table = document.getElementById("incomes-table");
    table.innerHTML = "";

    // Create table headers
    const headers = ["ID", "DATE", "SOURCE", "AMOUNT"];
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate the table with incomes
    for (const id in user.earnings) {
        const earning = user.earnings[id];
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${id}</td>
            <td>${earning.date}</td>
            <td>${earning.source}</td>
            <td>${earning.amount}</td>
        `;
        table.appendChild(row);
    }
}

function displayAllBudgets() {
    const user = window.parent.currentUser;
    const allBudgetsContainer = document.getElementById("all-budgets");
    allBudgetsContainer.innerHTML = ""; // Clear the container

    for (const id in user.budget) {
        const element = user.budget[id];
        const eachBudget = document.createElement("div");
        eachBudget.className = "each-budget";

        // Create the budget content
        eachBudget.innerHTML = `
            <p>For: ${element.for}</p>
            <p>Target: ₹${element.target}</p>
            <p>Current Amount: ₹${element.current}</p>
        `;

        // Create the delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-budget-button";
        deleteBtn.innerHTML = `<img src="delete.png" alt="Delete" />`;

        deleteBtn.addEventListener("click", () => deleteBudget(id));
        eachBudget.appendChild(deleteBtn);

        allBudgetsContainer.appendChild(eachBudget);
        if (element.current >= element.target) {
            eachBudget.classList.add("budget-reached"); // Add class if budget is reached
            eachBudget.addEventListener("click", () => {
                triggerConfetti(); // Trigger confetti animation
            });
        } else {
            eachBudget.classList.add("budget-unreached"); // Add class if budget is reached
            eachBudget.addEventListener("click", () => sendBudgetToNextDiv(id));
        }
    }
}
function triggerConfetti() {
    confetti({
        particleCount: 100, // Number of confetti particles
        spread: 70, // Spread angle
        origin: { y: 0.6 } // Start position (y-axis)
    });
}

function sendBudgetToNextDiv(id) {
    const user = window.parent.currentUser;
    const element = user.budget[id];
    document.getElementById('budget-details').innerHTML = `
        For: ${element.for}<br>
        Target: ₹${element.target}<br>
        Current Amount: ₹${element.current}
    `;
    document.getElementById('detailed-budget').classList.remove('hidden');
    const addAmountBtn = document.getElementById('add-amount-btn');
    addAmountBtn.replaceWith(addAmountBtn.cloneNode(true)); // Remove existing listeners
    document.getElementById('add-amount-btn').addEventListener('click', async function () {
        let newcurrent = document.getElementById('add-amount').value;
        newcurrent = parseInt(newcurrent, 10);
        if (isNaN(newcurrent)) {
            alert("Please enter a valid number.");
            return;
            } else {
                element.current += newcurrent;
                document.getElementById('detailed-budget').classList.add('hidden');
            document.getElementById('add-amount').value = ""; // Clear the input field
            displayAllBudgets(); // Refresh the budget display
            user.budget[id] = element; // Update the user object with the new budget
            await updateUsersOnServer(window.parent.users); // Update the server with the new budget
        }
    });
}

function deleteBudget(id) {
    // confirm if the user wants to delete the budget
    const confirmDelete = confirm("Are you sure you want to delete this budget? This action cannot be undone.");

    if (!confirmDelete) {
        return; // Exit the function if the user cancels
    }
    // Proceed with deletion if the user confirms
    const user = window.parent.currentUser;
    delete user.budget[id]; // Remove the budget from the user's budget object
    displayAllBudgets(); // Refresh the budget display
    updateUsersOnServer(window.parent.users); // Update the server with the new budget
}

function getBalanceList() {
    const user = window.parent.currentUser;
    const list = user.balance;
    return list;
}