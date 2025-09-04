import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlay, 
  FiCalendar, 
  FiBookOpen, 
  FiUsers, 
  FiClock,
  FiTrendingUp,
  FiArrowRight 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import AdminLayout from '../../AdminLayout/AdminLayout';
import StatusCard from '../../../../components/shared/StatusCard/StatusCard';
import { BatchChip } from '../../../../components/shared/SubjectChip/SubjectChip';
import './AcademicsOverview.css';

const AcademicsOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: {
      liveToday: 0,
      classesThisWeek: 0,
      subjectsInProgress: 0,
      joinableNow: 0,
      expiringEnrollments: 0
    },
    batchChips: []
  });

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/admin/academics/overview', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        throw new Error(result.message || 'Failed to load overview data');
      }
    } catch (error) {
      console.error('Overview fetch error:', error);
      toast.error('Failed to load overview data');
      
      // Set fallback data to prevent UI from breaking
      setData({
        kpis: {
          liveToday: 0,
          classesThisWeek: 0,
          subjectsInProgress: 0,
          joinableNow: 0,
          expiringEnrollments: 0
        },
        batchChips: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleBatchClick = (batchId) => {
    navigate(`/admin/academics/batches?selected=${batchId}`);
  };

  const kpiCards = [
    {
      title: 'Live Today',
      value: data.kpis.liveToday,
      subtitle: 'Sessions happening today',
      icon: FiPlay,
      variant: 'primary'
    },
    {
      title: 'Classes This Week',
      value: data.kpis.classesThisWeek,
      subtitle: 'Total scheduled sessions',
      icon: FiCalendar,
      variant: 'success'
    },
    {
      title: 'Subjects In Progress',
      value: data.kpis.subjectsInProgress,
      subtitle: 'Active learning tracks',
      icon: FiBookOpen,
      variant: 'info'
    },
    {
      title: 'Joinable Now',
      value: data.kpis.joinableNow,
      subtitle: 'Students can join live',
      icon: FiUsers,
      variant: 'warning'
    },
    {
      title: 'Expiring Soon',
      value: data.kpis.expiringEnrollments,
      subtitle: 'Enrollments expire in 30d',
      icon: FiClock,
      variant: 'danger'
    }
  ];

  return (
    <AdminLayout>
      <div className="academics-overview">
        <div className="overview-header">
          <div className="overview-header-content">
            <h1>Academics Overview</h1>
            <p>Real-time analytics and batch monitoring</p>
          </div>
          <div className="overview-header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/admin/academics/batches')}
            >
              <FiArrowRight />
              Manage Batches
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {kpiCards.map((kpi, index) => (
            <StatusCard
              key={index}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              icon={kpi.icon}
              variant={kpi.variant}
              loading={loading}
            />
          ))}
        </div>

        {/* Batch Overview */}
        <div className="batch-overview-section">
          <div className="section-header">
            <h2>Batch Status</h2>
            <p>Current subject progress across all batches</p>
          </div>

          {loading ? (
            <div className="batch-chips-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="batch-chip-skeleton">
                  <div className="skeleton-header"></div>
                  <div className="skeleton-subject"></div>
                  <div className="skeleton-meta"></div>
                </div>
              ))}
            </div>
          ) : data.batchChips.length === 0 ? (
            <div className="empty-state">
              <FiBookOpen size={48} />
              <h3>No Batches Found</h3>
              <p>Create batches to start managing academic sessions</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/academics/batches')}
              >
                Create First Batch
              </button>
            </div>
          ) : (
            <div className="batch-chips-grid">
              {data.batchChips.map(batch => (
                <BatchChip
                  key={batch.id}
                  batchName={batch.name}
                  currentSubject={batch.currentSubject}
                  coursesCount={batch.coursesCount}
                  onClick={() => handleBatchClick(batch.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="quick-stats-section">
          <div className="section-header">
            <h2>Today's Summary</h2>
          </div>
          
          <div className="quick-stats-grid">
            <div className="quick-stat-card">
              <div className="quick-stat-icon">
                <FiTrendingUp />
              </div>
              <div className="quick-stat-content">
                <h3>Performance Trend</h3>
                <p className="trend-positive">
                  +12% attendance this week
                </p>
              </div>
            </div>
            
            <div className="quick-stat-card">
              <div className="quick-stat-icon">
                <FiUsers />
              </div>
              <div className="quick-stat-content">
                <h3>Active Students</h3>
                <p>
                  {data.kpis.joinableNow} students ready for live sessions
                </p>
              </div>
            </div>
            
            <div className="quick-stat-card">
              <div className="quick-stat-icon">
                <FiClock />
              </div>
              <div className="quick-stat-content">
                <h3>Upcoming Actions</h3>
                <p>
                  {data.kpis.expiringEnrollments} enrollments need attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AcademicsOverview;
