import { useState } from "react";
import { useRef } from "react";
import "../CSS/BudgetCalculator.css";
import RevealOnScroll from "./RevealOnScroll";

export default function BudgetCalculator() {
    const [incomes, setIncomes] = useState([
        { type: "Salary", amount: "", taxDeducted: "" },
        { type: "Freelance", amount: "" },
        { type: "Passive", amount: "" },
    ]);
    const [expenses, setExpenses] = useState([
        { category: "Rent/Mortgage", amount: "" },
        { category: "Utilities", amount: "" },
        { category: "Groceries", amount: "" },
        { category: "Transport", amount: "" },
        { category: "Dining Out", amount: "" },
        { category: "Entertainment", amount: "" },
        { category: "Shopping", amount: "" },
        { category: "Travel", amount: "" },
        { category: "Loans", amount: "" },
        { category: "Credit Cards", amount: "" },
        { category: "Emergency Fund", amount: "" },
        { category: "SIPs", amount: "" },
        { category: "Retirement", amount: "" },
    ]);
    const [customCategories, setCustomCategories] = useState<string[]>([]);
    const [customCategoryInput, setCustomCategoryInput] = useState("");

    const handleAddCustomCategory = () => {
        if (customCategoryInput.trim() && !customCategories.includes(customCategoryInput.trim())) {
            setCustomCategories([...customCategories, customCategoryInput.trim()]);
            setCustomCategoryInput("");
        }
    };

    const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const explanationRef = useRef<HTMLDivElement>(null);
    
    return (
        <>
        <div className="budget-bg">
            <div
                className="budget-scroll-link"
                style={{
                    textAlign: "center",
                    marginBottom: "1.5rem",
                    color: "#7c4dff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    textDecoration: "none"
                }}
                onClick={() => {
                    explanationRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
            >
                Click on the text to know how to use Budget Calculator
            </div>
            <div className="budget-card">
                <h2 className="budget-card-title">Budget Calculator</h2>
                <form className="budget-form">
                    <section>
                        <h2 className="budget-section-title">Income Streams</h2>
                        {incomes.map((income, idx) => (
                            <div className="budget-row" key={income.type}>
                                <label className="budget-label">{income.type}</label>
                                <input
                                  className="budget-input"
                                  type="number"
                                  min="0"
                                  placeholder="Amount"
                                  value={income.amount}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const newIncomes = [...incomes];
                                    newIncomes[idx].amount = val === "" ? "" : Math.max(0, Number(val)).toString();
                                    setIncomes(newIncomes);
                                  }}
                                  onWheel={e => e.currentTarget.blur()}
                                />
                                {income.type === "Salary" && (
                                    <input className="budget-input" type="number" placeholder="Tax Deducted" value={income.taxDeducted} onChange={e => {
                                        const newIncomes = [...incomes];
                                        newIncomes[idx].taxDeducted = e.target.value;
                                        setIncomes(newIncomes);
                                    }}/>
                                )}
                            </div>
                        ))}
                    </section>
                    <section>
                        <h2 className="budget-section-title">Expense Categories</h2>
                        {expenses.map((expense, idx) => (
                            <div className="budget-row" key={expense.category}>
                                <label className="budget-label">{expense.category}</label>
                                <input
                                  className="budget-input"
                                  type="number"
                                  min="0"
                                  placeholder="Amount"
                                  value={expense.amount}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const newExpenses = [...expenses];
                                    newExpenses[idx].amount = val === "" ? "" : Math.max(0, Number(val)).toString();
                                    setExpenses(newExpenses);
                                  }}
                                  onWheel={e => e.currentTarget.blur()}
                                />
                            </div>
                        ))}
                        {customCategories.map(cat => (
                            <div className="budget-row" key={cat}>
                                <label className="budget-label">{cat}</label>
                                <input className="budget-input" type="number" placeholder="Amount" />
                            </div>
                        ))}
                        <div className="budget-row">
                            <input className="budget-input" type="text" placeholder="Add custom category" value={customCategoryInput} onChange={e => setCustomCategoryInput(e.target.value)}/>
                            <button type="button" className="budget-btn" onClick={handleAddCustomCategory}>Add</button>
                        </div>
                    </section>
                </form>
                <div className="budget-summary">
                    <div>
                        <b>Total Income:</b> ₹{totalIncome}
                    </div>
                    <div>
                        <b>Total Expenses:</b> ₹{totalExpenses}
                    </div>
                    <div>
                    <b>Net Savings:</b> ₹{totalIncome - totalExpenses}
                    </div>
                </div>
            </div>
        </div>
        <div className="budget-bg">
        <RevealOnScroll as="h1" className="budget-explanation-title">How to Use the Budget Calculator :</RevealOnScroll>
            <div className="budget-explanation" ref={explanationRef}>
                <RevealOnScroll as="p" style={{marginTop:"-2.2rem"}}>
                    Enter your monthly income sources and expenses below. The calculator will show your total income, expenses, and net savings. Use custom categories for anything not listed.
                </RevealOnScroll>
                <RevealOnScroll as="h3" style={{fontSize:"1.8rem"}}>Income Streams :</RevealOnScroll>
                <RevealOnScroll as="ul">
                    <li><span className="budget-gradient-text"><b>Salary:</b></span> Your main job’s income (enter your take-home pay after tax deductions).</li>
                    <li><span className="budget-gradient-text"><b>Freelance:</b></span> Side gigs, contract work, or any irregular income.</li>
                    <li><span className="budget-gradient-text"><b>Passive:</b></span> Money you earn regularly without active work (e.g., rent, dividends).</li>
                </RevealOnScroll>
                <RevealOnScroll as="h3" style={{fontSize:"1.8rem"}}>Expense Categories :</RevealOnScroll>
                <RevealOnScroll as="ul">
                    <li><span className="budget-gradient-text"><b>Essentials:</b></span> Must-haves like Rent/Mortgage, Utilities, and Groceries.</li>
                    <li><span className="budget-gradient-text"><b>Discretionary:</b></span> Wants such as Dining Out, Entertainment, Shopping, and Travel.</li>
                    <li><span className="budget-gradient-text"><b>Debt Payments:</b></span> Loans and Credit Card payments.</li>
                    <li><span className="budget-gradient-text"><b>Savings & Investments:</b></span> Emergency Fund, SIPs, and Retirement savings.</li>
                    <li><span className="budget-gradient-text"><b>Transport:</b></span> Daily commuting (bus, fuel, metro).</li>
                    <li><span className="budget-gradient-text"><b>Custom Categories:</b></span> Add your own (e.g., Pet Care, Gifts) for anything not covered above.</li>
                </RevealOnScroll>
                <RevealOnScroll as="p">
                    <span className="budget-gradient-text"><b>Tip:</b></span> Your net savings will update automatically as you enter your details.
                </RevealOnScroll>
            </div>
        </div>
        </>
    );
}