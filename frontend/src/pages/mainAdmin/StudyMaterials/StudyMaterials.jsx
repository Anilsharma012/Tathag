import React, { useState, useEffect } from 'react';
import { FaPlus, FaDownload, FaEdit, FaTrash, FaEye, FaFileAlt, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './StudyMaterials.css';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    type: 'All Types',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject: 'Quantitative Aptitude',
    type: 'PDF',
    tags: '',
    file: null
  });

  const [uploadLoading, setUploadLoading] = useState(false);

  const subjects = ['All Subjects', 'Quantitative Aptitude', 'Verbal Ability', 'Data Interpretation', 'Logical Reasoning', 'General Knowledge'];
  const types = ['All Types', 'PDF', 'Video', 'Practice Sets', 'Notes', 'Other'];

  // Fetch study materials
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.subject !== 'All Subjects' && { subject: filters.subject }),
        ...(filters.type !== 'All Types' && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/study-materials/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setMaterials(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch study materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch study materials');
    } finally {
      setLoading(false);
    }
  };

  // Upload study material
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('subject', uploadData.subject);
      formData.append('type', uploadData.type);
      formData.append('tags', uploadData.tags);
      formData.append('file', uploadData.file);

      const response = await fetch('/api/study-materials/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Study material uploaded successfully!');
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          subject: 'Quantitative Aptitude',
          type: 'PDF',
          tags: '',
          file: null
        });
        fetchMaterials();
      } else {
        toast.error(data.message || 'Failed to upload study material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload study material');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete study material
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study material?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/study-materials/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Study material deleted successfully!');
        fetchMaterials();
      } else {
        toast.error(data.message || 'Failed to delete study material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete study material');
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    fetchMaterials();
  }, [pagination.page, filters]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄';
      case 'Video': return '🎥';
      case 'Practice Sets': return '📝';
      case 'Notes': return '📖';
      default: return '📁';
    }
  };

  return (
    <div className="study-materials-container">
      <div className="study-materials-header">
        <div className="header-left">
          <h1><FaFileAlt /> Study Materials Management</h1>
          <p>Upload and manage study materials for students</p>
        </div>
        <button 
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
        >
          <FaPlus /> Upload Material
        </button>
      </div>

      {/* Filters */}
      <div className="materials-filters">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={filters.subject}
            onChange={(e) => handleFilterChange('subject', e.target.value)}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="search-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search materials..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Materials Table */}
      <div className="materials-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading study materials...</p>
          </div>
        ) : (
          <table className="materials-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Size</th>
                <th>Downloads</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    No study materials found
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material._id}>
                    <td className="material-info">
                      <div className="material-details">
                        <span className="file-icon">{getFileIcon(material.type)}</span>
                        <div>
                          <h4>{material.title}</h4>
                          <p>{material.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="subject-badge">{material.subject}</span>
                    </td>
                    <td>
                      <span className="type-badge">{material.type}</span>
                    </td>
                    <td>{material.fileSize}</td>
                    <td>{material.downloadCount}</td>
                    <td>{formatDate(material.createdAt)}</td>
                    <td className="actions">
                      <button 
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        title="Edit Material"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        title="Delete Material"
                        onClick={() => handleDelete(material._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {pagination.page} of {pagination.pages}
          </span>
          
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h2>Upload Study Material</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter material title"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    value={uploadData.subject}
                    onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  >
                    {subjects.filter(s => s !== 'All Subjects').map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    {types.filter(t => t !== 'All Types').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="form-group">
                <label>File *</label>
                <input
                  type="file"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov,.wmv"
                  required
                />
                <small>Supported formats: PDF, Word documents, Images, Videos (Max: 100MB)</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
