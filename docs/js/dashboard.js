// GPCC Dashboard - Main JavaScript
console.log('🚀 GPCC Dashboard JavaScript loaded');

// Configuration
const CONFIG = {
    refreshInterval: 30000, // 30 seconds
    dataUrls: {
        stats: 'data/live-stats.json',
        conversations: 'data/conversations.json',
        knowledge: 'data/knowledge-index.json'
    },

    apiEndpoints: {
        base: 'https://script.google.com/macros/s/AKfycbyLuWnjpj5ly46ZGbzbZwbSphf5pcPnTeuP_zzU2Szf2liSN42dP5acExGn066iw0F2og/exec',
        health: '?action=health',
        metrics: '?action=get_metrics',
        conversations: '?action=get_conversations&limit=10'
    },
    
    cache: {
        stats: null,
        conversations: null,
        knowledge: null
    },
    lastUpdate: null
};

// --- ADDED CODE START ---
// Test API connection
async function testAPIConnection() {
    try {
        const response = await fetch(`${CONFIG.apiEndpoints.base}${CONFIG.apiEndpoints.health}`);
        const data = await response.json();
        console.log('✅ API Connection successful:', data);
        return data;
    } catch (error) {
        console.error('❌ API Connection failed:', error);
        return null;
    }
}

// DOM Elements
let elements = {};

// Initialize Dashboard
async function initDashboard() {
    console.log('🔧 Initializing dashboard...');
    // Test API connection
    const apiStatus = await testAPIConnection();
    if (apiStatus) {
        console.log('✅ Connected to Google Sheets API');
    }
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set initial theme
    initTheme();
    
    // Load initial data
    loadAllData();
    
    // Start auto-refresh
    startAutoRefresh();
    
    // Initialize page navigation
    initPageNavigation();
    
    console.log('✅ Dashboard initialized');
}

// Cache frequently used DOM elements
function cacheElements() {
    elements = {
        // Metrics
        activeConversations: document.getElementById('active-conversations'),
        resolutionRate: document.getElementById('resolution-rate'),
        responseTime: document.getElementById('response-time'),
        satisfactionScore: document.getElementById('satisfaction-score'),
        resolutionBar: document.getElementById('resolution-bar'),
        
        // System status
        systemStatus: document.getElementById('system-status'),
        uptimeDisplay: document.getElementById('uptime-display'),
        lastUpdated: document.getElementById('last-updated'),
        
        // Footer elements
        footerUpdated: document.getElementById('footer-updated'),
        footerConversations: document.getElementById('footer-conversations'),
        footerArticles: document.getElementById('footer-articles'),
        footerUptime: document.getElementById('footer-uptime'),
        
        // Controls
        refreshBtn: document.getElementById('refresh-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.getElementById('theme-icon'),
        refreshInterval: document.getElementById('refresh-interval'),
        
        // Lists
        recentConversations: document.getElementById('recent-conversations'),
        knowledgeGaps: document.getElementById('knowledge-gaps'),
        systemAlerts: document.getElementById('system-alerts'),
        
        // Knowledge base
        knowledgeArticles: document.getElementById('knowledge-articles'),
        kbSearch: document.getElementById('kb-search'),
        
        // Tickets
        openTickets: document.getElementById('open-tickets'),
        closedTickets: document.getElementById('closed-tickets'),
        avgResolution: document.getElementById('avg-resolution'),
        ticketsContainer: document.getElementById('tickets-container'),
        
        // Analytics
        aiInsights: document.getElementById('ai-insights')
    };
}

// Set up event listeners
function setupEventListeners() {
    // Refresh button
    elements.refreshBtn.addEventListener('click', loadAllData);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Refresh interval selector
    elements.refreshInterval.addEventListener('change', updateRefreshInterval);
    
    // Knowledge base search
    if (elements.kbSearch) {
        elements.kbSearch.addEventListener('input', debounce(searchKnowledgeBase, 300));
    }
    
    // Time period buttons for charts
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // In a real app, this would reload chart data
            console.log('Time period changed to:', this.dataset.hours);
        });
    });
    
    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterKnowledgeByCategory(this.dataset.category);
        });
    });
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('gpcc-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle between light/dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('gpcc-theme', newTheme);
    updateThemeIcon(newTheme);
    
    console.log(`Theme changed to: ${newTheme}`);
}

// Update theme icon based on current theme
function updateThemeIcon(theme) {
    if (elements.themeIcon) {
        elements.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// Update refresh interval
function updateRefreshInterval() {
    const interval = parseInt(elements.refreshInterval.value) * 1000;
    if (interval === 0) {
        console.log('Auto-refresh disabled');
        clearInterval(window.refreshTimer);
    } else {
        console.log(`Auto-refresh interval set to: ${interval}ms`);
        startAutoRefresh(interval);
    }
}

// Start auto-refresh timer
function startAutoRefresh(interval = CONFIG.refreshInterval) {
    if (window.refreshTimer) {
        clearInterval(window.refreshTimer);
    }
    
    if (interval > 0) {
        window.refreshTimer = setInterval(loadAllData, interval);
        console.log(`Auto-refresh started: ${interval}ms interval`);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load all data from JSON files
async function loadAllData() {
    console.log('📥 Loading dashboard data...');
    
    try {
        // Update loading state
        updateLastUpdated('loading');
        
        // Load all data in parallel
        const [statsData, conversationsData, knowledgeData] = await Promise.all([
            fetchData(CONFIG.dataUrls.stats),
            fetchData(CONFIG.dataUrls.conversations),
            fetchData(CONFIG.dataUrls.knowledge)
        ]);
        
        // Cache the data
        CONFIG.cache.stats = statsData;
        CONFIG.cache.conversations = conversationsData;
        CONFIG.cache.knowledge = knowledgeData;
        CONFIG.lastUpdate = new Date();
        
        // Update the UI with new data
        updateDashboard(statsData);
        updateConversationsList(conversationsData);
        updateKnowledgeBase(knowledgeData);
        updateTickets();
        updateAnalyticsInsights(statsData, conversationsData);
        
        // Update last updated timestamp
        updateLastUpdated('success');
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        updateLastUpdated('error');
        showError('Failed to load dashboard data. Please try again.');
    }
}

// Fetch data from JSON file
async function fetchData(url) {
    try {
        const response = await fetch(`${url}?t=${Date.now()}`); // Cache bust
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}

// Update main dashboard metrics
function updateDashboard(statsData) {
    if (!statsData) return;
    
    // System status
    if (elements.systemStatus && statsData.system) {
        const statusIndicator = elements.systemStatus.querySelector('.status-indicator');
        const statusText = elements.systemStatus.querySelector('.status-text');
        
        if (statsData.system.status === 'operational') {
            statusIndicator.className = 'status-indicator operational';
            statusText.textContent = 'All systems operational';
        } else {
            statusIndicator.className = 'status-indicator error';
            statusText.textContent = `System status: ${statsData.system.status}`;
        }
        
        if (elements.uptimeDisplay) {
            elements.uptimeDisplay.textContent = `Uptime: ${statsData.system.uptime || '99.9%'}`;
        }
    }
    
    // Update metrics
    if (statsData.conversations && elements.activeConversations) {
        elements.activeConversations.textContent = statsData.conversations.active_now || 0;
        elements.footerConversations.textContent = statsData.conversations.total_today || 0;
    }
    
    if (statsData.performance && elements.resolutionRate) {
        const rate = statsData.performance.auto_resolution_rate || 0;
        elements.resolutionRate.textContent = `${rate}%`;
        elements.resolutionBar.style.width = `${rate}%`;
    }
    
    if (statsData.performance && elements.responseTime) {
        elements.responseTime.textContent = `${statsData.performance.avg_response_time_seconds || 0}s`;
    }
    
    if (statsData.performance && elements.satisfactionScore) {
        elements.satisfactionScore.textContent = statsData.performance.customer_satisfaction?.toFixed(1) || '0.0';
        
        // Update stars (simplified)
        const stars = elements.satisfactionScore.parentElement.querySelector('.metric-stars');
        if (stars) {
            const score = statsData.performance.customer_satisfaction || 0;
            const filledStars = Math.round(score / 20); // Convert 0-100 to 0-5
            const starElements = stars.querySelectorAll('.star');
            starElements.forEach((star, index) => {
                star.textContent = index < filledStars ? '★' : '☆';
            });
        }
    }
    
    if (statsData.knowledge && elements.footerArticles) {
        elements.footerArticles.textContent = statsData.knowledge.total_articles || 0;
    }
    
    if (statsData.system && elements.footerUptime) {
        elements.footerUptime.textContent = statsData.system.uptime || '99.9%';
    }
    
    if (statsData.team && elements.openTickets) {
        elements.openTickets.textContent = statsData.team.open_tickets || 0;
        elements.closedTickets.textContent = statsData.team.resolved_today || 0;
        elements.avgResolution.textContent = `${statsData.team.avg_resolution_time_hours || 0}h`;
    }
}

// Update recent conversations list
function updateConversationsList(conversationsData) {
    if (!conversationsData || !elements.recentConversations) return;
    
    const container = elements.recentConversations;
    container.innerHTML = '';
    
    if (!conversationsData.recent_conversations || conversationsData.recent_conversations.length === 0) {
        container.innerHTML = `
            <div class="conversation-item">
                <div class="conv-query">No recent conversations</div>
                <div class="conv-meta">
                    <span class="conv-time">--:--</span>
                    <span class="conv-status resolved">No data</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Show only the 5 most recent conversations
    const recentConvs = conversationsData.recent_conversations.slice(0, 5);
    
    recentConvs.forEach(conv => {
        const time = new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const statusClass = conv.resolved ? 'resolved' : 'pending';
        const statusText = conv.resolved ? 'Resolved' : 'Pending';
        
        const convElement = document.createElement('div');
        convElement.className = 'conversation-item';
        convElement.innerHTML = `
            <div class="conv-query">${conv.query_summary || 'Conversation'}</div>
            <div class="conv-meta">
                <span class="conv-time">${time}</span>
                <span class="conv-status ${statusClass}">${statusText}</span>
            </div>
        `;
        
        container.appendChild(convElement);
    });
}

// Update knowledge base display
function updateKnowledgeBase(knowledgeData) {
    if (!knowledgeData || !elements.knowledgeArticles) return;
    
    const container = elements.knowledgeArticles;
    
    // Store for filtering
    window.knowledgeArticles = knowledgeData.articles || [];
    
    // Display all articles initially
    displayKnowledgeArticles(window.knowledgeArticles);
    
    // Update knowledge gap count
    if (elements.knowledgeGaps && knowledgeData.summary) {
        const gapCount = knowledgeData.summary.knowledge_gaps_identified || 0;
        const gapBadge = document.querySelector('#gap-count');
        if (gapBadge) {
            gapBadge.textContent = gapCount;
        }
        
        // Update gaps list
        updateKnowledgeGapsList(knowledgeData);
    }
}

// Display knowledge articles
function displayKnowledgeArticles(articles) {
    if (!elements.knowledgeArticles) return;
    
    const container = elements.knowledgeArticles;
    container.innerHTML = '';
    
    if (!articles || articles.length === 0) {
        container.innerHTML = `
            <div class="info-card">
                <p>No knowledge articles found.</p>
            </div>
        `;
        return;
    }
    
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'info-card';
        articleElement.innerHTML = `
            <div class="info-header">
                <h4>${article.title || 'Untitled Article'}</h4>
                <span class="badge">${article.category || 'general'}</span>
            </div>
            <div class="conv-meta">
                <span>Views: ${article.view_count || 0}</span>
                <span>Success: ${article.success_rate || 0}%</span>
            </div>
            <p class="article-preview">${article.description || 'No description available.'}</p>
            <div class="article-tags">
                ${(article.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="article-footer">
                <span class="last-updated">Updated: ${new Date(article.last_updated).toLocaleDateString()}</span>
                <a href="${article.file_path}" class="view-article" target="_blank">View Article →</a>
            </div>
        `;
        
        container.appendChild(articleElement);
    });
}

// Filter knowledge articles by category
function filterKnowledgeByCategory(category) {
    if (!window.knowledgeArticles) return;
    
    let filteredArticles = window.knowledgeArticles;
    
    if (category !== 'all') {
        filteredArticles = window.knowledgeArticles.filter(article => 
            article.category === category
        );
    }
    
    displayKnowledgeArticles(filteredArticles);
}

// Search knowledge base
function searchKnowledgeBase(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm || !window.knowledgeArticles) {
        displayKnowledgeArticles(window.knowledgeArticles);
        return;
    }
    
    const filteredArticles = window.knowledgeArticles.filter(article => {
        const title = (article.title || '').toLowerCase();
        const tags = (article.tags || []).map(tag => tag.toLowerCase());
        const category = (article.category || '').toLowerCase();
        
        return title.includes(searchTerm) ||
               tags.some(tag => tag.includes(searchTerm)) ||
               category.includes(searchTerm);
    });
    
    displayKnowledgeArticles(filteredArticles);
}

// Update knowledge gaps list
function updateKnowledgeGapsList(knowledgeData) {
    if (!elements.knowledgeGaps || !knowledgeData.gaps) return;
    
    const container = elements.knowledgeGaps;
    container.innerHTML = '';
    
    // Simplified gaps display
    const gaps = knowledgeData.gaps || [];
    
    if (gaps.length === 0) {
        container.innerHTML = `
            <div class="gap-item">
                <div class="gap-text">No knowledge gaps identified</div>
                <div class="gap-meta">AI monitoring active</div>
            </div>
        `;
        return;
    }
    
    gaps.slice(0, 3).forEach(gap => {
        const gapElement = document.createElement('div');
        gapElement.className = 'gap-item';
        gapElement.innerHTML = `
            <div class="gap-text">${gap.query_pattern || 'Common query pattern'}</div>
            <div class="gap-meta">${gap.count || 0} occurrences</div>
        `;
        container.appendChild(gapElement);
    });
}

// Update tickets display
function updateTickets() {
    // In a real implementation, this would fetch from issues/ folder
    // For now, we'll use sample data
    if (elements.ticketsContainer) {
        elements.ticketsContainer.innerHTML = `
            <div class="info-card">
                <h4>Ticket System Status</h4>
                <p>Tickets are loaded from the <code>issues/</code> directory.</p>
                <p>Open: <strong>${elements.openTickets.textContent}</strong> | Closed: <strong>${elements.closedTickets.textContent}</strong></p>
                <div class="article-footer">
                    <a href="issues/open/" class="view-article" target="_blank">View Open Issues →</a>
                </div>
            </div>
        `;
    }
}

// Update analytics insights
function updateAnalyticsInsights(statsData, conversationsData) {
    if (!elements.aiInsights) return;
    
    const insights = [];
    
    // Generate insights based on data
    if (statsData?.performance?.auto_resolution_rate > 80) {
        insights.push({
            icon: '🎯',
            title: 'High Auto-Resolution Rate',
            desc: 'AI is effectively handling customer queries without human intervention.'
        });
    }
    
    if (conversationsData?.summary?.total_conversations > 100) {
        insights.push({
            icon: '📊',
            title: 'Growing Conversation Volume',
            desc: 'System is processing increased query volume efficiently.'
        });
    }
    
    if (statsData?.knowledge?.knowledge_gaps_identified > 0) {
        insights.push({
            icon: '🔍',
            title: 'Knowledge Gaps Identified',
            desc: 'AI has detected areas where knowledge base needs expansion.'
        });
    }
    
    // Default insight if none generated
    if (insights.length === 0) {
        insights.push({
            icon: '🤖',
            title: 'AI Analysis Active',
            desc: 'System is processing conversation patterns and generating insights.'
        });
    }
    
    // Update insights display
    const container = elements.aiInsights;
    container.innerHTML = '';
    
    insights.forEach(insight => {
        const insightElement = document.createElement('div');
        insightElement.className = 'insight-item';
        insightElement.innerHTML = `
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-desc">${insight.desc}</div>
            </div>
        `;
        container.appendChild(insightElement);
    });
}

// Update last updated timestamp
function updateLastUpdated(status) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (elements.lastUpdated) {
        if (status === 'loading') {
            elements.lastUpdated.innerHTML = '<span>Updating...</span>';
        } else if (status === 'error') {
            elements.lastUpdated.innerHTML = '<span>Update failed</span>';
        } else {
            elements.lastUpdated.innerHTML = `<span>Updated: ${timeString}</span>`;
        }
    }
    
    if (elements.footerUpdated) {
        if (status === 'loading') {
            elements.footerUpdated.textContent = 'Last update: Loading...';
        } else if (status === 'error') {
            elements.footerUpdated.textContent = 'Last update: Failed';
        } else {
            elements.footerUpdated.textContent = `Last update: ${timeString}`;
        }
    }
}

// Initialize page navigation
function initPageNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a[data-page]');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get target page
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `page-${targetPage}`) {
                    page.classList.add('active');
                }
            });
            
            // Load page-specific data
            loadPageData(targetPage);
            
            console.log(`Navigated to: ${targetPage}`);
        });
    });
}

// Load data for specific page
function loadPageData(page) {
    switch(page) {
        case 'knowledge':
            // Knowledge base is already loaded
            break;
        case 'tickets':
            updateTickets();
            break;
        case 'analytics':
            // Charts are initialized separately
            break;
    }
}

// Show error message
function showError(message) {
    // Create or update error alert
    let errorAlert = document.querySelector('.alert-item.error');
    
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.className = 'alert-item error';
        errorAlert.innerHTML = `
            <div class="alert-icon">❌</div>
            <div class="alert-content">
                <div class="alert-title">Error</div>
                <div class="alert-desc">${message}</div>
            </div>
        `;
        
        if (elements.systemAlerts) {
            elements.systemAlerts.prepend(errorAlert);
        }
    } else {
        errorAlert.querySelector('.alert-desc').textContent = message;
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorAlert && errorAlert.parentNode) {
            errorAlert.remove();
        }
    }, 10000);
}

// Export for global access
window.initDashboard = initDashboard;
window.loadAllData = loadAllData;
window.toggleTheme = toggleTheme;

console.log('📦 GPCC Dashboard module loaded successfully');
