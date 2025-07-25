
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 text-center text-[var(--text-tertiary)] border-t border-[var(--border-color)] mt-12">
      <p>&copy; {new Date().getFullYear()} Iqbalzcodets. All rights reserved.</p>
      <p className="text-sm">Powered by Gemini API</p>
    </footer>
  );
};

export default Footer;
