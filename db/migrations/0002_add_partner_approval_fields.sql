ALTER TABLE user ADD COLUMN approved_at INTEGER;  
ALTER TABLE user ADD COLUMN approved_by TEXT;  
ALTER TABLE user ADD COLUMN rejected_at INTEGER;  
ALTER TABLE user ADD COLUMN rejected_by TEXT;  
ALTER TABLE user ADD COLUMN rejection_reason TEXT;