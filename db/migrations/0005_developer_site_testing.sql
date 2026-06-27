CREATE TABLE track_a_documents (  
  id TEXT PRIMARY KEY,  
  partner_user_id TEXT NOT NULL,  
  service_id TEXT NOT NULL,  
  sub_service_id TEXT NOT NULL,  
  case_type TEXT NOT NULL CHECK (case_type IN ('positive', 'negative')),  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (  
    status IN ('draft', 'uploaded', 'validated', 'waiting_sync', 'synced', 'archived')  
  ),  
  file_name TEXT NOT NULL,  
  mime_type TEXT NOT NULL,  
  file_size INTEGER NOT NULL,  
  uploaded_at INTEGER,  
  synced_at INTEGER,  
  synced_to_drive INTEGER NOT NULL DEFAULT 0,  
  drive_file_id TEXT,  
  created_at INTEGER NOT NULL,  
  updated_at INTEGER NOT NULL,  
  FOREIGN KEY (partner_user_id) REFERENCES user(id) ON DELETE CASCADE,  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,  
  FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE  
);  
  
CREATE TABLE track_a_document_contents (  
  id TEXT PRIMARY KEY,  
  document_id TEXT NOT NULL UNIQUE,  
  base64_content TEXT NOT NULL,  
  created_at INTEGER NOT NULL,  
  FOREIGN KEY (document_id) REFERENCES track_a_documents(id) ON DELETE CASCADE  
);  
  
CREATE UNIQUE INDEX idx_track_a_documents_unique_case  
ON track_a_documents (partner_user_id, sub_service_id, case_type);