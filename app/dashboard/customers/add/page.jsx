// app/dashboard/customers/add/page.jsx
export const dynamic = "force-dynamic";

import { addCustomer } from "@/app/lib/actions";
import styles from "../../../components/dashboard/users/addUser/addUser.module.css"; 

const AddCustomerPage = () => {
  return (
    <div className={styles.container}>
      <form action={addCustomer} className={styles.form}>
        <input type="text" placeholder="Full name" name="name" required />
        <input type="email" placeholder="email" name="email" required />
        <input type="tel" placeholder="phone" name="phone" />
        <textarea
          name="address"
          id="address"
          rows="10"
          placeholder="Address"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCustomerPage;
