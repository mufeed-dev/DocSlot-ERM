import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary-teal text-white py-6 mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm font-medium opacity-80">
        <p>&copy; {new Date().getFullYear()} DocSlot. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
