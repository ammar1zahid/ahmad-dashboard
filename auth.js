// auth.js
// Node-only configuration file: do NOT call NextAuth() here.
// This file must NOT export NextAuth handlers or any runtime object.

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // console.log("[NextAuth jwt] user:", user.username);//testing
        token.id = user.id;
        token.username = user.username;
        token.img = user.img;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user ?? {};
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.img = token.img;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
