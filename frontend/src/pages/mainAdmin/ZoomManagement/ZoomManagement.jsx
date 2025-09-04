import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useZoom } from '../../../contexts/ZoomContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ZoomManagement.css';

const ZoomManagement = () => {
    const { user } = useAuth();
    const { meetings, fetchMeetings } = useZoom();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        courseId: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const response = await axios.get('/api/courses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(response.data.courses || response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Error fetching courses');
        }
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        fetchMeetings(course._id);
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.videoUrl || !uploadData.title || !uploadData.courseId) return;

        try {
            await axios.post('/api/courses/update-module', {
                courseId: uploadData.courseId,
                module: {
                    title: uploadData.title,
                    description: uploadData.description,
                    type: 'video',
                    content: uploadData.videoUrl
                }
            });
            toast.success('Video uploaded successfully!');
            setShowUploadModal(false);
            setUploadData({
                title: '',
                description: '',
                videoUrl: '',
                courseId: ''
            });
            fetchCourses();
        } catch (error) {
            toast.error('Error uploading video');
        }
    };

    const handleDeleteMeeting = async (meetingId) => {
        try {
            await axios.delete(`/api/zoom/meetings/${meetingId}`);
            toast.success('Meeting deleted successfully');
            fetchMeetings(selectedCourse?._id);
        } catch (error) {
            toast.error('Error deleting meeting');
        }
    };

    const handleEditMeeting = (meeting) => {
        setSelectedMeeting(meeting);
    };

    const handleUpdateMeeting = async (meetingId, data) => {
        try {
            await axios.put(`/api/zoom/meetings/${meetingId}`, data);
            toast.success('Meeting updated successfully');
            fetchMeetings(selectedCourse?._id);
            setSelectedMeeting(null);
        } catch (error) {
            toast.error('Error updating meeting');
        }
    };

    return (
        <div className="zoom-management">
            <h2>Zoom Meeting Management</h2>

            <div className="management-header">
                <select
                    value={selectedCourse?._id || ''}
                    onChange={(e) => {
                        const course = courses.find(c => c._id === e.target.value);
                        handleCourseSelect(course);
                    }}
                    className="course-selector"
                >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>
                            {course.name || course.title || 'Unnamed Course'}
                        </option>
                    ))}
                </select>

                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="upload-button"
                >
                    Upload Video
                </button>
            </div>

            {selectedCourse && (
                <div className="meeting-actions">
                    <button 
                        onClick={() => 
                            fetchMeetings(selectedCourse._id)
                        }
                        className="refresh-button"
                    >
                        Refresh Meetings
                    </button>
                </div>
            )}

            {selectedCourse && meetings.length > 0 && (
                <div className="meetings-grid">
                    {meetings.map(meeting => (
                        <div 
                            key={meeting._id} 
                            className="meeting-card"
                        >
                            <h3>{meeting.title}</h3>
                            <p>Start Time: {new Date(meeting.startTime).toLocaleString()}</p>
                            <p>Duration: {meeting.duration} minutes</p>
                            
                            {meeting.recordingUrl && (
                                <p>
                                    <span className="status-dot {meeting.recordingStatus}"></span>
                                    {meeting.recordingStatus}
                                </p>
                            )}

                            <div className="meeting-actions">
                                <button 
                                    onClick={() => handleEditMeeting(meeting)}
                                    className="edit-button"
                                >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => handleDeleteMeeting(meeting._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                                {meeting.recordingUrl && (
                                    <button 
                                        onClick={() => window.open(meeting.recordingUrl)}
                                        className="view-button"
                                    >
                                        View Recording
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUploadModal && (
                <div className="upload-modal">
                    <div className="modal-content">
                        <h3>Upload Video to Course</h3>
                        <form onSubmit={handleVideoUpload}>
                            <div className="form-group">
                                <label>Course</label>
                                <select
                                    value={uploadData.courseId}
                                    onChange={(e) => 
                                        setUploadData(prev => ({
                                            ...prev,
                                            courseId: e.target.value
                                        }))
                                    }
                                    required
                                    className="form-select"
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.name || course.title || 'Unnamed Course'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={uploadData.title}
                                    onChange={(e) => 
                                        setUploadData(prev => ({
                                            ...prev,
                                            title: e.target.value
                                        }))
                                    }
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={uploadData.description}
                                    onChange={(e) => 
                                        setUploadData(prev => ({
                                            ...prev,
                                            description: e.target.value
                                        }))
                                    }
                                    className="form-textarea"
                                />
                            </div>

                            <div className="form-group">
                                <label>Video URL</label>
                                <input
                                    type="url"
                                    value={uploadData.videoUrl}
                                    onChange={(e) => 
                                        setUploadData(prev => ({
                                            ...prev,
                                            videoUrl: e.target.value
                                        }))
                                    }
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="submit-button">
                                    Upload Video
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadData({
                                            title: '',
                                            description: '',
                                            videoUrl: '',
                                            courseId: ''
                                        });
                                    }}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedMeeting && (
                <div className="edit-meeting-modal">
                    <div className="modal-content">
                        <h3>Edit Meeting</h3>
                        <form onSubmit={(e) => handleUpdateMeeting(selectedMeeting._id, e.target)}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    defaultValue={selectedMeeting.title}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    defaultValue={selectedMeeting.startTime.split('T')[0]}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    defaultValue={selectedMeeting.duration}
                                    min="15"
                                    max="180"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="submit-button">
                                    Update Meeting
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setSelectedMeeting(null)}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ZoomManagement;
