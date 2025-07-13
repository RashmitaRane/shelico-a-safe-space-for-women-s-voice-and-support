document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const navbar = document.querySelector('nav');
    const searchInput = document.querySelector('.search-container input');
    const searchIcon = document.querySelector('.search-container i');
    const notificationBtn = document.querySelector('.notification-btn');
    const askQueryBtn = document.querySelector('.ask-query-btn');
    const profileIcon = document.getElementById('profileIcon');
    const dropdown = document.getElementById('dropdownContent');
    const queryPopup = document.getElementById("queryPopup");
    const storyPopup = document.getElementById("storyPopup");
    let cachedQueries = [];
    let cachedHelplines = [];
    let cachedMyths = [];
    let cachedStories = [];
    
    // Profile dropdown
    if (profileIcon && dropdown) {
        profileIcon.addEventListener('click', function(event) {
            event.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', function(event) {
            if (!dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    // Fix layout shift on fresh load
    window.addEventListener('load', function() {
        if (sidebar && navbar) {
            if (!sidebar.classList.contains('hide')) {
                navbar.style.width = "calc(100% - 260px)";
                navbar.style.left = "260px";
            }
        }
    });

    // Initialize popups
    if (queryPopup || storyPopup) {
        // Query Popup Elements
        const closeQueryPopup = queryPopup ? queryPopup.querySelector(".close-popup") : null;
        const queryText = document.getElementById("queryText");
        const charRemaining = document.getElementById("charRemaining");
        const queryForm = document.getElementById("queryForm");

        // Story Popup Elements
        const closeStoryPopup = storyPopup ? storyPopup.querySelector(".close-popup") : null;
        const storyText = document.getElementById("storyText");
        const storyCharRemaining = document.getElementById("storyCharRemaining");
        const storyForm = document.getElementById("storyForm");

        if (askQueryBtn) {
            askQueryBtn.addEventListener("click", function(e) {
                e.preventDefault();
                const activeSection = document.querySelector(".content-section.active").id;
                
                if (activeSection === "story-content") {
                    // Show story popup
                    storyPopup.style.display = "flex";
                    if (storyText) storyText.focus();
                } else {
                    // Show query popup
                    queryPopup.style.display = "flex";
                    if (queryText) queryText.focus();
                }
            });
        }

        // Show popups when buttons are clicked
        const navTabs = document.querySelectorAll('.nav-tab[data-target]');
        navTabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                updateUIForContent(targetId);
                setActiveContent(targetId);
                
                if (contentConfig[targetId]?.loadData) {
                    contentConfig[targetId].loadData();
                }
            });
        });
        
        // In the popup initialization section, update the query form submission handler:
     queryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(queryForm);
    const data = {
        queryText: formData.get("queryText"),
        visibility: formData.get("visibility"),
    };

    console.log("Submitting query:", data); // Debugging

    fetch("/submit_query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Submission failed");
            return response.json();
        })
        .then((data) => {
            console.log("Server response:", data); // Debugging
            if (data.status === "success") {
                location.reload(); // Reload the page
            } else {
                throw new Error(data.message || "Unknown error");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});
         // Close popups
        if (closeQueryPopup) {
            closeQueryPopup.addEventListener("click", function() {
                queryPopup.style.display = "none";
            });
        }
        
        if (closeStoryPopup) {
            closeStoryPopup.addEventListener("click", function() {
                storyPopup.style.display = "none";
            });
        }

        // Close popups when clicking outside
        window.addEventListener("click", function(e) {
            if (queryPopup && e.target === queryPopup) {
                queryPopup.style.display = "none";
            }
            if (storyPopup && e.target === storyPopup) {
                storyPopup.style.display = "none";
            }
        });

        // Character count for textareas
        if (queryText && charRemaining) {
            queryText.addEventListener("input", function() {
                charRemaining.textContent = 1000 - queryText.value.length;
            });
        }

        if (storyText && storyCharRemaining) {
            storyText.addEventListener("input", function() {
                storyCharRemaining.textContent = 2000 - storyText.value.length;
            });
        }

        
       if (storyForm) {
    storyForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const title = document.getElementById("storyTitle").value;
        const storyContent = storyText.value;

        if (!storyContent.trim()) {
            showInlineMessage("Story content cannot be empty!", "error");
            return;
        }

        // Show loading state
        const submitBtn = storyForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Posting...';
        submitBtn.disabled = true;

        // Prepare data
        const data = {
            title: title,
            storyText: storyContent
        };

        fetch('/post_story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                storyPopup.style.display = "none";
                storyForm.reset();
                storyCharRemaining.textContent = "2000";
                
                // Refresh the page after successful story submission
                loadStories();
            } else {
                throw new Error(data.message || "Unknown error");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showInlineMessage(error.message || "Failed to post story. Please try again.", "error");
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    });
}
        // Add this helper function for inline messages
        function showInlineMessage(message, type) {
            // Remove any existing messages
            const existingMessages = document.querySelectorAll('.inline-message');
            existingMessages.forEach(msg => msg.remove());
            
            // Create message element
            const messageDiv = document.createElement('div');
            messageDiv.className = `inline-message ${type}`;
            messageDiv.textContent = message;
            
            // Add to the top of the content area
            const content = document.querySelector('#content');
            content.insertBefore(messageDiv, content.firstChild);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
    // Content configuration
    const contentConfig = {
        'query-content': {
            searchPlaceholder: 'Search a query...',
            showNotification: true,
            showAskButton: true,
            askButtonText: 'Ask Query',
            searchAction: searchQueries,
            loadData: loadQueries 
        },
        'helpline-content': {
            searchPlaceholder: 'Search health helplines...',
            showNotification: false,
            showAskButton: false,
            searchAction: searchHelplines,
            loadData: loadHelplines
        },
        'myth-content': {
            searchPlaceholder: 'Search a myth...',
            showNotification: false,
            showAskButton: false,
            searchAction: searchMyths,
            loadData: loadMythCards
        },
        'story-content': {
            searchPlaceholder: 'Search stories...',
            showNotification: false,
            showAskButton: true,
            askButtonText: 'Post Your Story',
            searchAction: searchStories,
            loadData: loadStories
        },
        'myposts-content': {
        searchPlaceholder: 'Search your posts...',
        showNotification: false,
        showAskButton: false,
        searchAction:searchMyPosts,
        loadData: loadMyPosts
    }
    };

    // Initialize with default content
    updateUIForContent('query-content');
    const urlParams = new URLSearchParams(window.location.search);
    const sectionFromUrl = urlParams.get('section');
    const initialSectionId = sectionFromUrl ? `${sectionFromUrl}-content` : 'query-content';

    // Set content
    setActiveContent(initialSectionId);
    updateUIForContent(initialSectionId);

    // Load its data
    if (contentConfig[initialSectionId] && typeof contentConfig[initialSectionId].loadData === 'function') {
        contentConfig[initialSectionId].loadData();
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
            
            if (contentConfig[targetId]?.loadData) {
                contentConfig[targetId].loadData();
            }
        });
    });

    // Search functionality
   // Search functionality
if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', () => {
        const activeContent = document.querySelector('.content-section.active').id;
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            contentConfig[activeContent].searchAction(searchTerm);
        } else {
            // If search is empty, reload the current content
            if (contentConfig[activeContent]?.loadData) {
                contentConfig[activeContent].loadData();
            }
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeContent = document.querySelector('.content-section.active').id;
            const searchTerm = searchInput.value.trim();
            
            if (searchTerm) {
                contentConfig[activeContent].searchAction(searchTerm);
            } else {
                // If search is empty, reload the current content
                if (contentConfig[activeContent]?.loadData) {
                    contentConfig[activeContent].loadData();
                }
            }
        }
    });
}
    // Helper functions
    function updateUIForContent(contentId) {
        const config = contentConfig[contentId];
        
        if (searchInput) {
            searchInput.placeholder = config.searchPlaceholder;
        }
        
        if (notificationBtn) {
            notificationBtn.style.display = config.showNotification ? 'block' : 'none';
        }
        
        if (askQueryBtn) {
            const askQueryBtnText = askQueryBtn.querySelector('span');
            askQueryBtn.style.display = config.showAskButton ? 'block' : 'none';
            if (config.showAskButton && config.askButtonText) {
                askQueryBtnText.textContent = config.askButtonText;
            }
        }
    }

    function setActiveContent(targetId) {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        
        const activeTab = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
        const contentSection = document.getElementById(targetId);
        
        if (activeTab) activeTab.classList.add('active');
        if (contentSection) contentSection.classList.add('active');
    }

    // Search functions
    
    function searchQueries(query) {
        const queryList = document.getElementById('queryList');
        
        if (!query || query.trim() === '') {
            // If search is empty, show all queries
            displayQueries(cachedQueries);
            return;
        }
        
        queryList.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Searching queries...</div>';
        
        // Use cached data if available
        if (cachedQueries.length > 0) {
            const searchTerm = query.toLowerCase().replace(/\s+/g, '');
            const filteredQueries = cachedQueries.filter(q => {
                const queryText = q.query.toLowerCase().replace(/\s+/g, '');
                const username = q.username.toLowerCase().replace(/\s+/g, '');
                return queryText.includes(searchTerm) || username.includes(searchTerm);
            });
            
            displaySearchResults(filteredQueries, queryList, 'queries');
        } else {
            // If no cached data, fetch fresh data
            loadQueries();
        }
    }
    function searchHelplines(query) {
        const helplineList = document.getElementById('helplineList');
        
        if (!query || query.trim() === '') {
            displayHelplines(cachedHelplines);
            return;
        }
        
        helplineList.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Searching helplines...</div>';
        
        if (cachedHelplines.length > 0) {
            const searchTerm = query.toLowerCase().replace(/\s+/g, '');
            const filteredHelplines = cachedHelplines.filter(hl => {
                const title = hl.title.toLowerCase().replace(/\s+/g, '');
                const location = hl.location ? hl.location.toLowerCase().replace(/\s+/g, '') : '';
                const description = hl.description.toLowerCase().replace(/\s+/g, '');
                return title.includes(searchTerm) || location.includes(searchTerm) || description.includes(searchTerm);
            });
            
            displaySearchResults(filteredHelplines, helplineList, 'helplines');
        } else {
            loadHelplines();
        }
    }

    function searchMyths(query) {
        const mythCardContainer = document.getElementById('mythCardContainer');
        mythCardContainer.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Searching myths...</div>';
    
        fetch('/user/get_myth_cards')
            .then(response => response.json())
            .then(data => {
                mythCardContainer.innerHTML = '';
                
                if (data.status === 'success' && data.myth_cards && data.myth_cards.length > 0) {
                    // Filter myth cards based on search term (case and space insensitive)
                    const filteredMyths = data.myth_cards.filter(card => {
                        const searchTerm = query.toLowerCase().replace(/\s+/g, '');
                        const myth = card.myth.toLowerCase().replace(/\s+/g, '');
                        const fact = card.fact.toLowerCase().replace(/\s+/g, '');
                        
                        return myth.includes(searchTerm) || 
                               fact.includes(searchTerm);
                    });
    
                    if (filteredMyths.length > 0) {
                        filteredMyths.forEach(card => {
                            const mythCard = createMythCard(card);
                            mythCardContainer.appendChild(mythCard);
                        });
                    } else {
                        mythCardContainer.innerHTML = '<div class="no-data">No matching myth cards found</div>';
                    }
                } else {
                    mythCardContainer.innerHTML = '<div class="no-data">No myth cards available at this time.</div>';
                }
            })
            .catch(error => {
                console.error('Error searching myth cards:', error);
                mythCardContainer.innerHTML = '<div class="error-message">Failed to search myth cards. Please try again later.</div>';
            });
    }
    function searchStories(query) {
        const storyList = document.getElementById('storyList');
        storyList.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Searching stories...</div>';
    
        fetch('/get_stories')
            .then(response => response.json())
            .then(data => {
                storyList.innerHTML = '';
                
                if (data.status === 'success' && data.stories && data.stories.length > 0) {
                    // Filter stories based on search term (case and space insensitive)
                    const filteredStories = data.stories.filter(story => {
                        const searchTerm = query.toLowerCase().replace(/\s+/g, '');
                        const title = story.title ? story.title.toLowerCase().replace(/\s+/g, '') : '';
                        const storyText = story.story.toLowerCase().replace(/\s+/g, '');
                        const username = story.username.toLowerCase().replace(/\s+/g, '');
                        
                        return title.includes(searchTerm) || 
                               storyText.includes(searchTerm) || 
                               username.includes(searchTerm);
                    });
    
                    if (filteredStories.length > 0) {
                        filteredStories.forEach(story => {
                            const card = createStoryCard(story);
                            storyList.appendChild(card);
                        });
                    } else {
                        storyList.innerHTML = '<div class="no-data">No matching stories found</div>';
                    }
                } else {
                    storyList.innerHTML = '<div class="no-data">No stories available yet.</div>';
                }
            })
            .catch(error => {
                console.error('Error searching stories:', error);
                storyList.innerHTML = '<div class="error-message">Failed to search stories. Please try again later.</div>';
            });
    }

    function loadQueries() {
        const queryList = document.getElementById('queryList');
        queryList.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Loading queries...</div>';
        
        // Only fetch if we don't have cached data
        if (cachedQueries.length === 0) {
            fetch('/get_queries')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.queries && data.queries.length > 0) {
                        cachedQueries = data.queries;
                        displayQueries(cachedQueries);
                    } else {
                        queryList.innerHTML = '<div class="no-data">No queries available yet. Be the first to ask!</div>';
                    }
                })
                .catch(error => {
                    console.error('Error loading queries:', error);
                    queryList.innerHTML = '<div class="error-message">Failed to load queries. Please try again later.</div>';
                });
        } else {
            // Use cached data
            displayQueries(cachedQueries);
        }
    }
    
    function loadStories() {
        const container = document.getElementById('storyList');
        container.innerHTML = '<div class="loading">Loading stories...</div>';
    
        fetch('/get_stories')
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                container.innerHTML = '';
    
                if (data.status === 'success' && data.stories.length > 0) {
                    data.stories.forEach(story => {
                        const card = createStoryCard(story);
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = '<div class="no-stories">No stories found</div>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                container.innerHTML = '<div class="error">Failed to load stories</div>';
            });
    }
    function loadQueryReply(queryId, container) {
        container.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Loading reply...</div>';
        
        fetch(`/get_query_responses/${queryId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                container.innerHTML = '';
                
                if (data.status === 'success' && data.responses && data.responses.length > 0) {
                    const reply = data.responses[0];
                    const replyDate = new Date(reply.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    
                    container.innerHTML = `
                        <div class="reply-meta">
                            <div class="profile-circle small">${reply.admin_name ? reply.admin_name.charAt(0).toUpperCase() : 'A'}</div>
                            <div class="user-info">
                                <span class="reply-username">${reply.admin_name || 'Admin'}</span>
                                <span class="reply-time">${replyDate}</span>
                            </div>
                        </div>
                        <div class="reply-content">${reply.response}</div>
                    `;
                } else {
                    container.innerHTML = '<div class="no-reply-msg">No reply yet</div>';
                }
            })
            .catch(error => {
                console.error('Error loading reply:', error);
                container.innerHTML = '<div class="no-reply-msg">Error loading reply</div>';
            });
    }
    function loadHelplines() {
        const helplineList = document.getElementById('helplineList');
        helplineList.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Loading health helplines...</div>';
        
        if (cachedHelplines.length === 0) {
            fetch('/user/get_helplines')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success' && data.helplines && data.helplines.length > 0) {
                        cachedHelplines = data.helplines;
                        displayHelplines(cachedHelplines);
                    } else {
                        helplineList.innerHTML = '<div class="no-data">No health helplines available at this time.</div>';
                    }
                })
                .catch(error => {
                    console.error('Error loading helplines:', error);
                    helplineList.innerHTML = '<div class="error-message">Failed to load health helplines. Please try again later.</div>';
                });
        } else {
            displayHelplines(cachedHelplines);
        }
    }
    function displayHelplines(helplines) {
        const helplineList = document.getElementById('helplineList');
        helplineList.innerHTML = '';
        
        if (helplines.length > 0) {
            helplines.forEach(helpline => {
                const card = createHelplineCard(helpline);
                helplineList.appendChild(card);
            });
        } else {
            helplineList.innerHTML = '<div class="no-data">No health helplines available at this time.</div>';
        }
    }    
    function loadMythCards() {
        const mythCardContainer = document.getElementById('mythCardContainer');
        mythCardContainer.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Loading myth cards...</div>';
        
        fetch('/user/get_myth_cards')
            .then(response => response.json())
            .then(data => {
                mythCardContainer.innerHTML = '';
                
                if (data.status === 'success' && data.myth_cards && data.myth_cards.length > 0) {
                    data.myth_cards.forEach(card => {
                        const mythCard = createMythCard(card);
                        mythCardContainer.appendChild(mythCard);
                    });
                } else {
                    mythCardContainer.innerHTML = '<div class="no-data">No myth cards available at this time.</div>';
                }
            })
            .catch(error => {
                console.error('Error loading myth cards:', error);
                mythCardContainer.innerHTML = '<div class="error-message">Failed to load myth cards. Please try again later.</div>';
            });
    }
    function createHelplineCard(helpline) {
        const card = document.createElement('div');
        card.className = 'helpline-card';
        card.innerHTML = `
            <div class="helpline-header">
                <h3>${helpline.title || 'Untitled Helpline'}</h3>
                <span class="helpline-location">${helpline.location || 'N/A'}</span>
            </div>
            <div class="helpline-content">
                <p>${helpline.description || 'No description available'}</p>
            </div>
        `;
        return card;
    }
    function loadStories() {
        const container = document.getElementById('storyList');
        container.innerHTML = '<div class="loading">Loading stories...</div>';
    
        fetch('/get_stories')
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                container.innerHTML = '';
    
                if (data.status === 'success' && data.stories.length > 0) {
                    data.stories.forEach(story => {
                        const storyEl = document.createElement('div');
                        storyEl.className = 'story-card';
                        storyEl.innerHTML = `
                        <div class="story-meta">
                            <div class="profile-circle">${story.username.charAt(0).toUpperCase()}</div>
                            <div class="user-info">
                                <span class="story-username">${story.username}</span>
                                <span class="story-time">${story.created_at}</span>
                            </div>
                        </div>
                        <div class="content">${story.story}</div>
                    `;

                        container.appendChild(storyEl);
                    });
                } else {
                    container.innerHTML = '<div class="no-stories">No stories found</div>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                container.innerHTML = '<div class="error">Failed to load stories</div>';
            });
    }
   function createQueryCard(query) {
    const card = document.createElement('div');
    card.className = 'query-card';

    const date = new Date(query.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Build the query (question) section
    card.innerHTML = `
        <div class="query-meta">
            <div class="profile-circle">${query.username ? query.username.charAt(0).toUpperCase() : 'U'}</div>
            <div class="user-info">
                <span class="query-username">${query.username || 'Anonymous'}</span>
                <span class="query-time">${formattedDate}</span>
            </div>
        </div>
        <div class="query-content">${query.query}</div>
        <div class="reply-toggle">
            <i class='bx bx-message-detail'></i>
            <span>${query.responses.length > 0 ? 'View Reply' : 'No Reply'}</span>
        </div>
       <div class="query-reply-container" style="display: none;">
    ${query.responses.length > 0 ? `
       <div class="custom-query-reply-card">
            <div class="reply-admin-name" style="font-weight:bold; color:#bb7d17; margin-bottom:8px;">
                ${query.responses[0].admin_name || 'Admin'}
            </div>
            <div class="reply-content-main">${query.responses[0].response}</div>
        </div>
    ` : `<div class="no-reply-msg">No reply yet</div>`}
    </div>
    `;

    const replyToggle = card.querySelector('.reply-toggle');
    const replyContainer = card.querySelector('.query-reply-container');

    replyToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (replyContainer.style.display === 'none' || replyContainer.style.display === '') {
            replyContainer.style.display = 'block';
            this.innerHTML = `<i class='bx bx-x'></i> <span>Hide</span>`;
        } else {
            replyContainer.style.display = 'none';
            this.innerHTML = `<i class='bx bx-message-detail'></i> <span>${query.responses.length > 0 ? 'View Reply' : 'No Reply'}</span>`;
        }
    });

    return card;
}
    function displayQueries(queries) {
    const queryList = document.getElementById('queryList');
    queryList.innerHTML = '';
    
    if (queries.length > 0) {
        const publicQueries = queries.filter(query => query.visibility === 'public');
        if (publicQueries.length > 0) {
            publicQueries.forEach(query => {
                const card = createQueryCard(query);
                queryList.appendChild(card);
            });
        } else {
            queryList.innerHTML = '<div class="no-data">No public queries available yet.</div>';
        }
    } else {
        queryList.innerHTML = '<div class="no-data">No queries available yet. Be the first to ask!</div>';
    }
}
    function displaySearchResults(items, container, type) {
        container.innerHTML = '';
        
        if (items.length > 0) {
            items.forEach(item => {
                let card;
                if (type === 'queries') card = createQueryCard(item);
                else if (type === 'helplines') card = createHelplineCard(item);
                else if (type === 'myths') card = createMythCard(item);
                else if (type === 'stories') card = createStoryCard(item);
                
                if (card) container.appendChild(card);
            });
        } else {
            container.innerHTML = `<div class="no-data">No matching ${type} found</div>`;
        }
    }
    function createMythCard(card) {
        const mythCard = document.createElement('div');
        mythCard.className = 'myth-card';
        mythCard.innerHTML = `
            <div class="myth-card-inner">
                <div class="myth-card-front">
                    <div class="myth-header">MYTH</div>
                    <div class="myth-content">
                        <p>${card.myth || 'No myth text available'}</p>
                    </div>
                </div>
                <div class="myth-card-back">
                    <div class="fact-header">FACT</div>
                    <div class="fact-content">
                        <p>${card.fact || 'No fact text available'}</p>
                    </div>
                    <button class="flip-back-btn">Flip Back</button>
                </div>
            </div>
        `;
        
        mythCard.addEventListener('click', function(e) {
            if (e.target.classList.contains('flip-back-btn')) return;
            this.classList.toggle('flipped');
        });
        
        const flipBtn = mythCard.querySelector('.flip-back-btn');
        flipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mythCard.classList.remove('flipped');
        });
        
        return mythCard;
    }
   
function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    
    // Format date
    const date = new Date(story.created_at);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Truncate the story if it's too long
    const truncatedStory = story.story.length > 200 ? 
        story.story.substring(0, 200) + '...' : 
        story.story;
    
    card.innerHTML = `
        <div class="story-meta">
            <div class="profile-circle">${story.username.charAt(0).toUpperCase()}</div>
            <div class="user-info">
                <span class="story-username">${story.username}</span>
                <span class="story-time">${formattedDate}</span>
            </div>
        </div>
        ${story.title ? `<h3 class="story-title">${story.title}</h3>` : ''}
        <div class="content">${truncatedStory}</div>
        ${story.story.length > 200 ? 
            '<a href="#" class="read-more-link">Read more</a>' : 
        ''}
    `;
    
    // Add click event for show more button if it exists
    const readMoreLink = card.querySelector('.read-more-link');
    if (readMoreLink) {
        readMoreLink.addEventListener('click', function(e) {
            e.preventDefault();
            const content = card.querySelector('.content');
            content.textContent = story.story;
            readMoreLink.remove();
        });
    }
    
    return card;
}
    const viewMyPosts = dropdown.querySelector('#viewMyPosts');
    if (viewMyPosts) {
        viewMyPosts.addEventListener('click', function(e) {
            e.preventDefault();
            dropdown.style.display = 'none';
            updateUIForContent('myposts-content');
            setActiveContent('myposts-content');
            loadMyPosts();
        });
    }

    document.addEventListener('click', function(event) {
        if (!dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });

    function searchMyPosts(query) {
    const container = document.getElementById('myPostsList');
    const storedPosts = sessionStorage.getItem('myPosts');
    if (!storedPosts) return;

    const allPosts = JSON.parse(storedPosts);
    const searchTerm = query.toLowerCase().replace(/\s+/g, '');

    const filteredPosts = allPosts.filter(post => {
        const content = post.type === 'story' ? 
            `${post.title || ''} ${post.story}`.toLowerCase().replace(/\s+/g, '') : 
            post.query.toLowerCase().replace(/\s+/g, '');
        return content.includes(searchTerm);
    });

    displayMyPosts(filteredPosts);
}
    function loadMyPosts() {
        const container = document.getElementById('myPostsList');
        container.innerHTML = '<div class="loading-spinner"><i class="bx bx-loader-alt bx-spin"></i> Loading your posts...</div>';
    
        Promise.all([
            fetch('/get_user_queries').then(res => res.json()),
            fetch('/get_user_stories').then(res => res.json())
        ])
        .then(([queriesData, storiesData]) => {
            let allPosts = [];
    
         if (queriesData.status === 'success') {
        queriesData.queries.forEach(query => {
        allPosts.push({
            type: 'query',
            query_id: query.query_id,
            query: query.query,
            visibility: query.visibility,
            status: query.status || 'pending',
            created_at: query.created_at,
            response: query.response || '',
            admin_name: query.admin_name || ''
        });
    });
}
    
            if (storiesData.status === 'success') {
                storiesData.stories.forEach(story => {
                    allPosts.push({
                        type: 'story',
                        story_id: story.story_id,
                        title: story.title,
                        story: story.story,
                        created_at: story.created_at
                    });
                });
            }
    
            // Sort by latest first
            allPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
            sessionStorage.setItem('myPosts', JSON.stringify(allPosts));
            displayMyPosts(allPosts);
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            container.innerHTML = '<div class="error-message">Failed to load your posts.</div>';
        });
    }
    function createDeletePopup(postId, postType) {
    const popup = document.createElement('div');
    popup.className = 'delete-popup-overlay';
    popup.innerHTML = `
        <div class="delete-popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this ${postType}?</p>
            <div class="popup-buttons">
                <button class="cancel-delete-btn">Cancel</button>
                <button class="confirm-delete-btn" data-post-id="${postId}" data-post-type="${postType}">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Close popup when clicking cancel or outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup || e.target.classList.contains('cancel-delete-btn')) {
            popup.remove();
        }
    });
    
    // Handle delete confirmation
    const confirmBtn = popup.querySelector('.confirm-delete-btn');
    confirmBtn.addEventListener('click', () => {
        deletePost(postId, postType);
        popup.remove();
    });
    
    return popup;
}
function deletePost(postId, postType) {
    fetch(`/delete_${postType}/${postId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Refresh the posts list
            loadMyPosts();
            // Show success message
            showInlineMessage(`${postType.charAt(0).toUpperCase() + postType.slice(1)} deleted successfully!`, 'success');
        } else {
            showInlineMessage(`Failed to delete ${postType}: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showInlineMessage('Error deleting post. Please try again.', 'error');
    });
}
    function displayMyPosts(posts) {
    const container = document.getElementById('myPostsList');
    container.innerHTML = '';
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="no-data">No posts found.</div>';
        return;
    }
    
    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'my-post-card';
        
       if (post.type === 'query') {
    div.innerHTML = `
        <div class="my-post-header">
            <div class="profile-circle">Q</div>
            <div class="user-info">
                <div class="query-username">Your Query</div>
                <div class="query-time">${post.created_at}</div>
            </div>
            <button class="delete-post-btn" data-post-id="${post.query_id}" data-post-type="query">
                <i class='bx bx-trash'></i>
            </button>
        </div>
        <div class="my-post-content">${post.query}</div>
        <div class="query-status">
            ${post.status === 'replied' ? 
                '<span class="has-reply"><i class="bx bx-check-circle"></i>Replied</span>' : 
                '<span class="no-reply"><i class="bx bx-time"></i>Pending</span>'}
        </div>
        ${post.response ? `
            <div class="custom-query-reply-card">
                <div class="reply-admin-name" style="font-weight:bold; color:#bb7d17; margin-bottom:8px;">
                    ${post.admin_name || 'Admin'}
                </div>
                <div class="reply-content-main">${post.response}</div>
            </div>
        ` : ''}
    `;
} else if (post.type === 'story') {
            div.innerHTML = `
                <div class="my-post-header">
                    <div class="profile-circle">S</div>
                    <div class="user-info">
                        <div class="query-username">Your Story</div>
                        <div class="query-time">${post.created_at}</div>
                    </div>
                    <button class="delete-post-btn" data-post-id="${post.story_id}" data-post-type="story">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
                <div class="my-post-content">
                    ${post.title ? `<strong>${post.title}</strong><br>` : ''}
                    ${post.story}
                </div>
            `;
        }
        
        // Add event listener to delete button
        const deleteBtn = div.querySelector('.delete-post-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = deleteBtn.getAttribute('data-post-id');
                const postType = deleteBtn.getAttribute('data-post-type');
                createDeletePopup(postId, postType);
            });
        }
        
        container.appendChild(div);
    });
}
        // Initial load
        const activeSection = document.querySelector('.content-section.active').id;
        if (activeSection === 'query-content') {
            loadQueries();
        } else if (activeSection === 'helpline-content') {
            loadHelplines();
        } else if (activeSection === 'myth-content') {
            loadMythCards();
        } else if (activeSection === 'story-content') {
            loadStories();
        } else if (activeSection === 'myposts-content') {
            loadMyPosts();
        }
});