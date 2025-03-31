import * as React from "react";
import { createRoot } from "react-dom/client";
import { Circle, Warning, Octagon, MagnifyingGlass, CaretUp, CaretDown, Moon, Sun, Sparkle } from "@phosphor-icons/react";
import { MarkGithubIcon } from '@primer/octicons-react';
import data from './data.json';

// Theme context
const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => {},
});

// Theme provider component
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = React.useState(() => {
    // Check system preference on initial load
    if (typeof window !== 'undefined') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      return systemPrefersDark;
    }
    return false;
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme toggle component
function ThemeToggle() {
  const { isDark, toggleTheme } = React.useContext(ThemeContext);
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun weight="fill" className="w-5 h-5" />
      ) : (
        <Moon weight="fill" className="w-5 h-5" />
      )}
    </button>
  );
}

// Component to display the status icon
function StatusIcon({ status }) {
  const ariaLabel = {
    enacted: 'Enacted executive order',
    challenged: 'Challenged executive order',
    overturned: 'Overturned executive order'
  }[status];

  const tooltipText = {
    enacted: 'This executive order is currently in effect',
    challenged: 'This executive order is being challenged in court',
    overturned: 'This executive order has been overturned'
  }[status];

  const IconComponent = {
    enacted: Circle,
    challenged: Warning,
    overturned: Octagon
  }[status];

  if (!IconComponent) return null;

  return (
    <IconComponent 
      className={`w-5 h-5 ${
        status === 'enacted' ? 'text-green-500' :
        status === 'challenged' ? 'text-yellow-500' :
        'text-red-500'
      }`}
      weight="fill"
      aria-label={ariaLabel}
      role="img"
      title={tooltipText}
    />
  );
}

// Legend component
function StatusLegend() {
  return (
    <div className="flex gap-8 mb-8" role="region" aria-label="Status legend">
      {[
        { status: 'enacted', label: 'Enacted', icon: Circle },
        { status: 'challenged', label: 'Challenged', icon: Warning },
        { status: 'overturned', label: 'Overturned', icon: Octagon }
      ].map(({ status, label, icon: Icon }) => (
        <div key={status} className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${
            status === 'enacted' ? 'text-green-500' :
            status === 'challenged' ? 'text-yellow-500' :
            'text-red-500'
          }`} weight="fill" aria-hidden="true" />
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/timheuer/eotrack"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-150"
              aria-label="View source on GitHub"
            >
              <MarkGithubIcon size={20} />
            </a>
            <a
              href="https://github.com/timheuer/eotrack/issues/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-150"
              aria-label="Report incorrect information"
            >
              Issue? Missing EO? Missing Case? Report an Issue
            </a>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This site does not collect any user information
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}

// Modal component
function Modal({ isOpen, onClose, children, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Generating AI summary...</p>
            </div>
          ) : (
            children
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main application component
function App() {
  const [executiveOrders] = React.useState(data);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedEO, setSelectedEO] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sortConfig, setSortConfig] = React.useState({
    key: 'date',
    direction: 'desc'
  });

  const handleSummaryClick = async (eo) => {
    setSelectedEO(eo);
    setIsLoading(true);
    // TODO: Implement actual AI summary generation here
    // Simulating API call with timeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  // Sorting function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort the data
  const filteredAndSortedOrders = React.useMemo(() => {
    return executiveOrders
      .filter(eo => {
        const matchesSearch = searchQuery.toLowerCase() === '' || 
          eo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eo.challenges.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === 'all' || eo.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [executiveOrders, searchQuery, statusFilter, sortConfig]);

  // Format date according to system preferences
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, 
      { dateStyle: 'medium' }
    );
  };

  // Column header component with sort indicator
  const SortableHeader = ({ label, sortKey }) => (
    <th 
      className="p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150 text-left font-semibold text-gray-700"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? <CaretUp className="w-4 h-4" weight="bold" /> : <CaretDown className="w-4 h-4" weight="bold" />
        )}
      </div>
    </th>
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Orders Tracker</h1>
            </div>
            <StatusLegend />
            
            {/* Search and filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4" role="search">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" aria-hidden="true" weight="bold" />
                <input
                  type="search"
                  placeholder="Search by title or case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                  aria-label="Search executive orders"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-[200px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="enacted">Enacted</option>
                <option value="challenged">Challenged</option>
                <option value="overturned">Overturned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Table of Executive Orders */}
            <div className="overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="overflow-auto max-h-[calc(100vh-300px)]">
                <table className="w-full border-collapse bg-white dark:bg-gray-800" role="grid" aria-label="Executive Orders">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-700" role="row">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 align-top" role="columnheader" aria-label="Status">Status</th>
                      <SortableHeader label="EO#" sortKey="id" />
                      <SortableHeader label="Title" sortKey="title" />
                      <SortableHeader label="Date" sortKey="date" />
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 align-top" role="columnheader">Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAndSortedOrders.map((eo) => (
                      <tr key={eo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150" role="row">
                        <td className="p-4 align-top">
                          <div className="flex items-start">
                            <StatusIcon status={eo.status} />
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <a 
                            href={eo.url}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-150"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View Executive Order ${eo.id}`}
                          >
                            {eo.id}
                          </a>
                        </td>
                        <td className="p-4 align-top">
                          <div className="group relative flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white">{eo.title}</span>
                            <button
                              onClick={() => handleSummaryClick(eo)}
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              aria-label={`View AI Summary for ${eo.title}`}
                            >
                              <Sparkle size={16} weight="fill" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 align-top whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {formatDate(eo.date)}
                        </td>
                        <td className="p-4 align-top">
                          {eo.challenges.length > 0 ? (
                            <ul className="list-none space-y-2" aria-label={`Legal challenges for Executive Order ${eo.id}`}>
                              {eo.challenges.map((challenge, index) => (
                                <li key={index}>
                                  <a 
                                    href={challenge.url}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-150 inline-block"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`View legal challenge: ${challenge.title}`}
                                  >
                                    {challenge.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No challenges</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={selectedEO !== null}
          onClose={() => setSelectedEO(null)}
          isLoading={isLoading}
        >
          {selectedEO && (
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">
                AI Summary: {selectedEO.title}
              </h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          )}
        </Modal>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}

// Create root once and store it
let root;
if (!root) {
  root = createRoot(document.getElementById("root"));
}
root.render(<App />);
