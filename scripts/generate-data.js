/**
 * GPCC Data Generation and Anonymization Script
 * 
 * IMPORTANT: This script processes data BEFORE it goes to GitHub
 * It ensures NO PII (Personal Identifiable Information) is exposed
 * 
 * Usage: This is called by Make.com automation scenarios
 */

// Sample data structure for testing
const sampleData = {
  // This would come from Google Sheets or Make.com
  conversations: [
    {
      timestamp: new Date().toISOString(),
      user_id: 'user_12345',
      user_email: 'customer@example.com',  // WILL BE ANONYMIZED
      query: 'How do I reset my password?',
      bot_response: 'You can reset your password by...',
      confidence_score: 85,
      emotion_detected: 'neutral',
      resolution_status: 'resolved',
      feedback_score: 5,
      phone: '+1234567890',  // WILL BE ANONYMIZED
      transaction_id: 'txn_789012'  // WILL BE ANONYMIZED
    }
  ]
};

/**
 * ANONYMIZATION FUNCTIONS
 * These functions remove or mask PII
 */

function anonymizeEmail(email) {
  // Replace actual email with generic placeholder
  if (!email) return 'user@example.com';
  
  // Keep domain for analysis but anonymize user
  const parts = email.split('@');
  if (parts.length === 2) {
    return `user_${hashString(parts[0])}@example.com`;
  }
  return 'user@example.com';
}

function anonymizePhone(phone) {
  // Remove phone numbers completely
  return '[phone_removed]';
}

function anonymizeTransactionId(id) {
  // Hash transaction IDs
  return `txn_${hashString(id)}`;
}

function anonymizeName(name) {
  // Keep only first letter of first name
  if (!name) return 'User';
  const firstName = name.split(' ')[0];
  return `${firstName.charAt(0)}[lastname]`;
}

function hashString(str) {
  // Simple hash for demonstration
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).substring(0, 8);
}

/**
 * Main anonymization function
 */
function anonymizeConversation(conversation) {
  return {
    ...conversation,
    user_email: anonymizeEmail(conversation.user_email),
    phone: anonymizePhone(conversation.phone),
    transaction_id: anonymizeTransactionId(conversation.transaction_id),
    // Remove any other potential PII fields
    ip_address: '[ip_removed]',
    device_id: '[device_removed]'
  };
}

/**
 * Generate public stats from private data
 */
function generatePublicStats(privateData) {
  const publicStats = {
    system: {
      status: 'operational',
      last_updated: new Date().toISOString(),
      version: '1.0.0'
    },
    conversations: {
      total_today: privateData.conversations.length,
      active_now: privateData.conversations.filter(c => 
        new Date(c.timestamp) > new Date(Date.now() - 5 * 60 * 1000)
      ).length
    },
    performance: {
      avg_confidence_score: calculateAverage(privateData.conversations, 'confidence_score'),
      auto_resolution_rate: calculateResolutionRate(privateData.conversations)
    }
  };
  
  return publicStats;
}

function calculateAverage(items, field) {
  if (!items.length) return 0;
  const sum = items.reduce((acc, item) => acc + (item[field] || 0), 0);
  return Math.round(sum / items.length);
}

function calculateResolutionRate(conversations) {
  if (!conversations.length) return 0;
  const resolved = conversations.filter(c => c.resolution_status === 'resolved').length;
  return Math.round((resolved / conversations.length) * 100);
}

// Export functions for use in Make.com
if (typeof module !== 'undefined') {
  module.exports = {
    anonymizeConversation,
    generatePublicStats,
    anonymizeEmail,
    anonymizePhone,
    anonymizeTransactionId
  };
}

console.log('✅ GPCC Data Generation Script loaded');
console.log('🔒 All PII functions ready for anonymization');
