// API Configuration - Auto-detect environment
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'http://hra.betopialimited.com/') {
        return 'http://hra.betopialimited.com/api';}

    else if (hostname === '103.149.105.113') {
        return 'http://103.149.105.113:5512/api';

    } 
    else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5512/api';
    }
    // Fallback to relative URL
    return '/api';
})();

// State Management
let currentPage = 'dashboard';
let allCandidates = [];
let selectedCandidateIds = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadDashboardStats();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        if (currentPage === 'dashboard') {
            loadDashboardStats();
        }
    }, 30000);
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        refreshCurrentPage();
    });
    
    // File upload
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        handleFileUpload(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });
    
    // Search and filters
    document.getElementById('search-candidates').addEventListener('input', filterCandidates);
    document.getElementById('filter-status').addEventListener('change', filterCandidates);
    document.getElementById('filter-score').addEventListener('change', filterCandidates);
    
    // Select all checkbox
    document.getElementById('select-all').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.candidate-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
        updateSelectedCandidates();
    });
    
    // Notification form
    document.getElementById('notification-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendBulkNotifications();
    });
    
    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('candidate-modal').style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('candidate-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Page Navigation
function showPage(pageName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}-page`).classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'candidates': 'Candidates',
        'job-description': 'Job Description',
        'analyze': 'Analyze Resumes',
        'notifications': 'Send Notifications',
        'emails': 'Email Analysis',
        'settings': 'Settings'
    };
    document.getElementById('page-title').textContent = titles[pageName];
    
    currentPage = pageName;
    
    // Load page-specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'candidates':
            loadCandidates();
            break;
        case 'job-description':
            loadActiveJD();
            loadJDHistory();
            break;
        case 'notifications':
            loadNotificationPreview();
            loadAppointmentCandidates();
            break;
        case 'emails':
            if (typeof loadEmails === 'function') {
                loadEmails();
            }
            break;
    }
}

function refreshCurrentPage() {
    showToast('Refreshing...', 'info');
    showPage(currentPage);
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard-stats/`);
        const data = await response.json();
        
        document.getElementById('total-candidates').textContent = data.total_candidates;
        document.getElementById('shortlisted-count').textContent = data.shortlisted;
        document.getElementById('notified-count').textContent = data.notified;
        document.getElementById('avg-score').textContent = data.average_score.toFixed(1);
        
        // Display recent jobs
        if (data.recent_jobs && data.recent_jobs.length > 0) {
            const jobsHTML = data.recent_jobs.map(job => `
                <div class="job-item ${job.status}">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Job #${job.id}</strong> - ${job.status}
                            <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                ${job.processed_resumes}/${job.total_resumes} processed
                                ${job.shortlisted_count > 0 ? `• ${job.shortlisted_count} shortlisted` : ''}
                            </p>
                        </div>
                        <div>
                            <span class="status-badge ${job.status}">${job.status}</span>
                        </div>
                    </div>
                </div>
            `).join('');
            document.getElementById('recent-jobs').innerHTML = jobsHTML;
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Failed to load dashboard stats', 'error');
    }
}

// Candidates Functions
async function loadCandidates() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/`);
        allCandidates = await response.json();
        displayCandidates(allCandidates);
    } catch (error) {
        console.error('Error loading candidates:', error);
        showToast('Failed to load candidates', 'error');
    } finally {
        hideLoading();
    }
}

function displayCandidates(candidates) {
    const tbody = document.getElementById('candidates-tbody');
    
    if (candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">No candidates found</td></tr>';
        return;
    }
    
    const html = candidates.map(candidate => {
        const scoreClass = candidate.score >= 80 ? 'high' : candidate.score >= 60 ? 'medium' : 'low';
        return `
            <tr>
                <td>
                    <input type="checkbox" class="candidate-checkbox" data-id="${candidate.id}">
                </td>
                <td><strong>${candidate.candidate_name}</strong></td>
                <td>${candidate.email || 'N/A'}</td>
                <td>${candidate.phone || 'N/A'}</td>
                <td>${candidate.years_of_experience || 'N/A'}</td>
                <td>
                    <span class="score-badge ${scoreClass}">${candidate.score}</span>
                </td>
                <td>
                    <select class="status-select" onchange="updateCandidateStatus(${candidate.id}, this.value)" data-current="${candidate.status}">
                        <option value="pending" ${candidate.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="shortlisted" ${candidate.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                        <option value="rejected" ${candidate.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                        <option value="notified" ${candidate.status === 'notified' ? 'selected' : ''}>Notified</option>
                        <option value="appointed" ${candidate.status === 'appointed' ? 'selected' : ''}>Appointed</option>
                    </select>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view" onclick="viewCandidate(${candidate.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon btn-notify" onclick="notifyCandidate(${candidate.id})" title="Send Notification">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteCandidate(${candidate.id}, '${candidate.candidate_name}')" title="Delete Candidate">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    tbody.innerHTML = html;
    
    // Add checkbox listeners
    document.querySelectorAll('.candidate-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSelectedCandidates);
    });
}

function filterCandidates() {
    const searchTerm = document.getElementById('search-candidates').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const scoreFilter = parseInt(document.getElementById('filter-score').value) || 0;
    
    const filtered = allCandidates.filter(candidate => {
        const matchesSearch = candidate.candidate_name.toLowerCase().includes(searchTerm) ||
                            (candidate.email && candidate.email.toLowerCase().includes(searchTerm)) ||
                            (candidate.phone && candidate.phone.includes(searchTerm));
        
        const matchesStatus = !statusFilter || candidate.status === statusFilter;
        const matchesScore = candidate.score >= scoreFilter;
        
        return matchesSearch && matchesStatus && matchesScore;
    });
    
    displayCandidates(filtered);
}

function updateSelectedCandidates() {
    selectedCandidateIds = Array.from(document.querySelectorAll('.candidate-checkbox:checked'))
        .map(cb => parseInt(cb.getAttribute('data-id')));
}

async function viewCandidate(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}/`);
        const candidate = await response.json();
        
        const detailsHTML = `
            <h2>${candidate.candidate_name}</h2>
            <div style="margin-top: 1.5rem;">
                <p><strong>Email:</strong> ${candidate.email || 'Not Provided'}</p>
                <p><strong>Phone:</strong> ${candidate.phone || 'Not Provided'}</p>
                <p><strong>Experience:</strong> ${candidate.years_of_experience || 'Not Provided'}</p>
                <p><strong>Score:</strong> <span class="score-badge ${candidate.score >= 80 ? 'high' : 'medium'}">${candidate.score}</span></p>
                <p><strong>Status:</strong> <span class="status-badge ${candidate.status}">${candidate.status}</span></p>
                <hr style="margin: 1rem 0;">
                <p><strong>Fitness Reasoning:</strong></p>
                <p style="color: var(--text-secondary);">${candidate.fitness_reasoning}</p>
                <p><strong>Matching Skills:</strong></p>
                <p style="color: var(--secondary-color);">${candidate.matching_skills}</p>
                <p><strong>Missing Skills:</strong></p>
                <p style="color: var(--danger-color);">${candidate.missing_skills}</p>
            </div>
        `;
        
        document.getElementById('candidate-details').innerHTML = detailsHTML;
        document.getElementById('candidate-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading candidate details:', error);
        showToast('Failed to load candidate details', 'error');
    }
}

async function notifyCandidate(id) {
    if (!confirm('Send interview invitation to this candidate?')) return;
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}/send_notification/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                date: 'February 25, 2026',
                time: '10:30 AM',
                location: 'Virtual Zoom Meeting'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Notification sent successfully!', 'success');
            loadCandidates();
        } else {
            showToast('Failed to send notification', 'error');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
        showToast('Failed to send notification', 'error');
    } finally {
        hideLoading();
    }
}

async function updateCandidateStatus(id, newStatus) {
    const selectElement = event.target;
    const previousStatus = selectElement.getAttribute('data-current');
    
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}/update_status/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Status updated to ${newStatus}`, 'success');
            selectElement.setAttribute('data-current', newStatus);
            loadCandidates();
        } else {
            showToast(data.message || 'Failed to update status', 'error');
            selectElement.value = previousStatus;
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
        selectElement.value = previousStatus;
    }
}

async function deleteCandidate(id, candidateName) {
    if (!confirm(`Are you sure you want to delete ${candidateName}? This action cannot be undone.`)) {
        return;
    }
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/${id}/delete_candidate/`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`${candidateName} deleted successfully`, 'success');
            loadCandidates();
            loadDashboardStats();
        } else {
            showToast(data.message || 'Failed to delete candidate', 'error');
        }
    } catch (error) {
        console.error('Error deleting candidate:', error);
        showToast('Failed to delete candidate', 'error');
    } finally {
        hideLoading();
    }
}

// Analyze Functions
async function syncDrive() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/sync-drive/`, {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            showToast('Successfully synced from Google Drive!', 'success');
        } else {
            // Show detailed error with suggestion
            const errorMsg = data.message || 'Drive sync failed';
            showToast(errorMsg, 'error');
            
            // If OAuth is disabled, highlight manual upload option
            if (errorMsg.includes('disabled_client') || errorMsg.includes('OAuth')) {
                setTimeout(() => {
                    const uploadCard = document.querySelector('.analyze-card:nth-child(2)');
                    if (uploadCard) {
                        uploadCard.style.border = '3px solid var(--primary-color)';
                        uploadCard.style.animation = 'pulse 2s infinite';
                        setTimeout(() => {
                            uploadCard.style.border = '';
                            uploadCard.style.animation = '';
                        }, 6000);
                    }
                    alert(
                        '⚠️ Google Drive sync is currently disabled.\n\n' +
                        '✅ Please use the "Upload Resume" option below instead.\n\n' +
                        'Or see GOOGLE_OAUTH_FIX.md for instructions to fix OAuth.'
                    );
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Error syncing drive:', error);
        showToast('Failed to sync Google Drive. Use manual upload instead.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleFileUpload(files) {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.innerHTML = '';
    
    for (let file of files) {
        if (!file.name.endsWith('.pdf')) {
            showToast(`${file.name} is not a PDF file`, 'error');
            continue;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload-resume/`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                statusDiv.innerHTML += `
                    <div class="upload-item">
                        <span><i class="fas fa-file-pdf"></i> ${file.name}</span>
                        <span class="text-success"><i class="fas fa-check"></i> Uploaded</span>
                    </div>
                `;
            } else {
                statusDiv.innerHTML += `
                    <div class="upload-item">
                        <span><i class="fas fa-file-pdf"></i> ${file.name}</span>
                        <span class="text-danger"><i class="fas fa-times"></i> Failed</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}

async function analyzeResumes() {
    if (!confirm('Start analyzing all resumes? This may take a few minutes.')) return;
    
    // Show progress
    const progressDiv = document.getElementById('analysis-progress');
    const resultsDiv = document.getElementById('analysis-results');
    progressDiv.style.display = 'block';
    resultsDiv.style.display = 'none';
    
    document.getElementById('progress-text').textContent = 'Starting analysis...';
    document.getElementById('progress-fill').style.width = '10%';
    
    try {
        const response = await fetch(`${API_BASE_URL}/analyze-resumes/`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        document.getElementById('progress-fill').style.width = '100%';
        
        if (data.success) {
            document.getElementById('progress-text').textContent = 'Analysis completed!';
            
            setTimeout(() => {
                progressDiv.style.display = 'none';
                
                resultsDiv.innerHTML = `
                    <h2 class="text-success"><i class="fas fa-check-circle"></i> Analysis Completed</h2>
                    <div class="stats-grid" style="margin-top: 1.5rem;">
                        <div class="stat-card">
                            <div class="stat-icon blue">
                                <i class="fas fa-file"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${data.total_processed}</h3>
                                <p>Resumes Processed</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="stat-content">
                                <h3>${data.shortlisted_count}</h3>
                                <p>Shortlisted</p>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="showPage('candidates')">
                        <i class="fas fa-users"></i> View Candidates
                    </button>
                `;
                resultsDiv.style.display = 'block';
            }, 1000);
            
            showToast('Analysis completed successfully!', 'success');
        } else {
            document.getElementById('progress-text').textContent = 'Analysis failed!';
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error analyzing resumes:', error);
        document.getElementById('progress-text').textContent = 'Analysis failed!';
        showToast('Failed to analyze resumes', 'error');
    }
}

// Notification Functions
async function loadNotificationPreview() {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/shortlisted/`);
        const candidates = await response.json();
        
        const top10 = candidates.slice(0, 10);
        
        if (top10.length === 0) {
            document.getElementById('notification-candidates').innerHTML = '<p class="no-data">No shortlisted candidates</p>';
            return;
        }
        
        const html = top10.map(candidate => `
            <div class="candidate-chip">
                <i class="fas fa-user"></i> ${candidate.candidate_name} (${candidate.score})
            </div>
        `).join('');
        
        document.getElementById('notification-candidates').innerHTML = html;
    } catch (error) {
        console.error('Error loading notification preview:', error);
    }
}

async function sendBulkNotifications() {
    const date = document.getElementById('interview-date').value;
    const time = document.getElementById('interview-time').value;
    const location = document.getElementById('interview-location').value;
    const selectTop10 = document.getElementById('select-top-10').checked;
    
    if (!confirm(`Send notifications to ${selectTop10 ? 'top 10 shortlisted' : 'selected'} candidates?`)) return;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/send-notifications/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidate_ids: selectTop10 ? [] : selectedCandidateIds,
                date,
                time,
                location
            })
        });
        
        const data = await response.json();
        
        const resultsDiv = document.getElementById('notification-results');
        resultsDiv.innerHTML = `
            <h3 class="text-success"><i class="fas fa-check-circle"></i> Notifications Sent</h3>
            <p style="margin-top: 1rem;">
                <strong>Success:</strong> ${data.success_count} candidates<br>
                <strong>Failed:</strong> ${data.failed_count} candidates
            </p>
            <div style="margin-top: 1rem; max-height: 200px; overflow-y: auto;">
                ${data.messages.map(msg => `<p style="font-size: 0.875rem; color: var(--text-secondary);">${msg}</p>`).join('')}
            </div>
        `;
        resultsDiv.style.display = 'block';
        
        showToast(`Notifications sent to ${data.success_count} candidates!`, 'success');
    } catch (error) {
        console.error('Error sending notifications:', error);
        showToast('Failed to send notifications', 'error');
    } finally {
        hideLoading();
    }
}

// Utility Functions
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--secondary-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Job Description Functions
let selectedJDFile = null;

function switchJDTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.jd-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`jd-${tabName}-tab`).classList.add('active');
    
    if (tabName === 'history') {
        loadJDHistory();
    }
}

async function loadActiveJD() {
    try {
        const response = await fetch(`${API_BASE_URL}/job-descriptions/active/`);
        
        if (response.ok) {
            const data = await response.json();
            displayActiveJD(data);
        } else {
            document.getElementById('active-jd-display').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading active JD:', error);
    }
}

function displayActiveJD(jd) {
    const display = document.getElementById('active-jd-display');
    display.style.display = 'block';
    
    document.getElementById('active-jd-title').textContent = jd.title;
    document.getElementById('active-jd-date').textContent = new Date(jd.created_at).toLocaleDateString();
    document.getElementById('active-jd-source').textContent = jd.file_path ? 'PDF Upload' : 'Text Input';
    
    let content = jd.description;
    if (jd.requirements) {
        content += `\n\nKey Requirements:\n${jd.requirements}`;
    }
    document.getElementById('active-jd-content').textContent = content.substring(0, 500) + (content.length > 500 ? '...' : '');
}

async function createJDFromText() {
    const title = document.getElementById('jd-title').value.trim();
    const description = document.getElementById('jd-description').value.trim();
    const requirements = document.getElementById('jd-requirements').value.trim();
    
    if (!title || !description) {
        showToast('Please fill in Job Title and Description', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/job-descriptions/create_text/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                description: description,
                requirements: requirements
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Job description created successfully!', 'success');
            clearJDForm();
            loadActiveJD();
            loadJDHistory();
        } else {
            showToast(data.error || 'Failed to create job description', 'error');
        }
    } catch (error) {
        console.error('Error creating JD:', error);
        showToast('Failed to create job description', 'error');
    } finally {
        hideLoading();
    }
}

function clearJDForm() {
    document.getElementById('jd-title').value = '';
    document.getElementById('jd-description').value = '';
    document.getElementById('jd-requirements').value = '';
}

// PDF Upload handlers
document.addEventListener('DOMContentLoaded', function() {
    const jdFileInput = document.getElementById('jd-file-input');
    const jdUploadArea = document.getElementById('jd-upload-area');
    const jdUploadBtn = document.getElementById('jd-upload-btn');
    
    if (jdFileInput) {
        jdFileInput.addEventListener('change', function(e) {
            selectedJDFile = e.target.files[0];
            if (selectedJDFile) {
                if (!selectedJDFile.name.endsWith('.pdf')) {
                    showToast('Please select a PDF file', 'error');
                    selectedJDFile = null;
                    return;
                }
                
                document.getElementById('jd-upload-status').innerHTML = `
                    <div style="padding: 1rem; background: #E0F2FE; border-radius: 8px; margin-top: 1rem;">
                        <i class="fas fa-file-pdf" style="color: #EF4444;"></i>
                        <strong>${selectedJDFile.name}</strong> (${(selectedJDFile.size / 1024).toFixed(2)} KB)
                    </div>
                `;
                jdUploadBtn.disabled = false;
            }
        });
    }
    
    if (jdUploadArea) {
        // Drag and drop
        jdUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            jdUploadArea.classList.add('dragover');
        });
        
        jdUploadArea.addEventListener('dragleave', () => {
            jdUploadArea.classList.remove('dragover');
        });
        
        jdUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            jdUploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.pdf')) {
                jdFileInput.files = e.dataTransfer.files;
                jdFileInput.dispatchEvent(new Event('change'));
            } else {
                showToast('Please drop a PDF file', 'error');
            }
        });
        
        jdUploadArea.addEventListener('click', () => {
            jdFileInput.click();
        });
    }
});

async function uploadJDPDF() {
    if (!selectedJDFile) {
        showToast('Please select a PDF file', 'error');
        return;
    }
    
    const title = document.getElementById('jd-pdf-title').value.trim();
    if (!title) {
        showToast('Please enter a job title', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', selectedJDFile);
        formData.append('title', title);
        
        const response = await fetch(`${API_BASE_URL}/job-descriptions/upload_pdf/`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Job description uploaded successfully!', 'success');
            selectedJDFile = null;
            document.getElementById('jd-pdf-title').value = '';
            document.getElementById('jd-upload-status').innerHTML = '';
            document.getElementById('jd-upload-btn').disabled = true;
            document.getElementById('jd-file-input').value = '';
            loadActiveJD();
            loadJDHistory();
        } else {
            showToast(data.error || 'Failed to upload job description', 'error');
        }
    } catch (error) {
        console.error('Error uploading JD:', error);
        showToast('Failed to upload job description', 'error');
    } finally {
        hideLoading();
    }
}

async function loadJDHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/job-descriptions/`);
        const data = await response.json();
        
        const tbody = document.getElementById('jd-history-tbody');
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No job descriptions found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(jd => `
            <tr>
                <td><strong>${jd.title}</strong></td>
                <td>${new Date(jd.created_at).toLocaleDateString()}</td>
                <td>${jd.file_path ? '<i class="fas fa-file-pdf"></i> PDF' : '<i class="fas fa-keyboard"></i> Text'}</td>
                <td>
                    ${jd.is_active ? 
                        '<span class="status-badge status-shortlisted"><i class="fas fa-check-circle"></i> Active</span>' : 
                        '<span class="status-badge status-pending">Inactive</span>'}
                </td>
                <td>
                    ${!jd.is_active ? 
                        `<button class="btn btn-sm btn-primary" onclick="setActiveJD(${jd.id})">
                            <i class="fas fa-check"></i> Activate
                        </button>` : 
                        '<span style="color: var(--text-secondary);">Currently Active</span>'}
                    <button class="btn btn-sm btn-secondary" onclick="viewJD(${jd.id})" style="margin-left: 0.5rem;">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading JD history:', error);
    }
}

async function setActiveJD(jdId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/job-descriptions/${jdId}/set_active/`, {
            method: 'POST',
        });
        
        if (response.ok) {
            showToast('Job description activated successfully!', 'success');
            loadActiveJD();
            loadJDHistory();
        } else {
            showToast('Failed to activate job description', 'error');
        }
    } catch (error) {
        console.error('Error activating JD:', error);
        showToast('Failed to activate job description', 'error');
    } finally {
        hideLoading();
    }
}

async function viewJD(jdId) {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/job-descriptions/${jdId}/`);
        const jd = await response.json();
        
        if (response.ok) {
            alert(`Title: ${jd.title}\n\nDescription:\n${jd.description}\n\nRequirements:\n${jd.requirements || 'N/A'}`);
        }
    } catch (error) {
        console.error('Error viewing JD:', error);
    } finally {
        hideLoading();
    }
}

// Appointment Letter Functions
let selectedAppointmentCandidates = [];

function switchNotificationTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.notif-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.notif-tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    if (tabName === 'appointment') {
        loadAppointmentCandidates();
    }
}

async function loadAppointmentCandidates() {
    try {
        const response = await fetch(`${API_BASE_URL}/candidates/shortlisted/`);
        const candidates = await response.json();
        
        const listDiv = document.getElementById('appointment-candidate-list');
        
        // Filter out candidates who already received appointment letters
        const eligible = candidates.filter(c => !c.appointment_sent);
        
        if (eligible.length === 0) {
            listDiv.innerHTML = '<p class="no-data">No eligible candidates for appointment letters</p>';
            return;
        }
        
        const html = eligible.map(candidate => `
            <div class="appointment-candidate-item">
                <input type="checkbox" 
                       class="appointment-checkbox" 
                       data-id="${candidate.id}" 
                       onchange="updateAppointmentSelection()">
                <div class="appointment-candidate-info">
                    <h4>${candidate.candidate_name}</h4>
                    <p><i class="fas fa-envelope"></i> ${candidate.email || 'No email'} 
                       <i class="fas fa-phone" style="margin-left: 1rem;"></i> ${candidate.phone || 'No phone'}</p>
                </div>
                <div class="appointment-candidate-score">
                    ${candidate.score}%
                </div>
            </div>
        `).join('');
        
        listDiv.innerHTML = html;
        
        // Add search functionality
        document.getElementById('search-appointment-candidates').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.appointment-candidate-item').forEach(item => {
                const name = item.querySelector('h4').textContent.toLowerCase();
                item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    } catch (error) {
        console.error('Error loading appointment candidates:', error);
        showToast('Failed to load candidates', 'error');
    }
}

function updateAppointmentSelection() {
    selectedAppointmentCandidates = Array.from(
        document.querySelectorAll('.appointment-checkbox:checked')
    ).map(cb => parseInt(cb.getAttribute('data-id')));
}

// Setup appointment form submission
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointment-form');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendAppointmentLetters();
        });
    }
    
    // Handle bulk selection checkbox
    const bulkCheckbox = document.getElementById('select-appointed-candidates');
    if (bulkCheckbox) {
        bulkCheckbox.addEventListener('change', function() {
            if (this.checked) {
                document.querySelectorAll('.appointment-checkbox').forEach(cb => {
                    cb.checked = true;
                });
                updateAppointmentSelection();
            }
        });
    }
});


async function sendAppointmentLetters() {
    const position = document.getElementById('appointment-position').value.trim();
    const department = document.getElementById('appointment-department').value.trim();
    const salary = document.getElementById('appointment-salary').value.trim();
    const probationMonths = document.getElementById('appointment-probation').value.trim();
    const startDate = document.getElementById('appointment-start-date').value;
    const selectAll = document.getElementById('select-appointed-candidates').checked;
    
    if (!position) {
        showToast('Position title is required', 'error');
        return;
    }
    
    if (!salary) {
        showToast('Basic salary is required', 'error');
        return;
    }
    
    if (!probationMonths || probationMonths < 1) {
        showToast('Probation period is required (minimum 1 month)', 'error');
        return;
    }
    
    if (!startDate) {
        showToast('Joining date is required', 'error');
        return;
    }
    
    // Get candidate IDs
    let candidateIds = [];
    if (selectAll) {
        // Get all eligible candidates
        candidateIds = Array.from(document.querySelectorAll('.appointment-checkbox'))
            .map(cb => parseInt(cb.getAttribute('data-id')));
    } else {
        candidateIds = selectedAppointmentCandidates;
    }
    
    if (candidateIds.length === 0) {
        showToast('Please select at least one candidate', 'error');
        return;
    }
    
    if (!confirm(`Send appointment letters to ${candidateIds.length} candidate(s)?`)) {
        return;
    }
    
    showLoading();
    
    const resultsDiv = document.getElementById('appointment-results');
    resultsDiv.style.display = 'none';
    
    let successCount = 0;
    let failedCount = 0;
    const messages = [];
    
    // Send appointment letters one by one
    for (const candidateId of candidateIds) {
        try {
            const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/send_appointment_letter/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    position_title: position,
                    department: department,
                    salary: salary,
                    start_date: startDate,
                    probation_months: parseInt(probationMonths)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                successCount++;
                messages.push(...data.messages);
            } else {
                failedCount++;
                messages.push(`Failed for candidate ID ${candidateId}: ${data.messages.join(', ')}`);
            }
        } catch (error) {
            failedCount++;
            messages.push(`Error for candidate ID ${candidateId}: ${error.message}`);
        }
    }
    
    hideLoading();
    
    // Display results
    resultsDiv.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 class="${successCount > 0 ? 'text-success' : 'text-danger'}">
                <i class="fas ${successCount > 0 ? 'fa-check-circle' : 'fa-times-circle'}"></i> 
                Appointment Letters ${successCount > 0 ? 'Sent' : 'Failed'}
            </h3>
            <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light-bg); border-radius: 8px;">
                <p><strong>✅ Success:</strong> ${successCount} candidate(s)</p>
                <p><strong>❌ Failed:</strong> ${failedCount} candidate(s)</p>
            </div>
            <div style="margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                <h4 style="margin-bottom: 0.5rem;">Details:</h4>
                ${messages.map(msg => `
                    <p style="font-size: 0.875rem; color: var(--text-secondary); padding: 0.25rem 0; border-bottom: 1px solid var(--border-color);">
                        <i class="fas fa-arrow-right" style="color: var(--primary-color); margin-right: 0.5rem;"></i>
                        ${msg}
                    </p>
                `).join('')}
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
    
    if (successCount > 0) {
        showToast(`Appointment letters sent to ${successCount} candidate(s)!`, 'success');
        
        // Clear form and reload candidates
        document.getElementById('appointment-form').reset();
        selectedAppointmentCandidates = [];
        setTimeout(() => {
            loadAppointmentCandidates();
        }, 2000);
    } else {
        showToast('Failed to send appointment letters', 'error');
    }
}

