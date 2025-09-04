import React, { useState, useEffect } from 'react';
import './DiscussionForum.css';
import {
  FiMessageCircle,
  FiUsers,
  FiStar,
  FiPlus,
  FiSearch,
  FiFilter,
  FiHeart,
  FiShare2,
  FiEye,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
  FiTag,
  FiTrendingUp
} from 'react-icons/fi';

const DiscussionForum = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'recent',
    search: ''
  });
  const [forumStats, setForumStats] = useState({
    totalQuestions: 0,
    activeMembers: 0,
    averageRating: 0
  });

  // Fetch discussions from API
  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 10,
        category: filters.category !== 'all' ? filters.category : '',
        search: filters.search,
        sortBy: filters.sortBy
      });

      const response = await fetch(`/api/discussions/published?${queryParams}`);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setDiscussions(data.discussions || []);
        // Update forum stats
        setForumStats({
          totalQuestions: data.pagination?.total || 0,
          activeMembers: 234, // This could come from API
          averageRating: 4.8 // This could come from API
        });
      } else {
        console.error('Failed to fetch discussions:', data.message);
        setDiscussions([]);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
      // Set empty stats on error
      setForumStats({
        totalQuestions: 0,
        activeMembers: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleVote = async (discussionId, voteType) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        alert('Please login to vote');
        return;
      }

      const response = await fetch(`/api/discussions/${discussionId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Update the discussion in state
        setDiscussions(prev => prev.map(disc =>
          disc._id === discussionId
            ? { ...disc, upvotes: data.upvotes, downvotes: data.downvotes }
            : disc
        ));
      } else {
        console.error('Vote failed:', data.message);
        alert(data.message || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'quantitative-aptitude': '#3b82f6',
      'verbal-ability': '#10b981',
      'data-interpretation': '#f59e0b',
      'logical-reasoning': '#8b5cf6',
      'current-affairs': '#ef4444',
      'general': '#6b7280'
    };
    return colors[category] || colors.general;
  };

  const CreateDiscussionModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      content: '',
      category: 'general',
      tags: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          alert('Please login to ask a question');
          return;
        }

        const response = await fetch('/api/discussions/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          alert('Question submitted successfully! It will be published after admin approval.');
          setShowCreateModal(false);
          setFormData({ title: '', content: '', category: 'general', tags: '' });
          fetchDiscussions(); // Refresh discussions
        } else {
          alert(data.message || 'Failed to submit question');
        }
      } catch (error) {
        console.error('Error creating discussion:', error);
        alert('Failed to submit question');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Ask a Question</h3>
            <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
          </div>
          
          <form onSubmit={handleSubmit} className="create-discussion-form">
            <div className="form-group">
              <label>Question Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's your question?"
                required
                maxLength={200}
              />
              <small>{formData.title.length}/200 characters</small>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="general">General</option>
                <option value="quantitative-aptitude">Quantitative Aptitude</option>
                <option value="verbal-ability">Verbal Ability</option>
                <option value="data-interpretation">Data Interpretation</option>
                <option value="logical-reasoning">Logical Reasoning</option>
                <option value="current-affairs">Current Affairs</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Question Details *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Describe your question in detail..."
                required
                rows={6}
              />
            </div>

            <div className="form-group">
              <label>Tags (Optional)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Add tags separated by commas (e.g., algebra, shortcuts, CAT)"
              />
              <small>Add relevant tags to help others find your question</small>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="submit-btn">
                {submitting ? 'Submitting...' : 'Submit Question'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="discussion-forum">
      <div className="forum-header">
        <div className="section-header">
          <h2>Doubts & Discussions</h2>
          <button 
            className="primary-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Ask Question
          </button>
        </div>

        <div className="forum-stats">
          <div className="stat-item">
            <FiMessageCircle />
            <span>{forumStats.totalQuestions} Questions</span>
          </div>
          <div className="stat-item">
            <FiUsers />
            <span>{forumStats.activeMembers} Active Members</span>
          </div>
          <div className="stat-item">
            <FiStar />
            <span>{forumStats.averageRating} Average Rating</span>
          </div>
        </div>
      </div>

      <div className="forum-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search discussions..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-controls">
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

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="upvotes">Most Upvoted</option>
          </select>
        </div>
      </div>

      <div className="discussions-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading discussions...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="empty-state">
            <FiMessageCircle size={48} />
            <h3>No discussions found</h3>
            <p>Be the first to ask a question!</p>
            <button 
              className="primary-btn"
              onClick={() => setShowCreateModal(true)}
            >
              Ask Question
            </button>
          </div>
        ) : (
          discussions.map((discussion) => (
            <div key={discussion._id} className="discussion-card">
              <div className="discussion-votes">
                <button 
                  className="vote-btn upvote"
                  onClick={() => handleVote(discussion._id, 'upvote')}
                >
                  <FiArrowUp />
                </button>
                <span className="vote-count">{discussion.upvotes?.length || 0}</span>
                <button 
                  className="vote-btn downvote"
                  onClick={() => handleVote(discussion._id, 'downvote')}
                >
                  <FiArrowDown />
                </button>
              </div>

              <div className="discussion-content">
                <div className="discussion-header">
                  <h4 className="discussion-title">{discussion.title}</h4>
                  <span 
                    className="category-tag"
                    style={{ backgroundColor: getCategoryColor(discussion.category) }}
                  >
                    {discussion.category.replace('-', ' ')}
                  </span>
                </div>

                <p className="discussion-excerpt">
                  {discussion.content.length > 150 
                    ? discussion.content.substring(0, 150) + '...'
                    : discussion.content
                  }
                </p>

                {discussion.tags && discussion.tags.length > 0 && (
                  <div className="discussion-tags">
                    {discussion.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        <FiTag /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="discussion-meta">
                  <div className="author-info">
                    <span>Asked by {discussion.askedBy?.name || 'Anonymous'}</span>
                    <span className="time">
                      <FiClock /> {formatTime(discussion.createdAt)}
                    </span>
                  </div>

                  <div className="discussion-stats">
                    <span><FiEye /> {discussion.views || 0} views</span>
                    <span><FiMessageCircle /> {discussion.replies?.length || 0} replies</span>
                    {discussion.isPinned && (
                      <span className="pinned-badge">
                        <FiStar /> Pinned
                      </span>
                    )}
                  </div>
                </div>

                <div className="discussion-actions">
                  <button 
                    className="action-btn"
                    onClick={() => setSelectedDiscussion(discussion)}
                  >
                    View Discussion
                  </button>
                  <button className="action-btn secondary">
                    <FiShare2 /> Share
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && <CreateDiscussionModal />}
    </div>
  );
};

export default DiscussionForum;
