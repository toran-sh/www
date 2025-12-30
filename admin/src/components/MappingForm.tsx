import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

function MappingForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    subdomain: '',
    destinationUrl: '',
    name: '',
    description: '',
    tags: '',
    active: true,
    preservePath: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save logic
    console.log('Form data:', formData);
    alert('Save functionality will be implemented with API integration');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div>
      <h2 className="mb-3">{isEdit ? 'Edit Mapping' : 'Create New Mapping'}</h2>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="subdomain">Subdomain *</label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              value={formData.subdomain}
              onChange={handleChange}
              placeholder="api"
              required
              pattern="[a-zA-Z0-9-]+"
              title="Only letters, numbers, and hyphens allowed"
            />
            <p className="text-sm text-gray mt-1 mb-0">
              Will be accessible at: <strong>{formData.subdomain || 'subdomain'}.toran.dev</strong>
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="destinationUrl">Destination URL *</label>
            <input
              type="url"
              id="destinationUrl"
              name="destinationUrl"
              value={formData.destinationUrl}
              onChange={handleChange}
              placeholder="https://api.example.com"
              required
            />
            <p className="text-sm text-gray mt-1 mb-0">Must be a valid HTTPS URL</p>
          </div>

          <div className="mb-3">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Production API"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Main API server for production"
              rows={3}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="production, api, main"
            />
          </div>

          <div className="mb-3">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="preservePath"
                checked={formData.preservePath}
                onChange={handleChange}
                style={{ width: 'auto', margin: 0 }}
              />
              <span>Preserve path (forward URL path to destination)</span>
            </label>
          </div>

          <div className="mb-4">
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                style={{ width: 'auto', margin: 0 }}
              />
              <span>Active (enable this mapping)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Update Mapping' : 'Create Mapping'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/mappings')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MappingForm;
