import React from 'react';
import { Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
            <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg shadow-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                                SilentScan
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            <footer className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} SilentScan Static Analyzer. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
