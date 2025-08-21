// app/dashboard/customers/[id]/page.jsx
export const dynamic = "force-dynamic";

import { updateCustomer } from "@/app/lib/actions";
import { fetchCustomer } from "@/app/lib/data";
import styles from "../../../components/dashboard/users/singleUser/singleUser.module.css"; 
import Image from "next/image";

const SingleCustomerPage = async (props) => {
  const params = await props.params;
  const { id } = params;
  const customer = await fetchCustomer(id);

  if (!customer) {
    return <div>Customer not found</div>;
  }

  const cid = String(customer._id ?? customer.id ?? "");
  const name = customer.name ?? "";
  const email = customer.email ?? "";
  const phone = customer.phone ?? "";
  const address = customer.address ?? "";
  const imgSrc = customer.img || "/noavatar.png";

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
          <Image src={imgSrc} alt="" fill />
        </div>
        <div className={styles.username}>{name}</div>
      </div>

      <div className={styles.formContainer}>
        <form action={updateCustomer} className={styles.form}>
          <input type="hidden" name="id" value={cid} />

          <label>Full name</label>
          <input type="text" name="name" defaultValue={name} placeholder="Full name" />

          <label>Email</label>
          <input type="email" name="email" defaultValue={email} placeholder="Email" />

          <label>Phone</label>
          <input type="text" name="phone" defaultValue={phone} placeholder="Phone" />

          <label>Address</label>
          <textarea name="address" defaultValue={address} placeholder="Address" />

          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleCustomerPage;
