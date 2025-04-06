import * as React from "react";
import { createRoot } from "react-dom/client";
import { Circle, Warning, Octagon, MagnifyingGlass, CaretUp, CaretDown, Moon, Sun, CheckCircle, Clock, Article, Scroll, Gavel } from "@phosphor-icons/react";
import { MarkGithubIcon, CopilotIcon } from '@primer/octicons-react';
import data from './data.json';

// Helper function to check if a date is within the last 48 hours
const isRecentlyUpdated = (dateString) => {
  const now = new Date();
  const updated = new Date(dateString);
  const diffHours = (now - updated) / (1000 * 60 * 60);
  return diffHours <= 48;
};

// Format date string for tooltip
const formatDateForTooltip = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Document type icon component
function DocumentTypeIcon({ type }) {
  const normalizedType = type.toLowerCase();
  const Icon = normalizedType === 'executive order' ? Gavel : Scroll;
  const label = normalizedType === 'executive order' ? 'Executive Order' : 'Proclamation';

  return (
    <Icon
      className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2"
      weight="fill"
      aria-label={label}
      title={label}
    />
  );
}

// Theme context
const ThemeContext = React.createContext({
  isDark: false,
  toggleTheme: () => { },
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
    overturned: 'Overturned executive order',
    resolved: 'Resolved and enacted executive order'
  }[status];

  const tooltipText = {
    enacted: 'This executive order is currently in effect',
    challenged: 'This executive order is being challenged in court',
    overturned: 'This executive order has been overturned',
    resolved: 'This executive order was challenged but resolved and remains in effect'
  }[status];

  const IconComponent = {
    enacted: Circle,
    challenged: Warning,
    overturned: Octagon,
    resolved: CheckCircle
  }[status];

  if (!IconComponent) return null;

  return (
    <IconComponent
      className={`w-5 h-5 ${status === 'enacted' ? 'text-green-500' :
        status === 'challenged' ? 'text-yellow-500' :
          status === 'resolved' ? 'text-green-500' :
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
function StatusLegend({ statusFilter, onStatusFilterChange, onSortByUpdated }) {
  // Calculate counts
  const counts = React.useMemo(() => {
    const statusCounts = {
      enacted: 0,
      challenged: 0,
      overturned: 0,
      resolved: 0
    };

    data.forEach(eo => {
      statusCounts[eo.status]++;
    });

    return statusCounts;
  }, []);

  return (
    <div className="flex justify-between items-center mb-8" role="region" aria-label="Status legend">
      <div className="flex gap-8">
        {[{ status: 'enacted', label: 'Enacted', icon: Circle },
        { status: 'challenged', label: 'Challenged', icon: Warning },
        { status: 'resolved', label: 'Resolved', icon: CheckCircle },
        { status: 'overturned', label: 'Overturned', icon: Octagon }
        ].map(({ status, label, icon: Icon }) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(status === statusFilter ? 'all' : status)}
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity duration-150 ${status === statusFilter ? 'ring-2 ring-gray-300 dark:ring-gray-600 rounded-lg p-1' : 'p-1'
              }`}
            aria-pressed={status === statusFilter}
            aria-label={`Filter by ${label} status`}
          >
            <Icon className={`w-5 h-5 ${status === 'enacted' ? 'text-green-500' :
              status === 'challenged' ? 'text-yellow-500' :
                status === 'resolved' ? 'text-green-500' :
                  'text-red-500'
              }`} weight="fill" aria-hidden="true" />
            <span className="text-gray-700 dark:text-gray-300">{label} ({counts[status]})</span>
          </button>
        ))}
        <button
          onClick={onSortByUpdated}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150"
          aria-label="Sort by recently updated cases"
        >
          <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" weight="fill" aria-hidden="true" />
          <span className="text-gray-700 dark:text-gray-300">Updated in last 48 hours</span>
        </button>
      </div>
      <div className="flex gap-4 text-gray-700 dark:text-gray-300 text-sm">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-gray-500 dark:text-gray-400" weight="fill" aria-label="Executive Order" />
          <span>Executive Order</span>
        </div>
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-gray-500 dark:text-gray-400" weight="fill" aria-label="Proclamation" />
          <span>Proclamation</span>
        </div>
      </div>
    </div>
  );
}

// Document type filter component
function DocTypeFilter({ docTypes, onDocTypeChange }) {
  return (
    <div className="flex gap-4 items-center mt-4">
      <span className="text-gray-700 dark:text-gray-300 text-sm">Filter by type:</span>
      {['Executive Order', 'Proclamation'].map((type) => (
        <label key={type} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={docTypes.includes(type.toLowerCase())}
            onChange={() => onDocTypeChange(type.toLowerCase())}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <span className="text-gray-700 dark:text-gray-300 text-sm">{type}</span>
        </label>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This site does not collect any user information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <CopilotIcon size={16} />
              Built by GitHub Copilot
            </div>
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
  const [docTypeFilter, setDocTypeFilter] = React.useState(['executive order', 'proclamation']);
  const [sortConfig, setSortConfig] = React.useState({
    key: 'date',
    direction: 'desc'
  });
  const [sortByUpdated, setSortByUpdated] = React.useState(false);

  // Handle document type filter changes
  const handleDocTypeChange = (type) => {
    setDocTypeFilter(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];
      return newTypes.length === 0 ? ['executive order', 'proclamation'] : newTypes;
    });
  };

  // Sorting function
  const handleSort = (key) => {
    setSortByUpdated(false);
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSortByUpdated = () => {
    setSortByUpdated(true);
    setSortConfig({ key: 'lastUpdated', direction: 'desc' });
  };

  // Filter and sort the data
  const filteredAndSortedOrders = React.useMemo(() => {
    return executiveOrders
      .filter(eo => {
        const matchesSearch = searchQuery.toLowerCase() === '' ||
          eo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eo.challenges.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || eo.status === statusFilter;

        const matchesDocType = docTypeFilter.includes(eo.doctype.toLowerCase());

        return matchesSearch && matchesStatus && matchesDocType;
      })
      .sort((a, b) => {
        if (sortByUpdated) {
          // Get the most recent update date from challenges
          const getLatestUpdate = (eo) => {
            if (eo.challenges.length === 0) return new Date(0);
            return new Date(Math.max(...eo.challenges.map(c => new Date(c.lastUpdated))));
          };
          return getLatestUpdate(b) - getLatestUpdate(a);
        }

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
  }, [executiveOrders, searchQuery, statusFilter, docTypeFilter, sortConfig, sortByUpdated]);

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
        <div className="static sm:sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Orders Tracker</h1>
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
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-150 text-sm"
                  aria-label="Report incorrect information"
                >
                  Issue? Missing EO? Missing Case? Report an Issue
                </a>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6 hidden sm:block">
              Tracking the <a href="https://www.whitehouse.gov/presidential-actions/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-150">Executive Orders and Proclamations of Donald J. Trump</a> in current term and legal challenges to them in the simplest way. Links to the official presidential records are from the <a href="https://www.federalregister.gov/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-150">Federal Registry</a>, which takes a few days from date of proclamations to register.
            </p>
            <div className="hidden sm:block">
              <StatusLegend
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onSortByUpdated={handleSortByUpdated}
              />
              <DocTypeFilter
                docTypes={docTypeFilter}
                onDocTypeChange={handleDocTypeChange}
              />
            </div>

            {/* Search and filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4" role="search">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" aria-hidden="true" weight="bold" />
                <input
                  type="search"
                  placeholder="Search by EO#, title, or case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150 text-sm sm:text-base"
                  aria-label="Search executive orders"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-[200px] px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-150 text-sm sm:text-base"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="enacted">Enacted</option>
                <option value="challenged">Challenged</option>
                <option value="overturned">Overturned</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="max-w-screen-xl mx-auto px-2 sm:px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
            {/* Table of Executive Orders */}
            <div className="overflow-hidden rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="overflow-auto max-h-[calc(100vh-300px)]">
                <table className="w-full border-collapse bg-white dark:bg-gray-800" role="grid" aria-label="Executive Orders">
                  <thead className="static sm:sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-700" role="row">
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 align-top" role="columnheader" aria-label="Status">Status</th>
                      <SortableHeader label="EO#" sortKey="id" />
                      <SortableHeader label="Title" sortKey="title" />
                      <SortableHeader label="EO Date" sortKey="date" />
                      <th className="p-4 text-left font-semibold text-gray-700 dark:text-gray-300 align-top" role="columnheader">Cases</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAndSortedOrders.map((eo) => (
                      <tr key={eo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150" role="row">
                        <td className="p-2 sm:p-4 align-top flex items-center sm:table-cell">
                          <div className="flex items-start">
                            <StatusIcon status={eo.status} />
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 align-top flex items-center sm:table-cell">
                          <span className="sm:hidden mr-2 text-gray-500 dark:text-gray-400">EO#:</span>
                          <div className="flex items-center">
                            <DocumentTypeIcon type={eo.doctype} />
                            <a
                              href={eo.url}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-150 text-sm sm:text-base"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View ${eo.subtype === 'executive_order' ? 'Executive Order' : 'Proclamation'} ${eo.id}`}
                            >
                              {eo.id}
                            </a>
                          </div>
                        </td>
                        <td className="p-2 sm:p-4 align-top text-gray-900 dark:text-white text-sm sm:text-base">
                          <span className="sm:hidden mr-2 text-gray-500 dark:text-gray-400">Title:</span>
                          {eo.title}
                        </td>
                        <td className="p-2 sm:p-4 align-top whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          <span className="sm:hidden mr-2 text-gray-500 dark:text-gray-400">Date:</span>
                          {formatDate(eo.date)}
                        </td>
                        <td className="p-2 sm:p-4 align-top text-sm sm:text-base">
                          <span className="sm:hidden mr-2 text-gray-500 dark:text-gray-400">Cases:</span>
                          {eo.challenges.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 align-top" aria-label={`Legal challenges for Executive Order ${eo.id}`}>
                              {eo.challenges.map((challenge, index) => (
                                <li key={index} className="flex flex-wrap">
                                  <span className="mr-2">•</span>
                                  <div className="flex items-center gap-2 flex-1">
                                    <a
                                      href={challenge.url}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-150 break-words"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`View legal challenge: ${challenge.title}`}
                                    >
                                      {challenge.title}
                                    </a>
                                    {isRecentlyUpdated(challenge.lastUpdated) && (
                                      <div className="tooltip-wrapper inline-flex">
                                        <Clock
                                          className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0"
                                          weight="fill"
                                          aria-label="Updated in the last 48 hours"
                                        />
                                        <div className="tooltip">
                                          {formatDateForTooltip(challenge.lastUpdated)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
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
