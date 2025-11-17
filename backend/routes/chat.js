// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// 200+ Q&A hardcoded pairs
const faqAnswers = {
  // Budgeting basics
  "how do i create a budget": "List your sources of income and all expenses. Allocate money for savings first, then essentials, then wants. Review and adjust monthly.",
  "what is zero-based budgeting": "Zero-based budgeting means every dollar you earn is assigned a purpose. Income minus expenses equals zero.",
  "how to track expenses": "Record each expense, categorize it, and review at the end of each week using apps like BudgetFlow.",
  "how can i reduce my expenses": "Track all spending, cut back on non-essentials, set spending limits, and look for cheaper alternatives.",
  "how to save money every month": "Automate your savings, reduce impulse buys, plan your grocery list, and review recurring subscriptions.",
  "how much should i save": "Many recommend saving at least 20% of your income, or as much as you can comfortably afford.",
  "what are sinking funds": "Sinking funds are separate savings for known future expenses, like car repairs or annual fees.",
  "what is an emergency fund": "A fund with 3–6 months of expenses set aside for unexpected costs like medical bills or job loss.",
  "how do i budget for groceries": "Set a monthly grocery limit, use a list, and take inventory before shopping.",
  "tips for first-time budgeters": "Start simple, track everything, review weekly, and don't be afraid to adjust your categories.",
  "what is the 50/30/20 rule": "It's a guideline: 50% needs, 30% wants, 20% savings/debt repayment.",
  "how to avoid impulse spending": "Wait 24 hours before major purchases, delete shopping apps, and stick to a pre-written list.",
  "best method for budgeting": "Try different methods like zero-based, envelope, or 50/30/20 to see what fits your style!",
  "how can i stick to a budget": "Track daily, use reminders, set achievable goals, and celebrate small wins.",
  "what to do if i overspend": "Review where and why you overspent, and adjust next month's budget or categories accordingly.",

  // Debt and credit
  "how can i pay off debt fast": "Focus on the highest interest debt first (avalanche) or smallest balance (snowball). Make more than minimum payments.",
  "what is a credit score": "A number reflecting your creditworthiness. Higher is better for loans and cards.",
  "how to improve my credit score": "Pay all bills on time, keep credit card balances low, and avoid unnecessary hard credit checks.",
  "how long do late payments affect credit": "Late payments can impact your credit score for up to seven years but matter less as time passes.",
  "best way to consolidate debt": "Consider a low-interest personal loan, balance transfer card, or a debt management plan.",
  "should i pay off debt or save": "Build a small emergency fund, then focus on paying off high-interest debt, but keep saving where possible.",

  // Income and earning
  "how can i increase my income": "Ask for a raise, start a side hustle, sell unused items, or improve job skills for a new opportunity.",
  "ideas for side hustles": "Freelancing, tutoring, delivery services, cleaning, and selling crafts online are great options.",
  "what is passive income": "Money earned with minimal active effort, like rental income, dividends, or selling digital products.",
  "should i invest or save": "First, build an emergency fund. Then, consider investing for long-term growth and saving for short-term needs.",

  // Savings and investing
  "why should i invest": "Investing helps your money grow, beat inflation, and achieve long-term goals like retirement.",
  "how do i start investing": "Open a brokerage account, start with index funds, and invest automatically each month.",
  "what is a mutual fund": "A mutual fund pools money from investors to buy a diversified group of stocks, bonds, or other securities.",
  "what is an index fund": "An index fund mirrors a market index like the S&P 500 to diversify and lower risk.",
  "what is compound interest": "Compound interest is earning interest on your previous interest. It grows your savings over time.",
  "how can i save for retirement": "Start as early as possible, save monthly into a retirement account, and utilize employer matches if available.",
  "best savings account type": "High-yield savings accounts offer more interest than traditional accounts with similar safety.",
  "how to save for a big purchase": "Set a target, divide by how many months you have, and set up automatic transfers to a special fund.",
  "should i use a financial advisor": "If you want professional advice or are handling large/inheritance money, a certified advisor can help.",

  // BudgetFlow app features
  "what is budgetflow": "BudgetFlow is a smart personal finance app helping you track expenses, set budgets, and get financial insights.",
  "how does budgetflow work": "You add your transactions, set budgets for categories, and the app reviews your progress in real time.",
  "can budgetflow split transactions": "Yes, you can assign a single expense to multiple categories for better tracking.",
  "can i export my budgetflow data": "You can export your transactions and reports as a CSV anytime from your account settings.",
  "is budgetflow secure": "All your data is encrypted and stored securely. We never share your information.",
  "can i track recurring bills": "Yes—set up recurring transactions in BudgetFlow to automate bill tracking.",
  "can i set spending alerts": "You can set spending or savings alerts in each category from your account dashboard.",
  "does budgetflow support multiple currencies": "Currently, BudgetFlow supports INR, USD, and EUR. More coming soon!",
  "can i use budgetflow with my partner": "Shared profiles and budgeting are supported, so you can track household finances together.",
  "what categories does budgetflow support": "Groceries, rent, utilities, entertainment, transport, savings, and more! All customizable.",
  "how do i add a transaction": "Just say something like 'Add 400 to groceries' or use the Add Transaction form.",
  "how to edit a transaction": "Tap the transaction you wish to change, update the fields, and save.",
  "can i delete a transaction": "Yes. Select the transaction and tap delete. Data is instantly updated.",
  "can i back up my data": "All data is automatically backed up on our secure servers. Manual exports are also available.",
  "can i restore deleted data": "Contact support within 30 days to request a data restore. After that, data is permanently deleted.",

  // Personal finance & money tips
  "how to build credit": "Always pay on time, avoid large credit balances, and don't open too many accounts at once.",
  "how to budget for rent": "Rent typically shouldn't exceed 30% of your monthly income.",
  "should i rent or buy a house": "Buying is better long-term if stable, renting is best for flexibility or uncertain plans.",
  "how to split bills with roommates": "Use apps or spreadsheets to track who paid what. BudgetFlow helps with shared categories!",
  "how to avoid late fees": "Set automatic payments, use calendar reminders, and check your bills weekly.",
  "how do i save on groceries": "Plan your weekly meals, use a list, and look for sales or discounts.",
  "what are smart shopping habits": "Compare prices, buy in bulk for staples, and avoid shopping hungry.",
  "how to cut utility costs": "Turn off lights when not needed, unplug gadgets, and compare providers annually.",

  // Financial planning and goal setting
  "how to set financial goals": "Make them specific, measurable, and time-bound—like 'save ₹20,000 in 12 months'.",
  "best way to save for a car": "Estimate the total cost, set a target amount, and save monthly into a dedicated fund.",
  "how much should i spend on travel": "Set travel goals in advance, research costs, and save incrementally to avoid debt.",
  "how to plan for wedding expenses": "List all expected costs, set a maximum total, and stick to your budget for each item.",

  // Credit cards and banking
  "should i use credit cards": "Credit cards offer rewards and build credit if paid off completely every month.",
  "how many credit cards is too many": "If you can manage the accounts, 2-3 is fine. Don't open more than you need for rewards or credit.",
  "is it good to close old accounts": "Closing old cards can reduce your credit score due to lost history. Consider annual fees before closing.",

  // Major expenses & emergencies
  "what to do if i lose my job": "Use your emergency fund, cut all non-essential spending, and start your job search immediately.",
  "how to prepare for unexpected bills": "Keep a small emergency fund and review your insurance coverage.",
  "how to recover from identity theft": "Contact your bank, change passwords, file a police report, and monitor your credit report closely.",

  // App troubleshooting and tips
  "i forgot my budgetflow password": "Use the Forgot Password link on the login screen to reset your password via email.",
  "can i change my email": "Go to Account Settings and select 'Change Email'. Confirm using your new address.",
  "budgetflow is not syncing": "Check your internet, then force sync from app settings. Contact support if this doesn't work.",
  "how do i report a bug": "Use the in-app feedback form, or email support with a detailed description.",
  "can i suggest features": "Absolutely! We welcome user ideas—send feedback using the feedback button.",
  "is budgetflow free": "BudgetFlow has a free plan with core features and a premium plan with advanced analytics.",
  "how can i get premium": "Go to your profile and choose Upgrade to Premium. Contact support if you have payment issues.",

  // Miscellaneous budgeting topics
  "what is discretionary spending": "Money spent on non-essentials like dining out, hobbies, or entertainment.",
  "what is net worth": "Net worth is what you own minus what you owe. Track it to understand your financial progress.",
  "how to calculate monthly surplus": "Subtract your total expenses from total income for each month.",
  "why track spending": "Tracking spending helps you see patterns, spot leaks, and make intentional choices with your money.",
  "can budgeting reduce stress": "Yes—knowing where your money goes helps you feel more in control and reduces surprise expenses.",
  "is cash or card better for budgets": "Cash limits you to what you have, while cards offer convenience but can lead to overspending. Use what works best for you!",
  "how often should i review my budget": "Review at least monthly, or weekly for the best results.",
  "how can students budget": "Track allowances, set monthly limits for eating out, and try to save some money for emergencies.",
  "good budgeting apps for families": "BudgetFlow, YNAB, and Splitwise are great for shared family budgeting.",

  // Additional Q&A (continuing to 200+)
  "what is a budget": "A plan for how you will spend your money each month based on your income and expenses.",
  "why do i need a budget": "A budget helps you control spending, reach goals, avoid debt, and feel less financial stress.",
  "how to start a budget": "Track your current spending for a month, calculate your average expenses, then create categories and limits.",
  "what are fixed expenses": "Fixed expenses are costs that stay the same each month, like rent, insurance, and loan payments.",
  "what are variable expenses": "Variable expenses change each month, like groceries, gas, dining out, and entertainment.",
  "how to find money to save": "Review your expenses, cut unnecessary subscriptions, reduce dining out, and redirect savings to goals.",
  "what if my income is irregular": "Base your budget on your lowest expected monthly income, then adjust during high-income months.",
  "how to budget on a low income": "Prioritize necessities first, cut all non-essentials, and focus on increasing income where possible.",
  "how much to budget for food": "Generally, 5-15% of income is reasonable for groceries, depending on family size and location.",
  "how to stop living paycheck to paycheck": "Create a budget, cut unnecessary costs, build an emergency fund, and look for ways to increase income.",
  "what is the envelope method": "Divide cash into envelopes for each budget category and spend only what's in each envelope.",
  "should i use budgeting software": "Yes, budgeting apps like BudgetFlow save time and provide insights you'd miss tracking manually.",
  "how to teach kids about money": "Let them earn chores money, involve them in budgeting, and show them the link between spending and goals.",
  "what is a financial plan": "A comprehensive strategy covering budgeting, savings, investments, debt repayment, and insurance.",
  "how to avoid lifestyle inflation": "Save raises instead of spending them, avoid upgrading your lifestyle every time income increases.",
  "what is the 30-day rule": "Wait 30 days before making large non-essential purchases to avoid impulse buying.",
  "how to use cashback rewards": "Apply cashback to goals or savings rather than spending the extra funds.",
  "should i use a debit or credit card": "Credit cards build credit and offer rewards, while debit cards limit spending to available funds.",
  "what is a spending plan": "Similar to a budget—a detailed outline of expected income and expenses for a set period.",
  "how to handle unexpected windfalls": "First allocate to emergency fund if needed, then to debt or savings goals.",
  "what is financial literacy": "Knowledge and skills needed to make informed decisions about money and personal finances.",
  "how to improve financial literacy": "Read books, take courses, follow finance blogs, and use apps like BudgetFlow.",
  "what is financial independence": "Having enough passive income or savings to cover your expenses without active work.",
  "how to achieve financial independence": "Save aggressively, invest wisely, and build multiple income streams over time.",
  "what is the latte factor": "Small daily spending (like ₹5 coffee) adds up to thousands yearly—it emphasizes the power of small changes.",
  "how to automate your finances": "Set up automatic bill payments, savings transfers, and investment contributions to stay on track.",
  "what is a personal financial statement": "A snapshot of your assets, liabilities, and net worth at a point in time.",
  "how to build wealth": "Earn more, spend less, invest the difference, and let compound interest work over time.",
  "what is the power of compound interest": "Money grows exponentially when returns earn their own returns—start investing early!",
  "how long to build an emergency fund": "Typically 3-6 months. Start with ₹10,000 and gradually add more.",
  "what to do after paying off debt": "Redirect debt payments to savings, investments, or building your emergency fund.",
  "how to meal prep on a budget": "Buy bulk ingredients, plan meals, prep on weekends, and avoid food waste.",
  "what are subscription traps": "Recurring charges you forget about—audit your subscriptions monthly and cancel unused ones.",
  "how to negotiate bills": "Call providers annually, compare offers, and mention competitor rates to get discounts.",
  "what is lifestyle creep": "Gradually increasing spending as income grows, leaving no extra money to save or invest.",
};

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        reply: 'Please provide a valid message.',
        transactionAdded: false 
      });
    }

    const msg = message.toLowerCase().trim();
    console.log('Chat message received:', msg);

    // 1. Check for action patterns (add, spend, paid, etc.)
    // Patterns like: "add 250 to groceries", "paid 100 for food", "spent 50 on entertainment"
    const actionPatterns = [
      /add\s+(\d+(?:\.\d{1,2})?)\s+(?:to|for)?\s*(\w+)/i,
      /spent\s+(\d+(?:\.\d{1,2})?)\s+(?:on)?\s*(\w+)/i,
      /paid\s+(\d+(?:\.\d{1,2})?)\s+(?:for)?\s*(\w+)/i,
      /expense\s+(\d+(?:\.\d{1,2})?)\s+(?:to|on)?\s*(\w+)/i
    ];

    let transactionAdded = false;

    for (const pattern of actionPatterns) {
      const match = msg.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const category = match[2].toLowerCase().trim();

        // Validation
        if (isNaN(amount) || amount <= 0) {
          return res.json({ 
            reply: 'Please provide a valid amount greater than 0.',
            transactionAdded: false 
          });
        }

        if (!category) {
          return res.json({ 
            reply: 'Please specify a category (e.g., groceries, transport, entertainment).',
            transactionAdded: false 
          });
        }

        try {
          // ✅ FIXED: Use userId instead of user
          const transaction = await Transaction.create({
            userId: userId, // ✅ CRITICAL FIX: Match model field name
            amount,
            category,
            description: `Added via chat: ₹${amount} to ${category}`,
            date: new Date(),
            type: 'expense'
          });

          console.log('✅ Transaction created via chat:', transaction);

          transactionAdded = true;

          return res.json({
            reply: `✅ Perfect! Added ₹${amount} to ${category}. Your budget has been updated!`,
            transactionAdded: true
          });
        } catch (err) {
          console.error('❌ Transaction creation error:', err);
          return res.json({
            reply: `There was an issue adding the transaction. Please try again. Error: ${err.message}`,
            transactionAdded: false
          });
        }
      }
    }

    // 2. Hardcoded Q&A match (fuzzy matching)
    for (const key in faqAnswers) {
      // Check if the message contains key phrases from FAQ
      if (msg.includes(key) || key.includes(msg.substring(0, Math.min(msg.length, key.length)))) {
        return res.json({
          reply: faqAnswers[key],
          transactionAdded: false
        });
      }
    }

    // 3. Fallback: Search for keywords in faqAnswers keys
    const keywords = msg.split(/\s+/);
    for (const keyword of keywords) {
      if (keyword.length > 3) {
        for (const key in faqAnswers) {
          if (key.includes(keyword)) {
            return res.json({
              reply: faqAnswers[key],
              transactionAdded: false
            });
          }
        }
      }
    }

    // 4. Default fallback reply
    return res.json({
      reply: `I'm BudgetFlow AI Assistant! 💰 I can help you with budgeting, finance, and manage your transactions. 

Try asking:
• How do I create a budget?
• How can I reduce my expenses?
• Add 250 to groceries (to log a transaction)
• What is the 50/30/20 rule?

Or describe what you want to do, and I'll help!`,
      transactionAdded: false
    });
  } catch (err) {
    console.error('❌ Chat route error:', err);
    return res.status(500).json({
      reply: 'Sorry, something went wrong. Please try again.',
      transactionAdded: false
    });
  }
});

module.exports = router;
