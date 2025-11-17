// Mock user data
export const mockUser = {
  id: 1,
  name: "Shivam Jha",
  email: "Shivam@budgetflow.com",
  avatar: "https://ui-avatars.com/api/?name=Shivam+Kumar&background=14b8a6&color=fff"
};
// Mock transactions
export const mockTransactions = [
  {
    id: 1,
    type: "expense",
    category: "Food",
    amount: 450,
    description: "Dinner at restaurant",
    date: "2025-11-10",
    time: "19:30"
  },
  {
    id: 2,
    type: "expense",
    category: "Transport",
    amount: 200,
    description: "Uber ride",
    date: "2025-11-10",
    time: "14:20"
  },
  {
    id: 3,
    type: "income",
    category: "Salary",
    amount: 75000,
    description: "Monthly salary",
    date: "2025-11-01",
    time: "09:00"
  },
  {
    id: 4,
    type: "expense",
    category: "Shopping",
    amount: 2500,
    description: "New shirt",
    date: "2025-11-09",
    time: "16:45"
  },
  {
    id: 5,
    type: "expense",
    category: "Bills",
    amount: 1800,
    description: "Electricity bill",
    date: "2025-11-08",
    time: "11:00"
  },
  {
    id: 6,
    type: "expense",
    category: "Food",
    amount: 350,
    description: "Groceries",
    date: "2025-11-07",
    time: "18:00"
  },
  {
    id: 7,
    type: "expense",
    category: "Entertainment",
    amount: 800,
    description: "Movie tickets",
    date: "2025-11-06",
    time: "20:00"
  },
  {
    id: 8,
    type: "income",
    category: "Freelance",
    amount: 5000,
    description: "Website project",
    date: "2025-11-05",
    time: "15:30"
  }
];
// Mock budgets
export const mockBudgets = [
  {
    id: 1,
    category: "Food",
    limit: 10000,
    spent: 800,
    icon: "🍔",
    color: "#ef4444"
  },
  {
    id: 2,
    category: "Transport",
    limit: 5000,
    spent: 200,
    icon: "🚗",
    color: "#3b82f6"
  },
  {
    id: 3,
    category: "Shopping",
    limit: 15000,
    spent: 2500,
    icon: "🛍️",
    color: "#8b5cf6"
  },
  {
    id: 4,
    category: "Bills",
    limit: 8000,
    spent: 1800,
    icon: "💡",
    color: "#f59e0b"
  },
  {
    id: 5,
    category: "Entertainment",
    limit: 5000,
    spent: 800,
    icon: "🎬",
    color: "#ec4899"
  },
  {
  id: 6, // or next available number
  category: "Booze",
  limit: 2000,      // set whatever budget you want
  spent: 0,         // or a test value
  icon: "🍺",
  color: "#ffb300"
}

];
// Category chart data
export const categoryChartData = [
  { name: 'Food', value: 800, color: '#ef4444' },
  { name: 'Transport', value: 200, color: '#3b82f6' },
  { name: 'Shopping', value: 2500, color: '#8b5cf6' },
  { name: 'Bills', value: 1800, color: '#f59e0b' },
  { name: 'Entertainment', value: 800, color: '#ec4899' }
];
// Monthly trend data
export const monthlyTrendData = [
  { month: 'May', income: 75000, expense: 45000 },
  { month: 'Jun', income: 80000, expense: 52000 },
  { month: 'Jul', income: 75000, expense: 48000 },
  { month: 'Aug', income: 85000, expense: 55000 },
  { month: 'Sep', income: 75000, expense: 47000 },
  { month: 'Oct', income: 90000, expense: 58000 },
  { month: 'Nov', income: 80000, expense: 6100 }
];
// Categories list
export const categories = [
  { value: "Food", label: "Food 🍔", color: "#ef4444" },
  { value: "Transport", label: "Transport 🚗", color: "#3b82f6" },
  { value: "Shopping", label: "Shopping 🛍️", color: "#8b5cf6" },
  { value: "Bills", label: "Bills 💡", color: "#f59e0b" },
  { value: "Entertainment", label: "Entertainment 🎬", color: "#ec4899" },
  { value: "Health", label: "Health 🏥", color: "#10b981" },
  { value: "Education", label: "Education 📚", color: "#06b6d4" },
  { value: "Booze", label: "Booze 🍺", color: "#ffb300" },
  { value: "Other", label: "Other 📦", color: "#6b7280" }
];

