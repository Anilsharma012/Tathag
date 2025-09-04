import React, { useState, useEffect } from 'react';
import './DiscussionManagement.css';
import {
  FiMessageCircle,
  FiUsers,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiBarChart2,
  FiClock,
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiMoreVertical,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi';

const DiscussionManagement = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [replies, setReplies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : '',
        category: filters.category !== 'all' ? filters.category : '',
        search: filters.search
      });

      const response = await fetch(`/api/admin/discussions/discussions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setDiscussions(data.discussions);
      } else {
        console.error('Failed to fetch discussions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 20,
        status: filters.status !== 'all' ? filters.status : ''
      });

      const response = await fetch(`/api/admin/discussions/replies?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReplies(data.replies);
      } else {
        console.error('Failed to fetch replies:', data.message);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/discussions/discussions/stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'discussions') {
      fetchDiscussions();
    } else if (activeTab === 'replies') {
      fetchReplies();
    }
  }, [activeTab, filters]);

  const moderateDiscussion = async (discussionId, action, moderationNote = '') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/discussions/discussions/${discussionId}/moderate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, moderationNote })
      });

      const data = await response.json();
      if (data.success) {
        fetchDiscussions();
        fetchStats();
        alert(`Discussion ${action}ed successfully`);
      } else {
        alert(data.message || 'Failed to moderate discussion');
      }
    } catch (error) {
      console.error('Error moderating discussion:', error);
      alert('Failed to moderate discussion');
    }
  };

  const moderateReply = async (replyId, action, moderationNote = '') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/discussions/replies/${replyId}/moderate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, moderationNote })
      });

      const data = await response.json();
      if (data.success) {
        fetchReplies();
        alert(`Reply ${action}ed successfully`);
      } else {
        alert(data.message || 'Failed to moderate reply');
      }
    } catch (error) {
      console.error('Error moderating reply:', error);
      alert('Failed to moderate reply');
    }
  };

  const deleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/discussions/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchDiscussions();
        fetchStats();
        alert('Discussion deleted successfully');
      } else {
        alert(data.message || 'Failed to delete discussion');
      }
    } catch (error) {
      console.error('Error deleting discussion:', error);
      alert('Failed to delete discussion');
    }
  };

  const deleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/discussions/replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchReplies();
        alert('Reply deleted successfully');
      } else {
        alert(data.message || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', bg: '#fef3c7', text: 'Pending' },
      approved: { color: '#10b981', bg: '#d1fae5', text: 'Approved' },
      rejected: { color: '#ef4444', bg: '#fee2e2', text: 'Rejected' },
      resolved: { color: '#8b5cf6', bg: '#ede9fe', text: 'Resolved' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span 
        className="status-badge"
        style={{ 
          color: config.color, 
          backgroundColor: config.bg 
        }}
      >
        {config.text}
      </span>
    );
  };

  const StatsOverview = () => (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon">
          <FiMessageCircle />
        </div>
        <div className="stat-info">
          <h3>{stats.total || 0}</h3>
          <p>Total Discussions</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon pending">
          <FiClock />
        </div>
        <div className="stat-info">
          <h3>{stats.pending || 0}</h3>
          <p>Pending Approval</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon approved">
          <FiCheckCircle />
        </div>
        <div className="stat-info">
          <h3>{stats.approved || 0}</h3>
          <p>Approved</p>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">
          <FiUsers />
        </div>
        <div className="stat-info">
          <h3>{stats.totalReplies || 0}</h3>
          <p>Total Replies</p>
        </div>
      </div>
    </div>
  );

  const DiscussionCard = ({ discussion }) => (
    <div className="management-card">
      <div className="card-header">
        <div className="discussion-info">
          <h4>{discussion.title}</h4>
          <div className="discussion-meta">
            <span>By {discussion.askedBy?.name || 'Anonymous'}</span>
            <span>{formatDate(discussion.createdAt)}</span>
            <span className="category-tag">{discussion.category}</span>
            {getStatusBadge(discussion.status)}
          </div>
        </div>
        <div className="card-actions">
          <div className="action-dropdown">
            <button className="action-btn">
              <FiMoreVertical />
            </button>
            <div className="dropdown-menu">
              {discussion.status === 'pending' && (
                <>
                  <button onClick={() => moderateDiscussion(discussion._id, 'approve')}>
                    <FiCheckCircle /> Approve
                  </button>
                  <button onClick={() => moderateDiscussion(discussion._id, 'reject')}>
                    <FiXCircle /> Reject
                  </button>
                </>
              )}
              <button onClick={() => moderateDiscussion(discussion._id, discussion.isPublished ? 'unpublish' : 'publish')}>
                <FiEye /> {discussion.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => moderateDiscussion(discussion._id, discussion.isPinned ? 'unpin' : 'pin')}>
                <FiStar /> {discussion.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => deleteDiscussion(discussion._id)} className="delete-action">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <p>{discussion.content.substring(0, 200)}...</p>
        <div className="discussion-stats">
          <span><FiEye /> {discussion.views || 0} views</span>
          <span><FiMessageCircle /> {discussion.replies?.length || 0} replies</span>
          <span><FiThumbsUp /> {discussion.upvotes?.length || 0} upvotes</span>
        </div>
      </div>
    </div>
  );

  const ReplyCard = ({ reply }) => (
    <div className="management-card">
      <div className="card-header">
        <div className="reply-info">
          <h4>Reply to: {reply.discussionId?.title || 'Unknown Discussion'}</h4>
          <div className="reply-meta">
            <span>By {reply.repliedBy?.name || 'Anonymous'}</span>
            <span>{formatDate(reply.createdAt)}</span>
            {getStatusBadge(reply.status)}
            {reply.isBestAnswer && (
              <span className="best-answer-badge">
                <FiCheckCircle /> Best Answer
              </span>
            )}
          </div>
        </div>
        <div className="card-actions">
          <div className="action-dropdown">
            <button className="action-btn">
              <FiMoreVertical />
            </button>
            <div className="dropdown-menu">
              {reply.status === 'pending' && (
                <>
                  <button onClick={() => moderateReply(reply._id, 'approve')}>
                    <FiCheckCircle /> Approve
                  </button>
                  <button onClick={() => moderateReply(reply._id, 'reject')}>
                    <FiXCircle /> Reject
                  </button>
                </>
              )}
              <button onClick={() => moderateReply(reply._id, reply.isBestAnswer ? 'unmark_best' : 'mark_best')}>
                <FiCheckCircle /> {reply.isBestAnswer ? 'Unmark Best' : 'Mark as Best'}
              </button>
              <button onClick={() => deleteReply(reply._id)} className="delete-action">
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <p>{reply.content}</p>
        <div className="reply-stats">
          <span><FiThumbsUp /> {reply.upvotes?.length || 0} upvotes</span>
          <span><FiThumbsDown /> {reply.downvotes?.length || 0} downvotes</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="discussion-management">
      <div className="management-header">
        <h1>Discussion Management</h1>
        <button onClick={() => {
          if (activeTab === 'discussions') fetchDiscussions();
          else if (activeTab === 'replies') fetchReplies();
          fetchStats();
        }} className="refresh-btn">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      <StatsOverview />

      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeTab === 'discussions' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          <FiMessageCircle /> Discussions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'replies' ? 'active' : ''}`}
          onClick={() => setActiveTab('replies')}
        >
          <FiUsers /> Replies
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiBarChart2 /> Analytics
        </button>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search discussions..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="resolved">Resolved</option>
        </select>

        {activeTab === 'discussions' && (
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="quantitative-aptitude">Quantitative Aptitude</option>
            <option value="verbal-ability">Verbal Ability</option>
            <option value="data-interpretation">Data Interpretation</option>
            <option value="logical-reasoning">Logical Reasoning</option>
            <option value="current-affairs">Current Affairs</option>
            <option value="technical">Technical</option>
          </select>
        )}
      </div>

      <div className="management-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'discussions' && (
              <div className="discussions-list">
                {discussions.length === 0 ? (
                  <div className="empty-state">
                    <FiMessageCircle size={48} />
                    <h3>No discussions found</h3>
                    <p>No discussions match your current filters.</p>
                  </div>
                ) : (
                  discussions.map((discussion) => (
                    <DiscussionCard key={discussion._id} discussion={discussion} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'replies' && (
              <div className="replies-list">
                {replies.length === 0 ? (
                  <div className="empty-state">
                    <FiUsers size={48} />
                    <h3>No replies found</h3>
                    <p>No replies match your current filters.</p>
                  </div>
                ) : (
                  replies.map((reply) => (
                    <ReplyCard key={reply._id} reply={reply} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-content">
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h3>Discussion Activity</h3>
                    <div className="metric">
                      <span className="metric-value">{stats.total || 0}</span>
                      <span className="metric-label">Total Discussions</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>Pending Moderation</h3>
                    <div className="metric">
                      <span className="metric-value">{stats.pending || 0}</span>
                      <span className="metric-label">Awaiting Review</span>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>Category Distribution</h3>
                    <div className="category-stats">
                      {stats.categoryStats?.map((cat, index) => (
                        <div key={index} className="category-item">
                          <span className="category-name">{cat._id}</span>
                          <span className="category-count">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscussionManagement;
