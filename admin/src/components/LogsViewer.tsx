import { useState } from 'react';

function LogsViewer() {
  const [filters, setFilters] = useState({
    subdomain: '',
    statusCode: '',
    startDate: '',
    endDate: '',
    search: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2 className="mb-3">Request/Response Logs</h2>

      <div className="card mb-3">
        <h4 className="mb-3">Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
          <div>
            <label htmlFor="subdomain">Subdomain</label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              value={filters.subdomain}
              onChange={handleFilterChange}
              placeholder="All subdomains"
            />
          </div>

          <div>
            <label htmlFor="statusCode">Status Code</label>
            <select
              id="statusCode"
              name="statusCode"
              value={filters.statusCode}
              onChange={handleFilterChange}
            >
              <option value="">All statuses</option>
              <option value="2xx">2xx (Success)</option>
              <option value="3xx">3xx (Redirect)</option>
              <option value="4xx">4xx (Client Error)</option>
              <option value="5xx">5xx (Server Error)</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="mt-3">
          <label htmlFor="search">Search (URL or IP)</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by URL or IP address"
          />
        </div>
      </div>

      <div className="card">
        <div className="text-center" style={{ padding: 'var(--spacing-2xl) 0' }}>
          <p className="text-lg text-gray mb-3">No logs available</p>
          <p className="text-gray mb-0">Logs will appear here once requests are proxied through your mappings.</p>
        </div>
      </div>
    </div>
  );
}

export default LogsViewer;
