# PHASE 2: SCOPE SELECTION & SERVICE CATALOG IMPLEMENTATION GUIDE

## Partner Integration Platform - Sprint 2 Implementation

---

## OVERVIEW

Anda akan membangun infrastruktur untuk:
1. **Service Catalog** - 6 domains dengan 24 sub-services (database-driven)
2. **Scope Selection** - Partner memilih layanan yang mereka implementasikan
3. **Dynamic Progress Tracking** - Progress bar otomatis berdasarkan selected scope
4. **Dashboard Update** - Tampilkan hanya layanan yang dipilih

**Status:** Login sudah selesai ✅  
**Target:** Scope selection & service catalog working ✅

---

## STEP 1: DATABASE SETUP (2-3 jam)

### 1.1: Create Drizzle Schema untuk Service Catalog

File: `db/schema.ts` (tambahkan ke existing schema)

```typescript
import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// SERVICE CATALOG TABLES
// ============================================

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // "Balance Inquiry", "Account Linking"
  description: text('description'),
  icon_url: text('icon_url'),
  order_index: integer('order_index').default(0),
  active: boolean('active').default(true),
  created_at: integer('created_at').default(sql`(unixepoch())`),
  updated_at: integer('updated_at'),
});

export const sub_services = sqliteTable('sub_services', {
  id: text('id').primaryKey(),
  service_id: text('service_id').notNull().references(() => services.id),
  name: text('name').notNull(), // "API Balance Service"
  code: text('code').notNull().unique(), // "SS_BALANCE_001"
  description: text('description'),
  order_index: integer('order_index').default(0),
  active: boolean('active').default(true),
  created_at: integer('created_at').default(sql`(unixepoch())`),
  updated_at: integer('updated_at'),
});

// ============================================
// PARTNER SCOPE TABLES
// ============================================

export const partner_scopes = sqliteTable('partner_scopes', {
  id: text('id').primaryKey(),
  partner_id: text('partner_id').notNull().unique().references(() => partners.id),
  
  // JSON: { "sub_service_ids": ["ss_1", "ss_2", "ss_3"] }
  scope_data: text('scope_data').notNull(),
  
  // Kalkulasi
  active_count: integer('active_count').default(0),
  passed_count: integer('passed_count').default(0),
  progress_percentage: text('progress_percentage').default('0.00'),
  
  scope_set_at: integer('scope_set_at'),
  created_at: integer('created_at').default(sql`(unixepoch())`),
  updated_at: integer('updated_at'),
});

export const partner_progress = sqliteTable('partner_progress', {
  id: text('id').primaryKey(),
  partner_id: text('partner_id').notNull().references(() => partners.id),
  sub_service_id: text('sub_service_id').notNull().references(() => sub_services.id),
  
  // Status: pending, track_a_passed, track_b_passed, fully_passed
  track_a_status: text('track_a_status').default('pending'),
  track_b_status: text('track_b_status').default('pending'),
  overall_status: text('overall_status').default('pending'),
  
  track_a_passed_at: integer('track_a_passed_at'),
  track_b_passed_at: integer('track_b_passed_at'),
  
  notes: text('notes'),
  created_at: integer('created_at').default(sql`(unixepoch())`),
  updated_at: integer('updated_at'),
});
```

### 1.2: Create Migration File

```bash
# Generate migration dari schema
npm run db:generate-migration

# File akan dibuat: migrations/0002_service_catalog.sql

# Apply migration ke local database
wrangler d1 execute partner-platform-dev \
  --local \
  --file=./migrations/0002_service_catalog.sql
```

**Verify di database:**

```bash
wrangler d1 execute partner-platform-dev \
  --local \
  --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%service%';"

# Output seharusnya:
# name
# ----
# services
# sub_services
# partner_scopes
# partner_progress
```

---

## STEP 2: SEED SERVICE CATALOG DATA (1-2 jam)

### 2.1: Create Seed Script

File: `db/seed.ts`

```typescript
import { db } from './index';
import { services, sub_services } from './schema';
import { generateId } from '@/lib/utils';

const DOMAINS = [
  {
    name: 'Balance Inquiry',
    description: 'Check account balance services',
    sub_services: [
      { name: 'API Balance Service', code: 'SS_BALANCE_001' }
    ]
  },
  {
    name: 'Account Linking',
    description: 'Account linking and authentication services',
    sub_services: [
      { name: 'API Get Auth/OAuth Code', code: 'SS_LINKING_001' },
      { name: 'API Account Binding', code: 'SS_LINKING_002' },
      { name: 'API Account Unbinding', code: 'SS_LINKING_003' },
      { name: 'API Account Inquiry', code: 'SS_LINKING_004' }
    ]
  },
  {
    name: 'Direct Debit',
    description: 'Direct debit payment services',
    sub_services: [
      { name: 'API Direct Debit Payment', code: 'SS_DEBIT_001' },
      { name: 'API Direct Debit Payment Status', code: 'SS_DEBIT_002' },
      { name: 'API Direct Debit Payment Notification', code: 'SS_DEBIT_003' },
      { name: 'API Direct Debit Payment Cancel', code: 'SS_DEBIT_004' },
      { name: 'API Direct Debit Payment Refund', code: 'SS_DEBIT_005' }
    ]
  },
  {
    name: 'CPM (Customer Presented Mode)',
    description: 'Customer presented payment mode services',
    sub_services: [
      { name: 'API Generate QR CPM', code: 'SS_CPM_001' },
      { name: 'API Query Payment', code: 'SS_CPM_002' },
      { name: 'API Direct Debit Payment Cancel', code: 'SS_CPM_003' },
      { name: 'API Payment Notification', code: 'SS_CPM_004' },
      { name: 'API Refund Payment', code: 'SS_CPM_005' }
    ]
  },
  {
    name: 'MPM (Merchant Presented Mode)',
    description: 'Merchant presented payment mode services',
    sub_services: [
      { name: 'API Generate QR MPM', code: 'SS_MPM_001' },
      { name: 'API Query Payment', code: 'SS_MPM_002' },
      { name: 'API Payment Notification', code: 'SS_MPM_003' },
      { name: 'API Cancel Payment', code: 'SS_MPM_004' },
      { name: 'API Refund Payment', code: 'SS_MPM_005' }
    ]
  },
  {
    name: 'Customer Top Up',
    description: 'Customer account top-up services',
    sub_services: [
      { name: 'API Account Inquiry - Customer Top Up', code: 'SS_TOPUP_001' },
      { name: 'API Customer Top Up', code: 'SS_TOPUP_002' },
      { name: 'API Customer Top Up Inquiry Status', code: 'SS_TOPUP_003' }
    ]
  }
];

export async function seedServiceCatalog() {
  console.log('🌱 Seeding service catalog...');

  try {
    // 1. Seed services (domains)
    for (let i = 0; i < DOMAINS.length; i++) {
      const domain = DOMAINS[i];
      const serviceId = generateId();

      await db.insert(services).values({
        id: serviceId,
        name: domain.name,
        description: domain.description,
        order_index: i,
        active: true,
        created_at: Math.floor(Date.now() / 1000),
      });

      console.log(`✓ Seeded service: ${domain.name}`);

      // 2. Seed sub-services untuk setiap domain
      for (let j = 0; j < domain.sub_services.length; j++) {
        const subService = domain.sub_services[j];

        await db.insert(sub_services).values({
          id: generateId(),
          service_id: serviceId,
          name: subService.name,
          code: subService.code,
          order_index: j,
          active: true,
          created_at: Math.floor(Date.now() / 1000),
        });

        console.log(`  └─ Seeded sub-service: ${subService.name}`);
      }
    }

    console.log('✅ Service catalog seeded successfully!');
    console.log(`📊 Total: 6 domains, 24 sub-services`);

  } catch (error) {
    console.error('❌ Error seeding service catalog:', error);
    throw error;
  }
}

// Run seeding
if (require.main === module) {
  seedServiceCatalog().then(() => process.exit(0)).catch(() => process.exit(1));
}
```

### 2.2: Add Script ke package.json

```json
{
  "scripts": {
    "db:seed": "tsx db/seed.ts",
    "db:seed:prod": "wrangler d1 execute partner-platform-prod --command='SELECT * FROM services;'",
    "db:seed:staging": "wrangler d1 execute partner-platform-staging --command='SELECT * FROM services;'"
  }
}
```

### 2.3: Run Seeding

```bash
# Local development
npm run db:seed

# Output:
# 🌱 Seeding service catalog...
# ✓ Seeded service: Balance Inquiry
#   └─ Seeded sub-service: API Balance Service
# ✓ Seeded service: Account Linking
#   └─ Seeded sub-service: API Get Auth/OAuth Code
#   ... (24 sub-services total)
# ✅ Service catalog seeded successfully!
# 📊 Total: 6 domains, 24 sub-services
```

**Verify di database:**

```bash
wrangler d1 execute partner-platform-dev \
  --local \
  --command="SELECT COUNT(*) as total FROM services;"

# Output: total | 6

wrangler d1 execute partner-platform-dev \
  --local \
  --command="SELECT COUNT(*) as total FROM sub_services;"

# Output: total | 24
```

---

## STEP 3: BACKEND APIS (3-4 jam)

### 3.1: Create Service Repository

File: `repositories/ServiceRepository.ts`

```typescript
import { db } from '@/db';
import { services, sub_services } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class ServiceRepository {
  // Get semua services dengan sub-services
  async getAllServices() {
    const allServices = await db.query.services.findMany({
      where: (service) => eq(service.active, true),
      with: {
        sub_services: {
          where: (ss) => eq(ss.active, true),
        }
      },
      orderBy: (service) => service.order_index,
    });

    return allServices;
  }

  // Get single service
  async getServiceById(serviceId: string) {
    const service = await db.query.services.findFirst({
      where: (s) => eq(s.id, serviceId),
      with: {
        sub_services: {
          where: (ss) => eq(ss.active, true),
        }
      }
    });

    return service;
  }

  // Get all sub-services
  async getAllSubServices() {
    const subServices = await db.query.sub_services.findMany({
      where: (ss) => eq(ss.active, true),
      orderBy: (ss) => ss.order_index,
    });

    return subServices;
  }

  // Get sub-service by ID
  async getSubServiceById(subServiceId: string) {
    const subService = await db.query.sub_services.findFirst({
      where: (ss) => eq(ss.id, subServiceId),
    });

    return subService;
  }
}

export const serviceRepository = new ServiceRepository();
```

### 3.2: Create Scope Service

File: `services/ScopeService.ts`

```typescript
import { db } from '@/db';
import { partner_scopes, partner_progress, sub_services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

interface ScopeData {
  sub_service_ids: string[];
}

export class ScopeService {
  // Partner memilih scope
  async setPartnerScope(partnerId: string, subServiceIds: string[]) {
    // 1. Validate sub-service IDs exist
    const selectedServices = await db.query.sub_services.findMany({
      where: (ss) => {
        const ids = subServiceIds;
        // Using raw SQL untuk IN clause
        return sql`${ss.id} IN (${ids})`;
      }
    });

    if (selectedServices.length !== subServiceIds.length) {
      throw new Error('Invalid sub-service IDs');
    }

    // 2. Delete existing scope (jika ada)
    await db.delete(partner_scopes)
      .where(eq(partner_scopes.partner_id, partnerId));

    // 3. Create new scope
    const scopeData: ScopeData = { sub_service_ids: subServiceIds };
    
    const scope = await db.insert(partner_scopes).values({
      id: generateId(),
      partner_id: partnerId,
      scope_data: JSON.stringify(scopeData),
      active_count: subServiceIds.length,
      passed_count: 0,
      progress_percentage: '0.00',
      scope_set_at: Math.floor(Date.now() / 1000),
      created_at: Math.floor(Date.now() / 1000),
    }).returning();

    // 4. Initialize partner_progress untuk setiap sub-service
    for (const subServiceId of subServiceIds) {
      await db.insert(partner_progress).values({
        id: generateId(),
        partner_id: partnerId,
        sub_service_id: subServiceId,
        track_a_status: 'pending',
        track_b_status: 'pending',
        overall_status: 'pending',
        created_at: Math.floor(Date.now() / 1000),
      }).onConflictDoNothing(); // Jika sudah ada, skip
    }

    return scope[0];
  }

  // Get partner scope
  async getPartnerScope(partnerId: string) {
    const scope = await db.query.partner_scopes.findFirst({
      where: eq(partner_scopes.partner_id, partnerId),
    });

    if (!scope) {
      return null;
    }

    // Parse JSON
    const scopeData: ScopeData = JSON.parse(scope.scope_data);

    // Get sub-service details
    const subServices = await db.query.sub_services.findMany({
      where: (ss) => {
        return inArray(ss.id, scopeData.sub_service_ids);
      },
      with: {
        service: true, // Get parent service
      }
    });

    return {
      ...scope,
      sub_service_ids: scopeData.sub_service_ids,
      sub_services: subServices,
    };
  }

  // Calculate progress
  async calculatePartnerProgress(partnerId: string) {
    const scope = await this.getPartnerScope(partnerId);

    if (!scope) {
      return null;
    }

    // Count passed sub-services
    const passedCount = await db.query.partner_progress.findMany({
      where: (pp) => {
        return and(
          eq(pp.partner_id, partnerId),
          eq(pp.overall_status, 'fully_passed')
        );
      }
    });

    const totalActive = scope.active_count;
    const passed = passedCount.length;

    // Kalkulasi percentage
    const percentage = totalActive > 0 
      ? ((passed / totalActive) * 100).toFixed(2) 
      : '0.00';

    // Update scope
    await db.update(partner_scopes)
      .set({
        passed_count: passed,
        progress_percentage: percentage,
        updated_at: Math.floor(Date.now() / 1000),
      })
      .where(eq(partner_scopes.partner_id, partnerId));

    return {
      total_active: totalActive,
      passed_count: passed,
      progress_percentage: parseFloat(percentage),
    };
  }

  // Check if scope is complete (100%)
  async isScopeComplete(partnerId: string): Promise<boolean> {
    const progress = await this.calculatePartnerProgress(partnerId);
    
    if (!progress) {
      return false;
    }

    return progress.progress_percentage === 100;
  }
}

export const scopeService = new ScopeService();
```

### 3.3: Create API Endpoints

**File: `app/api/services/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { serviceRepository } from '@/repositories/ServiceRepository';
import { handleApiError } from '@/lib/error-handling';

export async function GET(request: NextRequest) {
  try {
    const services = await serviceRepository.getAllServices();

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

**File: `app/api/scope/select/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { scopeService } from '@/services/ScopeService';
import { getUserFromSession } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handling';

interface SelectScopeRequest {
  sub_service_ids: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const user = await getUserFromSession(request);

    if (!user || !user.partner_id) {
      return NextResponse.json({
        success: false,
        error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' }
      }, { status: 401 });
    }

    // Get request body
    const body: SelectScopeRequest = await request.json();

    // Validate
    if (!body.sub_service_ids || body.sub_service_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'sub_service_ids is required and must not be empty'
        }
      }, { status: 400 });
    }

    // Set scope
    const scope = await scopeService.setPartnerScope(
      user.partner_id,
      body.sub_service_ids
    );

    // Calculate progress
    const progress = await scopeService.calculatePartnerProgress(user.partner_id);

    return NextResponse.json({
      success: true,
      data: {
        scope_id: scope.id,
        sub_service_ids: body.sub_service_ids,
        active_count: scope.active_count,
        passed_count: scope.passed_count,
        progress_percentage: parseFloat(scope.progress_percentage),
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
```

**File: `app/api/scope/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { scopeService } from '@/services/ScopeService';
import { getUserFromSession } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handling';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const user = await getUserFromSession(request);

    if (!user || !user.partner_id) {
      return NextResponse.json({
        success: false,
        error: { code: 'AUTH_REQUIRED', message: 'Not authenticated' }
      }, { status: 401 });
    }

    // Get scope
    const scope = await scopeService.getPartnerScope(user.partner_id);

    if (!scope) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Partner has not selected scope yet'
      });
    }

    // Calculate progress
    const progress = await scopeService.calculatePartnerProgress(user.partner_id);

    return NextResponse.json({
      success: true,
      data: {
        scope_id: scope.id,
        sub_service_ids: scope.sub_service_ids,
        active_count: scope.active_count,
        passed_count: scope.passed_count,
        progress_percentage: parseFloat(scope.progress_percentage),
        sub_services: scope.sub_services.map(ss => ({
          id: ss.id,
          name: ss.name,
          code: ss.code,
          service_name: ss.service.name,
        }))
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## STEP 4: FRONTEND COMPONENTS (3-4 jam)

### 4.1: Create Scope Selection Page

**File: `app/(partner)/onboarding/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Service {
  id: string;
  name: string;
  description?: string;
  sub_services: SubService[];
}

interface SubService {
  id: string;
  name: string;
  code: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSubServices, setSelectedSubServices] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch('/api/services');
        const result = await response.json();

        if (result.success) {
          setServices(result.data);
        } else {
          setError('Failed to load services');
        }
      } catch (err) {
        setError('Error loading services');
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  // Handle checkbox change
  const handleToggleSubService = (subServiceId: string) => {
    const newSelected = new Set(selectedSubServices);
    if (newSelected.has(subServiceId)) {
      newSelected.delete(subServiceId);
    } else {
      newSelected.add(subServiceId);
    }
    setSelectedSubServices(newSelected);
  };

  // Submit scope selection
  const handleSubmitScope = async () => {
    if (selectedSubServices.size === 0) {
      setError('Please select at least one service');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/scope/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_service_ids: Array.from(selectedSubServices),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Redirect ke dashboard
        router.push('/dashboard');
      } else {
        setError(result.error?.message || 'Failed to save scope');
      }
    } catch (err) {
      setError('Error saving scope');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading services...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Implementation Scope</CardTitle>
          <CardDescription>
            Choose which services you will be implementing. 
            You can update this later from your dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Service Selection */}
          <div className="space-y-6">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">{service.name}</h3>
                
                {/* Sub-services */}
                <div className="space-y-3 ml-4">
                  {service.sub_services.map((subService) => (
                    <label
                      key={subService.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedSubServices.has(subService.id)}
                        onCheckedChange={() =>
                          handleToggleSubService(subService.id)
                        }
                      />
                      <div className="flex-1">
                        <p className="font-medium">{subService.name}</p>
                        <p className="text-sm text-gray-500">{subService.code}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selection Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm">
              <strong>Selected Services:</strong> {selectedSubServices.size} / 24
            </p>
            <p className="text-xs text-gray-600 mt-1">
              You must implement all selected services to complete certification.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmitScope}
              disabled={submitting || selectedSubServices.size === 0}
              className="flex-1"
            >
              {submitting ? 'Saving...' : `Confirm Selection (${selectedSubServices.size})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4.2: Update Dashboard Component

**File: `app/(partner)/dashboard/page.tsx` (update existing)**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface PartnerScope {
  scope_id: string;
  active_count: number;
  passed_count: number;
  progress_percentage: number;
  sub_services: {
    id: string;
    name: string;
    service_name: string;
  }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState<PartnerScope | null>(null);
  const [loading, setLoading] = useState(true);

  // Load partner scope
  useEffect(() => {
    async function loadScope() {
      try {
        const response = await fetch('/api/scope');
        const result = await response.json();

        if (result.success && result.data) {
          setScope(result.data);
        }
      } catch (error) {
        console.error('Error loading scope:', error);
      } finally {
        setLoading(false);
      }
    }

    loadScope();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  // Jika belum pilih scope, arahkan ke onboarding
  if (!scope) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4">Please select your implementation scope first.</p>
            <Button asChild>
              <a href="/onboarding">Go to Onboarding</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group sub-services by domain
  const groupedByDomain = scope.sub_services.reduce((acc, ss) => {
    const domain = ss.service_name;
    if (!acc[domain]) {
      acc[domain] = [];
    }
    acc[domain].push(ss);
    return acc;
  }, {} as Record<string, typeof scope.sub_services>);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{scope.progress_percentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={scope.progress_percentage} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Completed Services</p>
              <p className="text-2xl font-bold">{scope.passed_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total in Scope</p>
              <p className="text-2xl font-bold">{scope.active_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services by Domain */}
      <div className="space-y-4">
        {Object.entries(groupedByDomain).map(([domain, services]) => (
          <Card key={domain}>
            <CardHeader>
              <CardTitle className="text-base">{domain}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.id} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm">{service.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button (enabled when 100%) */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <Button
            disabled={scope.progress_percentage !== 100}
            className="w-full"
          >
            {scope.progress_percentage === 100
              ? 'Submit for Certification'
              : `Complete ${scope.active_count - scope.passed_count} more services to submit`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## STEP 5: TESTING (2-3 jam)

### 5.1: Test Locally

```bash
# 1. Start development server
npm run dev

# 2. Login dengan test account
# URL: http://localhost:3000/login
# Email: test@example.com (dari login phase sebelumnya)

# 3. Test scope selection
# URL: http://localhost:3000/onboarding
# - Select 5 services (mix dari berbagai domain)
# - Click "Confirm Selection"

# 4. Verify database
wrangler d1 execute partner-platform-dev \
  --local \
  --command="SELECT partner_id, active_count, progress_percentage FROM partner_scopes;"

# Output:
# partner_id | active_count | progress_percentage
# p_123      | 5            | 0.00

# 5. Check dashboard
# URL: http://localhost:3000/dashboard
# - Should show selected services
# - Progress bar at 0%
```

### 5.2: Test API via curl

```bash
# 1. Get services
curl http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# 2. Select scope
curl -X POST http://localhost:3000/api/scope/select \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sub_service_ids": ["ss_1", "ss_2", "ss_3"]
  }'

# 3. Get scope
curl http://localhost:3000/api/scope \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

---

## STEP 6: DEPLOY TO STAGING (1 jam)

```bash
# 1. Push ke GitHub
git add .
git commit -m "feat: Add scope selection and service catalog

- Seeded 6 domains with 24 sub-services
- Partner can select implementation scope
- Dynamic progress calculation
- Dashboard shows selected services"

git push origin main

# 2. Cloudflare Pages otomatis deploy

# 3. Run migrations di staging D1
wrangler d1 execute partner-platform-staging \
  --file=./migrations/0002_service_catalog.sql \
  --env staging

# 4. Seed staging database
ENVIRONMENT=staging npm run db:seed

# 5. Test di staging
# URL: https://staging.partner-integration.com/onboarding
```

---

## CHECKLIST FASE 2

- [ ] Database schema created (services, sub_services, partner_scopes, partner_progress)
- [ ] Service catalog seeded (6 domains, 24 sub-services)
- [ ] ScopeService implemented (select scope, calculate progress)
- [ ] API endpoints created (/api/services, /api/scope/select, /api/scope)
- [ ] Onboarding page UI built
- [ ] Dashboard updated with scope selection
- [ ] Local testing complete
- [ ] Staging deployment done
- [ ] Progress calculation working correctly

---

## NEXT STEPS (Fase 3)

Setelah Fase 2 selesai, lanjut ke:

1. **Scenarios & Test Cases** - Definisikan test cases untuk setiap sub-service
2. **Validation Rules** - Define rules untuk Track A & B
3. **Track A Implementation** - PDF upload & validation
4. **Track B Implementation** - API testing interface

Apakah Anda siap mulai implementasi Fase 2? Ada bagian yang perlu dijelaskan lebih detail?

