import * as React from "react";
import { createRoot } from "react-dom/client";
import { Circle, Warning, Octagon, MagnifyingGlass, CaretUp, CaretDown, Moon, Sun } from "@phosphor-icons/react";
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
              <span>Source Code</span>
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

// Main application component
function App() {
  const [executiveOrders] = React.useState(data);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortConfig, setSortConfig] = React.useState({
    key: 'date',
    direction: 'desc'
  });

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
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">Executive Orders Tracker</h1>
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
                        <td className="p-4 align-top text-gray-900 dark:text-white">{eo.title}</td>
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
