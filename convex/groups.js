import { query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get expenses
export const getGroupExpenses = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);

    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");

    if (!group.members.some((m) => m.userId === currentUser._id))
        throw new Error("You are not a member of this group");

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    const settlements = await ctx.db
      .query("settlements")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    /* ----------  member map ---------- */
    
    const memberDetails = await Promise.all(
        group.members.map(async (m) => {
          const u = await ctx.db.get(m.userId);
          return { id: u._id, name: u.name, imageUrl: u.imageUrl, role: m.role };
        })
      );
      const ids = memberDetails.map((m) => m.id);

    /* ----------  ledgers ---------- */
    
    const totals = Object.fromEntries(ids.map((id) => [id, 0]));
    const ledger = {};
    ids.forEach((a) => {
      ledger[a] = {};
      ids.forEach((b) => {
        if (a !== b) ledger[a][b] = 0;
      });
    });

    /* ----------  apply expenses ---------- */
    
    for (const exp of expenses) {
        const payer = exp.paidByUserId;
        for (const split of exp.splits) {
          if (split.userId === payer || split.paid) continue; 
          const debtor = split.userId;
          const amt = split.amount;
          
          totals[payer] += amt;
          totals[debtor] -= amt;
          
          ledger[debtor][payer] += amt; 
        }
      }

    /* ----------  apply settlements ---------- */
    
    for (const s of settlements) {
        totals[s.paidByUserId] += s.amount;
        totals[s.receivedByUserId] -= s.amount;
  
        ledger[s.paidByUserId][s.receivedByUserId] -= s.amount; 
      }

    /* ----------  net the pair‑wise ledger ---------- */
    
    

    /* ----------  shape the response ---------- */

    const balances = memberDetails.map((m) => ({
        ...m,
        totalBalance: totals[m.id],
        owes: Object.entries(ledger[m.id])
          .filter(([, v]) => v > 0)
          .map(([to, amount]) => ({ to, amount })),
        owedBy: ids
          .filter((other) => ledger[other][m.id] > 0)
          .map((other) => ({ from: other, amount: ledger[other][m.id] })),
      }));
  
      const userLookupMap = {};
      memberDetails.forEach((member) => {
        userLookupMap[member.id] = member;
      });
  
      return {
        group: {
          id: group._id,
          name: group.name,
          description: group.description,
        },
        members: memberDetails,
        expenses,
        settlements,
        balances,
        userLookupMap,
      };
  },
});


export const getGroupOrMembers = query({
  args: {
    groupId: v.optional(v.id("groups")), 
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getCurrentUser);
    const allGroups = await ctx.db.query("groups").collect();
    const userGroups = allGroups.filter((group) =>
      group.members.some((member) => member.userId === currentUser._id)
    );

    
    if (args.groupId) {
      const selectedGroup = userGroups.find(
        (group) => group._id === args.groupId
      );

      if (!selectedGroup) {
        throw new Error("Group not found or you're not a member");
      }

      
      const memberDetails = await Promise.all(
        selectedGroup.members.map(async (member) => {
          const user = await ctx.db.get(member.userId);
          if (!user) return null;

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            role: member.role,
          };
        })
      );

      
      const validMembers = memberDetails.filter((member) => member !== null);

      
      return {
        selectedGroup: {
          id: selectedGroup._id,
          name: selectedGroup.name,
          description: selectedGroup.description,
          createdBy: selectedGroup.createdBy,
          members: validMembers,
        },
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    } else {
      
      return {
        selectedGroup: null,
        groups: userGroups.map((group) => ({
          id: group._id,
          name: group.name,
          description: group.description,
          memberCount: group.members.length,
        })),
      };
    }
  },
});