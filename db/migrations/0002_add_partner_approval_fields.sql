ALTER TABLE partners ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';  
ALTER TABLE partners ADD COLUMN approved_at TEXT;  
ALTER TABLE partners ADD COLUMN approved_by TEXT;  
ALTER TABLE partners ADD COLUMN rejected_at TEXT;  
ALTER TABLE partners ADD COLUMN rejected_by TEXT;  
ALTER TABLE partners ADD COLUMN rejection_reason TEXT;