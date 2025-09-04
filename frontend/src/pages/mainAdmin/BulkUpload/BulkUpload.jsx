import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './BulkUpload.css';

const BulkUpload = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [demoData, setDemoData] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Preview the file
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const previewData = {};
                
                // Get first 3 rows from each sheet for preview
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    previewData[sheetName] = json.slice(0, 3);
                });
                
                setPreview(previewData);
            };
            reader.readAsArrayBuffer(selectedFile);
        }
    };

    const handleDemoData = () => {
        // Create demo data structure
        const demoWorkbook = XLSX.utils.book_new();
        
        // Create demo sheets
        const subjectsData = [
            ['Subject Name', 'Description'],
            ['Mathematics', 'Core mathematics concepts'],
            ['Physics', 'Fundamental physics principles']
        ];
        
        const chaptersData = [
            ['Subject ID', 'Chapter Name', 'Description'],
            ['1', 'Algebra', 'Basic algebraic concepts'],
            ['1', 'Geometry', 'Geometric principles'],
            ['2', 'Mechanics', 'Basic mechanics']
        ];
        
        // Add sheets to workbook
        XLSX.utils.book_append_sheet(demoWorkbook, XLSX.utils.aoa_to_sheet(subjectsData), 'Subjects');
        XLSX.utils.book_append_sheet(demoWorkbook, XLSX.utils.aoa_to_sheet(chaptersData), 'Chapters');
        
        // Generate blob and download
        const wbout = XLSX.write(demoWorkbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'demo_course_data.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }
        if (!selectedCourse) {
            toast.error('Please select a course first');
            return;
        }

        setUploading(true);
        setUploadStatus([]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/admin/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                params: {
                    courseId: selectedCourse
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadStatus(prev => [...prev, { type: 'progress', message: `Uploading: ${percentCompleted}%` }]);
                }
            });

            setUploadStatus(prev => [...prev, { type: 'success', message: 'Upload completed successfully' }]);
            toast.success('Course structure uploaded successfully!');
            navigate('/admin/courses');
        } catch (error) {
            setUploadStatus(prev => [...prev, { type: 'error', message: error.response?.data?.message || 'Upload failed' }]);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        axios.get('/api/admin/download-template', {
            responseType: 'blob'
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'course_template.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="bulk-upload-container">
            <h2>Bulk Upload Course Structure</h2>
            
            <div className="course-selection">
                <label htmlFor="courseSelect">Select Course:</label>
                <select
                    id="courseSelect"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                >
                    <option value="">Select a course...</option>
                    {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                            {course.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="upload-section">
                <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
                    <input
                        type="file"
                        id="fileInput"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <div className="upload-icon">📁</div>
                    <p>Drag & drop Excel file here or click to browse</p>
                    <p className="file-info">{file ? file.name : 'No file selected'}</p>
                </div>

                <div className="template-buttons">
                    <button onClick={downloadTemplate} className="template-button">
                        Download Template
                    </button>
                    <button onClick={handleDemoData} className="template-button">
                        Download Demo Data
                    </button>
                </div>
            </div>

            {preview && (
                <div className="preview-section">
                    <h3>File Preview</h3>
                    {Object.entries(preview).map(([sheetName, data]) => (
                        <div key={sheetName} className="sheet-preview">
                            <h4>{sheetName}</h4>
                            <table>
                                <thead>
                                    <tr>
                                        {data[0]?.map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(1).map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row?.map((cell, cellIndex) => (
                                                <td key={cellIndex}>{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            <div className="upload-controls">
                <button 
                    onClick={handleUpload} 
                    disabled={!file || uploading}
                    className="upload-button"
                >
                    {uploading ? 'Uploading...' : 'Upload Course Structure'}
                </button>
            </div>

            {uploadStatus.length > 0 && (
                <div className="upload-status">
                    <h3>Upload Status</h3>
                    <ul>
                        {uploadStatus.map((status, index) => (
                            <li key={index} className={`status-item ${status.type}`}>
                                {status.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default BulkUpload;
