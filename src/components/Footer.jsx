import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-800 text-white py-6 mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-300">
            This site is independently run and is not officially affiliated with Sullivan Upper School or Ulster Schools Rugby.
          </p>
          <p className="text-sm text-gray-300">
            This website is managed by <a href="https://proactuary.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">ProActuary</a>
          </p>
          <p className="text-sm text-gray-300">
            Contact: <a href="mailto:medallions@proactuary.com" className="text-green-400 hover:text-green-300 transition-colors">medallions@proactuary.com</a>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;