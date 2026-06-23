# API SPECIFICATION (OpenAPI 3.0) v1.0

## Partner Integration Platform - REST API

---

## 1. API OVERVIEW

### Base URL
```
Production: https://api.partner-integration.com
Staging: https://staging-api.partner-integration.com
```

### Authentication
All endpoints (except `/auth/register`, `/auth/login`, `/auth/verify-email`) require:
```
Authorization: Bearer {session_token}
```

### Response Format
All responses are JSON with consistent structure:

```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-06-23T08:50:00Z",
    "request_id": "req_123"
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* error details */ }
  },
  "meta": {
    "timestamp": "2026-06-23T08:50:00Z",
    "request_id": "req_123"
  }
}
```

### Rate Limiting
- Login endpoints: 5 requests per 15 minutes per IP
- All endpoints: 100 requests per minute per user
- File upload: 1 request per 10 seconds per user

---

## 2. AUTHENTICATION ENDPOINTS

### POST /api/auth/register

Register new partner account

**Request:**
```json
{
  "email": "partner@company.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "company_name": "Acme Corp",
  "company_email": "contact@acme.com",
  "phone": "+62812345678",
  "website": "https://acme.com",
  "industry": "FinTech"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "email": "partner@company.com",
    "status": "pending_approval",
    "message": "Account created. Please verify your email."
  }
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Password: Min 8 chars, 1 uppercase, 1 number, 1 special char
- Name: Required, min 3 chars
- Company name: Required, min 3 chars
- Phone: Valid international format

---

### POST /api/auth/login

Login with email and password

**Request:**
```json
{
  "email": "partner@company.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_token": "sess_abc123def456",
    "user_id": "user_123",
    "partner_id": "p_123",
    "email": "partner@company.com",
    "role": "partner",
    "expires_at": "2026-06-24T08:50:00Z"
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Behavior:**
- On successful login: Invalidate previous sessions, create new session
- On failed login: Log attempt, rate limit after 5 failures

---

### POST /api/auth/verify-email

Verify email address with token

**Request:**
```json
{
  "token": "verify_token_abc123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

---

### POST /api/auth/logout

Logout and invalidate session

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Behavior:**
- Invalidate session token
- Log logout event
- Redirect to login page

---

### POST /api/auth/forgot-password

Request password reset email

**Request:**
```json
{
  "email": "partner@company.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset link sent to your email"
  }
}
```

**Behavior:**
- Generate reset token (expires in 24 hours)
- Send email with reset link
- Don't reveal if email exists (security)

---

### POST /api/auth/reset-password

Reset password with token

**Request:**
```json
{
  "token": "reset_token_abc123",
  "new_password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### GET /api/auth/session

Get current session information

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": "user_123",
    "partner_id": "p_123",
    "email": "partner@company.com",
    "name": "John Doe",
    "role": "partner",
    "expires_at": "2026-06-24T08:50:00Z",
    "active_sessions": 1
  }
}
```

---

## 3. PARTNER ENDPOINTS

### GET /api/partners/me

Get current partner profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "p_123",
    "user_id": "user_123",
    "email": "partner@company.com",
    "name": "John Doe",
    "company_name": "Acme Corp",
    "company_email": "contact@acme.com",
    "phone": "+62812345678",
    "website": "https://acme.com",
    "industry": "FinTech",
    "status": "active",
    "created_at": "2026-06-20T08:50:00Z"
  }
}
```

---

### PATCH /api/partners/me

Update partner profile

**Request:**
```json
{
  "phone": "+62812345679",
  "website": "https://acme-updated.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

---

### PATCH /api/partners/me/password

Change password

**Request:**
```json
{
  "current_password": "SecurePassword123!",
  "new_password": "NewPassword456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

### GET /api/partners

List all partners (Admin only)

**Query Parameters:**
- `status`: pending_approval, active, rejected, suspended
- `page`: 1-based page number (default: 1)
- `per_page`: 10-100 (default: 20)
- `sort_by`: created_at, company_name, status
- `sort_order`: asc, desc

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "p_123",
      "company_name": "Acme Corp",
      "status": "active",
      "created_at": "2026-06-20T08:50:00Z",
      "progress_percentage": 66.7
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  }
}
```

---

### GET /api/partners/:id

Get partner details (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "p_123",
    "company_name": "Acme Corp",
    "email": "partner@company.com",
    "phone": "+62812345678",
    "website": "https://acme.com",
    "status": "active",
    "progress_percentage": 66.7,
    "scope": {
      "sub_service_ids": ["ss_1", "ss_2", "ss_3"],
      "active_count": 3,
      "passed_count": 2
    },
    "track_a_count": 2,
    "track_b_count": 5,
    "last_activity": "2026-06-23T08:50:00Z"
  }
}
```

---

### POST /api/partners (Admin)

Create new partner (Admin invitation flow)

**Request:**
```json
{
  "email": "new-partner@company.com",
  "company_name": "New Partner Corp",
  "company_email": "contact@partner.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "partner_id": "p_124",
    "email": "new-partner@company.com",
    "temporary_password_sent": true,
    "message": "Partner created and invitation sent"
  }
}
```

---

### PATCH /api/partners/:id (Admin)

Update partner (Admin only)

**Request:**
```json
{
  "status": "suspended",
  "suspended_reason": "Failed compliance check"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Partner updated successfully"
  }
}
```

---

### POST /api/partners/:id/approve (Admin)

Approve pending partner

**Request:**
```json
{}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Partner approved successfully"
  }
}
```

---

### POST /api/partners/:id/reject (Admin)

Reject pending partner

**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Partner rejected successfully"
  }
}
```

---

## 4. SCOPE SELECTION ENDPOINTS

### POST /api/scope/select

Partner selects their scope (sub-services)

**Request:**
```json
{
  "sub_service_ids": ["ss_1", "ss_2", "ss_3"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scope_id": "scope_123",
    "sub_service_ids": ["ss_1", "ss_2", "ss_3"],
    "active_count": 3,
    "progress_percentage": 0
  }
}
```

---

### GET /api/scope

Get current partner scope

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scope_id": "scope_123",
    "sub_service_ids": ["ss_1", "ss_2", "ss_3"],
    "active_count": 3,
    "passed_count": 2,
    "progress_percentage": 66.7
  }
}
```

---

## 5. SERVICE ENDPOINTS

### GET /api/services

Get all services

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "srv_1",
      "name": "Core Banking",
      "description": "Core banking services",
      "icon_url": "https://...",
      "sub_services": [
        {
          "id": "ss_1",
          "name": "Balance Inquiry",
          "code": "SS_BALANCE_INQUIRY"
        }
      ]
    }
  ]
}
```

---

### GET /api/services/:id

Get service details with all sub-services, scenarios, and test cases

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "srv_1",
    "name": "Core Banking",
    "description": "Core banking services",
    "sub_services": [
      {
        "id": "ss_1",
        "name": "Balance Inquiry",
        "code": "SS_BALANCE_INQUIRY",
        "scenarios": [
          {
            "id": "sc_1",
            "name": "Positive Case",
            "scenario_type": "positive",
            "test_cases": [
              {
                "id": "tc_001",
                "name": "Valid Balance Inquiry",
                "code": "TC001",
                "expected_behavior": "Returns current balance"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### POST /api/services (Admin)

Create new service

**Request:**
```json
{
  "name": "Payment Services",
  "description": "All payment-related services"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "srv_2",
    "name": "Payment Services"
  }
}
```

---

## 6. TRACK A ENDPOINTS

### POST /api/track-a/submit

Submit Track A document

**Request (multipart/form-data):**
```
{
  "sub_service_id": "ss_1",
  "file": <PDF file>
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_123",
    "status": "uploaded",
    "file_name": "integration_proof.pdf",
    "file_size": 1024000,
    "uploaded_at": "2026-06-23T08:50:00Z"
  }
}
```

**Errors:**
```json
{
  "success": false,
  "error": {
    "code": "TRACK_A_FILE_SIZE_EXCEEDED",
    "message": "File size exceeds maximum allowed size",
    "details": {
      "max_size_mb": 10,
      "actual_size_mb": 15.2
    }
  }
}
```

---

### GET /api/track-a/submissions

Get partner's Track A submissions

**Query Parameters:**
- `sub_service_id`: Filter by sub-service
- `status`: draft, uploaded, validated, synced
- `page`: 1-based page number
- `per_page`: Results per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_123",
      "sub_service_id": "ss_1",
      "sub_service_name": "Balance Inquiry",
      "status": "synced",
      "file_name": "integration_proof.pdf",
      "file_size": 1024000,
      "uploaded_at": "2026-06-23T08:50:00Z",
      "synced_at": "2026-06-23T09:00:00Z",
      "drive_link": "https://drive.google.com/file/d/...",
      "validation_result": {
        "passed": true,
        "errors": []
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "per_page": 20
  }
}
```

---

### GET /api/track-a/submissions/:id

Get Track A submission details

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "sub_service_id": "ss_1",
    "sub_service_name": "Balance Inquiry",
    "status": "synced",
    "file_name": "integration_proof.pdf",
    "uploaded_at": "2026-06-23T08:50:00Z",
    "validation_result": {
      "layer_1": {
        "passed": true,
        "checks": {
          "file_format": "✓",
          "file_size": "✓"
        }
      },
      "layer_2": {
        "passed": true,
        "checks": {
          "merchantId_present": "✓",
          "transactionId_present": "✓",
          "balance_present": "✓"
        }
      }
    },
    "review_status": "approved",
    "reviewed_by": "admin@company.com",
    "reviewed_at": "2026-06-23T10:30:00Z"
  }
}
```

---

### DELETE /api/track-a/submissions/:id

Delete Track A submission (only in draft status)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Submission deleted successfully"
  }
}
```

---

## 7. TRACK B ENDPOINTS

### GET /api/track-b/test-cases/:testCaseId

Get test case for submission

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tc_001",
    "code": "TC001",
    "name": "Valid Balance Inquiry",
    "description": "Test balance inquiry with valid merchant",
    "expected_behavior": "Returns current balance",
    "validation_rules": [
      {
        "id": "vr_1",
        "rule_type": "required_field",
        "field_name": "response.merchantId",
        "error_message": "Response must contain merchantId",
        "help_text": "Add merchantId to response"
      }
    ]
  }
}
```

---

### POST /api/track-b/submit

Submit Track B API test

**Request:**
```json
{
  "test_case_id": "tc_001",
  "request": {
    "merchantId": "123456",
    "customerId": "789",
    "transactionId": "TXN_001"
  },
  "response": {
    "status": 200,
    "merchantId": "123456",
    "balance": "5000000",
    "currency": "IDR"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "submission_id": "sub_456",
    "status": "passed",
    "validation_result": {
      "layer_1": {
        "passed": true,
        "message": "Well-formed JSON"
      },
      "layer_2": {
        "passed": true,
        "passed_rules": 5,
        "failed_rules": 0,
        "details": [
          {
            "rule_id": "vr_1",
            "passed": true,
            "check": "merchantId present"
          }
        ]
      }
    },
    "submitted_at": "2026-06-23T08:50:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "TRACK_B_VALIDATION_FAILED",
    "message": "Validation failed",
    "details": {
      "layer": "layer_2",
      "failed_rules": [
        {
          "rule_id": "vr_1",
          "field": "response.balance",
          "error": "Required field missing",
          "expected": "Field should contain balance",
          "actual": "Field not present"
        }
      ]
    }
  }
}
```

---

### GET /api/track-b/submissions

Get partner's Track B submissions

**Query Parameters:**
- `test_case_id`: Filter by test case
- `status`: passed, failed, rejected
- `page`: Page number
- `per_page`: Results per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_456",
      "test_case_id": "tc_001",
      "test_case_code": "TC001",
      "sub_service_name": "Balance Inquiry",
      "status": "passed",
      "score": 100,
      "submitted_at": "2026-06-23T08:50:00Z",
      "review_status": "approved"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "per_page": 20
  }
}
```

---

## 8. DASHBOARD ENDPOINTS

### GET /api/dashboard/partner

Get partner dashboard data

**Response (200):**
```json
{
  "success": true,
  "data": {
    "partner": {
      "name": "John Doe",
      "company": "Acme Corp",
      "status": "active"
    },
    "progress": {
      "overall_percentage": 66.7,
      "selected_sub_services": 3,
      "passed_sub_services": 2,
      "status": "in_progress"
    },
    "scope": [
      {
        "sub_service_id": "ss_1",
        "name": "Balance Inquiry",
        "status": "passed",
        "track_a_status": "synced",
        "track_b_status": "passed"
      },
      {
        "sub_service_id": "ss_2",
        "name": "Top Up",
        "status": "passed",
        "track_a_status": "synced",
        "track_b_status": "passed"
      },
      {
        "sub_service_id": "ss_3",
        "name": "Mini Statement",
        "status": "in_progress",
        "track_a_status": "pending",
        "track_b_status": "pending"
      }
    ],
    "recent_submissions": [
      {
        "type": "track_b",
        "sub_service": "Balance Inquiry",
        "status": "passed",
        "submitted_at": "2026-06-23T08:50:00Z"
      }
    ],
    "announcements": [
      {
        "title": "System Maintenance",
        "content": "Scheduled maintenance on...",
        "priority": "high",
        "published_at": "2026-06-23T08:00:00Z"
      }
    ]
  }
}
```

---

### GET /api/dashboard/admin

Get admin dashboard (Admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_partners": 150,
      "active_partners": 120,
      "pending_approval": 15,
      "rejected": 5,
      "suspended": 10,
      "this_week_submissions": 45,
      "this_week_approvals": 38
    },
    "pending_approvals": [
      {
        "partner_id": "p_125",
        "company_name": "New Partner Inc",
        "registered_at": "2026-06-22T08:50:00Z"
      }
    ],
    "recent_submissions": [
      {
        "partner": "Acme Corp",
        "type": "track_b",
        "sub_service": "Balance Inquiry",
        "status": "passed",
        "submitted_at": "2026-06-23T08:50:00Z"
      }
    ],
    "progress_distribution": {
      "0_25_percent": 10,
      "25_50_percent": 20,
      "50_75_percent": 40,
      "75_100_percent": 50
    }
  }
}
```

---

## 9. AUDIT LOG ENDPOINTS

### GET /api/audit-logs

Get audit logs (Admin only)

**Query Parameters:**
- `event_type`: Event type filter
- `partner_id`: Partner filter
- `date_from`: Start date
- `date_to`: End date
- `page`: Page number
- `per_page`: Results per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "log_123",
      "event_type": "TrackBSubmitted",
      "partner": "Acme Corp",
      "resource_type": "submission",
      "resource_id": "sub_456",
      "action": "created",
      "status": "success",
      "ip_address": "192.168.1.1",
      "created_at": "2026-06-23T08:50:00Z"
    }
  ],
  "meta": {
    "total": 1500,
    "page": 1,
    "per_page": 20
  }
}
```

---

## 10. ERROR CODES

| Code | HTTP | Description |
|------|------|-------------|
| AUTH_INVALID_CREDENTIALS | 403 | Invalid email/password |
| AUTH_EMAIL_NOT_VERIFIED | 403 | Email not verified |
| AUTH_SESSION_EXPIRED | 401 | Session token expired |
| AUTH_UNAUTHORIZED | 403 | Insufficient permissions |
| TRACK_A_FILE_SIZE_EXCEEDED | 400 | File size > 10MB |
| TRACK_A_INVALID_FILE_FORMAT | 400 | Not a PDF file |
| TRACK_A_VALIDATION_FAILED | 422 | Layer 2 validation failed |
| TRACK_B_INVALID_JSON | 400 | Request/response not valid JSON |
| TRACK_B_VALIDATION_FAILED | 422 | Validation rules failed |
| RESOURCE_NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 422 | Input validation failed |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_SERVER_ERROR | 500 | Server error |

---

**Document Version:** 1.0
**Last Updated:** June 2026
**Status:** Ready for Implementation
