const documents = [
  { id: 1, name: 'XYZ_ISO27001_Certificate.pdf', category: 'Certification', supplier: 'XYZ Corporation', uploaded: 'Feb 20, 2026', expiry: 'Feb 20, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 2, name: 'ABC_SOC2_Report_2025.pdf', category: 'Compliance Report', supplier: 'ABC Services Ltd', uploaded: 'Jan 15, 2026', expiry: 'Jan 15, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 3, name: 'DEF_Privacy_Policy.docx', category: 'Policy', supplier: 'DEF Limited', uploaded: 'Feb 27, 2026', expiry: '\u2014', aiStatus: 'Processing', aiColor: '#F59E0B' },
  { id: 4, name: 'GHI_Pentest_Report_Q4.pdf', category: 'Security Report', supplier: 'GHI Technologies', uploaded: 'Nov 10, 2025', expiry: '\u2014', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 5, name: 'JKL_GDPR_DPA.pdf', category: 'DPA / Contract', supplier: 'JKL Consultancy', uploaded: 'Feb 01, 2026', expiry: 'Dec 31, 2027', aiStatus: 'Failed', aiColor: '#EF4444' },
];

const aiResponses: Record<string, string> = {
  default: 'Based on the indexed documents, I found relevant information. XYZ Corporation holds a valid ISO 27001 certificate expiring Feb 2027. ABC Services Ltd has a SOC 2 Type II report from 2025.',
  iso: "XYZ Corporation's ISO 27001 certificate was issued Feb 20, 2026 and expires Feb 20, 2027. The certificate covers information security management for cloud services. Citation: XYZ_ISO27001_Certificate.pdf",
  soc: "ABC Services Ltd's SOC 2 report (2025) covers Trust Services Criteria: Security, Availability, and Confidentiality. No exceptions were noted. Citation: ABC_SOC2_Report_2025.pdf",
  gdpr: "JKL Consultancy's GDPR Data Processing Agreement is active through Dec 31, 2027. Note: The document failed to index \u2014 manual review recommended. Citation: JKL_GDPR_DPA.pdf",
};

const categoryColors: Record<string, [string, string]> = {
  Certification: ['#EFF6FF', '#0EA5E9'],
  'Compliance Report': ['#ECFDF5', '#10B981'],
  Policy: ['#F5F3FF', '#8B5CF6'],
  'Security Report': ['#FEF2F2', '#EF4444'],
  'DPA / Contract': ['#FFFBEB', '#F59E0B'],
};

export function getDocuments() {
  return documents;
}

export function getAiResponses() {
  return aiResponses;
}

export function getCategoryColors() {
  return categoryColors;
}
