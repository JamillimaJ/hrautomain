// Email Analysis Functions

let allEmails = [];
let filteredEmails = [];
let selectedEmails = new Set();

// Load email analysis data
async function loadEmails() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/emails/`);
        const data = await response.json();
        
        if (data.success) {
            allEmails = data.emails || [];
            filteredEmails = [...allEmails];
            displayEmails();
            updateEmailStats();
        } else {
            showToast('Failed to load emails: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading emails:', error);
        showToast('Failed to load emails. Make sure the backend is running.', 'error');
    } finally {
        hideLoading();
    }
}

// Display emails in table
function displayEmails() {
    const tbody = document.getElementById('emails-tbody');
    
    if (filteredEmails.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="no-data">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p>No emails found matching your filters</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredEmails.map((email, index) => {
        const isSpam = email.Flag === 'spam';
        const isImportant = email.Score >= 80;
        const flagIcon = isSpam ? 'fa-ban' : (isImportant ? 'fa-star' : 'fa-flag');
        const flagColor = isSpam ? '#f5576c' : (isImportant ? '#ffd43b' : '#adb5bd');
        const emailId = email.ID;
        const isSelected = selectedEmails.has(emailId);
        
        return `
            <tr class="email-row ${isSpam ? 'spam-row' : ''}" data-index="${index}" data-email-id="${emailId}">
                <td style="text-align: center;" onclick="event.stopPropagation();">
                    <input type="checkbox" class="email-checkbox" data-email-id="${emailId}" ${isSelected ? 'checked' : ''} onchange="toggleEmailSelection('${emailId}')">
                </td>
                <td style="text-align: center;" onclick="showEmailDetails(${index})">
                    <i class="fas ${flagIcon}" style="color: ${flagColor}; font-size: 1.1rem;" title="${email.Flag}"></i>
                </td>
                <td onclick="showEmailDetails(${index})"><span style="color: var(--text-secondary); font-weight: 500;">${formatDate(email.Date)}</span></td>
                <td class="email-from" title="${email.From}" onclick="showEmailDetails(${index})">
                    ${truncateText(email.From, 30)}
                </td>
                <td class="email-subject" onclick="showEmailDetails(${index})">
                    <strong>${escapeHtml(email.Subject)}</strong>
                </td>
                <td onclick="showEmailDetails(${index})">
                    <span class="badge badge-${getBadgeColor(email.Type)}">${email.Type || 'N/A'}</span>
                </td>
                <td onclick="showEmailDetails(${index})">
                    <span class="badge badge-secondary">${email.Intention || 'N/A'}</span>
                </td>
                <td style="text-align: center;" onclick="showEmailDetails(${index})">
                    <span class="score-badge ${getScoreClass(email.Score)}">
                        ${email.Score}
                    </span>
                </td>
                <td style="text-align: center;" onclick="event.stopPropagation();">
                    <div class="action-dropdown">
                        <button class="btn-icon action-btn" onclick="toggleActionMenu(${index})" title="Actions">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="action-menu" id="action-menu-${index}">
                            <button onclick="showEmailDetails(${index})">
                                <i class="fas fa-eye"></i> View Details
                            </button>
                            <button onclick="updateEmailFlag('${emailId}', 'not spam')">
                                <i class="fas fa-check-circle"></i> Mark Not Spam
                            </button>
                            <button onclick="updateEmailFlag('${emailId}', 'spam')">
                                <i class="fas fa-ban"></i> Mark as Spam
                            </button>
                            <button onclick="removeEmail('${emailId}')" style="color: var(--danger-color);">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Show email details in modal
function showEmailDetails(index) {
    const email = filteredEmails[index];
    const modal = document.getElementById('email-modal');
    const details = document.getElementById('email-details');
    
    const isSpam = email.Flag === 'spam';
    
    details.innerHTML = `
        <div class="email-meta">
            <div class="email-meta-item">
                <label><i class="fas fa-calendar"></i> Date</label>
                <span>${formatDate(email.Date)}</span>
            </div>
            <div class="email-meta-item">
                <label><i class="fas fa-user"></i> From</label>
                <span>${escapeHtml(email.From)}</span>
            </div>
            <div class="email-meta-item">
                <label><i class="fas fa-tag"></i> Type</label>
                <span class="badge badge-${getBadgeColor(email.Type)}">${email.Type || 'N/A'}</span>
            </div>
            <div class="email-meta-item">
                <label><i class="fas fa-crosshairs"></i> Intention</label>
                <span class="badge badge-secondary">${email.Intention || 'N/A'}</span>
            </div>
            <div class="email-meta-item">
                <label><i class="fas fa-flag"></i> Flag Status</label>
                <span class="email-badge ${isSpam ? 'spam' : 'normal'}">${email.Flag}</span>
            </div>
            <div class="email-meta-item">
                <label><i class="fas fa-chart-line"></i> Importance Score</label>
                <span class="score-badge ${getScoreClass(email.Score)}">${email.Score}</span>
            </div>
        </div>
        
        <div class="email-detail-section">
            <h3><i class="fas fa-heading"></i> Subject</h3>
            <p><strong>${escapeHtml(email.Subject)}</strong></p>
        </div>
        
        <div class="email-detail-section">
            <h3><i class="fas fa-envelope-open-text"></i> Email Body</h3>
            <div class="email-body-content">
                ${escapeHtml(email.Body || 'Email body not available')}
            </div>
        </div>
        
        <div class="email-detail-section">
            <h3><i class="fas fa-sparkles"></i> AI Summary</h3>
            <p style="background: rgba(79, 70, 229, 0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--primary-color);">${escapeHtml(email.Summary || 'No summary available')}</p>
        </div>
        
        <div class="email-detail-section">
            <h3><i class="fas fa-fingerprint"></i> Email ID</h3>
            <p><code style="background: var(--light-bg); padding: 0.5rem 1rem; border-radius: 6px; display: inline-block; font-size: 0.9rem;">${email.ID}</code></p>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Update email statistics
function updateEmailStats() {
    const totalEmails = allEmails.length;
    const spamCount = allEmails.filter(e => e.Flag === 'spam').length;
    const importantCount = allEmails.filter(e => e.Score >= 80).length;
    const avgImportance = totalEmails > 0 
        ? Math.round(allEmails.reduce((sum, e) => sum + (e.Score || 0), 0) / totalEmails) 
        : 0;
    
    document.getElementById('total-emails').textContent = totalEmails;
    document.getElementById('spam-count').textContent = spamCount;
    document.getElementById('important-count').textContent = importantCount;
    document.getElementById('avg-importance').textContent = avgImportance;
}

// Filter emails
function filterEmails() {
    const searchTerm = document.getElementById('search-emails').value.toLowerCase();
    const flagFilter = document.getElementById('filter-flag').value;
    const typeFilter = document.getElementById('filter-type').value;
    const intentionFilter = document.getElementById('filter-intention').value;
    const importanceFilter = document.getElementById('filter-importance').value;
    
    filteredEmails = allEmails.filter(email => {
        // Search filter
        if (searchTerm && !(
            email.Subject?.toLowerCase().includes(searchTerm) ||
            email.From?.toLowerCase().includes(searchTerm) ||
            email.Summary?.toLowerCase().includes(searchTerm)
        )) {
            return false;
        }
        
        // Flag filter
        if (flagFilter && email.Flag !== flagFilter) {
            return false;
        }
        
        // Type filter
        if (typeFilter && email.Type !== typeFilter) {
            return false;
        }
        
        // Intention filter
        if (intentionFilter && email.Intention !== intentionFilter) {
            return false;
        }
        
        // Importance filter
        if (importanceFilter) {
            const minScore = parseInt(importanceFilter);
            if (email.Score < minScore) {
                return false;
            }
        }
        
        return true;
    });
    
    displayEmails();
}

// Helper functions
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    } catch {
        return dateString || 'N/A';
    }
}

function truncateText(text, maxLength) {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getBadgeColor(type) {
    const colors = {
        'Office': 'primary',
        'Personal': 'success',
        'Marketing': 'warning',
        'Transactional': 'info',
        'Meeting': 'purple',
        'Event': 'orange'
    };
    return colors[type] || 'secondary';
}

function getScoreClass(score) {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
}

// Initialize email filters
document.getElementById('search-emails')?.addEventListener('input', filterEmails);
document.getElementById('filter-flag')?.addEventListener('change', filterEmails);
document.getElementById('filter-type')?.addEventListener('change', filterEmails);
document.getElementById('filter-intention')?.addEventListener('change', filterEmails);
document.getElementById('filter-importance')?.addEventListener('change', filterEmails);

// Close action menus when scrolling
document.querySelector('.emails-table-container')?.addEventListener('scroll', function() {
    document.querySelectorAll('.action-menu.show').forEach(menu => {
        menu.classList.remove('show');
    });
});

// Select all checkbox
document.getElementById('select-all-emails')?.addEventListener('change', function(e) {
    const isChecked = e.target.checked;
    filteredEmails.forEach(email => {
        if (isChecked) {
            selectedEmails.add(email.ID);
        } else {
            selectedEmails.delete(email.ID);
        }
    });
    displayEmails();
    updateBulkActionsBar();
});

// Close email modal when clicking close button or outside modal
document.querySelector('.email-close')?.addEventListener('click', function() {
    document.getElementById('email-modal').style.display = 'none';
});

window.addEventListener('click', function(e) {
    const modal = document.getElementById('email-modal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
    
    // Close action menus when clicking outside
    if (!e.target.closest('.action-dropdown')) {
        document.querySelectorAll('.action-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// Email Action Functions
function toggleActionMenu(index) {
    const button = event.target.closest('.action-btn');
    const menu = document.getElementById(`action-menu-${index}`);
    const allMenus = document.querySelectorAll('.action-menu');
    
    // Close all other menus
    allMenus.forEach(m => {
        if (m !== menu) m.classList.remove('show');
    });
    
    // Toggle current menu
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
    } else {
        // Position the menu relative to the button
        const buttonRect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = 200; // Approximate menu height
        
        // Check if there's enough space below
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            // Position above
            menu.style.top = `${buttonRect.top - menuHeight}px`;
        } else {
            // Position below
            menu.style.top = `${buttonRect.bottom + 5}px`;
        }
        
        menu.style.left = `${buttonRect.left - 150}px`; // Align to right of button
        menu.classList.add('show');
    }
}

function toggleEmailSelection(emailId) {
    if (selectedEmails.has(emailId)) {
        selectedEmails.delete(emailId);
    } else {
        selectedEmails.add(emailId);
    }
    updateBulkActionsBar();
    updateSelectAllCheckbox();
}

function updateBulkActionsBar() {
    const bulkBar = document.getElementById('bulk-actions-bar');
    const count = selectedEmails.size;
    
    if (count > 0) {
        bulkBar.style.display = 'block';
        document.getElementById('selected-count').textContent = `${count} selected`;
    } else {
        bulkBar.style.display = 'none';
    }
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('select-all-emails');
    if (selectAllCheckbox) {
        const allSelected = filteredEmails.length > 0 && 
                          filteredEmails.every(email => selectedEmails.has(email.ID));
        selectAllCheckbox.checked = allSelected;
    }
}

function updateEmailFlag(emailId, newFlag) {
    // Update in allEmails array
    const email = allEmails.find(e => e.ID === emailId);
    if (email) {
        email.Flag = newFlag;
        
        // Update in JSON file via backend
        saveEmailChanges();
        
        // Re-render
        filterEmails();
        showToast(`Email flag updated to "${newFlag}"`, 'success');
    }
}

function removeEmail(emailId) {
    if (confirm('Are you sure you want to remove this email from the analysis list?')) {
        // Remove from allEmails
        allEmails = allEmails.filter(e => e.ID !== emailId);
        
        // Remove from selection if selected
        selectedEmails.delete(emailId);
        
        // Save changes
        saveEmailChanges();
        
        // Re-render
        filterEmails();
        updateBulkActionsBar();
        
        showToast('Email removed successfully', 'success');
    }
}

function updateSelectedFlags(newFlag) {
    if (selectedEmails.size === 0) {
        showToast('No emails selected', 'warning');
        return;
    }
    
    if (confirm(`Mark ${selectedEmails.size} email(s) as "${newFlag}"?`)) {
        selectedEmails.forEach(emailId => {
            const email = allEmails.find(e => e.ID === emailId);
            if (email) {
                email.Flag = newFlag;
            }
        });
        
        saveEmailChanges();
        filterEmails();
        
        showToast(`${selectedEmails.size} email(s) updated to "${newFlag}"`, 'success');
    }
}

function removeSelectedEmails() {
    if (selectedEmails.size === 0) {
        showToast('No emails selected', 'warning');
        return;
    }
    
    if (confirm(`Remove ${selectedEmails.size} selected email(s) from the list?`)) {
        allEmails = allEmails.filter(e => !selectedEmails.has(e.ID));
        
        saveEmailChanges();
        
        const removedCount = selectedEmails.size;
        selectedEmails.clear();
        
        filterEmails();
        updateBulkActionsBar();
        
        showToast(`${removedCount} email(s) removed successfully`, 'success');
    }
}

function clearSelection() {
    selectedEmails.clear();
    displayEmails();
    updateBulkActionsBar();
    updateSelectAllCheckbox();
}

async function saveEmailChanges() {
    try {
        const response = await fetch(`${API_BASE_URL}/update-emails/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ emails: allEmails })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            console.error('Failed to save email changes:', data.message);
        }
    } catch (error) {
        console.error('Error saving email changes:', error);
    }
}
