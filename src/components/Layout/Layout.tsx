import * as React from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={styles.menuButton}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.logo}>AgileChef</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconButton} title="Search">
            🔍
          </button>
          <button className={styles.iconButton} title="Notifications">
            🔔
          </button>
          <button className={styles.iconButton} title="Settings">
            ⚙️
          </button>
          <div className={styles.userProfile}>
            {user ? (
              <>
                <img 
                  src={user.imageUrl || "https://via.placeholder.com/32"} 
                  alt={`${user.firstName || 'User'}'s avatar`}
                  className={styles.avatar}
                />
                <button 
                  onClick={handleSignOut}
                  className={styles.signOutButton}
                  title="Sign out"
                >
                  Sign out
                </button>
              </>
            ) : (
              <img 
                src="https://via.placeholder.com/32" 
                alt="User avatar" 
                className={styles.avatar}
              />
            )}
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
          <nav className={styles.navigation}>
            <a href="#" className={`${styles.navItem} ${styles.active}`}>
              <span className={styles.navIcon}>📋</span>
              Kanban Board
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>📚</span>
              Recipe Book
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>📊</span>
              Analytics
            </a>
            <a href="#" className={styles.navItem}>
              <span className={styles.navIcon}>⚡</span>
              Quick Actions
            </a>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.version}>
              Version 0.1.0
            </div>
            <a href="https://github.com/flehmenlips/AgileChef" 
               target="_blank" 
               rel="noopener noreferrer"
               className={styles.githubLink}
            >
              GitHub
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          {children}
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            © 2024 AgileChef. All rights reserved.
          </div>
          <div className={styles.footerRight}>
            <a href="#" className={styles.footerLink}>Privacy Policy</a>
            <a href="#" className={styles.footerLink}>Terms of Service</a>
            <a href="#" className={styles.footerLink}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 