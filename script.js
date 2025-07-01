document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const transactionForm = document.getElementById("transaction-form");
  const typeToggle = document.querySelectorAll(".toggle-buttons button");
  const typeInput = document.getElementById("type");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");
  const transactionList = document.getElementById("transaction-list");
  const totalBalance = document.getElementById("total-balance");
  const totalIncome = document.getElementById("total-income");
  const totalExpense = document.getElementById("total-expense");
  const filterType = document.getElementById("filter-type");
  const filterCategory = document.getElementById("filter-category");

  // Initialize transactions from localStorage
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Set default date to today
  dateInput.valueAsDate = new Date();

  // Initialize the app
  init();

  function init() {
    // Event Listeners
    transactionForm.addEventListener("submit", addTransaction);
    typeToggle.forEach((button) => {
      button.addEventListener("click", toggleTransactionType);
    });
    filterType.addEventListener("change", filterTransactions);
    filterCategory.addEventListener("change", filterTransactions);

    updateUI();
  }

  // Toggle between income/expense
  function toggleTransactionType(e) {
    typeToggle.forEach((button) => button.classList.remove("active"));
    e.target.classList.add("active");
    typeInput.value = e.target.dataset.type;
  }

  // Add new transaction
  function addTransaction(e) {
    e.preventDefault();

    const transaction = {
      id: Date.now(),
      type: typeInput.value,
      amount:
        parseFloat(amountInput.value) *
        (typeInput.value === "expense" ? -1 : 1),
      description: descriptionInput.value,
      category: categoryInput.value,
      date: dateInput.value,
    };

    transactions.push(transaction);
    saveTransactions();
    updateUI();
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
  }

  // Update all UI elements
  function updateUI() {
    updateBalance();
    updateTransactionList();
    updateCategoryFilter();
  }

  // Update balance summary
  function updateBalance() {
    const amounts = transactions.map((t) => t.amount);
    const income = amounts.filter((a) => a > 0).reduce((sum, a) => sum + a, 0);
    const expense =
      amounts.filter((a) => a < 0).reduce((sum, a) => sum + a, 0) * -1;
    const balance = income - expense;

    totalBalance.textContent = formatCurrency(balance);
    totalIncome.textContent = formatCurrency(income);
    totalExpense.textContent = formatCurrency(expense);
  }

  // Update transaction list
  function updateTransactionList() {
    transactionList.innerHTML = "";

    if (transactions.length === 0) {
      transactionList.innerHTML =
        '<p class="empty-message">No transactions yet. Add one to get started!</p>';
      return;
    }

    const filtered = filterTransactions();

    filtered.forEach((transaction) => {
      const item = document.createElement("div");
      item.className = `transaction-item ${transaction.type}`;

      item.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-title">${
                      transaction.description
                    }</div>
                    <div class="transaction-meta">
                        <span>${transaction.category}</span>
                        <span>${formatDate(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${transaction.amount > 0 ? "+" : ""}${formatCurrency(
        transaction.amount
      )}
                </div>
                <button class="delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;

      transactionList.appendChild(item);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", function () {
        deleteTransaction(parseInt(this.dataset.id));
      });
    });
  }

  // Filter transactions
  function filterTransactions() {
    const type = filterType.value;
    const category = filterCategory.value;

    return transactions.filter((transaction) => {
      const typeMatch =
        type === "all" ||
        (type === "income" && transaction.amount > 0) ||
        (type === "expense" && transaction.amount < 0);

      const categoryMatch =
        category === "all" || transaction.category === category;

      return typeMatch && categoryMatch;
    });
  }

  // Update category filter options
  function updateCategoryFilter() {
    // Get all unique categories from transactions
    const categories = ["all"];
    transactions.forEach((transaction) => {
      if (!categories.includes(transaction.category)) {
        categories.push(transaction.category);
      }
    });

    // Update dropdown
    filterCategory.innerHTML = categories
      .map(
        (category) =>
          `<option value="${category}">${
            category.charAt(0).toUpperCase() + category.slice(1)
          }</option>`
      )
      .join("");
  }

  // Delete transaction
  function deleteTransaction(id) {
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    updateUI();
  }

  // Save to localStorage
  function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }

  // Helper: Format currency
  function formatCurrency(amount) {
    return "$" + Math.abs(amount).toFixed(2);
  }

  // Helper: Format date
  function formatDate(dateString) {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
});
