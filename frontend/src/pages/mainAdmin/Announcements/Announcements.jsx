import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBullhorn, FaFilter, FaSearch, FaThumbtack, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    targetAudience: 'all',
    isActive: 'true',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    targetAudience: 'all',
    isPinned: false,
    expiryDate: '',
    tags: ''
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'important', label: 'Important' },
    { value: 'update', label: 'Update' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'general', label: 'General' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const audiences = [
    { value: 'all', label: 'All Audiences' },
    { value: 'students', label: 'Students' },
    { value: 'teachers', label: 'Teachers' },
    { value: 'admins', label: 'Admins' }
  ];

  // Fetch announcements
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.targetAudience !== 'all' && { targetAudience: filters.targetAudience }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/announcements/admin?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.data);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/announcements/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create/Update announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const url = editingAnnouncement 
        ? `/api/announcements/admin/${editingAnnouncement._id}`
        : '/api/announcements/admin';
      
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      let data = null;
      try {
        if (!response.bodyUsed) {
          const responseClone = response.clone();
          data = await responseClone.json();
        } else {
          // Body already consumed elsewhere — try to parse directly (may still fail)
          try {
            data = await response.json();
          } catch (innerErr) {
            console.warn('Response body already used and could not parse JSON:', innerErr);
            data = null;
          }
        }
      } catch (parseErr) {
        console.warn('Could not parse response JSON:', parseErr);
      }

      if (data && data.success) {
        toast.success(editingAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
        setShowCreateModal(false);
        setEditingAnnouncement(null);
        resetForm();
        fetchAnnouncements();
        fetchStats();
      } else {
        const msg = data && data.message ? data.message : `Failed to save announcement (status ${response.status})`;
        toast.error(msg);
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/announcements/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Announcement deleted successfully!');
        fetchAnnouncements();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetAudience: 'all',
      isPinned: false,
      expiryDate: '',
      tags: ''
    });
  };

  // Edit announcement
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      isPinned: announcement.isPinned,
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : '',
      tags: announcement.tags ? announcement.tags.join(', ') : ''
    });
    setShowCreateModal(true);
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
    fetchAnnouncements();
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'important': return '🚨';
      case 'update': return '📢';
      case 'reminder': return '⏰';
      case 'maintenance': return '����';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div className="header-left">
          <h1><FaBullhorn /> Announcements Management</h1>
          <p>Create and manage announcements for students and staff</p>
        </div>
        <button 
          className="create-btn"
          onClick={() => {
            resetForm();
            setEditingAnnouncement(null);
            setShowCreateModal(true);
          }}
        >
          <FaPlus /> Create Announcement
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaBullhorn />
            </div>
            <div className="stat-info">
              <h3>{stats.overview.total}</h3>
              <p>Total Announcements</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon active">
              <FaEye />
            </div>
            <div className="stat-info">
              <h3>{stats.overview.active}</h3>
              <p>Active Announcements</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pinned">
              <FaThumbtack />
            </div>
            <div className="stat-info">
              <h3>{stats.overview.pinned}</h3>
              <p>Pinned Announcements</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon views">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>{stats.overview.totalViews}</h3>
              <p>Total Views</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="announcements-filters">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filters.targetAudience}
            onChange={(e) => handleFilterChange('targetAudience', e.target.value)}
          >
            {audiences.map(audience => (
              <option key={audience.value} value={audience.value}>{audience.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select 
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="search-group">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Announcements Table */}
      <div className="announcements-table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading announcements...</p>
          </div>
        ) : (
          <table className="announcements-table">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No announcements found
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement._id}>
                    <td className="announcement-info">
                      <div className="announcement-details">
                        <span className="type-icon">{getTypeIcon(announcement.type)}</span>
                        <div>
                          <h4>
                            {announcement.isPinned && <FaThumbtack className="pin-icon" />}
                            {announcement.title}
                          </h4>
                          <p>{announcement.content.substring(0, 100)}...</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{announcement.type}</span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ background: getPriorityColor(announcement.priority) }}
                      >
                        {announcement.priority}
                      </span>
                    </td>
                    <td>
                      <span className="audience-badge">{announcement.targetAudience}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${announcement.isActive ? 'active' : 'inactive'}`}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{announcement.viewCount}</td>
                    <td>{formatDate(announcement.createdAt)}</td>
                    <td className="actions">
                      <button 
                        className="action-btn view-btn"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        title="Edit Announcement"
                        onClick={() => handleEdit(announcement)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        title="Delete Announcement"
                        onClick={() => handleDelete(announcement._id)}
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="announcement-modal">
            <div className="modal-header">
              <h2>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAnnouncement(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="announcement-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter announcement title"
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  placeholder="Enter announcement content"
                  rows="6"
                  maxLength="2000"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    required
                  >
                    {types.filter(t => t.value !== 'all').map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    required
                  >
                    {priorities.filter(p => p.value !== 'all').map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    required
                  >
                    {audiences.map(audience => (
                      <option key={audience.value} value={audience.value}>{audience.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                  />
                  <span className="checkmark"></span>
                  Pin this announcement (appears at top)
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAnnouncement(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="submit-btn"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : (editingAnnouncement ? 'Update Announcement' : 'Create Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
