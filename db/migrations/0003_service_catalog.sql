CREATE TABLE services (  
  id TEXT PRIMARY KEY,  
  name TEXT NOT NULL UNIQUE,  
  description TEXT,  
  icon_url TEXT,  
  order_index INTEGER NOT NULL DEFAULT 0,  
  active INTEGER NOT NULL DEFAULT 1,  
  created_at INTEGER NOT NULL,  
  updated_at INTEGER NOT NULL  
);  
  
CREATE TABLE sub_services (  
  id TEXT PRIMARY KEY,  
  service_id TEXT NOT NULL,  
  name TEXT NOT NULL,  
  code TEXT NOT NULL UNIQUE,  
  description TEXT,  
  order_index INTEGER NOT NULL DEFAULT 0,  
  active INTEGER NOT NULL DEFAULT 1,  
  created_at INTEGER NOT NULL,  
  updated_at INTEGER NOT NULL,  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE  
);  
  
CREATE TABLE partner_scopes (  
  id TEXT PRIMARY KEY,  
  partner_user_id TEXT NOT NULL UNIQUE,  
  scope_data TEXT NOT NULL,  
  active_count INTEGER NOT NULL DEFAULT 0,  
  passed_count INTEGER NOT NULL DEFAULT 0,  
  progress_percentage TEXT NOT NULL DEFAULT '0.00',  
  scope_set_at INTEGER,  
  created_at INTEGER NOT NULL,  
  updated_at INTEGER NOT NULL,  
  FOREIGN KEY (partner_user_id) REFERENCES user(id) ON DELETE CASCADE  
);  
  
CREATE TABLE partner_progress (  
  id TEXT PRIMARY KEY,  
  partner_user_id TEXT NOT NULL,  
  sub_service_id TEXT NOT NULL,  
  track_a_status TEXT NOT NULL DEFAULT 'pending',  
  track_b_status TEXT NOT NULL DEFAULT 'pending',  
  overall_status TEXT NOT NULL DEFAULT 'pending',  
  track_a_passed_at INTEGER,  
  track_b_passed_at INTEGER,  
  notes TEXT,  
  created_at INTEGER NOT NULL,  
  updated_at INTEGER NOT NULL,  
  FOREIGN KEY (partner_user_id) REFERENCES user(id) ON DELETE CASCADE,  
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE  
);