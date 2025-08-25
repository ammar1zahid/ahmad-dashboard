import { updateUser } from "@/app/lib/actions";
import { fetchUser } from "@/app/lib/data";
import styles from "../../../components/dashboard/users/singleUser/singleUser.module.css";

const SingleUserPage = async (props) => {
  const params = await props.params;
  const { id } = params;
  const user = await fetchUser(id);

  if (!user) {
    return <div>User not found</div>;
  }

  // normalize primitives (defensive)
  const uid = String(user._id ?? user.id ?? "");
  const username = user.username ?? "";
  const email = user.email ?? "";
  const phone = user.phone ?? "";
  const address = user.address ?? "";
  const isAdmin = !!user.isAdmin;
  const isActive = !!user.isActive;

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.username}>{username}</div>
      </div>

      <div className={styles.formContainer}>
        <form action={updateUser} className={styles.form}>
          {/* PASS A STRING, NOT an ObjectId */}
          <input type="hidden" name="id" value={uid} />

          <label>Username</label>
          <input
            type="text"
            name="username"
            defaultValue={username}
            placeholder="Username"
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            defaultValue={email}
            placeholder="Email"
          />

          <label>Password</label>
          <input type="password" name="password" placeholder="Leave blank to keep" />

          <label>Phone</label>
          <input type="text" name="phone" defaultValue={phone} placeholder="Phone" />

          <label>Address</label>
          <textarea name="address" defaultValue={address} placeholder="Address" />

          <label>Is Admin?</label>
          <select name="isAdmin" id="isAdmin" defaultValue={isAdmin ? "true" : "false"}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <label>Is Active?</label>
          <select name="isActive" id="isActive" defaultValue={isActive ? "true" : "false"}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;