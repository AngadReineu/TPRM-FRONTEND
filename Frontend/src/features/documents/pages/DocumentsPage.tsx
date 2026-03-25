import { useState, useEffect } from 'react';
import { Upload, Search, FileText, Download, Trash2, Eye, X, Loader2, File } from 'lucide-react';
import { api } from '../../../lib/api';
import { toCamelCase } from '../../../lib/apiUtils';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';

interface Control {
  id: string;
  name: string;
}

interface Document {
  id: string;
  controlId: string;
  filename: string;
  docType: string;
  uploadedAt: string;
  fileSize: number;
}

const DOC_TYPES = ['SOW', 'PO', 'Invoice', 'SLA', 'Contract', 'NDA', 'DPA', 'Other'];

export function DocumentsPage() {
  const navigate = useNavigate();
  const [controls, setControls] = useState<Control[]>([]);
  const [documents, setDocuments] = useState<(Document & { controlName: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterControl, setFilterControl] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest first');
  
  // Upload Modal State
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState(DOC_TYPES[0]);
  const [uploadControlId, setUploadControlId] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch controls
      const data = await api.get<unknown[]>('/controls');
      const loadedControls = toCamelCase<Control[]>(data);
      setControls(loadedControls);
      
      // 2. Fetch documents for each control
      let allDocs: (Document & { controlName: string })[] = [];
      
      await Promise.all(loadedControls.map(async (c) => {
        try {
          const docsData = await api.get<unknown[]>(`/controls/${c.id}/documents`);
          const docs = toCamelCase<Document[]>(docsData);
          allDocs = [...allDocs, ...docs.map(d => ({ ...d, controlName: c.name }))];
        } catch (err) {
          console.error(`Failed to fetch documents for control ${c.id}`);
        }
      }));
      
      setDocuments(allDocs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string, controlId: string) => {
    try {
      await api.delete(`/controls/${controlId}/documents/${docId}`);
      toast.success('Document deleted');
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setDeletingId(null);
    } catch (err) {
      toast.error('Failed to delete document');
      console.error(err);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadControlId) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('doc_type', uploadDocType);
    const token = useAuthStore.getState().token;
    
    try {
      const result = await fetch(`http://localhost:8000/api/controls/${uploadControlId}/documents`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData
      });
      if (!result.ok) throw new Error('Upload failed');
      
      toast.success('Document uploaded successfully');
      setShowUpload(false);
      setUploadFile(null);
      setUploadDocType(DOC_TYPES[0]);
      setUploadControlId('');
      fetchData(); // reload
    } catch (err) {
      toast.error('Failed to upload document');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Filtering & Sorting
  const filteredDocs = documents.filter(d => {
    if (search && !d.filename.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && d.docType !== filterType) return false;
    if (filterControl !== 'All' && d.controlId !== filterControl) return false;
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'Name A-Z') return a.filename.localeCompare(b.filename);
    const timeA = new Date(a.uploadedAt).getTime();
    const timeB = new Date(b.uploadedAt).getTime();
    return sortOrder === 'Newest first' ? timeB - timeA : timeA - timeB;
  });

  const getDocBadge = (type: string) => {
    const cfgs: any = {
      SOW: { bg: '#EFF6FF', col: '#0EA5E9' },
      PO: { bg: '#ECFDF5', col: '#10B981' },
      Invoice: { bg: '#FFFBEB', col: '#F59E0B' },
      SLA: { bg: '#F5F3FF', col: '#8B5CF6' },
      Contract: { bg: '#F1F5F9', col: '#64748B' },
      NDA: { bg: '#FEF2F2', col: '#EF4444' },
      DPA: { bg: '#F0FDFA', col: '#14B8A6' },
      Other: { bg: '#F8FAFC', col: '#94A3B8' }
    };
    const c = cfgs[type] || cfgs.Other;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px]" style={{ backgroundColor: c.bg, color: c.col }}>{type}</span>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Document Library</h1>
          <p className="text-sm text-slate-500 mt-1">Reference documents uploaded per control — used by agents for comparison</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="bg-sky-500 text-white border-none rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600 flex items-center gap-2">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex-wrap">
        <div className="flex-1 relative min-w-[200px]">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-md outline-none" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none bg-white text-slate-700 min-w-[120px]">
          <option value="All">All Types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterControl} onChange={e => setFilterControl(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none bg-white text-slate-700 min-w-[160px]">
          <option value="All">All Controls</option>
          {controls.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-md outline-none bg-white text-slate-700 min-w-[140px]">
          <option>Newest first</option>
          <option>Oldest first</option>
          <option>Name A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="text-sky-500 animate-spin" /></div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border text-center border-slate-200 rounded-xl py-16 px-4">
          <File size={48} className="mx-auto text-slate-200 mb-3" />
          <div className="text-lg font-bold text-slate-700">No documents found</div>
          <p className="text-sm text-slate-500 mb-4">Upload a document to provide reference material for your agents.</p>
          <button onClick={() => setShowUpload(true)} className="bg-sky-50 text-sky-600 border border-sky-100 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-100 flex items-center gap-2 mx-auto">
            <Upload size={16} /> Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-4 flex-1">
                <div className="flex gap-3 mb-2">
                  <FileText size={24} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 truncate" title={doc.filename}>{doc.filename}</div>
                    <div className="mt-1.5">{getDocBadge(doc.docType)}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-slate-700">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium text-slate-700">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between items-center mt-1">
                    <span>Control:</span>
                    <span onClick={() => navigate(`/controls/${doc.controlId}`)} className="font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded cursor-pointer hover:bg-sky-100 truncate max-w-[120px] text-right" title={doc.controlName}>{doc.controlName}</span>
                  </div>
                </div>
              </div>
              
              {deletingId === doc.id ? (
                <div className="bg-red-50 p-3 border-t border-red-100 flex flex-col gap-2">
                  <span className="text-xs text-red-700 font-semibold text-center">This document will be removed from {doc.controlName}. Are you sure?</span>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleDelete(doc.id, doc.controlId)} className="bg-red-500 text-white px-3 py-1.5 text-xs rounded font-bold border-none cursor-pointer">Yes, delete</button>
                    <button onClick={() => setDeletingId(null)} className="bg-white text-slate-500 px-3 py-1.5 text-xs rounded font-bold border border-slate-200 cursor-pointer hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex border-t border-slate-100 bg-slate-50">
                  <a href={`http://localhost:8000/api/controls/${doc.controlId}/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center py-2.5 text-slate-600 hover:text-sky-500 hover:bg-sky-50 transition-colors border-r border-slate-200 cursor-pointer">
                    <Eye size={16} />
                  </a>
                  <a href={`http://localhost:8000/api/controls/${doc.controlId}/documents/${doc.id}/download`} download className="flex-1 flex justify-center py-2.5 text-slate-600 hover:text-emerald-500 hover:bg-emerald-50 transition-colors border-r border-slate-200 cursor-pointer">
                    <Download size={16} />
                  </a>
                  <button onClick={() => setDeletingId(doc.id)} className="flex-1 flex justify-center py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-[450px] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 m-0">Upload Document</h2>
              <button onClick={() => setShowUpload(false)} className="bg-transparent border-none text-slate-400 hover:text-slate-600 cursor-pointer p-1"><X size={18} /></button>
            </div>
            <div className="p-5 flex flex-col gap-5">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Control</label>
                <select value={uploadControlId} onChange={e => setUploadControlId(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none text-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                  <option value="" disabled>Select a control...</option>
                  {controls.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">The agent assigned to this control will use this document as the reference file for comparison</div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Type</label>
                <select value={uploadDocType} onChange={e => setUploadDocType(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none text-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">PDF File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 text-center relative hover:bg-slate-100 transition-colors">
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText size={20} className="text-red-500" />
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[250px]">{uploadFile.name}</span>
                      <button onClick={(e) => { e.preventDefault(); setUploadFile(null); }} className="ml-2 text-slate-400 bg-transparent border-none cursor-pointer hover:text-red-500 flex items-center justify-center"><X size={16} /></button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} className="mx-auto text-sky-500 mb-2" />
                      <div className="text-[13px] font-semibold text-slate-600 mb-1 pointer-events-none">Drag & drop or click to upload</div>
                      <input type="file" accept=".pdf,application/pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                            toast.error('Only PDF files allowed');
                            return;
                          }
                          setUploadFile(file);
                        }
                      }} />
                    </>
                  )}
                </div>
              </div>
              
            </div>
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
              <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 bg-white rounded-lg cursor-pointer hover:bg-slate-100">Cancel</button>
              <button disabled={!uploadFile || !uploadControlId || uploading} onClick={handleUploadSubmit} className="px-5 py-2 text-sm border-none font-semibold text-white bg-sky-500 rounded-lg cursor-pointer hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
