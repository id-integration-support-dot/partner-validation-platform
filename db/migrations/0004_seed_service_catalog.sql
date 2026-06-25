INSERT INTO services (id, name, description, icon_url, order_index, active, created_at, updated_at) VALUES  
('svc_balance', 'Balance Inquiry', 'Check account balance services', NULL, 1, 1, unixepoch(), unixepoch()),  
('svc_linking', 'Account Linking', 'Account linking and authentication services', NULL, 2, 1, unixepoch(), unixepoch()),  
('svc_debit', 'Direct Debit', 'Direct debit payment services', NULL, 3, 1, unixepoch(), unixepoch()),  
('svc_cpm', 'CPM (Customer Presented Mode)', 'Customer presented payment mode services', NULL, 4, 1, unixepoch(), unixepoch()),  
('svc_mpm', 'MPM (Merchant Presented Mode)', 'Merchant presented payment mode services', NULL, 5, 1, unixepoch(), unixepoch()),  
('svc_topup', 'Customer Top Up', 'Customer account top-up services', NULL, 6, 1, unixepoch(), unixepoch());  
  
INSERT INTO sub_services (id, service_id, name, code, description, order_index, active, created_at, updated_at) VALUES  
('ss_balance_001', 'svc_balance', 'API Balance Service', 'SS_BALANCE_001', NULL, 1, 1, unixepoch(), unixepoch()),  
  
('ss_linking_001', 'svc_linking', 'API Get Auth/OAuth Code', 'SS_LINKING_001', NULL, 1, 1, unixepoch(), unixepoch()),  
('ss_linking_002', 'svc_linking', 'API Account Binding', 'SS_LINKING_002', NULL, 2, 1, unixepoch(), unixepoch()),  
('ss_linking_003', 'svc_linking', 'API Account Unbinding', 'SS_LINKING_003', NULL, 3, 1, unixepoch(), unixepoch()),  
('ss_linking_004', 'svc_linking', 'API Account Inquiry', 'SS_LINKING_004', NULL, 4, 1, unixepoch(), unixepoch()),  
  
('ss_debit_001', 'svc_debit', 'API Direct Debit Payment', 'SS_DEBIT_001', NULL, 1, 1, unixepoch(), unixepoch()),  
('ss_debit_002', 'svc_debit', 'API Direct Debit Payment Status', 'SS_DEBIT_002', NULL, 2, 1, unixepoch(), unixepoch()),  
('ss_debit_003', 'svc_debit', 'API Direct Debit Payment Notification', 'SS_DEBIT_003', NULL, 3, 1, unixepoch(), unixepoch()),  
('ss_debit_004', 'svc_debit', 'API Direct Debit Payment Cancel', 'SS_DEBIT_004', NULL, 4, 1, unixepoch(), unixepoch()),  
('ss_debit_005', 'svc_debit', 'API Direct Debit Payment Refund', 'SS_DEBIT_005', NULL, 5, 1, unixepoch(), unixepoch()),  
  
('ss_cpm_001', 'svc_cpm', 'API Generate QR CPM', 'SS_CPM_001', NULL, 1, 1, unixepoch(), unixepoch()),  
('ss_cpm_002', 'svc_cpm', 'API Query Payment', 'SS_CPM_002', NULL, 2, 1, unixepoch(), unixepoch()),  
('ss_cpm_003', 'svc_cpm', 'API Direct Debit Payment Cancel', 'SS_CPM_003', NULL, 3, 1, unixepoch(), unixepoch()),  
('ss_cpm_004', 'svc_cpm', 'API Payment Notification', 'SS_CPM_004', NULL, 4, 1, unixepoch(), unixepoch()),  
('ss_cpm_005', 'svc_cpm', 'API Refund Payment', 'SS_CPM_005', NULL, 5, 1, unixepoch(), unixepoch()),  
  
('ss_mpm_001', 'svc_mpm', 'API Generate QR MPM', 'SS_MPM_001', NULL, 1, 1, unixepoch(), unixepoch()),  
('ss_mpm_002', 'svc_mpm', 'API Query Payment', 'SS_MPM_002', NULL, 2, 1, unixepoch(), unixepoch()),  
('ss_mpm_003', 'svc_mpm', 'API Payment Notification', 'SS_MPM_003', NULL, 3, 1, unixepoch(), unixepoch()),  
('ss_mpm_004', 'svc_mpm', 'API Cancel Payment', 'SS_MPM_004', NULL, 4, 1, unixepoch(), unixepoch()),  
('ss_mpm_005', 'svc_mpm', 'API Refund Payment', 'SS_MPM_005', NULL, 5, 1, unixepoch(), unixepoch()),  
  
('ss_topup_001', 'svc_topup', 'API Account Inquiry - Customer Top Up', 'SS_TOPUP_001', NULL, 1, 1, unixepoch(), unixepoch()),  
('ss_topup_002', 'svc_topup', 'API Customer Top Up', 'SS_TOPUP_002', NULL, 2, 1, unixepoch(), unixepoch()),  
('ss_topup_003', 'svc_topup', 'API Customer Top Up Inquiry Status', 'SS_TOPUP_003', NULL, 3, 1, unixepoch(), unixepoch());