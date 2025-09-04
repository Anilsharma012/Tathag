// Study Materials API utilities

const API_BASE_URL = ''; // Using relative URLs for proxy

// Get study materials for students
export const fetchStudyMaterials = async (filters = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams();
    
    if (filters.subject && filters.subject !== 'All Subjects') {
      queryParams.append('subject', filters.subject);
    }
    
    if (filters.type && filters.type !== 'All Types') {
      queryParams.append('type', filters.type);
    }

    const response = await fetch(`${API_BASE_URL}/api/study-materials/student?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching study materials:', error);
    throw error;
  }
};

// Download study material
export const downloadStudyMaterial = async (materialId) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/study-materials/download/${materialId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        // Clone response to prevent body stream issues
        const responseClone = response.clone();
        const errorData = await responseClone.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use default message
        console.warn('Could not parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error('Error downloading study material:', error);
    throw error;
  }
};

// Upload study material (admin only)
export const uploadStudyMaterial = async (formData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/api/study-materials/admin/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error uploading study material:', error);
    throw error;
  }
};

// Get all study materials (admin only)
export const fetchAllStudyMaterials = async (filters = {}, pagination = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    const queryParams = new URLSearchParams();
    
    // Add filters
    if (filters.subject && filters.subject !== 'All Subjects') {
      queryParams.append('subject', filters.subject);
    }
    
    if (filters.type && filters.type !== 'All Types') {
      queryParams.append('type', filters.type);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    // Add pagination
    if (pagination.page) {
      queryParams.append('page', pagination.page);
    }
    
    if (pagination.limit) {
      queryParams.append('limit', pagination.limit);
    }

    const response = await fetch(`${API_BASE_URL}/api/study-materials/admin?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error fetching all study materials:', error);
    throw error;
  }
};

// Delete study material (admin only)
export const deleteStudyMaterial = async (materialId) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/api/study-materials/admin/${materialId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error deleting study material:', error);
    throw error;
  }
};

// Update study material (admin only)
export const updateStudyMaterial = async (materialId, updateData) => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/api/study-materials/admin/${materialId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating study material:', error);
    throw error;
  }
};

export default {
  fetchStudyMaterials,
  downloadStudyMaterial,
  uploadStudyMaterial,
  fetchAllStudyMaterials,
  deleteStudyMaterial,
  updateStudyMaterial
};
