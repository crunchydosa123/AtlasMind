import React from "react";
import { Link } from "react-router-dom";

import { FaCogs, FaRobot, FaFileAlt } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">AI DocumentFlow</h1>
          <div className="space-x-4">
            <Link to="/login">
              <button className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                Login   
              </button>
            </Link>
            <Link to="/signup">
              <button className="bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg hover:bg-purple-100 transition">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-20">
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            Automate Your{" "}
            <span className="text-purple-600">Document Workflows</span> with AI
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Our intelligent platform simplifies document management by
            automating data extraction, risk detection, and workflow routing
            using OCR, NLP, and Machine Learning. Connect seamlessly with Google
            Drive, Dropbox, and ERP tools.
          </p>
          <div className="space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition">
              Get Started
            </button>
            <button className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="md:w-1/2 mb-10 md:mb-0">
          <img
            src="https://www.svgrepo.com/show/354262/ai-document.svg"
            alt="AI Document Automation"
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Why Choose DocumentFlow?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gray-100 shadow hover:shadow-lg transition">
              <FaRobot className="text-4xl text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">
                AI-Powered Automation
              </h4>
              <p className="text-gray-600">
                Automate document ingestion, form filling, and error detection
                using OCR, NLP, and ML.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-100 shadow hover:shadow-lg transition">
              <FaCogs className="text-4xl text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">
                Seamless Workflow Integration
              </h4>
              <p className="text-gray-600">
                Connect with tools like Google Drive, Dropbox, and ERP systems
                for smart workflow routing.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-100 shadow hover:shadow-lg transition">
              <FaFileAlt className="text-4xl text-purple-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">
                Risk & Compliance Detection
              </h4>
              <p className="text-gray-600">
                Reduce manual errors and detect compliance risks in documents
                before they escalate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-6 mt-10">
        <p>
          © {new Date().getFullYear()} AI DocumentFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
