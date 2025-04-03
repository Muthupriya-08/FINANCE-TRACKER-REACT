import React, { useState, useEffect } from 'react';
import './App.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function App() {
  const [transaction, setTransaction] = useState({
    description: '',
    amount: '',
    type: 'income',
  });

  const [transactions, setTransactions] = useState([]);
  const [editIndex, setEditIndex] = useState(-1); // -1 means not in edit mode

  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    // Request notification permission on load
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleChange = (e) => {
    setTransaction({
      ...transaction,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!transaction.description || !transaction.amount) {
      alert("Please fill in both description and amount.");
      return;
    }

    if (editIndex === -1) {
      // Add new transaction
      setTransactions([...transactions, transaction]);

      // Show notification on adding transaction
      if (Notification.permission === 'granted') {
        new Notification("New Transaction Added", {
          body: `You added ${transaction.description} of ${transaction.amount} ${transaction.type}`,
        });
      }
    } else {
      // Update existing transaction
      const updatedTransactions = [...transactions];
      updatedTransactions[editIndex] = transaction;
      setTransactions(updatedTransactions);
      setEditIndex(-1);
    }
    // Reset the form
    setTransaction({ description: '', amount: '', type: 'income' });
  };

  const handleDelete = (index) => {
    const newTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(newTransactions);
    // If we're editing the deleted transaction, reset the form.
    if (editIndex === index) {
      setEditIndex(-1);
      setTransaction({ description: '', amount: '', type: 'income' });
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setTransaction(transactions[index]);
  };

  const totalIncome = transactions.reduce((acc, cur) => {
    return cur.type === 'income' ? acc + parseFloat(cur.amount) : acc;
  }, 0);

  const totalExpense = transactions.reduce((acc, cur) => {
    return cur.type === 'expense' ? acc + parseFloat(cur.amount) : acc;
  }, 0);

  const balance = totalIncome - totalExpense;

  // Pie Chart data
  const data = [
    { name: 'Income', value: totalIncome },
    { name: 'Expense', value: totalExpense }
  ];

  // Pie Chart colors
  const COLORS = ['#4caf50', '#f44336'];

  return (
    <div className="container">
      <h1>💸 Finance Tracker 💸</h1>

      <blockquote className="quote">
        "💡 Financial freedom is a journey, not a destination. Keep tracking and stay motivated! 💡"
      </blockquote>

      <div className="summary">
        <h3>Summary</h3>
        <p>💰 Total Income: ${totalIncome.toFixed(2)}</p>
        <p>💸 Total Expense: ${totalExpense.toFixed(2)}</p>
        <p><strong>💵 Balance: ${balance.toFixed(2)}</strong></p>
      </div>

      {/* Pie Chart */}
      <div className="pie-chart">
        <h3>Income vs Expense</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Description:</label>
          <input
            type="text"
            name="description"
            value={transaction.description}
            onChange={handleChange}
            placeholder="e.g., Salary, Groceries..."
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            name="amount"
            value={transaction.amount}
            onChange={handleChange}
            placeholder="e.g., 100"
          />
        </div>
        <div>
          <label>Type:</label>
          <select
            name="type"
            value={transaction.type}
            onChange={handleChange}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <button type="submit">
          {editIndex === -1 ? 'Add Transaction 🚀' : 'Update Transaction ✏️'}
        </button>
      </form>

      {/* Transactions List */}
      <h2>Transactions</h2>
      <ul className="transaction-list">
        {transactions.length > 0 ? (
          transactions.map((trans, index) => (
            <li key={index}>
              <span>
                {trans.description} - ${parseFloat(trans.amount).toFixed(2)} ({trans.type})
              </span>
              <div>
                <button className="edit-btn" onClick={() => handleEdit(index)}>Edit ✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(index)}>Delete ❌</button>
              </div>
            </li>
          ))
        ) : (
          <li className="no-transactions">No transactions added yet. Start adding your journey! ✨</li>
        )}
      </ul>
    </div>
  );
}

export default App;
