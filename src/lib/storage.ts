export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
}

const STORAGE_KEY = 'prompt_manager_data';

export const storage = {
  async getPrompts(): Promise<Prompt[]> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          resolve(result[STORAGE_KEY] || []);
        });
      });
    } else {
      // Fallback for web preview
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
  },

  async savePrompt(prompt: Prompt): Promise<void> {
    const prompts = await this.getPrompts();
    const newPrompts = [prompt, ...prompts];
    await this.savePrompts(newPrompts);
  },

  async updatePrompt(updatedPrompt: Prompt): Promise<void> {
    const prompts = await this.getPrompts();
    const newPrompts = prompts.map((p) =>
      p.id === updatedPrompt.id ? updatedPrompt : p
    );
    await this.savePrompts(newPrompts);
  },

  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts();
    const newPrompts = prompts.filter((p) => p.id !== id);
    await this.savePrompts(newPrompts);
  },

  async savePrompts(prompts: Prompt[]): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEY]: prompts }, () => {
          resolve();
        });
      });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    }
  },
};
