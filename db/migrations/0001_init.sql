CREATE TABLE partners (  
  id TEXT PRIMARY KEY,  
  email TEXT NOT NULL UNIQUE,  
  name TEXT NOT NULL,  
  company_name TEXT,  
  status TEXT NOT NULL DEFAULT 'pending',  
  approved_at TEXT,  
  approved_by TEXT,  
  rejected_at TEXT,  
  rejected_by TEXT,  
  rejection_reason TEXT,  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,  
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP  
);