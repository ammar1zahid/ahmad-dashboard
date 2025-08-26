import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

// helper that throws if not admin
export default async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    throw new Error("Unauthorized: Admins only");
  }
  return session;
}
