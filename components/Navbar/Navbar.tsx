import { Clock8 } from "lucide-react";
import Link from "next/link";
import NavbarUser from "@/components/NavbarUser";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <div className={styles.siteNav}>
      <nav>
        <div className={styles.brand}>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <span className={styles.tagline}>
            Tiny missions. Big office mischief.
          </span>
        </div>
        <ul>
          <li>
            <Link href="/heists/create" className="btn">
              Create Heist
            </Link>
          </li>
          <li>
            <NavbarUser />
          </li>
        </ul>
      </nav>
    </div>
  );
}
