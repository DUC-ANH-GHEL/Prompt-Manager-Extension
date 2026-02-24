import React, { useState } from 'react';
import { Prompt } from '../lib/storage';
import { Save, X } from 'lucide-react';

interface PromptFormProps {
  initialPrompt?: Prompt;
  onSave: (prompt: Prompt) => void;
  onCancel: () => void;
}

export function PromptForm({ initialPrompt, onSave, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState(initialPrompt?.title || '');
  const [content, setContent] = useState(initialPrompt?.content || '');
  const [tags, setTags] = useState(initialPrompt?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPrompt: Prompt = {
      id: initialPrompt?.id || Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
      createdAt: initialPrompt?.createdAt || Date.now(),
    };
    onSave(newPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="e.g., Code Review Template"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
          placeholder="Enter your prompt here..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="coding, writing, email"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Save size={16} />
          Save Prompt
        </button>
      </div>
    </form>
  );
}
