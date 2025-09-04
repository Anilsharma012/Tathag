import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import './Dashboard-purchases.css';
import { fetchPublishedCourses } from '../../utils/api';
import DiscussionForum from '../../components/DiscussionForum/DiscussionForum';
import MockTestPage from './MockTests/MockTestPage';
import { fetchLiveClasses } from '../../utils/liveClassesApi';
import { getCache as getLiveCache, setCache as setLiveCache, shouldRevalidate as shouldRevalidateLive } from '../../utils/liveClassesCache';
import NextStepCard from '../../components/Student/NextStep/NextStepCard';
import {
  FiHome,
  FiBook,
  FiVideo,
  FiEdit3,
  FiTarget,
  FiBarChart2,
  FiMessageCircle,
  FiDownload,
  FiCalendar,
  FiBell,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiChevronDown,
  FiPlay,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiEye,
  FiShare2,
  FiFileText
} from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: 'Student',
    email: 'student@example.com',
    profileImage: null,
    streak: 15,
    totalPoints: 2850
  });
  const [myCourses, setMyCourses] = useState([]);
  const [myCoursesLoading, setMyCoursesLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  // Payment History and Receipts state
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const purchasesLoadedRef = useRef(false);

  // Offline payment upload state
  const [offlineForm, setOfflineForm] = useState({ courseId: '', amount: '', note: '' });
  const [offlineFile, setOfflineFile] = useState(null);
  const [offlineUploading, setOfflineUploading] = useState(false);

  const onOfflineField = (k, v) => setOfflineForm(prev => ({ ...prev, [k]: v }));

  const submitOfflinePayment = async (e) => {
    e.preventDefault();
    if (!offlineForm.courseId || !offlineForm.amount || !offlineFile) return;
    try {
      setOfflineUploading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('auth');
      const fd = new FormData();
      fd.append('courseId', offlineForm.courseId);
      fd.append('amount', String(Math.round(Number(offlineForm.amount) * 100)));
      if (offlineForm.note) fd.append('note', offlineForm.note);
      fd.append('slip', offlineFile);

      const resp = await fetch('/api/payments/offline/submit', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd
      });

      const contentType = resp.headers.get('content-type') || '';
      let body = null;
      try {
        if (!resp.bodyUsed) {
          const respClone = resp.clone();
          if (contentType.includes('application/json')) body = await respClone.json();
          else body = await respClone.text();
        } else {
          try {
            if (contentType.includes('application/json')) body = await resp.json();
            else body = await resp.text();
          } catch (innerErr) {
            console.warn('Response body already used and could not parse:', innerErr);
            body = null;
          }
        }
      } catch (parseErr) {
        console.warn('Could not parse response body:', parseErr);
        body = null;
      }

      if (!resp.ok) {
        const msg = body && body.message ? body.message : (typeof body === 'string' ? body : 'Upload failed');
        console.error('offline submit failed:', resp.status, msg);
        alert(msg);
        return;
      }

      alert('Offline slip uploaded successfully — pending review');
      setOfflineForm({ courseId: '', amount: '', note: '' });
      setOfflineFile(null);
      // Refresh lists
      loadPaymentHistory();
    } catch (err) {
      console.error('offline submit error:', err);
      alert(err.message || 'Upload failed');
    } finally {
      setOfflineUploading(false);
    }
  };

  // Study Materials state
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialFilters, setMaterialFilters] = useState({
    subject: 'All Subjects',
    type: 'All Types'
  });
  const [downloading, setDownloading] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementFilters, setAnnouncementFilters] = useState({
    type: 'all'
  });

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedAuthToken = localStorage.getItem("authToken");

    if (storedUser && storedAuthToken) {
      setUserDetails({
        name: storedUser.name || 'Student',
        email: storedUser.email || storedUser.phoneNumber || 'student@example.com',
        profileImage: storedUser.profilePic || null,
        streak: 15, // Can be made dynamic later
        totalPoints: 2850 // Can be made dynamic later
      });
    }
  }, []);

  // Function to load courses (can be called for retry)
  const loadCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);

    // Test API connectivity first
    try {
      console.log('🔍 Testing API connectivity...');
      const testResponse = await fetch('/api/test');
      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('✅ API test successful:', testData);
      } else {
        console.log('❌ API test failed:', testResponse.status);
      }
    } catch (testError) {
      console.log('❌ API test error:', testError);
    }

    try {
      const response = await fetchPublishedCourses();
      if (response.success) {
        setCourses(response.courses || []);
      } else {
        setCoursesError('Failed to load courses');
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      console.error('Full error object:', error);

      // Set a more user-friendly error message
      if (error.message.includes('Cannot connect')) {
        setCoursesError('Unable to load courses at the moment. Please check your internet connection and try again.');
      } else {
        setCoursesError(error.message || 'Failed to load courses');
      }

      // Don't set fallback data here - let backend handle it
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Function to load user's enrolled courses
const loadMyCourses = async () => {
  const authToken = localStorage.getItem('authToken');

  if (!authToken) {
    console.warn('⚠️ No auth token found. User not logged in.');
    setMyCourses([]);
    return;
  }

  setMyCoursesLoading(true);
  console.log('🔄 loadMyCourses: Starting to fetch courses...');

  try {
    // Try dev payment endpoint first
    console.log('�� Trying dev endpoint: /api/dev-payment/my-courses');
    let response = await fetch('/api/dev-payment/my-courses');
    console.log('📊 Dev endpoint response status:', response.status);

    // If that fails, try regular endpoint
    if (!response.ok) {
      console.log('🔄 Dev endpoint failed, trying regular endpoint: /api/user/student/my-courses');
      response = await fetch('/api/user/student/my-courses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('📊 Regular endpoint response status:', response.status);
    }

    if (!response.ok) {
      console.warn(`⚠️ API responded with status ${response.status}`);
      console.warn('⚠️ API call failed - not showing demo courses to avoid conflicts');
      setMyCourses([]);
      return;
    }

    const data = await response.json();
    console.log("📦 My Courses Response:", data);
    console.log("🔍 Response structure analysis:");
    console.log("   - data.courses:", data.courses);
    console.log("   - Array.isArray(data.courses):", Array.isArray(data.courses));
    console.log("   - data.courses length:", data.courses ? data.courses.length : 'N/A');

    // Handle different response formats
    let coursesArray = [];
    if (Array.isArray(data.courses)) {
      coursesArray = data.courses;
      console.log('✅ Using data.courses array');
    } else if (Array.isArray(data)) {
      coursesArray = data;
      console.log('��� Using data as array');
    } else if (data.data && Array.isArray(data.data)) {
      coursesArray = data.data;
      console.log('✅ Using data.data array');
    } else {
      console.warn('⚠️ No courses array found in response:', data);
    }

    console.log('📚 Final courses array:', coursesArray);
    console.log('📊 Setting courses count:', coursesArray.length);
    setMyCourses(coursesArray);

    // Load progress for each enrolled course
    try {
      const token = localStorage.getItem('authToken');
      await Promise.all(
        coursesArray.map(async (enr) => {
          const courseId = (enr.courseId && typeof enr.courseId === 'object') ? enr.courseId._id : (enr.courseId || enr._id);
          if (!courseId) return;
          try {
            const resp = await fetch(`/api/progress/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (resp.ok) {
              const d = await resp.json();
              const percent = d?.progress?.overallProgress ?? 0;
              setCourseProgress((prev) => ({ ...prev, [courseId]: Number(percent) }));
            }
          } catch (_) {}
        })
      );
    } catch (err) {
      console.warn('Failed to load course progress', err);
    }

  } catch (error) {
    console.error('❌ Error fetching my courses:', error);

    // Don't show demo courses as fallback to avoid enrollment conflicts
    console.error('❌ Failed to load my courses - showing empty state');
    setMyCourses([]);
  } finally {
    setMyCoursesLoading(false);
  }
};


  // Fetch published courses on component mount
  useEffect(() => {
    loadCourses();
    loadMyCourses();
  }, []);

  useEffect(() => {
    hydrateLiveClasses();
    // Also refresh when myCourses change (e.g., after purchase)
  }, [myCourses.length]);

  const hydrateLiveClasses = async () => {
    const scope = 'student-dashboard';
    const cached = getLiveCache(scope);
    setUpcomingClasses((cached.items || []).slice(0, 5));
    if (shouldRevalidateLive(scope)) {
      try {
        const data = await fetchLiveClasses({ role: 'student' });
        setLiveCache(scope, data, {});
        setUpcomingClasses((data || []).slice(0, 5));
      } catch (_) {
        // silent fail, keep cache
      }
    }
  };

  const canJoinClass = (it) => {
    const now = new Date();
    const start = new Date(it.startTime);
    const end = new Date(it.endTime);
    return now >= new Date(start.getTime() - 10 * 60000) && now <= new Date(end.getTime() + 30 * 60000);
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Handle payment success redirect
  useEffect(() => {
    if (location.state?.showMyCourses) {
      setActiveSection('my-courses'); // Navigate to My Courses section

      // Immediate refresh to show purchased course
      loadMyCourses();

      if (location.state?.refreshCourses) {
        // Additional refresh after a delay to ensure data is updated
        setTimeout(() => {
          loadMyCourses();
          loadCourses(); // Also refresh available courses
        }, 1000);
      }
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Add periodic refresh for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        if (activeSection === 'my-courses') {
          console.log('🔄 Dev mode: Refreshing My Courses...');
          loadMyCourses();
        }
      }, 5000); // Refresh every 5 seconds in dev mode

      return () => clearInterval(interval);
    }
  }, [activeSection]);

  // Function to load payment history
  const loadPaymentHistory = async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.warn('⚠�� No auth token found. Cannot load payment history.');
      setPaymentHistory([]);
      return;
    }

    setPaymentHistoryLoading(true);

    try {
      const response = await fetch('/api/user/payment/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Payment history API responded with status ${response.status}`);
        setPaymentHistory([]);
        return;
      }

      const data = await response.json();
      console.log("📦 Payment History Response:", data);

      if (data.success && Array.isArray(data.payments)) {
        setPaymentHistory(data.payments);
      } else {
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('❌ Error loading payment history:', error);
      setPaymentHistory([]);
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  // Function to load receipts
  const loadReceipts = async () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.warn('⚠️ No auth token found. Cannot load receipts.');
      setReceipts([]);
      return;
    }

    setReceiptsLoading(true);

    try {
      const response = await fetch('/api/user/receipts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Receipts API responded with status ${response.status}`);
        setReceipts([]);
        return;
      }

      const data = await response.json();
      console.log("📦 Receipts Response:", data);

      if (data.success && Array.isArray(data.receipts)) {
        setReceipts(data.receipts);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('❌ Error loading receipts:', error);
      setReceipts([]);
    } finally {
      setReceiptsLoading(false);
    }
  };

  // Function to download receipt
  const downloadReceipt = async (receiptId, format = 'html') => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      alert('Please login to download receipt');
      return;
    }

    try {
      const response = await fetch(`/api/user/receipt/${receiptId}/download?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      if (format === 'html') {
        const html = await response.text();
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receiptId}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else if (format === 'text') {
        const text = await response.text();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receiptId}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('�� Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  // Handle demo purchase for testing
  const handleDemoPurchase = async (course) => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      alert('Please login first!');
      return;
    }

    try {
      // Simulate payment verification directly
      const response = await fetch('/api/user/payment/verify-and-unlock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          razorpay_order_id: 'demo_order_' + Date.now(),
          razorpay_payment_id: 'demo_payment_' + Date.now(),
          razorpay_signature: 'demo_signature',
          courseId: course._id
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Demo course purchased successfully!');
        // Refresh my courses
        setTimeout(() => {
          loadMyCourses();
          setActiveSection('my-courses'); // Switch to My Courses
        }, 1000);
      } else {
        alert('❌ Demo purchase failed: ' + data.message);
      }
    } catch (error) {
      console.error('Demo purchase error:', error);
      alert('❌ Demo purchase error: ' + error.message);
    }
  };

  // Handle enrollment with authentication check
  const handleEnrollNow = async (course) => {
    const authToken = localStorage.getItem('authToken');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    // Check if user is logged in
    if (!authToken || !storedUser) {
      // Store course details for after login
      localStorage.setItem('pendingCourse', JSON.stringify(course));
      alert('Please login to enroll in this course!');
      navigate('/login');
      return;
    }

    try {
      // Check if already enrolled
      const response = await fetch('/api/user/student/my-courses', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Checking enrollment for course:', course._id);
        console.log('📚 User enrolled courses:', data.courses);

        // Fix: Compare against courseId._id (populated course object) not c._id (enrollment ID)
        // Also filter out demo enrollments with fake IDs
        const realEnrollments = (data.courses || []).filter(c =>
          c._id && !c._id.toString().startsWith('demo_')
        );

        const alreadyEnrolled = course && realEnrollments.some(c => {
          const enrolledCourseId = (c.courseId && c.courseId._id) || c.courseId;
          const matches = enrolledCourseId && enrolledCourseId.toString() === course._id.toString();
          console.log(`📋 Comparing ${enrolledCourseId} with ${course._id}: ${matches}`);
          return matches;
        });

        console.log('✅ Final enrollment check result:', alreadyEnrolled);

        if (alreadyEnrolled) {
          alert('✅ You are already enrolled in this course!');
          setActiveSection('my-courses'); // Switch to My Courses section
          return;
        }
      }

      // Navigate to course purchase page
      navigate('/course-purchase', {
        state: {
          ...course,
          price: course.price || 30000,
          oldPrice: course.oldPrice || 120000,
          features: [
            'Complete CAT preparation material',
            'Live interactive classes',
            'Mock tests and practice sets',
            'Doubt clearing sessions',
            'Performance analysis',
            'Study materials download'
          ]
        }
      });

    } catch (error) {
      console.error('Error checking enrollment:', error);
      // If there's an error, still allow to proceed to purchase
      navigate('/course-purchase', {
        state: {
          ...course,
          price: course.price || 30000,
          oldPrice: course.oldPrice || 120000,
          features: [
            'Complete CAT preparation material',
            'Live interactive classes',
            'Mock tests and practice sets',
            'Doubt clearing sessions',
            'Performance analysis',
            'Study materials download'
          ]
        }
      });
    }
  };

  // Load study materials
  const loadStudyMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        ...(materialFilters.subject !== 'All Subjects' && { subject: materialFilters.subject }),
        ...(materialFilters.type !== 'All Types' && { type: materialFilters.type })
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if we have a valid token
      if (authToken && authToken !== 'null' && authToken !== 'undefined') {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/study-materials/student?${queryParams}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudyMaterials(data.data);
          console.log('✅ Study materials loaded:', data.data.length);
        } else {
          console.error('❌ Failed to load study materials:', data.message);
          setStudyMaterials([]);
        }
      } else {
        console.error('❌ Study materials API error:', response.status);
        setStudyMaterials([]);
      }
    } catch (error) {
      console.error('❌ Error loading study materials:', error);
      setStudyMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Handle material download
  const handleDownloadMaterial = async (materialId, materialTitle) => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken || authToken === 'null' || authToken === 'undefined') {
      alert('Please login to download study materials!');
      navigate('/login');
      return;
    }

    setDownloading(materialId);

    try {
      const response = await fetch(`/api/study-materials/download/${materialId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        // Get the file blob
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = materialTitle;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        console.log('✅ Material downloaded successfully');

        // Refresh materials to update download count
        loadStudyMaterials();
      } else {
        let errorMessage = 'Failed to download material';
        try {
          // Clone response to prevent body stream issues
          const responseClone = response.clone();
          const errorData = await responseClone.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, use default message
          console.warn('Could not parse error response:', parseError);
        }
        alert(errorMessage);
        console.error('❌ Download failed:', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error downloading material:', error);
      alert('Failed to download material. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Load announcements
  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        ...(announcementFilters.type !== 'all' && { type: announcementFilters.type }),
        limit: 20
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if we have a valid token
      if (authToken && authToken !== 'null' && authToken !== 'undefined') {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`/api/announcements/student?${queryParams}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnnouncements(data.data);
          console.log('✅ Announcements loaded:', data.data.length);
        } else {
          console.error('❌ Failed to load announcements:', data.message);
          setAnnouncements([]);
        }
      } else {
        console.error('❌ Announcements API error:', response.status);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('❌ Error loading announcements:', error);
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  // Mark announcement as read
  const markAnnouncementAsRead = async (announcementId) => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken || authToken === 'null' || authToken === 'undefined') {
      return; // Skip if no auth token
    }

    try {
      await fetch(`/api/announcements/mark-read/${announcementId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('❌ Error marking announcement as read:', error);
    }
  };

  // Load study materials when filters change
  useEffect(() => {
    if (activeSection === 'materials') {
      loadStudyMaterials();
    }
  }, [materialFilters, activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load announcements when filters change
  useEffect(() => {
    if (activeSection === 'announcements') {
      loadAnnouncements();
    }
  }, [announcementFilters, activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load purchases data when purchases section becomes active
  useEffect(() => {
    if (activeSection === 'purchases' && !purchasesLoadedRef.current) {
      purchasesLoadedRef.current = true;
      loadPaymentHistory();
      loadReceipts();
    } else if (activeSection !== 'purchases') {
      purchasesLoadedRef.current = false;
    }
  }, [activeSection]);

  // Helper functions for announcements
  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'important': return '🚨';
      case 'update': return '📢';
      case 'reminder': return '⏰';
      case 'maintenance': return '🔧';
      default: return '📄';
    }
  };

  const formatAnnouncementDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'courses', label: 'Available Courses', icon: FiBook },
    { id: 'my-courses', label: 'My Courses', icon: FiBook },
    { id: 'live-classes', label: 'Live Classes', icon: FiVideo },
    { id: 'practice-tests', label: 'Practice Tests', icon: FiEdit3 },
    { id: 'mock-tests', label: 'Mock Tests', icon: FiTarget },
    { id: 'analysis', label: 'Analysis & Reports', icon: FiBarChart2 },
    { id: 'doubts', label: 'Doubts & Discussions', icon: FiMessageCircle },
    { id: 'materials', label: 'Study Materials', icon: FiDownload },
    { id: 'schedule', label: 'Schedule', icon: FiCalendar },
    { id: 'announcements', label: 'Announcements', icon: FiBell },
    { id: 'purchases', label: 'Purchase History', icon: FiFileText },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ];

  const renderPurchasesContent = () => {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount / 100);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'paid': return '#27ae60';
        case 'created': return '#f39c12';
        case 'failed': return '#e74c3c';
        default: return '#7f8c8d';
      }
    };

    return (
      <div className="purchases-content">
        <div className="section-header">
          <h2>Purchase History</h2>
          <p>View your course purchases and download receipts</p>
        </div>

        <div className="purchases-section">
          <div className="section-title">
            <h3>Payment History</h3>
            {paymentHistoryLoading && <span className="loading-indicator">Loading...</span>}
          </div>

          <form className="offline-upload" onSubmit={submitOfflinePayment}>
            <div className="upload-row">
              <div className="upload-field">
                <label>Course</label>
                <select value={offlineForm.courseId} onChange={e => onOfflineField('courseId', e.target.value)}>
                  <option value="">Select course</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="upload-field">
                <label>Amount (INR)</label>
                <input type="number" min="0" step="0.01" value={offlineForm.amount} onChange={e => onOfflineField('amount', e.target.value)} />
              </div>
              <div className="upload-field">
                <label>Slip Photo</label>
                <input type="file" accept="image/*" onChange={e => setOfflineFile(e.target.files?.[0] || null)} />
              </div>
              <div className="upload-field">
                <label>Note</label>
                <input type="text" value={offlineForm.note} onChange={e => onOfflineField('note', e.target.value)} placeholder="Optional" />
              </div>
              <div className="upload-actions">
                <button type="submit" className="download-btn" disabled={offlineUploading || !offlineForm.courseId || !offlineForm.amount || !offlineFile}>
                  {offlineUploading ? 'Uploading…' : 'Upload Offline Slip'}
                </button>
              </div>
            </div>
          </form>

          {paymentHistory.length === 0 && !paymentHistoryLoading ? (
            <div className="empty-state">
              <FiFileText size={48} />
              <h4>No Purchases Yet</h4>
              <p>Your course purchases will appear here</p>
            </div>
          ) : (
            <div className="purchases-grid">
              {paymentHistory.map((payment) => (
                <div key={payment._id} className="purchase-card">
                  <div className="purchase-header">
                    <div className="course-info">
                      <h4>{payment.courseId?.name || 'Course'}</h4>
                      <p>{payment.courseId?.description?.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                    </div>
                    <div className="purchase-status">
                      <span
                        className={`status-badge ${payment.status}`}
                        style={{ backgroundColor: getStatusColor(payment.status) }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="purchase-details">
                    <div className="detail-row">
                      <span>Purchase Date:</span>
                      <span>{formatDate(payment.createdAt)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Amount Paid:</span>
                      <span className="amount">{formatCurrency(payment.amount)}</span>
                    </div>
                    {payment.paymentMethod && (
                      <div className="detail-row">
                        <span>Method:</span>
                        <span>{(payment.paymentMethod || '').toUpperCase()}</span>
                      </div>
                    )}
                    {payment.offlineSlipUrl && (
                      <div className="detail-row">
                        <span>Slip:</span>
                        <a className="link" href={payment.offlineSlipUrl} target="_blank" rel="noreferrer">View</a>
                      </div>
                    )}
                    {payment.validityEndDate && (
                      <div className="detail-row">
                        <span>Valid Until:</span>
                        <span>{formatDate(payment.validityEndDate)}</span>
                      </div>
                    )}
                    {payment.receiptNumber && (
                      <div className="detail-row">
                        <span>Receipt No:</span>
                        <span>{payment.receiptNumber}</span>
                      </div>
                    )}
                  </div>

                  {payment.status === 'paid' && (
                    <div className="purchase-actions">
                      <button
                        className="download-btn"
                        onClick={() => downloadReceipt(payment._id, 'html')}
                      >
                        <FiDownload /> Download Receipt
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="purchases-section">
          <div className="section-title">
            <h3>Receipts</h3>
            {receiptsLoading && <span className="loading-indicator">Loading...</span>}
          </div>

          {receipts.length === 0 && !receiptsLoading ? (
            <div className="empty-state">
              <FiDownload size={48} />
              <h4>No Receipts Available</h4>
              <p>Receipts for successful payments will appear here</p>
            </div>
          ) : (
            <div className="receipts-table">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Downloads</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr key={receipt._id}>
                      <td>{receipt.receiptNumber}</td>
                      <td>{receipt.courseId?.name || 'Course'}</td>
                      <td>{formatDate(receipt.generatedAt)}</td>
                      <td>{formatCurrency(receipt.totalAmount)}</td>
                      <td>{receipt.downloadCount}</td>
                      <td>
                        <div className="receipt-actions">
                          <button
                            className="download-btn small"
                            onClick={() => downloadReceipt(receipt._id, 'html')}
                            title="Download as HTML"
                          >
                            <FiDownload /> HTML
                          </button>
                          <button
                            className="download-btn small"
                            onClick={() => downloadReceipt(receipt._id, 'text')}
                            title="Download as Text"
                          >
                            <FiFileText /> TXT
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboardContent = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Welcome back, {userDetails.name.split(' ')[0]}! 👋</h1>
        <p>Here's your learning progress today</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiBook />
          </div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Available Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <h3>85%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTarget />
          </div>
          <div className="stat-info">
            <h3>12</h3>
            <p>Tests Taken</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>{userDetails.streak}</h3>
            <p>Day Streak</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="progress-chart-card">
          <h3>Learning Progress</h3>
          <Line
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Study Hours',
                data: [3, 4, 2, 5, 3, 6, 4],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>

        <div className="upcoming-classes-card">
          <h3>Upcoming Classes</h3>
          <div className="class-list">
            {upcomingClasses.length === 0 ? (
              <div className="empty-state" style={{padding:'12px 0'}}>
                <FiClock className="empty-icon" />
                <h4>No upcoming classes</h4>
                <p>Your scheduled classes will appear here after enrollment.</p>
              </div>
            ) : (
              upcomingClasses.map(it => (
                <div key={it._id} className="class-item">
                  <div className="class-time">
                    <FiClock />
                    <span>{formatTime(it.startTime)}</span>
                  </div>
                  <div className="class-details">
                    <h4>{it.title}</h4>
                    <p>{it.courseId?.name || it.platform?.toUpperCase()}</p>
                  </div>
                  {canJoinClass(it) ? (
                    <a className="join-btn" href={it.joinLink} target="_blank" rel="noreferrer">
                      <FiPlay /> Join
                    </a>
                  ) : (
                    <button className="join-btn" disabled>
                      <FiPlay /> Locked
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="course-progress-card">
          <h3>Course Progress</h3>
          <Doughnut
            data={{
              labels: ['Completed', 'In Progress', 'Not Started'],
              datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'bottom' } }
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderMyCoursesContent = () => (
    <div className="courses-content">
      <div className="section-header">
        <h2>My Courses</h2>
        <div className="filter-buttons">
          <button className="filter-btn active">All</button>
          <button className="filter-btn">In Progress</button>
          <button className="filter-btn">Completed</button>
        </div>
      </div>

      {myCoursesLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your courses...</p>
        </div>
      ) : myCourses.length === 0 ? (
        <div className="empty-state">
          <FiBook className="empty-icon" />
          <h3>No courses enrolled yet</h3>
          <p>Browse available courses and start learning!</p>
          <button
            className="primary-btn"
            onClick={() => setActiveSection('courses')}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {myCourses.map((enrollmentData, index) => {
            // Handle both populated courseId objects and string IDs
            let course = enrollmentData.courseId || enrollmentData;

            // If courseId is just a string, try to find the course in available courses
            if (typeof course === 'string') {
              const foundCourse = courses.find(c => c._id === course);
              course = foundCourse || {
                _id: course,
                name: 'Course Details Loading...',
                description: 'Course information is being loaded.',
                thumbnail: 'default-course.png'
              };
            }

            // Ensure course has required properties
            if (!course._id) {
              course._id = enrollmentData._id || `course-${index}`;
            }

            return (
              <div key={course._id} className="course-card enrolled">
                <div className="course-thumbnail">
                  {course.thumbnail && course.thumbnail !== 'default-course.jpg' ? (
                    <img
                      src={`/uploads/${course.thumbnail}`}
                      alt={course.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="course-thumbnail-placeholder" style={course.thumbnail && course.thumbnail !== 'default-course.jpg' ? {display: 'none'} : {}}>
                    <FiBook />
                  </div>
                  <div className="enrolled-badge">
                    <FiCheckCircle /> Enrolled
                  </div>
                </div>
                <div className="course-details">
                  <div className="course-header">
                    <h3>{course.name}</h3>
                    <span className="status-badge enrolled">
                      {enrollmentData.status === 'unlocked' ? 'Active' : 'Locked'}
                    </span>
                  </div>
                  <p className="course-description">{course.description || 'Start your learning journey'}</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${Math.min(100, Math.max(0, courseProgress[course._id] || 0))}%`}}></div>
                    </div>
                    <span className="progress-text">{Math.round(courseProgress[course._id] || 0)}% Complete</span>
                  </div>
                  <div className="course-actions">
                    <button
                      className="continue-btn primary"
                      onClick={() => {
                        if (course && course._id) {
                          navigate(`/student/course-content/${course._id}`);
                        } else {
                          console.error('Course ID not found:', course);
                        }
                      }}
                    >
                      <FiPlay /> Continue Learning
                    </button>
                    <button className="info-btn">
                      <FiEye /> View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCoursesContent = () => (
    <div className="courses-content">
      <div className="section-header">
        <h2>Available Courses</h2>
        <div className="filter-buttons">
          <button className="filter-btn active">All Courses</button>
          <button className="filter-btn">Popular</button>
          <button className="filter-btn">Newest</button>
        </div>
      </div>

      {coursesLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : coursesError ? (
        <div className="error-state">
          <p className="error-message">⚠️ {coursesError}</p>
          <button
            className="retry-btn"
            onClick={loadCourses}
            disabled={coursesLoading}
          >
            {coursesLoading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <FiBook className="empty-icon" />
          <h3>No courses available</h3>
          <p>Check back later for new courses!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-thumbnail">
                {course.thumbnail && course.thumbnail !== 'default-course.jpg' ? (
                  <img
                    src={`/uploads/${course.thumbnail}`}
                    alt={course.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="course-thumbnail-placeholder" style={course.thumbnail && course.thumbnail !== 'default-course.jpg' ? {display: 'none'} : {}}>
                  <FiBook />
                </div>
              </div>
              <div className="course-details">
                <div className="course-header">
                  <h3>{course.name}</h3>
                  <span className="price-badge">₹{course.price?.toLocaleString('en-IN') || 'Free'}</span>
                </div>
                <p className="course-description">{course.description || 'No description available'}</p>
                <div className="course-actions">
                  <button
                    className="enroll-btn"
                    onClick={() => handleEnrollNow(course)}
                  >
                    <FiPlay /> Enroll Now
                  </button>
                  <button
                    className="preview-btn"
                    onClick={() => handleDemoPurchase(course)}
                    style={{ backgroundColor: '#4CAF50', color: 'white' }}
                  >
                    🔧 Demo Buy
                  </button>
                  <button className="preview-btn">
                    <FiEye /> Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLiveClassesContent = () => (
    <div className="live-classes-content">
      <div className="section-header">
        <h2>Live Classes</h2>
        <button className="primary-btn" onClick={() => navigate('/student/live-classes')}>View All</button>
      </div>

      <div className="classes-calendar">
        <div className="calendar-header">
          <h3>This Week's Schedule</h3>
        </div>
        <div className="calendar-grid">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="calendar-day">
              <h4>{day}</h4>
              <div className="day-number">{index + 1}</div>
              {index % 2 === 0 && (
                <div className="class-event">
                  <span className="event-time">2:00 PM</span>
                  <span className="event-title">Quant Class</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="upcoming-sessions">
        <h3>Upcoming Live Sessions</h3>
        <div className="sessions-list">
          {[
            { subject: 'Quantitative Aptitude', topic: 'Number Systems', time: 'Today, 2:00 PM', instructor: 'Prof. Sharma' },
            { subject: 'Verbal Ability', topic: 'Critical Reasoning', time: 'Tomorrow, 4:00 PM', instructor: 'Prof. Verma' },
            { subject: 'Data Interpretation', topic: 'Graphs & Charts', time: 'Friday, 3:00 PM', instructor: 'Prof. Singh' }
          ].map((session, index) => (
            <div key={index} className="session-card">
              <div className="session-info">
                <h4>{session.subject}</h4>
                <p>{session.topic}</p>
                <div className="session-meta">
                  <span><FiClock /> {session.time}</span>
                  <span><FiUser /> {session.instructor}</span>
                </div>
              </div>
              <button className="join-session-btn">
                <FiVideo /> Join Live
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPracticeTestsContent = () => (
    <div className="practice-tests-content">
      <div className="section-header">
        <h2>Practice Tests</h2>
        <div className="test-filters">
          <select className="filter-select">
            <option>All Subjects</option>
            <option>Quantitative Aptitude</option>
            <option>Verbal Ability</option>
            <option>Data Interpretation</option>
          </select>
        </div>
      </div>

      <div className="tests-grid">
        {[
          { subject: 'Quantitative Aptitude', tests: 25, attempted: 18, accuracy: 78 },
          { subject: 'Verbal Ability', tests: 20, attempted: 15, accuracy: 82 },
          { subject: 'Data Interpretation', tests: 18, attempted: 12, accuracy: 75 },
          { subject: 'Logical Reasoning', tests: 22, attempted: 10, accuracy: 80 }
        ].map((test, index) => (
          <div key={index} className="test-subject-card">
            <div className="test-header">
              <h3>{test.subject}</h3>
              <span className="accuracy-badge">{test.accuracy}%</span>
            </div>
            <div className="test-stats">
              <div className="stat">
                <span className="stat-number">{test.tests}</span>
                <span className="stat-label">Total Tests</span>
              </div>
              <div className="stat">
                <span className="stat-number">{test.attempted}</span>
                <span className="stat-label">Attempted</span>
              </div>
              <div className="stat">
                <span className="stat-number">{test.accuracy}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
            <button className="start-test-btn">Start Practice</button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMockTestsContent = () => <MockTestPage />;

  const renderAnalysisContent = () => (
    <div className="analysis-content">
      <div className="section-header">
        <h2>Analysis & Reports</h2>
        <div className="date-filter">
          <select>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="performance-chart">
          <h3>Performance Trend</h3>
          <Line
            data={{
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: [
                {
                  label: 'Score',
                  data: [65, 70, 68, 75],
                  borderColor: '#667eea',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                },
                {
                  label: 'Accuracy',
                  data: [78, 82, 80, 85],
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: { legend: { position: 'top' } }
            }}
          />
        </div>

        <div className="subject-wise-analysis">
          <h3>Subject-wise Performance</h3>
          <Bar
            data={{
              labels: ['Quant', 'Verbal', 'DI', 'LR'],
              datasets: [{
                label: 'Accuracy %',
                data: [78, 82, 75, 80],
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } }
            }}
          />
        </div>

        <div className="rank-progress">
          <h3>Rank Progress</h3>
          <div className="rank-stats">
            <div className="rank-item">
              <span className="rank-label">Current Rank</span>
              <span className="rank-value">1,245</span>
            </div>
            <div className="rank-item">
              <span className="rank-label">Best Rank</span>
              <span className="rank-value">987</span>
            </div>
            <div className="rank-item">
              <span className="rank-label">Improvement</span>
              <span className="rank-value improvement">+258</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoubtsContent = () => <DiscussionForum />;

  const renderMaterialsContent = () => (
    <div className="materials-content">
      <div className="section-header">
        <h2>Study Materials</h2>
        <div className="materials-filters">
          <select
            value={materialFilters.subject}
            onChange={(e) => setMaterialFilters(prev => ({ ...prev, subject: e.target.value }))}
          >
            <option>All Subjects</option>
            <option>Quantitative Aptitude</option>
            <option>Verbal Ability</option>
            <option>Data Interpretation</option>
            <option>Logical Reasoning</option>
            <option>General Knowledge</option>
          </select>
          <select
            value={materialFilters.type}
            onChange={(e) => setMaterialFilters(prev => ({ ...prev, type: e.target.value }))}
          >
            <option>All Types</option>
            <option>PDF</option>
            <option>Video</option>
            <option>Practice Sets</option>
            <option>Notes</option>
          </select>
        </div>
      </div>

      <div className="materials-grid">
        {materialsLoading ? (
          <div className="loading-materials">
            <div className="loading-spinner"></div>
            <p>Loading study materials...</p>
          </div>
        ) : studyMaterials.length === 0 ? (
          <div className="no-materials">
            <FiFileText size={48} />
            <h3>No Study Materials Found</h3>
            <p>Check back later for new materials or try different filters.</p>
          </div>
        ) : (
          studyMaterials.map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-icon">
                {material.type === 'PDF' ? <FiDownload /> :
                 material.type === 'Video' ? <FiPlay /> : <FiFileText />}
              </div>
              <div className="material-info">
                <h4>{material.title}</h4>
                <div className="material-meta">
                  <span className="material-type">{material.type}</span>
                  <span className="material-size">{material.fileSize}</span>
                  <span className="material-downloads">{material.downloadCount} downloads</span>
                </div>
                {material.description && (
                  <p className="material-description">{material.description}</p>
                )}
                <div className="material-subject">
                  <small>{material.subject}</small>
                </div>
              </div>
              <div className="material-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownloadMaterial(material._id, material.title)}
                  disabled={downloading === material._id}
                  title="Download Material"
                >
                  {downloading === material._id ? (
                    <div className="download-spinner"></div>
                  ) : (
                    <FiDownload />
                  )}
                </button>
                <button className="share-btn" title="Share Material">
                  <FiShare2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderScheduleContent = () => (
    <div className="schedule-content">
      <div className="section-header">
        <h2>Schedule</h2>
        <div className="view-toggle">
          <button className="toggle-btn active">Week View</button>
          <button className="toggle-btn">Month View</button>
        </div>
      </div>

      <div className="schedule-calendar">
        <div className="calendar-controls">
          <button className="nav-btn">���</button>
          <h3>January 2024</h3>
          <button className="nav-btn">❯</button>
        </div>

        <div className="weekly-schedule">
          {[
            { day: 'Monday', date: '15', events: [{ time: '2:00 PM', title: 'Quant Class', type: 'class' }] },
            { day: 'Tuesday', date: '16', events: [{ time: '4:00 PM', title: 'Mock Test', type: 'test' }] },
            { day: 'Wednesday', date: '17', events: [{ time: '3:00 PM', title: 'Verbal Class', type: 'class' }] },
            { day: 'Thursday', date: '18', events: [{ time: '2:00 PM', title: 'DI Practice', type: 'practice' }] },
            { day: 'Friday', date: '19', events: [{ time: '4:00 PM', title: 'Doubt Session', type: 'doubt' }] },
            { day: 'Saturday', date: '20', events: [{ time: '10:00 AM', title: 'Mock Test', type: 'test' }] },
            { day: 'Sunday', date: '21', events: [] }
          ].map((day, index) => (
            <div key={index} className="schedule-day">
              <div className="day-header">
                <h4>{day.day}</h4>
                <span className="date">{day.date}</span>
              </div>
              <div className="day-events">
                {day.events.map((event, eventIndex) => (
                  <div key={eventIndex} className={`event event-${event.type}`}>
                    <span className="event-time">{event.time}</span>
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnnouncementsContent = () => (
    <div className="announcements-content">
      <div className="section-header">
        <h2>Announcements</h2>
        <div className="announcement-filters">
          <button
            className={`filter-btn ${announcementFilters.type === 'all' ? 'active' : ''}`}
            onClick={() => setAnnouncementFilters(prev => ({ ...prev, type: 'all' }))}
          >
            All
          </button>
          <button
            className={`filter-btn ${announcementFilters.type === 'important' ? 'active' : ''}`}
            onClick={() => setAnnouncementFilters(prev => ({ ...prev, type: 'important' }))}
          >
            Important
          </button>
          <button
            className={`filter-btn ${announcementFilters.type === 'update' ? 'active' : ''}`}
            onClick={() => setAnnouncementFilters(prev => ({ ...prev, type: 'update' }))}
          >
            Updates
          </button>
          <button
            className={`filter-btn ${announcementFilters.type === 'reminder' ? 'active' : ''}`}
            onClick={() => setAnnouncementFilters(prev => ({ ...prev, type: 'reminder' }))}
          >
            Reminders
          </button>
        </div>
      </div>

      <div className="announcements-list">
        {announcementsLoading ? (
          <div className="loading-announcements">
            <div className="loading-spinner"></div>
            <p>Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="no-announcements">
            <FiBell size={48} />
            <h3>No Announcements</h3>
            <p>Check back later for new announcements.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`announcement-card ${announcement.isUnread ? 'unread' : ''}`}
              onClick={() => {
                if (announcement.isUnread) {
                  markAnnouncementAsRead(announcement._id);
                }
              }}
            >
              <div className="announcement-header">
                <h3>
                  {announcement.isPinned && <span className="pin-badge">📌</span>}
                  {getAnnouncementIcon(announcement.type)} {announcement.title}
                </h3>
                <span className="announcement-date">
                  {announcement.timeAgo || announcement.formattedDate || formatAnnouncementDate(announcement.createdAt)}
                </span>
              </div>
              <p>{announcement.content}</p>
              <div className="announcement-actions">
                <span className={`announcement-type ${announcement.type}`}>
                  {announcement.type.toUpperCase()}
                </span>
                <span className={`announcement-priority priority-${announcement.priority}`}>
                  {announcement.priority.toUpperCase()}
                </span>
                {announcement.isUnread && <span className="unread-indicator">New</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfileContent = () => (
    <div className="profile-content">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <button className="primary-btn">Save Changes</button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">
              <FiUser />
            </div>
            <button className="change-avatar-btn">Change Photo</button>
          </div>
          <div className="profile-info">
            <h3>{userDetails.name}</h3>
            <p>{userDetails.email}</p>
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{userDetails.streak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat">
                <span className="stat-number">{userDetails.totalPoints}</span>
                <span className="stat-label">Total Points</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-form">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue={userDetails.name} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" defaultValue={userDetails.email} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+91 9876543210" />
            </div>
            <div className="form-group">
              <label>Target Exam</label>
              <select>
                <option>CAT 2024</option>
                <option>XAT 2024</option>
                <option>NMAT 2024</option>
              </select>
            </div>
            <div className="form-group">
              <label>Study Goal</label>
              <select>
                <option>95+ Percentile</option>
                <option>90+ Percentile</option>
                <option>85+ Percentile</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Location</label>
              <input type="text" placeholder="City, State" />
            </div>
          </div>
        </div>

        <div className="preferences-card">
          <h3>Preferences</h3>
          <div className="preferences-list">
            <div className="preference-item">
              <span>Email Notifications</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <span>SMS Reminders</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
            <div className="preference-item">
              <span>Performance Analytics</span>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboardContent();
      case 'courses': return renderCoursesContent();
      case 'my-courses': return renderMyCoursesContent();
      case 'live-classes': return renderLiveClassesContent();
      case 'practice-tests': return renderPracticeTestsContent();
      case 'mock-tests': return renderMockTestsContent();
      case 'analysis': return renderAnalysisContent();
      case 'doubts': return renderDoubtsContent();
      case 'materials': return renderMaterialsContent();
      case 'schedule': return renderScheduleContent();
      case 'announcements': return renderAnnouncementsContent();
      case 'purchases': return renderPurchasesContent();
      case 'profile': return renderProfileContent();
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="student-lms">
      {/* Sidebar */}
      <div className={`lms-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h2>TathaGat LMS</h2>
          </div>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lms-main">
        {/* Top Navigation */}
        <header className="lms-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <FiMenu />
            </button>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search courses, materials..." />
            </div>
          </div>

          <div className="header-right">
            <button className="notification-btn">
              <FiBell />
              <span className="notification-badge">3</span>
            </button>

            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="profile-avatar">
                  <FiUser />
                </div>
                <span>{userDetails.name.split(' ')[0]}</span>
                <FiChevronDown />
              </button>

              {profileDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => setActiveSection('profile')}>
                    <FiUser /> Profile
                  </button>
                  <button>
                    <FiBell /> Notifications
                  </button>
                  <hr />
                  <button className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="lms-content">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
};

export default StudentDashboard;
