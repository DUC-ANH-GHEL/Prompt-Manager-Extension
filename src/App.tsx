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
            <button
              onClick={() => setShowDownloadInfo(!showDownloadInfo)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="How to Install"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setView('create')}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Prompt
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
