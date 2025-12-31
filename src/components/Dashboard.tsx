function Dashboard() {
  return (
    <div>
      <h2 className="mb-3">Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
        <div className="card">
          <h4 className="mb-2" style={{ color: 'var(--color-primary)' }}>Total Mappings</h4>
          <p className="text-xl mb-0" style={{ fontWeight: 700, fontSize: '2rem' }}>-</p>
          <p className="text-sm text-gray mb-0">Active subdomain mappings</p>
        </div>

        <div className="card">
          <h4 className="mb-2" style={{ color: 'var(--color-success)' }}>Total Requests</h4>
          <p className="text-xl mb-0" style={{ fontWeight: 700, fontSize: '2rem' }}>-</p>
          <p className="text-sm text-gray mb-0">Proxied requests today</p>
        </div>

        <div className="card">
          <h4 className="mb-2" style={{ color: 'var(--color-warning)' }}>Avg Response Time</h4>
          <p className="text-xl mb-0" style={{ fontWeight: 700, fontSize: '2rem' }}>- ms</p>
          <p className="text-sm text-gray mb-0">Last 24 hours</p>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="mb-3">Quick Start</h3>
        <div style={{ lineHeight: 1.8 }}>
          <p><strong>1. Create a mapping</strong></p>
          <p className="text-gray mb-3">Go to Mappings → Create New to map a subdomain to your destination server.</p>

          <p><strong>2. Test your proxy</strong></p>
          <p className="text-gray mb-3">Send requests to <code style={{ background: 'var(--color-gray-100)', padding: '2px 6px', borderRadius: '4px' }}>subdomain.toran.dev</code></p>

          <p><strong>3. View logs</strong></p>
          <p className="text-gray mb-0">Monitor all requests and responses in the Logs section.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
