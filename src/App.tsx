import React, { useState, useEffect } from 'react';
import { Prompt, storage } from './lib/storage';
import { PromptList } from './components/PromptList';
import { PromptForm } from './components/PromptForm';
import { Plus, Download, Settings, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | undefined>(undefined);
  const [testInputValue, setTestInputValue] = useState('');
  const [showDownloadInfo, setShowDownloadInfo] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const data = await storage.getPrompts();
    setPrompts(data);
  };

  const handleSave = async (prompt: Prompt) => {
    if (view === 'edit') {
      await storage.updatePrompt(prompt);
    } else {
      await storage.savePrompt(prompt);
    }
    await loadPrompts();
    setView('list');
    setEditingPrompt(undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      await storage.deletePrompt(id);
      await loadPrompts();
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setView('edit');
  };

  const handleInsert = (text: string) => {
    // In a real extension, we would send a message to the content script
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Use callback to handle potential errors (like content script not loaded)
          chrome.tabs.sendMessage(tabs[0].id, { action: 'insert_prompt', text }, (response) => {
            // Check for connection error
            if (chrome.runtime.lastError) {
              console.warn("Extension connection error:", chrome.runtime.lastError.message);
              alert("Không thể chèn văn bản. Vui lòng tải lại trang web (F5) và thử lại.\n\nLưu ý: Extension không hoạt động trên trang New Tab hoặc trang cài đặt của Chrome.");
            }
          });
        }
      });
    } else {
      // Simulation for web preview
      setTestInputValue(prev => prev + text);
      
      // Show toast or feedback
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce';
      toast.textContent = 'Đã chèn vào khu vực kiểm tra!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "prompt_manager_backup.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const importedPrompts = JSON.parse(e.target.result as string);
            if (Array.isArray(importedPrompts)) {
              // Basic validation
              const validPrompts = importedPrompts.filter(p => p.id && p.title && p.content);
              if (validPrompts.length > 0) {
                if (confirm(`Tìm thấy ${validPrompts.length} prompt. Bạn có muốn ghi đè (Replace) hay gộp (Merge)?\nOK = Ghi đè\nCancel = Gộp`)) {
                  await storage.savePrompts(validPrompts);
                } else {
                  // Merge logic: add only if ID doesn't exist, or just add all with new IDs? 
                  // Simple merge: just concat and let user sort it out, or filter by ID.
                  // Let's filter out duplicates by ID for safety
                  const currentIds = new Set(prompts.map(p => p.id));
                  const newPrompts = validPrompts.filter(p => !currentIds.has(p.id));
                  await storage.savePrompts([...prompts, ...newPrompts]);
                }
                await loadPrompts();
                alert("Nhập dữ liệu thành công!");
              } else {
                alert("File không hợp lệ hoặc không có dữ liệu prompt.");
              }
            }
          } catch (error) {
            alert("Lỗi khi đọc file backup: " + error);
          }
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Prompt Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 hidden group-hover:block">
                <button 
                  onClick={handleExport}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download size={16} /> Backup Data
                </button>
                <label className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer">
                  <Download size={16} className="rotate-180" /> Restore Data
                  <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
              </div>
            </div>
            <button
              onClick={() => setShowDownloadInfo(!showDownloadInfo)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="How to Install"
            >
              <Terminal size={20} />
            </button>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Download Info Banner */}
        <AnimatePresence>
          {showDownloadInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Terminal size={16} />
                  How to install as Chrome Extension:
                </h3>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Download this project (Build output).</li>
                  <li>Open Chrome and go to <code>chrome://extensions</code>.</li>
                  <li>Enable <strong>Developer mode</strong> (top right).</li>
                  <li>Click <strong>Load unpacked</strong>.</li>
                  <li>Select the <code>dist</code> folder from the build.</li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Switcher */}
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PromptList
                prompts={prompts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onInsert={handleInsert}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PromptForm
                initialPrompt={editingPrompt}
                onSave={handleSave}
                onCancel={() => {
                  setView('list');
                  setEditingPrompt(undefined);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test Area for Preview */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Test Area (Simulation)
          </h3>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm text-gray-600 mb-2">
              Try clicking "Insert" on a prompt above to see it appear here:
            </label>
            <textarea
              value={testInputValue}
              onChange={(e) => setTestInputValue(e.target.value)}
              className="w-full h-32 p-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
              placeholder="AI Chat Input..."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
