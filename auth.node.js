// auth-node.js
// Node-only providers (DO NOT add "use server" here because it exports an array)

import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import connect from "./app/lib/utils";
import { User } from "./app/lib/models";

export const nodeProviders = [
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials) {
        console.log("[auth.node] authorize called with no credentials");
        return null;
      }
       
      // console.log("[auth.node] authorize called with:", credentials?.username);//testing

      await connect();

      const user = await User.findOne({ username: credentials.username }).lean();
      if (!user) {
        console.log("[auth.node] user not found:", credentials.username);
        return null;
      }

      if (!user.password) {
        console.log("[auth.node] user has no password:", credentials.username);
        return null;
      }

      const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordCorrect) {
        console.log("[auth.node] wrong password for:", credentials.username);
        return null;
      }

      // console.log("[auth.node] authorize success for:", user._id.toString());//testing

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        img: user.img || null,
        isAdmin: user.isAdmin,
      };
    },
  }),
];
