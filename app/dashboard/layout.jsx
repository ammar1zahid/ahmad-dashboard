import React from 'react'
import Sidebar from '../components/dashboard/sidebar/sidebar'
import Navbar from '../components/dashboard/navbar/navbar'
import styles from "../components/dashboard/dashboard.module.css"
import Footer from '../components/dashboard/footer/footer'

function Layout({children}) {
  return (
    <div className={styles.container}>
      <div className={styles.menu} >
        <Sidebar/>
      </div>
      <div className={styles.content}>
        <Navbar/>
        {children}
        <Footer/>
      </div>

    </div>
  )
}

export default Layout