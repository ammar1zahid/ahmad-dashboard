import React from 'react'
import styles from "../components/login/login.module.css";
import LoginForm from '../components/login/loginForm/loginForm';

function Login() {
  return (
    <div className={styles.container}>
      <LoginForm/>
    </div>
  )
}

export default Login