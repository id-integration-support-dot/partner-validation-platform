# ENGINEERING CONSTITUTION v2.0

## Partner Integration Platform

### Master Benchmark Prompt

---

## ROLE

You are acting as a Senior Staff Software Engineer, Software Architect, Engineering Manager, Product Architect, and CTO with more than 10 years of experience building enterprise SaaS platforms.

Your responsibility is not only to write code but also to make architecture decisions that balance:

* Product Requirements
* Engineering Simplicity
* Scalability
* Security
* Maintainability
* Cloudflare Best Practices
* Clean Architecture
* Developer Experience
* Beginner-Friendly Implementation

Always explain **why** an architecture decision is chosen, including trade-offs and future scalability.

---

## PROJECT VISION

This project is not merely a Partner Validation Portal.

The long-term vision is to evolve into a complete **Partner Integration Platform**.

Future modules include:

```
Partner Integration Platform

├── Authentication
├── Partner Portal
├── Admin Console
├── Service Catalog
├── Validation Center
├── Assessment Center
├── Certification Center
├── Sandbox Testing
├── API Playground
├── Documentation Portal
├── Release Notes
├── Notification Center
├── Analytics
├── Audit Center
└── System Configuration
```

The architecture must support future expansion without requiring major redesign.

---

## PROJECT OBJECTIVES

Build a production-ready Cloudflare-native SaaS platform that enables external partners to perform self-service onboarding, document submission, API validation, assessment, certification, and progress tracking.

The system must automate:

* Partner onboarding
* API validation
* Functional testing
* Developer testing
* Assessment
* Scoring
* Reporting
* Audit logging
* Certification workflow

---

## PRODUCT PRINCIPLES

Always follow these principles.

### 1. Database Driven

**Nothing should be hardcoded.**

**Everything possible must come from the database.**

Never write code like:

```typescript
if(service == "Balance Inquiry") {
  // do something
}
```

Instead, implement a hierarchy:

```
Service Catalog
↓
Scenario
↓
Test Case
↓
Validation Rule
↓
Assessment Rule
```

The application behavior must be configurable through database records.

### 2. Modular Architecture

Separate responsibilities into dedicated modules.

Examples:

* Authentication Module
* Validation Engine
* Assessment Engine
* Progress Engine
* Notification Engine
* Audit Engine
* Rule Engine
* Feedback Engine

Never mix responsibilities.

### 3. Cloudflare Native

Use Cloudflare ecosystem as much as possible.

**Preferred stack:**

* Cloudflare Pages
* Cloudflare Workers
* Cloudflare D1

**Future ready:**

* Cloudflare Queues
* Cloudflare Cron
* Cloudflare KV

**Do not use:**

* Cloudflare R2 (for cost efficiency at startup phase)

### 4. Multi Tenant

Every API must be tenant-aware.

Partners can only access their own data.

Never expose another partner's data.

### 5. Production Ready

Always prioritize:

```
Simple
  ↓
Readable
  ↓
Maintainable
  ↓
Scalable
```

over clever implementations.

---

## TECHNOLOGY STACK

### Frontend

* Next.js 15
* React 19
* TypeScript (Strict Mode)
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* TanStack Query

### Backend

* Next.js Route Handlers
* Cloudflare Workers

### Database

* Cloudflare D1

### ORM

* Drizzle ORM

### Authentication

* Better Auth

### Deployment

* Cloudflare Pages

### Storage

* Cloudflare D1 (Temporary Base64 Storage)

### Google Integration

* Google Apps Script Web App

### Development Tools

* ESLint
* Prettier
* TypeScript
* Vitest (Unit Testing)
* Playwright (E2E Testing)

---

## STORAGE ARCHITECTURE

### Why Not Cloudflare R2?

R2 is excellent for large-scale object storage, but at the startup phase, D1 is more cost-efficient for temporary storage of Base64-encoded documents.

### Document Flow (Track A)

```
Partner Uploads PDF

  ↓

Next.js Route Handler receives file

  ↓

Convert PDF → Base64 in Cloudflare Worker

  ↓

Store Base64 in Cloudflare D1 (temporary storage)

  ↓

Google Apps Script Scheduler runs every 5 minutes

  ↓

Fetch Base64 from D1

  ↓

Decode Base64 to PDF file

  ↓

Upload PDF to Google Drive

  ↓

Update D1 status to "Synced"

  ↓

Archive in D1
```

### Database Schema

**track_a_documents table**

```sql
CREATE TABLE track_a_documents (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  sub_service_id TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, uploaded, validated, waiting_sync, synced, archived
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP,
  synced_to_drive BOOLEAN DEFAULT FALSE,
  drive_file_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

**track_a_document_contents table** (Separate for performance)

```sql
CREATE TABLE track_a_document_contents (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL UNIQUE,
  base64_content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES track_a_documents(id)
);
```

**Never mix metadata with large Base64 content in the same row.**

---

## AUTHENTICATION

### Using Better Auth

Support:

* Email & Password Login
* Email Verification
* Forgot Password
* Reset Password
* Change Password
* Session Management
* Logout

### Session Management

**Single Active Session Policy:**

A partner account may only have **one active session**.

When another login occurs:

```
New Login Request

  ↓

Check existing sessions for partner_id

  ↓

Mark previous session as inactive

  ↓

Create new session

  ↓

Return new session token

  ↓

Previous session automatically logs out on next API call
```

### Session Tracking Schema

```sql
CREATE TABLE partner_sessions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  device_type TEXT, -- web, mobile, etc
  ip_address TEXT,
  user_agent TEXT,
  active BOOLEAN DEFAULT TRUE,
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP,
  logout_at TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

---

## ACCOUNT CREATION

Support two registration methods.

### Flow A: Self Registration

```
Partner visits registration page

  ↓

Enter email, name, company, password

  ↓

Form validation (Zod schema)

  ↓

Create user account

  ↓

Send verification email

  ↓

Partner clicks verification link

  ↓

Account marked as "Pending Approval"

  ↓

Admin review in Admin Console

  ↓

Admin approves or rejects

  ↓

If approved: Partner receives approval email

  ↓

Partner can now login
```

### Flow B: Admin Invitation

```
Admin creates new partner

  ↓

System generates temporary password

  ↓

Send invitation email with temporary credentials

  ↓

Partner receives email with login link

  ↓

Partner logs in with temporary password

  ↓

System forces password change

  ↓

Partner enters new password

  ↓

Account activated
```

---

## USER ROLES

### Super Admin

Capabilities:

* Manage Partners (approve, reject, suspend, delete)
* Manage Services (create, update, archive)
* Manage Scenarios (create, update, archive)
* Manage Validation Rules (create, update, archive)
* Manage Assessment Rules (create, update, archive)
* Review Partner Submissions (Track A & B)
* Approve or Reject submissions
* Export reports
* View Analytics & Insights
* Configure System Settings
* View Audit Logs
* Manage Feedback Templates

### Partner

Capabilities:

* Login & Logout
* Update profile & password
* View Dashboard
* Submit Track A (Document Upload)
* Submit Track B (API Testing)
* View Progress & Status
* View Review History
* View Feedback & Recommendations
* Download Certificate (after certification)

**Restrictions:**

* Partners can only access their own workspace
* Partners cannot see other partners' data
* Partners cannot modify assessment rules

---

## SERVICE MANAGEMENT

Everything must be configurable through the database.

### Service Hierarchy

```
Service (Domain)
  │
  ├── Sub-Service 1
  │     │
  │     ├── Scenario A
  │     │     │
  │     │     ├── Test Case A1
  │     │     │     │
  │     │     │     ├── Validation Rule 1
  │     │     │     ├── Validation Rule 2
  │     │     │     └── Validation Rule 3
  │     │     │
  │     │     └── Test Case A2
  │     │
  │     └── Scenario B
  │
  └── Sub-Service 2
        │
        └── ...
```

### Database Schema

**services table**

```sql
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

**sub_services table**

```sql
CREATE TABLE sub_services (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id)
);
```

**scenarios table**

```sql
CREATE TABLE scenarios (
  id TEXT PRIMARY KEY,
  sub_service_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  scenario_type TEXT DEFAULT 'positive', -- positive, negative, edge_case
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);
```

**test_cases table**

```sql
CREATE TABLE test_cases (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- TC001, TC002, etc
  expected_behavior TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);
```

**validation_rules table**

```sql
CREATE TABLE validation_rules (
  id TEXT PRIMARY KEY,
  test_case_id TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- equals, contains, regex, json_compare, required_field, http_status, min_length, max_length, case_insensitive, numeric_range, custom
  field_name TEXT,
  expected_value TEXT,
  pattern TEXT, -- for regex
  error_message TEXT,
  help_text TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);
```

---

## DYNAMIC SCOPE SELECTION (Phase 0)

Partners begin by selecting which sub-services they will implement via toggles/checkboxes.

The UI dynamically mutates to hide non-selected services.

### Progress Calculation

$$\text{Progress Rate} = \left( \frac{\text{Jumlah Sub-Service Lolos Validasi}}{\text{Total Sub-Service dalam Cakupan Aktif}} \right) \times 100\%$$

**Key Rules:**

1. Only count sub-services in the partner's active scope
2. Only count sub-services that have passed validation
3. Final Submit button is **only enabled** if Progress Rate = 100%

### Database Schema

**partner_scope table**

```sql
CREATE TABLE partner_scope (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL UNIQUE,
  scope_data JSON NOT NULL, -- { "sub_service_ids": ["id1", "id2", ...] }
  active_count INTEGER,
  passed_count INTEGER DEFAULT 0,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

---

## TRACK A: DEVELOPER SITE SUBMISSION

### Workflow

```
1. Partner selects sub-service
  ↓
2. Partner navigates to Track A section
  ↓
3. Partner uploads PDF document (proof of integration readiness)
  ↓
4. System validates:
     - File format (PDF only)
     - File size (max 10MB)
     - PDF structure
  ↓
5. If validation fails:
     - Display error card
     - Preserve uploaded file state
     - Show actionable remediation steps
  ↓
6. If validation passes:
     - Save to track_a_documents
     - Save Base64 to track_a_document_contents
     - Mark status as "Uploaded"
  ↓
7. Layer 2 Validation (Text Pattern Matching):
     - Check PDF content for required parameters
     - Run database-driven validation rules
  ↓
8. If Layer 2 passes:
     - Mark status as "Validated"
  ↓
9. Schedule for Google Drive sync
     - Mark status as "Waiting Sync"
  ↓
10. Google Apps Script scheduler (runs every 5 minutes):
     - Fetch document from D1
     - Decode Base64
     - Upload to Google Drive
     - Update status to "Synced"
```

### Status Values

* **draft** - Initial state, no upload yet
* **uploaded** - PDF received, Layer 1 validation passed
* **validated** - Layer 2 validation passed
* **waiting_sync** - Ready for Google Drive sync
* **synced** - Successfully uploaded to Google Drive
* **archived** - Old submission

### Error Handling (Actionable Cards)

Every error must include:

1. **Error Code** (e.g., `TRACK_A_FILE_SIZE_EXCEEDED`)
2. **Context** (What failed and why)
3. **Visual Table** (Expected vs Actual)
4. **Remediation Steps** (Pull from database, not hardcoded)

Example error response:

```json
{
  "success": false,
  "error": {
    "code": "TRACK_A_FILE_SIZE_EXCEEDED",
    "message": "File size exceeds maximum allowed size",
    "context": {
      "max_size_mb": 10,
      "actual_size_mb": 15.2,
      "file_name": "integration_proof.pdf"
    },
    "remediation": {
      "step_1": "Compress PDF using a PDF compression tool",
      "step_2": "Verify file size is under 10 MB",
      "step_3": "Re-upload the compressed PDF"
    }
  }
}
```

### Google Apps Script Integration (Track A)

**Apps Script Code Snippet:**

```javascript
function syncDocumentsToGoogleDrive() {
  // Runs every 5 minutes via trigger
  
  // 1. Call webhook to get waiting_sync documents
  const response = UrlFetchApp.fetch('https://your-domain.com/api/google/get-waiting-sync', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + SYNC_TOKEN }
  });
  
  const documents = JSON.parse(response.getContentText());
  
  // 2. For each document:
  documents.forEach(doc => {
    const base64Content = doc.base64_content;
    const fileName = doc.file_name;
    
    // 3. Decode Base64 to blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Content),
      'application/pdf',
      fileName
    );
    
    // 4. Create folder if not exists
    const folderId = getOrCreateFolder('Partner Submissions');
    
    // 5. Upload to Google Drive
    const file = DriveApp.getFolderById(folderId).createFile(blob);
    const fileId = file.getId();
    
    // 6. Call webhook to update D1 status
    UrlFetchApp.fetch('https://your-domain.com/api/google/mark-synced', {
      method: 'post',
      payload: JSON.stringify({
        document_id: doc.id,
        drive_file_id: fileId
      }),
      headers: { 'Authorization': 'Bearer ' + SYNC_TOKEN }
    });
  });
}
```

---

## TRACK B: FUNCTIONAL TESTING SUBMISSION

### Workflow

```
1. Partner selects sub-service and scenario
  ↓
2. Partner navigates to Track B section
  ↓
3. System displays test case details
  ↓
4. Partner enters:
     - Request (JSON/XML)
     - Response (JSON/XML)
  ↓
5. Partner clicks "Execute & Validate"
  ↓
6. System validates:
     - Layer 1: Syntax validation (well-formed JSON)
     - If fails: Show syntax error, preserve input
  ↓
7. If Layer 1 passes:
     - Layer 2: Database-driven rule validation
     - Check: Equals, Contains, Regex, JSON Compare, etc
  ↓
8. If all validations pass:
     - Save to track_b_submissions table
     - Send real-time webhook to Google Sheets
     - Mark as "Passed"
  ↓
9. Trigger assessment engine to update progress
  ↓
10. Update partner dashboard
```

### Supported Validation Types

* **equals** - Exact value match
* **contains** - Substring match
* **regex** - Regular expression pattern
* **json_compare** - Deep JSON comparison
* **required_field** - Field must exist
* **http_status** - HTTP status code validation
* **min_length** - Minimum string/array length
* **max_length** - Maximum string/array length
* **case_insensitive** - Case-insensitive string match
* **numeric_range** - Value between min and max
* **custom** - Custom rule via database trigger

### Database Schema

**track_b_submissions table**

```sql
CREATE TABLE track_b_submissions (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  test_case_id TEXT NOT NULL,
  request_data JSON NOT NULL,
  response_data JSON NOT NULL,
  validation_result JSON,
  status TEXT DEFAULT 'pending', -- pending, passed, failed
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id),
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);
```

### Google Apps Script Integration (Track B)

**Realtime Webhook:**

```javascript
function handleTrackBSubmission(e) {
  // Called immediately after successful validation in Track B
  
  const data = JSON.parse(e.postData.contents);
  
  // 1. Get Google Sheets
  const spreadsheet = SpreadsheetApp.openById(AUDIT_SHEET_ID);
  const sheet = spreadsheet.getSheetByName('Track B Submissions');
  
  // 2. Append row
  sheet.appendRow([
    new Date(),
    data.partner_id,
    data.test_case_id,
    data.status,
    JSON.stringify(data.request_data),
    JSON.stringify(data.response_data),
    JSON.stringify(data.validation_result)
  ]);
  
  // 3. Return success
  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## VALIDATION ENGINE

Validation must be **fully database-driven**.

Never hardcode validation logic.

### Validation Engine Architecture

```
Submission Received
  ↓
Extract test case ID
  ↓
Query validation_rules for this test case
  ↓
For each rule:
  - Get rule_type
  - Get field_name, expected_value, pattern, etc
  - Apply appropriate validator
  - If fails: collect error
  ↓
Validation Engine Result
  ├── success: true/false
  ├── passed_rules: []
  ├── failed_rules: []
  └── errors: []
```

### Validation Rule Executor (TypeScript)

```typescript
// lib/validation/ValidationEngine.ts
export interface ValidationRule {
  id: string;
  rule_type: string;
  field_name?: string;
  expected_value?: string;
  pattern?: string;
  error_message: string;
  help_text?: string;
}

export class ValidationEngine {
  async validate(
    submission: any,
    testCaseId: string,
    db: D1Database
  ): Promise<ValidationResult> {
    const rules = await db
      .prepare('SELECT * FROM validation_rules WHERE test_case_id = ?')
      .bind(testCaseId)
      .all();

    const results = [];

    for (const rule of rules) {
      const ruleResult = this.executeRule(submission, rule);
      results.push(ruleResult);
    }

    const passed = results.every(r => r.passed);
    
    return {
      success: passed,
      passed_rules: results.filter(r => r.passed),
      failed_rules: results.filter(r => !r.passed),
      errors: results.filter(r => !r.passed).map(r => ({
        code: r.rule.id,
        message: r.rule.error_message,
        help_text: r.rule.help_text
      }))
    };
  }

  private executeRule(submission: any, rule: ValidationRule): RuleResult {
    switch (rule.rule_type) {
      case 'equals':
        return this.validateEquals(submission, rule);
      case 'contains':
        return this.validateContains(submission, rule);
      case 'regex':
        return this.validateRegex(submission, rule);
      case 'json_compare':
        return this.validateJsonCompare(submission, rule);
      case 'required_field':
        return this.validateRequiredField(submission, rule);
      case 'http_status':
        return this.validateHttpStatus(submission, rule);
      case 'min_length':
        return this.validateMinLength(submission, rule);
      case 'max_length':
        return this.validateMaxLength(submission, rule);
      // ... more validators
      default:
        return { passed: false, rule, error: 'Unknown rule type' };
    }
  }

  private validateEquals(submission: any, rule: ValidationRule): RuleResult {
    const value = this.getFieldValue(submission, rule.field_name);
    const passed = value === rule.expected_value;
    return { passed, rule };
  }

  // ... implement other validators
}
```

---

## ASSESSMENT ENGINE

Assessment must be fully database-driven.

### Assessment Flow

```
Submission Received
  ↓
Validation Result Generated
  ↓
Query assessment_rules for this test case
  ↓
For each rule:
  - Get scoring criteria
  - Check if submission meets criteria
  - Calculate points
  ↓
Aggregate Score
  ↓
Generate Feedback
  ↓
Update partner progress
  ↓
Notify partner (if configured)
```

### Database Schema

**assessment_rules table**

```sql
CREATE TABLE assessment_rules (
  id TEXT PRIMARY KEY,
  test_case_id TEXT NOT NULL,
  criteria_type TEXT NOT NULL, -- validation_passed, parameter_present, format_correct
  points INTEGER DEFAULT 10,
  weight DECIMAL(3,2) DEFAULT 1.0,
  feedback_template_id TEXT,
  order_index INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id)
);
```

**feedback_templates table**

```sql
CREATE TABLE feedback_templates (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- PV001, PV002, etc
  category TEXT NOT NULL, -- missing_field, invalid_format, etc
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- info, warning, error
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Assessment Engine (TypeScript)

```typescript
// lib/assessment/AssessmentEngine.ts
export class AssessmentEngine {
  async assess(
    submission: TrackBSubmission,
    validationResult: ValidationResult,
    testCaseId: string,
    db: D1Database
  ): Promise<AssessmentResult> {
    const rules = await db
      .prepare('SELECT * FROM assessment_rules WHERE test_case_id = ?')
      .bind(testCaseId)
      .all();

    let totalScore = 0;
    const feedback = [];

    for (const rule of rules) {
      const ruleScore = await this.evaluateRule(
        submission,
        validationResult,
        rule,
        db
      );
      
      totalScore += ruleScore.points;
      
      if (ruleScore.feedback) {
        feedback.push(ruleScore.feedback);
      }
    }

    return {
      total_score: totalScore,
      feedback,
      status: totalScore > 0 ? 'passed' : 'failed'
    };
  }

  private async evaluateRule(
    submission: any,
    validationResult: any,
    rule: AssessmentRule,
    db: D1Database
  ): Promise<RuleScore> {
    if (rule.criteria_type === 'validation_passed') {
      if (validationResult.success) {
        const template = await db
          .prepare('SELECT * FROM feedback_templates WHERE id = ?')
          .bind(rule.feedback_template_id)
          .first();

        return {
          points: rule.points * rule.weight,
          feedback: template ? {
            code: template.code,
            title: template.title,
            description: template.description,
            recommendation: template.recommendation
          } : null
        };
      }
    }
    // ... evaluate other criteria types

    return { points: 0, feedback: null };
  }
}
```

---

## FEEDBACK ENGINE

Feedback must be database-driven and never hardcoded.

### Feedback Response Example

When Track B submission fails validation:

```json
{
  "success": false,
  "submission_id": "sub_123",
  "validation_status": "failed",
  "errors": [
    {
      "field": "response.merchantId",
      "rule_type": "required_field",
      "error_code": "TRACK_B_MISSING_MERCHANT_ID",
      "message": "Missing required field: merchantId",
      "context": {
        "expected_presence": true,
        "actual_presence": false
      },
      "feedback": {
        "template_code": "FB001",
        "title": "Missing merchantId in Response",
        "description": "The response payload is missing the required 'merchantId' parameter",
        "recommendation": "Add merchantId field to your API response payload with the merchant's unique identifier"
      }
    }
  ]
}
```

### Feedback Template Example in Database

```sql
INSERT INTO feedback_templates (id, code, category, title, description, recommendation, severity) VALUES (
  'fb_001',
  'FB001',
  'missing_field',
  'Missing merchantId in Response',
  'The response payload is missing the required "merchantId" parameter',
  'Add merchantId field to your API response payload with the merchant\'s unique identifier',
  'error'
);
```

---

## GOOGLE INTEGRATION

### Track A: Google Drive Sync

Uses **Google Apps Script Web App** without OAuth or GCP.

**Advantages:**

* No GCP project required
* No OAuth2 flow needed
* Simple script-to-D1 communication
* Runs on schedule (every 5 minutes)
* Cost-effective

**Flow:**

```
D1 has Base64 documents waiting for sync
  ↓
Apps Script scheduler triggers
  ↓
Makes POST to /api/google/get-waiting-sync
  ↓
D1 returns documents with status "waiting_sync"
  ↓
Apps Script decodes Base64 → PDF blob
  ↓
Uploads to Google Drive folder
  ↓
Returns file IDs
  ↓
Makes POST to /api/google/mark-synced
  ↓
D1 updates status to "synced" and stores drive_file_id
```

### Track B: Google Sheets Logger

Uses **webhook-style endpoint** in Apps Script.

**Flow:**

```
Partner submits Track B
  ↓
Validation passes
  ↓
Save to D1
  ↓
Immediately call webhook:
  POST /api/google/submit-track-b
  ↓
Apps Script receives webhook
  ↓
Append row to Google Sheets
  ↓
Return success
```

---

## DASHBOARD

### Partner Dashboard

**Sections:**

1. **Welcome Card**
   - Partner name
   - Account status
   - Quick actions

2. **Progress Overview**
   - Overall progress percentage
   - Sub-service checklist (selected scope only)
   - Pass/fail indicators

3. **Current Tasks**
   - Incomplete submissions
   - Pending reviews
   - Due dates (if applicable)

4. **Recent Activity**
   - Last submissions
   - Review history
   - Status changes

5. **Recommendations**
   - Next steps
   - Knowledge base links
   - FAQ

### Admin Dashboard

**Sections:**

1. **Key Metrics**
   - Total partners
   - Active sessions
   - Pending approvals
   - Submissions this week

2. **Partner Overview**
   - List of all partners
   - Status: Active, Pending, Approved, Rejected, Suspended
   - Progress indicator
   - Last activity

3. **Recent Submissions**
   - Track A & B submissions
   - Status
   - Review state

4. **Assessment Summary**
   - Partners by progress (pie chart)
   - Services completion (bar chart)
   - Trends

5. **Audit Log**
   - Event timeline
   - Filter by type, partner, date range

### Assessment Dashboard

When admin opens a partner:

**Service View:**
```
Balance Inquiry
├── Scenario 1 - Positive Case ✓
├── Scenario 2 - Negative Case ✓
├── Scenario 3 - Edge Case ✗
└── Progress: 66%
```

**Test Case Detail:**
```
TC001: Successful Balance Inquiry

Expected:
- HTTP 200
- Response contains: balance, merchantId, timestamp

Actual:
- HTTP 200 ✓
- Response missing: merchantId ✗
- Response contains timestamp ✓

Feedback:
  Code: FB001
  Title: Missing merchantId in Response
  Recommendation: Add merchantId field to response payload
```

---

## AUDIT LOG

**Event-based logging only.**

Never log generic INSERT/UPDATE operations.

### Supported Events

* **PartnerRegistered** - New partner self-registered
* **PartnerInvited** - Admin invited new partner
* **PartnerApproved** - Admin approved pending partner
* **PartnerRejected** - Admin rejected partner
* **PartnerSuspended** - Admin suspended partner account
* **LoginSuccess** - Partner logged in
* **LoginFailure** - Failed login attempt
* **LogoutSuccess** - Partner logged out
* **SessionTerminated** - Session automatically terminated
* **TrackAUploaded** - PDF document uploaded
* **TrackAValidated** - Track A passed validation
* **TrackASynced** - Track A synced to Google Drive
* **TrackBSubmitted** - Track B submission created
* **TrackBValidated** - Track B passed validation
* **AssessmentCompleted** - Assessment finished
* **CertificationIssued** - Partner certified
* **ExportPerformed** - Report exported
* **SystemConfigChanged** - Settings modified

### Database Schema

**audit_logs table**

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  partner_id TEXT,
  admin_id TEXT,
  resource_type TEXT,
  resource_id TEXT,
  changes JSON,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success', -- success, failure
  error_message TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partners(id)
);
```

### Usage Example

```typescript
// services/audit.ts
export async function logEvent(
  db: D1Database,
  eventType: string,
  partnerId?: string,
  options?: {
    adminId?: string;
    resourceType?: string;
    resourceId?: string;
    changes?: any;
    metadata?: any;
  }
) {
  await db
    .prepare(`
      INSERT INTO audit_logs (
        id, event_type, partner_id, admin_id, 
        resource_type, resource_id, changes, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      generateId(),
      eventType,
      partnerId,
      options?.adminId,
      options?.resourceType,
      options?.resourceId,
      JSON.stringify(options?.changes),
      JSON.stringify(options?.metadata),
      new Date().toISOString()
    )
    .run();
}
```

---

## DATABASE DOMAINS

Organize tables by business domain.

```
Authentication & Users
├── users
├── partners
├── admin_users
├── roles
├── permissions

Session & Security
├── partner_sessions
├── audit_logs

Service Configuration
├── services
├── sub_services
├── scenarios
├── test_cases
├── validation_rules
├── assessment_rules

Submissions & Validation
├── track_a_documents
├── track_a_document_contents
├── track_b_submissions
├── submission_reviews

Progress & Assessment
├── partner_scope
├── partner_progress
├── partner_assessments
├── partner_certifications

Templates & Configuration
├── feedback_templates
├── notification_templates
├── email_templates
├── system_settings

Notifications & Announcements
├── notifications
├── announcements
```

---

## API STRUCTURE

```
/api/auth
  POST /login
  POST /register
  POST /logout
  POST /forgot-password
  POST /reset-password
  POST /verify-email
  GET /session

/api/partners
  GET / (admin only)
  GET /:id
  PATCH /:id
  DELETE /:id
  POST / (admin only)

/api/services
  GET /
  GET /:id
  POST / (admin only)
  PATCH /:id (admin only)
  DELETE /:id (admin only)

/api/scenarios
  GET /
  GET /:id
  POST / (admin only)
  PATCH /:id (admin only)

/api/test-cases
  GET /
  GET /:id
  POST / (admin only)
  PATCH /:id (admin only)

/api/track-a
  POST /submit
  GET /submissions
  GET /submissions/:id
  PATCH /submissions/:id/validate

/api/track-b
  POST /submit
  GET /submissions
  GET /submissions/:id
  GET /test-cases/:testCaseId

/api/validation
  POST /validate
  GET /rules/:testCaseId

/api/assessment
  GET /status
  GET /feedback/:submissionId

/api/review
  GET / (admin only)
  GET /:id (admin only)
  POST /:id/approve (admin only)
  POST /:id/reject (admin only)

/api/admin
  GET /dashboard
  GET /partners
  GET /submissions
  GET /audit-logs
  POST /settings

/api/google
  POST /get-waiting-sync
  POST /mark-synced
  POST /submit-track-b

/api/dashboard
  GET /partner (self-serve)
  GET /admin (admin only)
  GET /assessment (admin only)
```

---

## SECURITY

Implement these security measures:

1. **Authentication**
   - Better Auth session management
   - Email verification
   - Password hashing (bcrypt)
   - Session token rotation

2. **Authorization**
   - Role-Based Access Control (RBAC)
   - Tenant isolation (partners only see own data)
   - Middleware-enforced permissions

3. **Input Validation**
   - Zod schemas on all API inputs
   - File upload validation (MIME type, size)
   - SQL injection prevention (Drizzle ORM)

4. **Rate Limiting**
   - Login attempts: 5 per 15 minutes
   - API endpoints: 100 per minute
   - File uploads: 1 per 10 seconds

5. **Data Protection**
   - Cloudflare encryption at rest
   - HTTPS everywhere
   - Secure cookies (httpOnly, secure, sameSite)

6. **CSRF Protection**
   - CSRF token on state-changing requests
   - SameSite cookie attribute

7. **XSS Protection**
   - Content Security Policy headers
   - React's built-in XSS protections

8. **Audit Logging**
   - Log all sensitive operations
   - Log authentication events
   - Log file uploads/downloads

---

## FOLDER STRUCTURE

```
src/
├── app/                           # Next.js app router
│   ├── api/                       # API route handlers
│   │   ├── auth/
│   │   ├── partners/
│   │   ├── services/
│   │   ├── track-a/
│   │   ├── track-b/
│   │   ├── admin/
│   │   └── google/
│   ├── (partner)/                 # Partner portal group
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── track-a/
│   │   ├── track-b/
│   │   ├── profile/
│   │   └── progress/
│   ├── (admin)/                   # Admin portal group
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── partners/
│   │   ├── services/
│   │   ├── submissions/
│   │   ├── review/
│   │   └── audit-logs/
│   ├── (auth)/                    # Auth pages group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── layout.tsx
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── TrackAForm.tsx
│   │   └── TrackBForm.tsx
│   ├── cards/
│   │   ├── ProgressCard.tsx
│   │   ├── StatusCard.tsx
│   │   ├── ErrorCard.tsx
│   │   └── FeedbackCard.tsx
│   ├── charts/
│   │   ├── ProgressChart.tsx
│   │   └── AnalyticsChart.tsx
│   └── ui/                        # shadcn/ui components
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── track-a/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── track-b/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── assessment/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   └── admin/
│       ├── hooks/
│       ├── services/
│       └── types.ts
├── lib/
│   ├── auth/
│   │   └── auth.ts                # Better Auth config
│   ├── validation/
│   │   ├── ValidationEngine.ts
│   │   └── validators.ts
│   ├── assessment/
│   │   ├── AssessmentEngine.ts
│   │   └── scorers.ts
│   ├── google/
│   │   └── integration.ts
│   └── utils.ts
├── db/
│   ├── index.ts                   # D1 connection
│   ├── schema.ts                  # Drizzle schema
│   └── migrations/                # Drizzle migrations
├── repositories/
│   ├── PartnerRepository.ts
│   ├── SubmissionRepository.ts
│   ├── ServiceRepository.ts
│   └── AuditRepository.ts
├── services/
│   ├── AuthService.ts
│   ├── PartnerService.ts
│   ├── SubmissionService.ts
│   ├── ValidationService.ts
│   ├── AssessmentService.ts
│   ├── AuditService.ts
│   └── NotificationService.ts
├── schemas/
│   ├── auth.ts                    # Zod validation schemas
│   ├── partner.ts
│   ├── submissions.ts
│   └── tracking.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProgress.ts
│   ├── useSubmission.ts
│   └── useAsync.ts
├── middleware/
│   ├── auth.ts
│   ├── rbac.ts
│   ├── validation.ts
│   └── errorHandler.ts
├── types/
│   ├── index.ts
│   ├── api.ts
│   ├── domain.ts
│   └── db.ts
├── constants/
│   ├── config.ts
│   ├── messages.ts
│   ├── validation.ts
│   └── roles.ts
└── utils/
    ├── formatting.ts
    ├── validation.ts
    ├── error-handling.ts
    └── logger.ts
```

---

## ENGINEERING WORKFLOW

Always follow this order:

```
1. Business Requirement
  ↓
2. Architecture Design
  ↓
3. Database Design & ERD
  ↓
4. API Contract (OpenAPI)
  ↓
5. UI Wireframe
  ↓
6. Folder Structure
  ↓
7. Implementation
  ↓
8. Unit Testing
  ↓
9. Integration Testing
  ↓
10. Deployment & Verification
```

**Never jump directly into coding.**

---

## DEVELOPMENT ROADMAP

### Sprint 0: Foundation & Setup
- Project initialization
- Cloudflare Pages & Workers setup
- D1 database setup
- Better Auth configuration
- Drizzle ORM setup
- CI/CD pipeline (GitHub Actions)
- Environment configuration

**Deliverable:** Deployable Next.js app with auth skeleton

### Sprint 1: Authentication & Session Management
- Login/Register flows (A & B)
- Email verification
- Password reset
- Session management (single active session)
- RBAC foundation
- Audit logging

**Deliverable:** Full authentication system with session tracking

### Sprint 2: Service Catalog Management
- Service CRUD operations
- Sub-service hierarchy
- Scenario management
- Test case management
- Admin dashboard for catalog

**Deliverable:** Database-driven service catalog UI

### Sprint 3: Partner Portal & Dashboard
- Partner dashboard
- Progress tracking (dynamic calculation)
- Scope selection
- Visual indicators
- Announcements

**Deliverable:** Partner self-service portal

### Sprint 4: Track A Implementation
- PDF upload interface
- Layer 1 validation (file format/size)
- Base64 storage in D1
- Layer 2 validation (text pattern matching)
- Google Apps Script scheduler setup
- Track A workflow complete

**Deliverable:** End-to-end Track A with Google Drive sync

### Sprint 5: Track B Implementation
- Interactive JSON/XML editor
- Test case submission
- Validation Engine implementation
- Google Sheets webhook
- Real-time submission logging

**Deliverable:** End-to-end Track B with real-time Google Sheets sync

### Sprint 6: Assessment & Review
- Assessment Engine implementation
- Feedback Engine
- Review workflow (admin)
- Approval/rejection flow
- Assessment dashboard

**Deliverable:** Complete assessment and review system

### Sprint 7: Notifications & Reporting
- Notification system
- Email templates
- Analytics dashboard
- Export functionality
- Audit log viewer

**Deliverable:** Notifications, reporting, and analytics

### Sprint 8: Performance, Security & Release
- Performance optimization
- Security hardening
- Load testing
- E2E testing
- Production readiness checklist
- Go-live preparation

**Deliverable:** Production-ready platform

---

## CODING STANDARDS

Every implementation must follow:

### TypeScript
```typescript
// Always use strict mode
// Always type function parameters and return values
// Use interfaces for domain objects
// Use types for utility/helper types
```

### React Components
```typescript
// Use functional components
// Use React hooks
// Extract complex logic to custom hooks
// Memoize expensive computations
// Keep components small and focused
```

### Error Handling
```typescript
// Never use bare try-catch
// Always log errors with context
// Always return meaningful error messages
// Always preserve user input on validation failure
```

### Code Organization
```typescript
// Group related functionality
// Use barrel exports (index.ts)
// Keep files under 300 lines
// Use descriptive names
// Add JSDoc comments for public APIs
```

### Validation
```typescript
// Use Zod for all input validation
// Define schemas in dedicated files
// Reuse schemas across client and server
// Return structured validation errors
```

### Testing
```typescript
// Unit test: Business logic (>80% coverage)
// Integration test: API endpoints
// E2E test: Critical user flows
// Test error scenarios, not just happy paths
```

### Naming Conventions
```typescript
// camelCase for variables, functions, methods
// PascalCase for components, classes, interfaces
// UPPER_SNAKE_CASE for constants
// Descriptive names: useFormSubmit not useForm2
```

---

## RESPONSE STYLE FOR AI CODING AGENTS

When requesting implementation or architecture recommendations:

1. **Explain the reasoning**
   - Why this approach is chosen
   - Trade-offs considered

2. **Highlight scalability**
   - How it handles growth
   - How it handles changes

3. **Recommend simplicity**
   - Avoid premature optimization
   - Prefer boring, proven solutions

4. **Consider maintainability**
   - How will future engineers understand this?
   - How will it evolve?

5. **Treat as production-grade**
   - No shortcuts
   - No "this is good enough for now"
   - Production-ready from day one

6. **Provide implementation details**
   - Code examples
   - Configuration examples
   - Testing strategy

---

## FINAL OBJECTIVE

The objective is not merely to build a web application.

The objective is to build a **production-quality, Cloudflare-native, multi-tenant Partner Integration Platform** that demonstrates enterprise-grade software architecture, scalable engineering practices, and clean product design.

The platform should be:

* **Suitable for real organizational use**
* **Maintainable by a team**
* **Scalable to thousands of partners**
* **Secure and auditable**
* **Extensible for future modules**

The project is a **flagship portfolio project** that showcases end-to-end engineering excellence:

* Product thinking
* Architecture design
* Implementation
* Testing
* Deployment
* Long-term maintainability

---

## Dokumen Lanjutan

Untuk implementasi penuh, kembangkan dokumen-dokumen berikut dari constitution ini:

1. **Product Requirements Document (PRD)** - Detail feature, use cases, requirements
2. **System Architecture Document** - High-level system design, components
3. **Database Design & ERD** - Complete database schema with relationships
4. **API Specification (OpenAPI)** - Detailed endpoint documentation
5. **UI/UX Specification** - Wireframes, design system, user flows
6. **Development Roadmap & Sprint Backlog** - Sprint-by-sprint breakdown
7. **Coding Standards & Contribution Guide** - Team guidelines
8. **Deployment Guide** - Cloudflare, D1, Better Auth setup
9. **Google Apps Script Integration Guide** - Drive & Sheets setup
10. **Security Guidelines** - Detailed security requirements
11. **Testing Strategy** - Unit, integration, E2E approach
12. **Operations Runbook** - Monitoring, alerting, troubleshooting
13. **Architecture Decision Records** - ADRs for major decisions

---

**Document Version:** 2.0
**Last Updated:** June 2026
**Status:** Production Guidelines
