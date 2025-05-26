import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Optional fallback if email is missing
    const email = identity.email ?? "unknown@no-email.com";

    // Optional fallback if name or imageUrl is missing
    const name = identity.name ?? "Anonymous";
    const imageUrl = identity.pictureUrl ?? undefined;


    //console.log("User Identity:", identity);

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (user !== null) {
      if (user.name !== name) {
        await ctx.db.patch(user._id, { name });
      }
      return user._id;
    }

    return await ctx.db.insert("users", {
      name,
      tokenIdentifier: identity.tokenIdentifier,
      email,
      imageUrl,
    });
  },
});

export const getCurrentUser =query({
  handler :async(ctx)=>{
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authentication ");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});
