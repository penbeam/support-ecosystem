// GPCC Charts Module
console.log('📊 GPCC Charts module loaded');

// Chart instances storage
const charts = {};

// Initialize all charts
function initCharts() {
    console.log('📈 Initializing charts...');
    
    // Wait a bit for DOM to be ready
    setTimeout(() => {
        initializeConversationsChart();
        initializeResolutionChart();
        initializeConfidenceChart();
        initializeCategoriesChart();
        initializeResponseDistributionChart();
        initializeEmotionsChart();
        
        console.log('✅ Charts initialized');
    }, 100);
}

// Chart 1: Conversations Over Time
function initializeConversationsChart() {
    const ctx = document.getElementById('chart-conversations');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.conversations) {
        charts.conversations.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    // Sample data for 24 hours
    const hours = Array.from({length: 24}, (_, i) => {
        const date = new Date();
        date.setHours(date.getHours() - 23 + i);
        return date.getHours().toString().padStart(2, '0') + ':00';
    });
    
    const data = Array.from({length: 24}, () => Math.floor(Math.random() * 30) + 10);
    
    charts.conversations = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Conversations',
                data: data,
                borderColor: getChartColor('blue'),
                backgroundColor: getChartColor('blue', 0.1),
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: getChartColor('blue'),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: isDark ? '#161b22' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        maxRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Number of Conversations',
                        color: textColor
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

// Chart 2: Resolution Status (Doughnut)
function initializeResolutionChart() {
    const ctx = document.getElementById('chart-resolution');
    if (!ctx) return;
    
    if (charts.resolution) {
        charts.resolution.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    charts.resolution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Auto-Resolved', 'Human Escalated', 'Pending'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: [
                    getChartColor('green'),
                    getChartColor('orange'),
                    getChartColor('yellow')
                ],
                borderColor: isDark ? '#0d1117' : '#ffffff',
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

// Chart 3: Confidence Score Trend
function initializeConfidenceChart() {
    const ctx = document.getElementById('chart-confidence');
    if (!ctx) return;
    
    if (charts.confidence) {
        charts.confidence.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    // Sample data for 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const confidenceData = [78, 82, 85, 88, 86, 84, 89];
    
    charts.confidence = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Confidence Score',
                data: confidenceData,
                borderColor: getChartColor('purple'),
                backgroundColor: getChartColor('purple', 0.1),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: getChartColor('purple'),
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    min: 70,
                    max: 100,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Confidence %',
                        color: textColor
                    }
                }
            }
        }
    });
}

// Chart 4: Query Categories Distribution
function initializeCategoriesChart() {
    const ctx = document.getElementById('chart-categories');
    if (!ctx) return;
    
    if (charts.categories) {
        charts.categories.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    charts.categories = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Technical', 'Billing', 'Account', 'General', 'Feature Request'],
            datasets: [{
                label: 'Queries',
                data: [45, 30, 15, 25, 10],
                backgroundColor: [
                    getChartColor('blue'),
                    getChartColor('green'),
                    getChartColor('purple'),
                    getChartColor('orange'),
                    getChartColor('yellow')
                ],
                borderColor: isDark ? '#0d1117' : '#ffffff',
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Number of Queries',
                        color: textColor
                    }
                }
            }
        }
    });
}

// Chart 5: Response Time Distribution
function initializeResponseDistributionChart() {
    const ctx = document.getElementById('chart-response-dist');
    if (!ctx) return;
    
    if (charts.responseDist) {
        charts.responseDist.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    charts.responseDist = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Response Times',
                data: generateResponseTimeData(),
                backgroundColor: getChartColor('blue', 0.6),
                borderColor: getChartColor('blue'),
                borderWidth: 1,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Response: ${context.parsed.x}s, Confidence: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Response Time (seconds)',
                        color: textColor
                    },
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Confidence Score %',
                        color: textColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

// Chart 6: Customer Emotion Analysis
function initializeEmotionsChart() {
    const ctx = document.getElementById('chart-emotions');
    if (!ctx) return;
    
    if (charts.emotions) {
        charts.emotions.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#c9d1d9' : '#57606a';
    
    charts.emotions = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['Satisfied', 'Neutral', 'Frustrated', 'Confused', 'Happy'],
            datasets: [{
                data: [40, 30, 15, 10, 5],
                backgroundColor: [
                    getChartColor('green', 0.7),
                    getChartColor('blue', 0.7),
                    getChartColor('red', 0.7),
                    getChartColor('yellow', 0.7),
                    getChartColor('purple', 0.7)
                ],
                borderColor: isDark ? '#0d1117' : '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        display: false
                    }
                }
            }
        }
    });
}

// Helper: Get chart color based on theme
function getChartColor(colorName, opacity = 1) {
    const root = document.documentElement;
    const colorValue = getComputedStyle(root).getPropertyValue(`--chart-${colorName}`);
    
    if (!colorValue) {
        // Default colors
        const defaults = {
            blue: '#0969da',
            green: '#1a7f37',
            red: '#cf222e',
            orange: '#bc4c00',
            purple: '#8250df',
            yellow: '#9a6700'
        };
        
        const color = defaults[colorName] || defaults.blue;
        return opacity < 1 ? hexToRgba(color, opacity) : color;
    }
    
    const color = colorValue.trim();
    return opacity < 1 ? hexToRgba(color, opacity) : color;
}

// Helper: Convert hex to rgba
function hexToRgba(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Helper: Generate sample response time data
function generateResponseTimeData() {
    const data = [];
    for (let i = 0; i < 50; i++) {
        const time = Math.floor(Math.random() * 180) + 10; // 10-190 seconds
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
        data.push({ x: time, y: confidence });
    }
    return data;
}

// Update all charts when theme changes
function updateChartsTheme() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.update();
        }
    });
}

// Listen for theme changes
document.addEventListener('themeChanged', updateChartsTheme);

// Export for global access
window.initCharts = initCharts;
window.updateChartsTheme = updateChartsTheme;

console.log('🎨 GPCC Charts module ready');
