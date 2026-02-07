import { useState } from 'react';
import { Plus, Trash2, FolderOpen, ChevronDown } from 'lucide-react';
import { useAnalyzerStore } from '@/lib/analyzer/store';

export function ProjectSelector() {
  const projects = useAnalyzerStore(s => s.projects);
  const activeProjectId = useAnalyzerStore(s => s.activeProjectId);
  const createProject = useAnalyzerStore(s => s.createProject);
  const setActiveProject = useAnalyzerStore(s => s.setActiveProject);
  const deleteProject = useAnalyzerStore(s => s.deleteProject);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim());
    setNewName('');
    setShowNew(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-200 hover:bg-gray-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FolderOpen size={14} className="text-blue-400 flex-shrink-0" />
              <span className="truncate">
                {activeProject?.name || 'Select a project'}
              </span>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
              {projects.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                    p.id === activeProjectId
                      ? 'bg-blue-600/20 text-blue-300'
                      : 'hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <span
                    className="flex-1 truncate text-sm"
                    onClick={() => { setActiveProject(p.id); setShowDropdown(false); }}
                  >
                    {p.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete project "${p.name}" and all its data?`)) {
                        deleteProject(p.id);
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 ml-2 flex-shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-500">No projects yet</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex-shrink-0"
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {showNew && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g., Tax 2024, Chase Statements Q1"
            autoFocus
            className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      )}
    </div>
  );
}
