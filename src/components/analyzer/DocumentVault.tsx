import { FileText, Search } from 'lucide-react';
import { useState } from 'react';
import { useAnalyzerStore } from '@/lib/analyzer/store';

export function DocumentVault() {
  const documents = useAnalyzerStore(s => s.getDocuments());
  const [search, setSearch] = useState('');

  const filtered = documents.filter(doc => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      doc.uploaded_filename.toLowerCase().includes(q) ||
      (doc.form_type || '').toLowerCase().includes(q) ||
      (doc.form_year || '').includes(q) ||
      (doc.raw_text || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents by keyword, type, year..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {documents.length === 0
            ? 'No documents uploaded yet. Upload 1095 forms or other PDF documents.'
            : 'No documents match the search.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <FileText size={20} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-200 truncate">{doc.uploaded_filename}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    {doc.form_type && (
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {doc.form_type}
                      </span>
                    )}
                    {doc.form_year && (
                      <span className="text-xs text-gray-400">Year: {doc.form_year}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      Uploaded {new Date(doc.parsed_at).toLocaleDateString()}
                    </span>
                  </div>
                  {doc.form_fields && Object.keys(doc.form_fields).length > 0 && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(doc.form_fields).map(([key, val]) => (
                        <p key={key} className="text-xs text-gray-400">
                          <span className="text-gray-500">{key}:</span> {val}
                        </p>
                      ))}
                    </div>
                  )}
                  {doc.warnings.length > 0 && (
                    <div className="mt-2">
                      {doc.warnings.map((w, i) => (
                        <p key={i} className="text-xs text-amber-400/80">{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
