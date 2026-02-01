# GPCC API Reference

## Base URL
`https://script.google.com/macros/s/YOUR_APP_ID/exec`

## Authentication
- Currently: No authentication (for testing)
- Production: IP restriction or API keys recommended

## Endpoints

### 1. Health Check

GET ?action=health

Returns system status and available sheets.

### 2. Log Conversation

POST ?action=log_conversation

Body:
```json
{
  "action": "log_conversation",
  "user_id": "user_123",
  "query": "How to reset password?",
  "bot_response": "Go to settings...",
  "confidence_score": 85,
  "emotion_detected": "neutral"
}

3. Get Metrics

GET ?action=get_metrics

Returns aggregated performance metrics.

4. Get Conversations

GET ?action=get_conversations&limit=10&offset=0

Returns anonymized conversation data.

5. Update Knowledge

POST ?action=update_knowledge

Body:

{
  "action": "update_knowledge",
  "issue_id": "KB001",
  "problem_description": "Password reset",
  "solution_summary": "Step-by-step guide",
  "github_file_path": "knowledge-base/solutions/password-reset.md"
}

## Rate Limiting
100 requests per minute

Implement exponential backoff on 429 errors
