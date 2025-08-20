"use client"

import { usePathname } from 'next/navigation'
import styles from './menuink.module.css'
import Link from 'next/link'

function MenuLink({item}) {

const pathname = usePathname()  
  return (
    <Link href={item.path} className={`${styles.container} ${pathname=== item.path && styles.active}`}>
        {item.icon}
        {item.title}
    </Link>
  )
}

export default MenuLink