import React from "react";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className="footer-title">Lost and Found Web Portal</p>
        <p className="footer-sub">
          A campus community platform to report, discover, and recover lost belongings safely.
        </p>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Mini Project &bull; CSE (Data Science)
        </p>
      </div>
    </footer>
  );
}

