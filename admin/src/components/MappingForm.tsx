import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Generate random subdomain (8-12 characters, lowercase alphanumeric)
function generateSubdomain(): string {
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 characters
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
  });

  // Generate subdomain on mount for new mappings
  useEffect(() => {
    if (!isEdit && !formData.subdomain) {
      setFormData(prev => ({
        ...prev,
        subdomain: generateSubdomain()
      }));
    }
  }, [isEdit, formData.subdomain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add default values for active and preservePath
    const submitData = {
      ...formData,
      active: true,
      preservePath: true,
    };
    // TODO: Implement save logic
    console.log('Form data:', submitData);
    alert('Save functionality will be implemented with API integration');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <h2 className="mb-3">{isEdit ? 'Edit Mapping' : 'Create New Mapping'}</h2>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {formData.subdomain && (
            <div className="mb-3">
              <label htmlFor="subdomain">Subdomain</label>
              <input
                type="text"
                id="subdomain"
                name="subdomain"
                value={formData.subdomain}
                readOnly
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  cursor: 'not-allowed',
                  opacity: 0.7
                }}
              />
              <p className="text-sm text-gray mt-1 mb-0">
                Will be accessible at: <strong>{formData.subdomain}.toran.dev</strong>
              </p>
            </div>
          )}

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

          <div className="mb-4">
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
