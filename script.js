// Initialize variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentCurrency = localStorage.getItem('currency') || 'aed';
let currencySymbols = {
    'inr': '₹',
    'aed': 'د.إ',
    'usd': '$'
};

// DOM elements
const balanceAmount = document.getElementById('balanceAmount');
const incomeAmount = document.getElementById('incomeAmount');
const expenseAmount = document.getElementById('expenseAmount');
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const emptyState = document.getElementById('emptyState');
const currencyButtons = document.querySelectorAll('.currency-btn');
const themeToggle = document.getElementById('themeToggle');

// Set active currency button
currencyButtons.forEach(button => {
    if (button.dataset.currency === currentCurrency) {
        button.classList.add('active');
    } else {
        button.classList.remove('active');
    }
});

// Update UI with transactions
function updateUI() {
    // Calculate totals
    let balance = 0;
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
            income += amount;
            balance += amount;
        } else {
            expense += amount;
            balance -= amount;
        }
    });
    
    // Update balance display
    balanceAmount.textContent = `${currencySymbols[currentCurrency]}${balance.toFixed(2)}`;
    incomeAmount.textContent = `${currencySymbols[currentCurrency]}${income.toFixed(2)}`;
    expenseAmount.textContent = `${currencySymbols[currentCurrency]}${expense.toFixed(2)}`;
    
    // Update transaction list
    transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionList.appendChild(emptyState);
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display only the 5 most recent transactions
    const recentTransactions = sortedTransactions.slice(0, 5);
    
    recentTransactions.forEach((transaction, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'transaction-item';
        
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        
        listItem.innerHTML = `
            <div class="transaction-details">
                <span class="transaction-name">${transaction.name}</span>
                <span class="transaction-date">${formattedDate} · ${transaction.category}</span>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'} ${currencySymbols[currentCurrency]}${parseFloat(transaction.amount).toFixed(2)}
            </div>
            <div class="transaction-actions">
                <button class="action-btn delete-btn" data-id="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        transactionList.appendChild(listItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.dataset.id);
            deleteTransaction(id);
        });
    });
}

// Add new transaction
function addTransaction(e) {
    e.preventDefault();
    
    const name = document.getElementById('transactionName').value;
    const amount = document.getElementById('transactionAmount').value;
    const type = document.getElementById('transactionType').value;
    const category = document.getElementById('transactionCategory').value;
    
    if (name.trim() === '' || amount <= 0) {
        alert('Please enter a valid name and amount');
        return;
    }
    
    const newTransaction = {
        name,
        amount,
        type,
        category,
        date: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    saveTransactions();
    updateUI();
    
    // Reset form
    transactionForm.reset();
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions.splice(id, 1);
        saveTransactions();
        updateUI();
    }
}

// Save transactions to localStorage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Change currency
function changeCurrency(currency) {
    currentCurrency = currency;
    localStorage.setItem('currency', currency);
    
    // Update active button
    currencyButtons.forEach(button => {
        if (button.dataset.currency === currency) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    updateUI();
}

// Toggle theme
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update icon
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Event listeners
transactionForm.addEventListener('submit', addTransaction);

currencyButtons.forEach(button => {
    button.addEventListener('click', function() {
        changeCurrency(this.dataset.currency);
    });
});

themeToggle.addEventListener('click', toggleTheme);

// Transaction Type Selection
const typeButtons = document.querySelectorAll('.type-btn');
const transactionTypeInput = document.getElementById('transactionType');
const incomeCategories = document.querySelector('.income-categories');
const expenseCategories = document.querySelector('.expense-categories');

typeButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        typeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update hidden input value
        const type = this.dataset.type;
        transactionTypeInput.value = type;
        
        // Show/hide appropriate category groups
        if (type === 'income') {
            incomeCategories.style.display = 'grid';
            expenseCategories.style.display = 'none';
            
            // Reset active class on expense categories
            expenseCategories.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Select first income category
            const firstIncomeCategory = incomeCategories.querySelector('.category-btn');
            if (firstIncomeCategory) {
                firstIncomeCategory.classList.add('active');
                selectCategory(firstIncomeCategory);
            }
        } else {
            incomeCategories.style.display = 'none';
            expenseCategories.style.display = 'grid';
            
            // Reset active class on income categories
            incomeCategories.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Select first expense category
            const firstExpenseCategory = expenseCategories.querySelector('.category-btn');
            if (firstExpenseCategory) {
                firstExpenseCategory.classList.add('active');
                selectCategory(firstExpenseCategory);
            }
        }
    });
});

// Category Selection
const selectedCategory = document.getElementById('selectedCategory');
const categoryTray = document.querySelector('.category-tray');
const categoryButtons = document.querySelectorAll('.category-btn');
const transactionCategoryInput = document.getElementById('transactionCategory');

// Toggle category tray
selectedCategory.addEventListener('click', function() {
    categoryTray.classList.toggle('open');
});

// Close category tray when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.category-selector')) {
        categoryTray.classList.remove('open');
    }
});

// Select category
categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
        selectCategory(this);
        categoryTray.classList.remove('open');
    });
});

function selectCategory(categoryBtn) {
    if (!categoryBtn) return;
    
    // Remove active class from all buttons
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    categoryBtn.classList.add('active');
    
    // Update hidden input value
    transactionCategoryInput.value = categoryBtn.dataset.category;
    
    // Get the icon and text from the button
    const iconClass = categoryBtn.querySelector('i').className;
    const categoryText = categoryBtn.querySelector('span') ? 
                         categoryBtn.querySelector('span').textContent : 
                         categoryBtn.dataset.category;
    
    // Update selected category display
    selectedCategory.innerHTML = `
        <i class="${iconClass} category-icon"></i>
        <span>${categoryText}</span>
    `;
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial transaction type
    const initialType = transactionTypeInput.value || 'income';
    const activeTypeBtn = document.querySelector(`.type-btn[data-type="${initialType}"]`);
    if (activeTypeBtn) {
        activeTypeBtn.classList.add('active');
    }
    
    // Show appropriate category group
    if (initialType === 'income') {
        incomeCategories.style.display = 'grid';
        expenseCategories.style.display = 'none';
        
        // Find active income category or select first one
        const activeIncomeCategory = incomeCategories.querySelector('.category-btn.active') || 
                                    incomeCategories.querySelector('.category-btn');
        if (activeIncomeCategory) {
            selectCategory(activeIncomeCategory);
        }
    } else {
        incomeCategories.style.display = 'none';
        expenseCategories.style.display = 'grid';
        
        // Find active expense category or select first one
        const activeExpenseCategory = expenseCategories.querySelector('.category-btn.active') || 
                                     expenseCategories.querySelector('.category-btn');
        if (activeExpenseCategory) {
            selectCategory(activeExpenseCategory);
        }
    }
});

// Initialize UI
updateUI();