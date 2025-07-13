document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const navbar = document.querySelector('nav');
    const searchInput = document.querySelector('.search-container input');
    const searchIcon = document.querySelector('.search-container i');
    const dynamicActionBtn = document.getElementById('dynamicActionBtn');
    const dynamicActionBtnText = dynamicActionBtn.querySelector('span');
    
    // Popup elements
    const helplineFormPopup = document.getElementById('helplineFormPopup');
    const mythFormPopup = document.getElementById('mythFormPopup');
    const closePopupBtns = document.querySelectorAll('.close-popup');
    
    const profileIcon = document.getElementById('profileIcon');
    const dropdown = document.getElementById('dropdownContent');

    // Track active confirmation dialog
    let activeConfirmationDialog = null;

    // Initialize UI
    initUI();
    
    // Content configuration
    const contentConfig = {
        'dashboard-content': {
            searchPlaceholder: '',
            actionButtonText: '',
            showActionButton: false,
            searchAction: null,
            loadData: loadDashboardData
        },
        'query-content': {
            searchPlaceholder: 'Search queries...',
            actionButtonText: '',
            showActionButton: false,
            searchAction: searchQueries,
            loadData: loadQueries  // Add this line
        },
        'helpline-content': {
            searchPlaceholder: 'Search health helplines...',
            actionButtonText: 'Add Helpline',
            showActionButton: true,
            searchAction: searchHelplines,
            popup: helplineFormPopup,
            loadData: loadHelplines
        },
        'myth-content': {
            searchPlaceholder: 'Search a myth...',
            actionButtonText: 'Add Myth',
            showActionButton: true,
            searchAction: searchMyths,
            popup: mythFormPopup,
            loadData: loadMythCards
        },
        'storyboard-content': {
            searchPlaceholder: 'Search stories...',
            actionButtonText: '',
            showActionButton: false,
            searchAction: searchStories
        }
    };

    // Initialize with default content
    updateUIForContent('dashboard-content');
    loadDashboardData(); 
    loadInitialData();

    // Event Listeners
    setActiveContent('dashboard-content');          // Highlight "Query" section
    updateUIForContent('dashboard-content');        // Update search bar & button
    loadDashboardData();  
    setupEventListeners();

    // Helper Functions
    function initUI() {
        // Fix layout shift on fresh load
        if (sidebar && navbar) {
            if (!sidebar.classList.contains('hide')) {
                navbar.style.width = "calc(100% - 260px)";
                navbar.style.left = "260px";
            }
        }
    }

    function setupEventListeners() {
        // Profile dropdown functionality
        if (profileIcon && dropdown) {
            profileIcon.addEventListener('click', function(event) {
                event.stopPropagation();
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            // Close dropdown if clicked outside
            document.addEventListener('click', function(event) {
                if (!dropdown.contains(event.target) && event.target !== profileIcon) {
                    dropdown.style.display = 'none';
                }
            });
        }

        // Sidebar toggle
        if (toggleSidebar && sidebar) {
            toggleSidebar.addEventListener('click', () => {
                sidebar.classList.toggle('hide');
                navbar.style.width = sidebar.classList.contains('hide') 
                    ? "calc(100% - 70px)" 
                    : "calc(100% - 260px)";
                navbar.style.left = sidebar.classList.contains('hide') ? "70px" : "260px";
            });
        }

        // Content switching
        const menuItems = document.querySelectorAll('.side-menu li[data-target]');
        menuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                updateUIForContent(targetId);
                setActiveContent(targetId);
                
                // Load data for the active content if it has a loadData function
                if (contentConfig[targetId]?.loadData) {
                    contentConfig[targetId].loadData();
                }
            });
        });

        // Search functionality
        if (searchIcon && searchInput) {
            searchIcon.addEventListener('click', handleSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleSearch();
            });
        }

        // Dynamic action button click handler
        dynamicActionBtn.addEventListener('click', handleActionButtonClick);

        // Close popup handlers
        closePopupBtns.forEach(btn => {
            btn.addEventListener('click', () => closePopup(btn.closest('.popup-overlay')));
        });

        // Close popup when clicking outside
        document.querySelectorAll('.popup-overlay').forEach(popup => {
            popup.addEventListener('click', function(e) {
                if (e.target === this) {
                    closePopup(this);
                }
            });
        });

        // Form submissions
        setupFormHandlers();
    }

    function handleSearch() {
        const activeContent = document.querySelector('.content-section.active').id;
        const query = searchInput.value.trim();
        if (query) {
            contentConfig[activeContent].searchAction(query);
        }
    }

    function handleActionButtonClick() {
        const activeContent = document.querySelector('.content-section.active').id;
        const popup = contentConfig[activeContent].popup;
        if (popup) {
            popup.style.display = 'flex';
            // Reset form mode when adding new
            if (activeContent === 'helpline-content') {
                const form = document.getElementById('helplineForm');
                delete form.dataset.editId;
                form.querySelector('.submit-btn').textContent = 'Post Helpline';
                form.reset();
            } else if (activeContent === 'myth-content') {
                const form = document.getElementById('mythForm');
                delete form.dataset.editId;
                form.querySelector('.submit-btn').textContent = 'Post Myth';
                form.reset();
            }
        }
    }

    function closePopup(popup) {
        popup.style.display = 'none';
        // Reset myth form if it's open
        if (popup === mythFormPopup) {
            document.querySelector('.flip-container').classList.remove('flipped');
            document.getElementById('mythForm').reset();
            document.getElementById('factForm').reset();
        }
    }

    function setupFormHandlers() {
        // Helpline Form Submission
        document.getElementById('helplineForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = this.dataset.editId ? 'Updating...' : 'Posting...';
        
            try {
                const title = document.getElementById('helplineTitle').value.trim();
                const location = document.getElementById('helplineLocation').value.trim();
                const description = document.getElementById('helplineDescription').value.trim();
                
                if (!title || !description) {
                    throw new Error('Title and description are required');
                }
                
                const url = this.dataset.editId ? '/update_helpline' : '/add_helpline';
                const body = {
                    title: title,
                    location: location,
                    description: description
                };
                
                if (this.dataset.editId) {
                    body.h_id = this.dataset.editId;
                }
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                });
        
                const data = await response.json();
        
                if (!response.ok || data.status !== 'success') {
                    throw new Error(data.message || 'Failed to process helpline');
                }
        
                // Success case
                loadHelplines();
                this.reset();
                delete this.dataset.editId;
                submitBtn.textContent = 'Post Helpline';
                helplineFormPopup.style.display = 'none';
                showSuccessMessage(data.message || (this.dataset.editId ? 'Helpline updated!' : 'Helpline added successfully!'));
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage(error.message || 'An error occurred');
            } finally {
                submitBtn.disabled = false;
            }
        });
        
        // Myth form handling
        let currentMyth = null;
        
        document.getElementById('mythForm').addEventListener('submit', function(e) {
            e.preventDefault();
            currentMyth = document.getElementById('mythText').value.trim();
            if (!currentMyth) {
                showErrorMessage('Please enter a myth');
                return;
            }
            document.querySelector('.flip-container').classList.add('flipped');
        });
        
        document.querySelector('.back-btn').addEventListener('click', function() {
            document.querySelector('.flip-container').classList.remove('flipped');
        });
        
        document.getElementById('factForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = this.dataset.editId ? 'Updating...' : 'Posting...';
        
            try {
                const fact = document.getElementById('factText').value.trim();
                
                if (!fact || !currentMyth) {
                    throw new Error('Please fill in all fields');
                }
                
                const url = this.dataset.editId ? '/update_myth_card' : '/add_myth_card';
                const body = {
                    myth: currentMyth,
                    fact: fact
                };
                
                if (this.dataset.editId) {
                    body.myth_id = this.dataset.editId;
                }
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
        
                const data = await response.json();
        
                if (!response.ok || data.status !== 'success') {
                    throw new Error(data.message || 'Failed to process myth card');
                }
        
                // Success case - refresh the list
                loadMythCards();
                
                // Reset forms and UI
                document.getElementById('mythForm').reset();
                this.reset();
                delete this.dataset.editId;
                submitBtn.textContent = 'Post Myth Card';
                mythFormPopup.style.display = 'none';
                document.querySelector('.flip-container').classList.remove('flipped');
                
                showSuccessMessage(data.message || (this.dataset.editId ? 
                    'Myth card updated!' : 'Myth card added successfully!'));
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage(error.message || 'An error occurred');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    function updateUIForContent(contentId) {
        const config = contentConfig[contentId];
        
        // Update search placeholder
        if (searchInput) {
            searchInput.placeholder = config.searchPlaceholder;
            searchInput.value = '';
        }
        
        // Update action button
        if (dynamicActionBtn) {
            dynamicActionBtn.style.display = config.showActionButton ? 'flex' : 'none';
            dynamicActionBtnText.textContent = config.actionButtonText;
        }
    }

    function setActiveContent(targetId) {
        // Remove active class from all menu items and content sections
        document.querySelectorAll('.side-menu li').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked menu item and target content
        const menuItem = document.querySelector(`.side-menu li[data-target="${targetId}"]`);
        const contentSection = document.getElementById(targetId);
        
        if (menuItem) menuItem.classList.add('active');
        if (contentSection) contentSection.classList.add('active');
    }
    
    // Search functions for each content type
    function searchQueries(query) {
        const rows = document.querySelectorAll('#queryList tr');
        const searchTerm = query.toLowerCase();
        
        rows.forEach(row => {
            if (row.classList.contains('no-data') || row.classList.contains('error-message')) {
                return;
            }
            
            const question = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            const user = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            
            if (question.includes(searchTerm) || user.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function searchHelplines(query) {
        console.log(`Searching health helplines for: ${query}`);
        // Filter helplines based on search query
        const rows = document.querySelectorAll('#helplineList tr');
        rows.forEach(row => {
            const title = row.querySelector('td:first-child').textContent.toLowerCase();
            const location = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const desc = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            if (title.includes(query.toLowerCase()) || 
                location.includes(query.toLowerCase()) || 
                desc.includes(query.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function searchMyths(query) {
        console.log(`Searching myths for: ${query}`);
        // Implement actual search functionality here
    }

    function searchStories(query) {
        console.log(`Searching stories for: ${query}`);
        // Implement actual search functionality here
    }

    function loadDashboardData() {
        fetch('/get_dashboard_stats')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update stats
                    document.getElementById('pending-queries').textContent = data.pending_queries;
                    document.getElementById('new-stories').textContent = data.new_stories;
                    document.getElementById('total-users').textContent = data.total_users;
                    document.getElementById('total-helplines').textContent = data.total_helplines;
                    document.getElementById('total-myths').textContent = data.total_myths;
                    
                    // Update recent activities
                    const activityList = document.getElementById('activityList');
                    activityList.innerHTML = '';
                    
                    data.recent_activities.forEach(activity => {
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.innerHTML = `
                             <div class="activity-icon">
                            <i class='bx ${activity.icon}'></i>
                        </div>
                        <div class="activity-content">
                            <h4>${activity.title}</h4>
                            <p>${activity.description}</p>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                    `;
                        activityList.appendChild(activityItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading dashboard data:', error);
            });
    }
    
    // Load initial data from database
    function loadInitialData() {
        loadHelplines();
        loadMythCards();
        loadStories();
    }
    
                
    function loadQueries() {
        fetch('/get_queries')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const queryList = document.getElementById('queryList');
            queryList.innerHTML = '';
            
            if (data.status === 'success' && data.queries && data.queries.length > 0) {
                data.queries.forEach((query, index) => {
                    const row = document.createElement('tr');
                    const statusClass = query.status === 'replied' ? 'status-replied' : 'status-pending';
                    const statusText = query.status === 'replied' ? 'REPLIED' : 'PENDING';
                    
                    const privacyClass = query.visibility === 'public' ? 'privacy-public' : 'privacy-private';
                    const privacyText = query.visibility === 'public' ? 'PUBLIC' : 'PRIVATE';
                    
                    row.innerHTML = `
                        <td>${index+1}</td>
                        <td>${query.username || 'User #'+query.user_id}</td>
                        <td>${query.query}</td>
                        <td class="${privacyClass}">${privacyText}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td class="action-buttons">
                            <button class="query-action-btn view-query-btn" data-id="${query.query_id}">
                                <i class='bx bx-show'></i> View
                            </button>
                            <button class="query-action-btn reply-query-btn" data-id="${query.query_id}">
                                <i class='bx bx-reply'></i> Reply
                            </button>
                        </td>
                    `;
                    queryList.appendChild(row);
                });
                
                // Add event listeners for buttons
                queryList.addEventListener('click', function(e) {
                    const viewBtn = e.target.closest('.view-query-btn');
                    const replyBtn = e.target.closest('.reply-query-btn');
                    
                    if (viewBtn) {
                        handleViewQuery(viewBtn.dataset.id);
                    }
                    
                    if (replyBtn) {
                        handleReplyQuery(replyBtn.dataset.id);
                    }
                });
            } else {
                queryList.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-data">No queries found</td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error("Error loading queries:", error);
            document.getElementById('queryList').innerHTML = `
                <tr>
                    <td colspan="6" class="error-message">Failed to load queries. Please try again later.</td>
                </tr>
            `;
        });
    }
    
    function handleViewQuery(queryId) {
        // Implement view query functionality
        showQueryPopup(queryId, false);        // You can fetch the full query details here and show in a popup
    }
    
    function handleReplyQuery(queryId) {
        // Implement reply functionality
        showQueryPopup(queryId,true);        // You can open a reply form here
    }      
    function setupFilterDropdowns() {
        // Status filter
        const statusFilterBtn = document.getElementById('statusFilterBtn');
        const statusDropdown = statusFilterBtn.nextElementSibling;
        
        // Privacy filter
        const privacyFilterBtn = document.getElementById('privacyFilterBtn');
        const privacyDropdown = privacyFilterBtn.nextElementSibling;
        
        // Toggle dropdowns
        statusFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            statusDropdown.style.display = statusDropdown.style.display === 'block' ? 'none' : 'block';
            privacyDropdown.style.display = 'none';
        });
        
        privacyFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            privacyDropdown.style.display = privacyDropdown.style.display === 'block' ? 'none' : 'block';
            statusDropdown.style.display = 'none';
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            statusDropdown.style.display = 'none';
            privacyDropdown.style.display = 'none';
        });
        
        // Status filter options
        statusDropdown.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const status = option.dataset.status;
                statusFilterBtn.querySelector('span').textContent = option.textContent;
                statusFilterBtn.classList.toggle('active', status !== 'all');
                filterQueries(status, 'status');
                statusDropdown.style.display = 'none';
            });
        });
        
        // Privacy filter options
        privacyDropdown.querySelectorAll('a').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const privacy = option.dataset.privacy;
                privacyFilterBtn.querySelector('span').textContent = option.textContent;
                privacyFilterBtn.classList.toggle('active', privacy !== 'all');
                filterQueries(privacy, 'privacy');
                privacyDropdown.style.display = 'none';
            });
        });
    }
    
    function filterQueries(value, type) {
        const rows = document.querySelectorAll('#queryList tr');
        
        rows.forEach(row => {
            if (row.classList.contains('no-data') || row.classList.contains('error-message')) {
                return;
            }
            
            let showRow = true;
            
            if (type === 'status' && value !== 'all') {
                const status = row.querySelector('.status-badge').textContent.toLowerCase();
                if (status !== value) showRow = false;
            }
            
            if (type === 'privacy' && value !== 'all') {
                const privacy = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
                if (privacy !== value) showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    // After loading queries
    setupFilterDropdowns();
function showQueryPopup(queryId, isReplyMode = false) {
    // Create popup
     const existingPopup = document.querySelector('.query-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }
    const popup = document.createElement('div');
    popup.className = 'query-popup-overlay';
    
    popup.innerHTML = `
        <div class="query-popup-content">
            <span class="close-query-popup">&times;</span>
            <h2>Query Details</h2>
            
            <div class="query-details">
                <div id="queryContent">
                    <p>Loading query details...</p>
                </div>
            </div>
            
            <div id="responseSection"></div>
        </div>
    `;

    document.body.appendChild(popup);
    
    // Close popup handler
    popup.querySelector('.close-query-popup').addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.body.removeChild(popup);
    });
    
    // Load query details
    fetch(`/get_query_responses/${queryId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to load query');
            }
            
            const queryContent = popup.querySelector('#queryContent');
            const responseSection = popup.querySelector('#responseSection');
            
            // Display query info
            queryContent.innerHTML = `
                <div class="query-header">
                    <h3>Query from ${data.query.username || 'User'}</h3>
                    <div class="query-meta">
                        <span><strong>Posted:</strong> ${data.query.created_at}</span>
                        <span><strong>Status:</strong> ${data.query.status.toUpperCase()}</span>
                        <span><strong>Visibility:</strong> ${data.query.visibility.toUpperCase()}</span>
                    </div>
                </div>
                <div class="query-text">${data.query.query}</div>
            `;
            
            // Display responses if any
            if (data.responses.length > 0) {
                responseSection.innerHTML = `
                    <div class="responses-container">
                        <h3>Responses</h3>
                        <div class="responses-list">
                            ${data.responses.map(r => `
                                <div class="response-item">
                                    <div class="response-header">
                                        <strong>${r.admin_name}</strong>
                                        <span>${r.created_at}</span>
                                    </div>
                                    <div class="response-text">${r.response}</div>
                                    ${isReplyMode ? `
                                    <div class="response-actions">
                                        <button class="edit-response-btn" 
                                            data-response-id="${r.response_id}">
                                            <i class='bx bx-edit'></i> Update
                                        </button>
                                        <button class="delete-response-btn" 
                                            data-response-id="${r.response_id}"
                                            data-query-id="${queryId}">
                                            <i class='bx bx-trash'></i> Delete
                                        </button>
                                    </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                // Add event listeners for edit/delete if in reply mode
                if (isReplyMode) {
                    // Edit response
                    responseSection.querySelectorAll('.edit-response-btn').forEach(btn => {
                        btn.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            const responseId = btn.dataset.responseId;
                            const responseItem = btn.closest('.response-item');
                            const responseText = responseItem.querySelector('.response-text').textContent;
                            
                            responseSection.innerHTML = `
                                <div class="response-form">
                                    <h3>Edit Response</h3>
                                    <textarea id="responseText">${responseText}</textarea>
                                    <div class="form-actions">
                                        <button type="button" class="cancel-edit-btn">
                                            Cancel
                                        </button>
                                        <button type="button" class="submit-btn" 
                                            data-query-id="${queryId}" 
                                            data-response-id="${responseId}">
                                            Update Response
                                        </button>
                                    </div>
                                </div>
                            `;
                            
                            // Cancel edit
                            responseSection.querySelector('.cancel-edit-btn').addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                showQueryPopup(queryId, isReplyMode);
                            });
                            
                            // Submit update
                            responseSection.querySelector('.submit-btn').addEventListener('mousedown', (e)=>{
                                 e.preventDefault();
                                handleResponseSubmit.call(e.target);
                            });
                        });
                    });
                    
                    // Delete response
                    responseSection.querySelectorAll('.delete-response-btn').forEach(btn => {
                        btn.addEventListener('mousedown', (e) => {
                            const responseId = btn.dataset.responseId;
                            const queryId = btn.dataset.queryId;
                            
                            showConfirmationDialog('Are you sure you want to delete this response?', (confirmed) => {
                                if (confirmed) {
                                    fetch('/delete_response', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            response_id: responseId,
                                            query_id: queryId
                                        })
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.status !== 'success') {
                                            throw new Error(data.message);
                                        }
                                        
                                        showSuccessMessage(data.message);
                                        document.body.removeChild(popup);
                                        loadQueries(); // Refresh the queries list
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                        showErrorMessage(error.message);
                                    });
                                }
                            });
                        });
                    });
                }
            } else if (isReplyMode) {
                // No responses - show reply form
                responseSection.innerHTML = `
                    <div class="response-form">
                        <h3>Add Response</h3>
                        <textarea id="responseText" placeholder="Type your response here..."></textarea>
                        <button id="submitResponseBtn" data-query-id="${queryId}">
                            Submit Response
                        </button>
                    </div>
                `;
                
                // Submit response handler
                responseSection.querySelector('#submitResponseBtn').addEventListener('mousedown', (e)=>{
                    
                    e.preventDefault();
                    handleResponseSubmit.call(e.target);
                });
            } else {
                // View mode with no responses
                responseSection.innerHTML = '<p class="no-responses">No responses yet</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            popup.querySelector('#queryContent').innerHTML = 
                '<p class="error">Failed to load query details: ' + error.message + '</p>';
        });

        function handleResponseSubmit() {
        const queryId = this.dataset.queryId;
        const responseId = this.dataset.responseId; // Will be undefined for new responses
        const responseText = document.getElementById('responseText').value.trim();
        
        if (!responseText) {
            showErrorMessage('Please enter a response');
            return;
        }
        
        const submitBtn = this;
        submitBtn.disabled = true;
        submitBtn.textContent = responseId ? 'Updating...' : 'Submitting...';
        
        const url = responseId ? '/update_response' : '/submit_response';
        const method = 'POST';
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query_id: queryId,
                response_text: responseText,
                response_id: responseId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to process response');
            }
            
            showSuccessMessage(data.message);
            document.body.removeChild(popup);
            loadQueries(); // Refresh the queries list
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage(error.message);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = responseId ? 'Update Response' : 'Submit Response';
        });
    }
}

function updateQueryStatus(queryId, status) {
    // Find all rows that might contain this query (in case of filtered views)
    const rows = document.querySelectorAll('#queryList tr');
    
    rows.forEach(row => {
        if (row.querySelector('td:first-child')?.textContent === queryId.toString()) {
            const statusCell = row.querySelector('.status-badge');
            if (statusCell) {
                statusCell.textContent = status.toUpperCase();
                statusCell.className = `status-badge status-${status.toLowerCase()}`;
            }
        }
    });
}

function deleteResponse(responseId, queryId) {
    fetch('/delete_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            response_id: responseId,
            query_id: queryId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status !== 'success') {
            throw new Error(data.message);
        }
        
        showSuccessMessage(data.message);
        updateQueryStatus(queryId, data.query_status);
    })
    .catch(error => {
        console.error("Delete failed:", error);
        showErrorMessage(error.message);
    });
}


    function loadHelplines() {
        fetch('/get_helplines')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const helplineList = document.getElementById('helplineList');
                helplineList.innerHTML = '';
                
                if (data.status === 'success' && data.helplines && data.helplines.length > 0) {
                    data.helplines.forEach(helpline => {
                        const row = document.createElement('tr');
                        const words = helpline.description.split(' ');
                        const shortDesc = words.length > 6 ? words.slice(0, 6).join(' ') + '...' : helpline.description;
                        
                        row.innerHTML = `
                            <td>${helpline.title || 'Untitled'}</td>
                            <td>${helpline.location || 'N/A'}</td>
                            <td>
                                <span class="truncated-desc" data-full="${helpline.description}">
                                    ${shortDesc}
                                </span>
                                ${words.length > 6 ? '<span class="read-more" style="color: #bb7d17; cursor: pointer;"> more</span>' : ''}
                            </td>
                            <td class="action-buttons">
                                <button class="btn-edit helpline-edit-btn" data-id="${helpline.h_id}">
                                    <i class='bx bx-edit'></i> Edit  
                                </button>
                                <button class="btn-delete helpline-delete-btn" data-id="${helpline.h_id}">
                                    <i class='bx bx-trash'></i> Delete
                                </button>
                            </td>
                        `;
                        helplineList.appendChild(row);
                    });
    
                    // Add click handler for description expansion
                    document.querySelectorAll('.truncated-desc').forEach(desc => {
                        desc.addEventListener('click', showFullDescription);
                    });
                    
                    // Add click handler for "more" links
                    document.querySelectorAll('.read-more').forEach(link => {
                        link.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const fullDesc = this.previousElementSibling.getAttribute('data-full');
                            showFullDescriptionPopup(fullDesc);
                        });
                    });
    
                    // Event delegation for edit/delete buttons
                    helplineList.addEventListener('click', function(e) {
                        const editBtn = e.target.closest('.helpline-edit-btn');
                        const deleteBtn = e.target.closest('.helpline-delete-btn');
                        
                        if (editBtn) {
                            handleEditHelpline(editBtn.dataset.id);
                        }
                        
                        if (deleteBtn) {
                            handleDeleteHelpline(deleteBtn.dataset.id);
                        }
                    });
                } else {
                    helplineList.innerHTML = `
                        <tr>
                            <td colspan="4" class="no-data">No helplines available</td>
                        </tr>
                    `;
                }
            })
            .catch(error => {
                console.error("Error loading helplines:", error);
                const helplineList = document.getElementById('helplineList');
                helplineList.innerHTML = `
                    <tr>
                        <td colspan="4" class="error-message">Failed to load helplines. Please try again later.</td>
                    </tr>
                `;
            });
    }
    
    // Add these new functions for description handling
    function showFullDescription(e) {
        const fullDesc = e.target.getAttribute('data-full');
        showFullDescriptionPopup(fullDesc);
    }
    
    function showFullDescriptionPopup(description) {
        const popup = document.createElement('div');
        popup.className = 'desc-popup';
        popup.innerHTML = `
            <div class="desc-popup-content">
                <p>${description}</p>
                <button class="desc-popup-close">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        popup.style.display = 'flex';
        
        popup.querySelector('.desc-popup-close').addEventListener('click', () => {
            popup.remove();
        });
        
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
    }

    async function handleEditHelpline(h_id) {
        try {
            const response = await fetch(`/get_helpline?id=${h_id}`);
            const data = await response.json();
            
            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch helpline');
            }
            
            // Populate the form
            document.getElementById('helplineTitle').value = data.helpline.title;
            document.getElementById('helplineLocation').value = data.helpline.location || '';
            document.getElementById('helplineDescription').value = data.helpline.description;
            
            // Set edit mode
            const form = document.getElementById('helplineForm');
            form.dataset.editId = h_id;
            form.querySelector('.submit-btn').textContent = 'Update Helpline';
            
            // Show the popup
            helplineFormPopup.style.display = 'flex';
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('Failed to load helpline for editing');
        }
    }

    async function handleDeleteHelpline(h_id) {
        showConfirmationDialog('Are you sure you want to delete this helpline?', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch('/delete_helpline', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ h_id: h_id })
                    });
                    
                    const result = await response.json();
                    
                    if (result.status !== 'success') {
                        throw new Error(result.message);
                    }
                    
                    loadHelplines();
                    showSuccessMessage(result.message);
                } catch (error) {
                    console.error("Delete failed:", error);
                    showErrorMessage(error.message);
                }
            }
        });
    }
    
    function loadMythCards(showAll = false) {
        fetch('/get_myth_cards')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                const mythCardList = document.getElementById('mythCardList');
                mythCardList.innerHTML = '';
                
                if (data.status === 'success' && data.myth_cards && data.myth_cards.length > 0) {
                    // Add the grid container
                    const container = document.createElement('div');
                    container.className = 'myth-cards-container';
                    mythCardList.appendChild(container);
                    
                    // Determine how many cards to show initially
                    const cardsToShow = showAll ? data.myth_cards.length : Math.min(9, data.myth_cards.length);
                    
                    for (let i = 0; i < cardsToShow; i++) {
                        const card = data.myth_cards[i];
                        const mythItem = document.createElement('div');
                        mythItem.className = 'myth-card';
                        mythItem.dataset.id = card.myth_id;
                        mythItem.innerHTML = `
                            <div class="myth-card-actions">
                                <button class="myth-edit-btn" data-id="${card.myth_id}" title="Edit">
                                    <i class='bx bx-edit'></i>
                                </button>
                                <button class="myth-delete-btn" data-id="${card.myth_id}" title="Delete">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                            <h3>MYTH: ${card.myth}</h3>
                            <div class="fact">FACT: ${card.fact}</div>
                        `;
                        container.appendChild(mythItem);
                    }

                    // Add "Show More" button if there are more cards
                    if (!showAll && data.myth_cards.length > 9) {
                        const showMoreContainer = document.createElement('div');
                        showMoreContainer.className = 'show-more-container';
                        showMoreContainer.innerHTML = `
                            <button class="show-more-btn">Show More (${data.myth_cards.length - 9} more)</button>
                        `;
                        mythCardList.appendChild(showMoreContainer);
                        
                        showMoreContainer.querySelector('.show-more-btn').addEventListener('click', () => {
                            loadMythCards(true);
                        });
                    }

                    // Add click handler for toggling facts
                    container.addEventListener('click', function(e) {
                        const mythCard = e.target.closest('.myth-card');
                        if (mythCard && !e.target.closest('.myth-card-actions')) {
                            mythCard.classList.toggle('active');
                        }
                    });

                    // Add event listeners for edit/delete buttons
                    container.addEventListener('click', function(e) {
                        const editBtn = e.target.closest('.myth-edit-btn');
                        const deleteBtn = e.target.closest('.myth-delete-btn');
                        
                        if (editBtn) {
                            handleEditMythCard(editBtn.dataset.id);
                        }
                        
                        if (deleteBtn) {
                            handleDeleteMythCard(deleteBtn.dataset.id);
                        }
                    });
                } else {
                    mythCardList.innerHTML = '<p class="no-data">No myth cards found</p>';
                }
            })
            .catch(error => {
                console.error("Error loading myth cards:", error);
                document.getElementById('mythCardList').innerHTML = 
                    '<p class="error-message">Failed to load myth cards. Please try again later.</p>';
            });
    }

    async function handleEditMythCard(myth_id) {
        try {
            const response = await fetch(`/get_myth_card?id=${myth_id}`);
            const data = await response.json();
            
            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch myth card');
            }
            
            // Populate the form
            document.getElementById('mythText').value = data.myth_card.myth;
            document.getElementById('factText').value = data.myth_card.fact;
            
            // Set edit mode
            const form = document.getElementById('factForm');
            form.dataset.editId = myth_id;
            form.querySelector('.submit-btn').textContent = 'Update Myth Card';
            
            // Show the popup and flip to fact side
            mythFormPopup.style.display = 'flex';
            document.querySelector('.flip-container').classList.add('flipped');
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('Failed to load myth card for editing');
        }
    }

    async function handleDeleteMythCard(myth_id) {
        showConfirmationDialog('Are you sure you want to delete this myth card?', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch('/delete_myth_card', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ myth_id })
                    });
                    
                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        loadMythCards();
                        showSuccessMessage('Myth card deleted successfully');
                    } else {
                        throw new Error(result.message || 'Failed to delete myth card');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showErrorMessage(error.message || 'Failed to delete myth card');
                }
            }
        });
    }
    function loadStories() {
        const tableBody = document.getElementById('storyboardList');
        tableBody.innerHTML = '<tr><td colspan="4" class="loading">Loading...</td></tr>';
        
        fetch('/get_stories')
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                tableBody.innerHTML = '';
                
                if (data.status === 'success' && data.stories.length > 0) {
                    data.stories.forEach((story, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>User #${story.user_id}</td>
                        <td>${story.title}</td>
                        <td>${story.created_at}</td>
                       <td style="text-align: right;">
                            <button class="btn-report-story" data-id="${story.story_id}">
                                <i class='bx bx-flag'></i> Report
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);

                });
               tableBody.querySelectorAll('.btn-report-story').forEach(btn => {
    btn.addEventListener('click', function() {
        const storyId = this.getAttribute('data-id');
        showConfirmationDialog('Do you want to report this story? It will be deleted.', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/delete_story/${storyId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (result.status === 'success') {
                        showSuccessMessage('Story reported and deleted successfully');
                        loadStories(); // Refresh the list
                    } else {
                        showErrorMessage(result.message || 'Failed to delete story');
                    }
                } catch (error) {
                    showErrorMessage('Error deleting story');
                }
            }
        });
    });
});

            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="no-data">No stories</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.innerHTML = '<tr><td colspan="5" class="error">Load failed</td></tr>';
        });
}
    
    // Confirmation dialog function
    function showConfirmationDialog(message, callback) {
        // Remove any existing dialog
        if (activeConfirmationDialog) {
            activeConfirmationDialog.remove();
        }
        
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <p>${message}</p>
                <div class="dialog-buttons">
                    <button class="confirm-btn">Yes</button>
                    <button class="cancel-btn">Back</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        activeConfirmationDialog = dialog;
        
        dialog.querySelector('.confirm-btn').addEventListener('click', () => {
            callback(true);
            dialog.remove();
            activeConfirmationDialog = null;
        });
        
        dialog.querySelector('.cancel-btn').addEventListener('click', () => {
            callback(false);
            dialog.remove();
            activeConfirmationDialog = null;
        });
    }

    // Toast message functions
    function showSuccessMessage(message) {
        showToast(message, 'success');
    }

    function showErrorMessage(message) {
        showToast(message, 'error');
    }

    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

   
});