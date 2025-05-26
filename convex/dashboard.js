import { query } from "./_generated/server";
import { internal } from "./_generated/api";

// Get user balances
export const getUserBalances = query({
    handler: async (ctx) => {
    // Use centralized getCurrentUser for consistency
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    /* ───── Individual Expense Entries (No Group Involved) ───── */
    // Fetch all expenses where the user is either the payer or a splitter
    // and not part of a group
    // This includes expenses where the user paid or owes money

    const expenses = (await ctx.db.query("expenses").collect()).filter(
      (e) =>
        !e.groupId && 
        (e.paidByUserId === user._id ||
          e.splits.some((s) => s.userId === user._id))
    );

    /* tallies */
    let youOwe = 0; // Total amount you owe
    let youAreOwed = 0; // Total amount owed to you
    const balanceByUser = {}; // Balance details by user
    // Iterate through expenses to calculate balances

    for (const e of expenses) {
        const isPayer = e.paidByUserId === user._id;
        const mySplit = e.splits.find((s) => s.userId === user._id);
  
        if (isPayer) {
          for (const s of e.splits) {
            // If the user is the payer, they are owed money by others
            if (s.userId === user._id || s.paid) continue;
            
            // If the split is paid, skip it
            
            youAreOwed += s.amount;
            (balanceByUser[s.userId] ??= { owed: 0, owing: 0 }).owed += s.amount;
          }
        } else if (mySplit && !mySplit.paid) {
            // If the user is a splitter and hasn't paid
            // If the user owes money, add to youOwe
          youOwe += mySplit.amount;
          // Update the balance for the payer
          (balanceByUser[e.paidByUserId] ??= { owed: 0, owing: 0 }).owing +=
            mySplit.amount;
        }
      }

      /* ───── Individual Settlements (No Group Context) ───── */
        // Fetch all settlements where the user is either the payer or receiver
      const settlements = (await ctx.db.query("settlements").collect()).filter(
        (s) =>
          !s.groupId &&
          (s.paidByUserId === user._id || s.receivedByUserId === user._id)
      );

      for (const s of settlements) {
        if (s.paidByUserId === user._id) {
            // If the user is the payer, they owe money to the receiver
          youOwe -= s.amount;
          (balanceByUser[s.receivedByUserId] ??= { owed: 0, owing: 0 }).owing -=
            s.amount;
        } else {
            // If the user is the receiver, they are owed money by the payer
          youAreOwed -= s.amount;
          (balanceByUser[s.paidByUserId] ??= { owed: 0, owing: 0 }).owed -=
            s.amount;
        }
      }

      /* Generate lists for the user interface */
      const youOweList = []; // List of users you owe money to
      const youAreOwedByList = []; // Lists to hold owed and owing details

      for (const [uid, { owed, owing }] of Object.entries(balanceByUser)) {
        const net = owed - owing; // Calculate net balance
        if (net === 0) continue; // Skip zero balances
        // Fetch user details
        const counterpart = await ctx.db.get(uid);
        const base = {
          userId: uid,
          name: counterpart?.name ?? "Unknown",
          imageUrl: counterpart?.imageUrl,
          amount: Math.abs(net),
        };
        net > 0 ? youAreOwedByList.push(base) : youOweList.push(base);
      }
  
      youOweList.sort((a, b) => b.amount - a.amount);
      youAreOwedByList.sort((a, b) => b.amount - a.amount);
  
      return {
        youOwe,// Total amount you owe
        youAreOwed,// Total amount owed to you
        totalBalance: youAreOwed - youOwe,// Net balance
        oweDetails: { youOwe: youOweList, youAreOwedBy: youAreOwedByList },// Detailed lists of balances
      };

  },
});

// This code defines a query to get user balances, including individual expenses and settlements without group context.
// It calculates how much the user owes and how much is owed to them, providing detailed lists for the UI.

// Get total spent in the current year
export const getTotalSpent = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get the current year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        // Fetch all expenses paid by the user in the current year
        const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_date", (q) => q.gte("date", startOfYear))
            .collect();

        // Filter expenses to only include those paid by the user
        const userExpenses = expenses.filter(
            (expense) =>
              expense.paidByUserId === user._id ||
              expense.splits.some((split) => split.userId === user._id)
        );

        // Calculate total spent
        let totalSpent = 0;

        userExpenses.forEach((expense) => {
        const userSplit = expense.splits.find(
            (split) => split.userId === user._id
        );
        if (userSplit) {
            totalSpent += userSplit.amount;
        }
        });

        return totalSpent;
    },
});

// This code defines a query to get the total amount spent by the user in the current year.
// It filters expenses based on the current year and calculates the total amount spent by the user, including their splits in shared expenses.

// Get total spent in the current month
export const getMonthlySpending = query({
    handler: async (ctx) => {
        const user = await ctx.runQuery(internal.users.getCurrentUser);

        // Get the current month and year
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1).getTime();

        // Get all expenses for current year
        const allExpenses = await ctx.db
            .query("expenses")
            .withIndex("by_date", (q) => q.gte("date", startOfYear))
            .collect();

        // Filter expenses to only include those paid by the user in the current month
        const userExpenses = allExpenses.filter(
            (expense) =>
              expense.paidByUserId === user._id ||
              expense.splits.some((split) => split.userId === user._id)
        );

        // Group expenses by month
        const monthlyTotals = {};

        // Initialize all months with zero
        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(currentYear, i, 1);
            monthlyTotals[monthDate.getTime()] = 0;
        }

        // Sum up expenses by month
        userExpenses.forEach((expense) => {
            const date = new Date(expense.date);
            const monthStart = new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            ).getTime();

        // Get user's share of this expense
        const userSplit = expense.splits.find(
            (split) => split.userId === user._id
        );
        if (userSplit) {
            monthlyTotals[monthStart] =
            (monthlyTotals[monthStart] || 0) + userSplit.amount;
        }
        });

        // Convert to array format
        const result = Object.entries(monthlyTotals).map(([month, total]) => ({
            month: parseInt(month),
            total,
        }));

        // Sort by month (ascending)
        result.sort((a, b) => a.month - b.month);

        return result;
    },
});
// This code defines a query to get the total amount spent by the user in each month of the current year.
// It filters expenses based on the current year and calculates the total amount spent by the user in each month, including their splits in shared expenses.


// Get groups for the current user
export const getUserGroups = query({
    handler: async (ctx) => {
      const user = await ctx.runQuery(internal.users.getCurrentUser);
  
      // Get all groups
      const allGroups = await ctx.db.query("groups").collect();
  
      // Filter for groups where the user is a member
      const groups = allGroups.filter((group) =>
        group.members.some((member) => member.userId === user._id)
      );
  
      // Calculate balances for each group
      const enhancedGroups = await Promise.all(
        groups.map(async (group) => {
          // Get all expenses for this group
          const expenses = await ctx.db
            .query("expenses")
            .withIndex("by_group", (q) => q.eq("groupId", group._id))
            .collect();
  
          let balance = 0;
  
          expenses.forEach((expense) => {
            if (expense.paidByUserId === user._id) {
              // User paid for others
              expense.splits.forEach((split) => {
                if (split.userId !== user._id && !split.paid) {
                  balance += split.amount;
                }
              });
            } else {
              // User owes someone else
              const userSplit = expense.splits.find(
                (split) => split.userId === user._id
              );
              if (userSplit && !userSplit.paid) {
                balance -= userSplit.amount;
              }
            }
          });
  
          // Apply settlements
          const settlements = await ctx.db
            .query("settlements")
            .filter((q) =>
              q.and(
                q.eq(q.field("groupId"), group._id),
                q.or(
                  q.eq(q.field("paidByUserId"), user._id),
                  q.eq(q.field("receivedByUserId"), user._id)
                )
              )
            )
            .collect();
  
          settlements.forEach((settlement) => {
            if (settlement.paidByUserId === user._id) {
              // User paid someone
              balance += settlement.amount;
            } else {
              // Someone paid the user
              balance -= settlement.amount;
            }
          });
  
          return {
            ...group,
            id: group._id,
            balance,
          };
        })
      );
  
      return enhancedGroups;
    },
});

// This code defines a query to get all groups the current user is a member of.
// It calculates the balance for each group, considering both expenses and settlements.
// It returns an array of groups with their details and the user's balance in each group.
// This code is part of a Convex backend service that provides various queries related to user balances, expenses, and groups.

