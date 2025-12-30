import { Link } from 'react-router-dom';

function MappingList() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h2 className="mb-0">Subdomain Mappings</h2>
        <Link to="/mappings/new">
          <button className="btn-primary">+ Create New Mapping</button>
        </Link>
      </div>

      <div className="card">
        <div className="text-center" style={{ padding: 'var(--spacing-2xl) 0' }}>
          <p className="text-lg text-gray mb-3">No mappings configured yet</p>
          <p className="text-gray mb-3">Create your first mapping to start proxying requests.</p>
          <Link to="/mappings/new">
            <button className="btn-primary">Create Mapping</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MappingList;
