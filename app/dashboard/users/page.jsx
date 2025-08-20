import Search from "@/app/components/dashboard/search/search";
import styles from "../../components/dashboard/users/users.module.css";
import Link from "next/link";
import Image from "next/image";
import Pagination from "@/app/components/dashboard/pagination/pagination";
import { fetchUsers } from "@/app/lib/data";
import { deleteUser } from "@/app/lib/actions";

// 👇 force runtime rendering
export const dynamic = "force-dynamic";

async function UsersPage({ searchParams }) {
  try {
    // await searchParams before using it
    const params = await searchParams;
    const q = params?.q || "";
    const page = Number(params?.page) || 1;

    const { count = 0, users = [] } = (await fetchUsers(q, page)) || {};

    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <Search placeholder="Search for a user" />
          <Link href="/dashboard/users/add">
            <button className={styles.addButton}>Add New</button>
          </Link>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <td>Name</td>
              <td>Email</td>
              <td>Created At</td>
              <td>Role</td>
              <td>Status</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const id = String(user._id ?? user.id ?? "");
                const created = user.createdAt
                  ? new Date(user.createdAt).toString().slice(4, 16)
                  : "";

                return (
                  <tr key={id}>
                    <td>
                      <div className={styles.user}>
                        <Image
                          src={user.img || "/noavatar.png"}
                          alt=""
                          width={40}
                          height={40}
                          className={styles.userImage}
                        />
                        {user.username}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{created}</td>
                    <td>{user.isAdmin ? "Admin" : "Client"}</td>
                    <td>{user.isActive ? "active" : "passive"}</td>
                    <td>
                      <div className={styles.buttons}>
                        <Link href={`/dashboard/users/${id}`}>
                          <button className={`${styles.button} ${styles.view}`}>
                            View
                          </button>
                        </Link>
                        <form action={deleteUser}>
                          <input type="hidden" name="id" value={id} />
                          <button
                            className={`${styles.button} ${styles.delete}`}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering UsersPage:", error);
    return (
      <div className={styles.container}>
        <p style={{ color: "red" }}>Failed to load users.</p>
      </div>
    );
  }
}

export default UsersPage;
