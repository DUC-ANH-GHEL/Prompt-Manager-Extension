// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insert_prompt") {
    insertText(request.text);
    sendResponse({ status: "success" });
  }
});

function insertText(text) {
  const activeElement = document.activeElement;
  
  // Try to find the main chat input if active element is not a textarea/input
  let target = activeElement;
  
  if (!target || (target.tagName !== 'TEXTAREA' && target.tagName !== 'INPUT' && !target.isContentEditable)) {
    // Common selectors for AI chat inputs (ChatGPT, Claude, Gemini, etc.)
    const selectors = [
      'textarea',
      'div[contenteditable="true"]',
      'input[type="text"]'
    ];
    
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        target = el;
        break;
      }
    }
  }

  if (target) {
    // Focus the element
    target.focus();

    // Handle contenteditable divs (like some rich text editors)
    if (target.isContentEditable) {
      // Use execCommand for broader compatibility with rich text editors
      // Although deprecated, it's still widely supported for extensions
      document.execCommand('insertText', false, text);
    } else {
      // Standard input/textarea
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      
      // Insert text at cursor position
      const newValue = value.substring(0, start) + text + value.substring(end);
      target.value = newValue;
      
      // Move cursor to end of inserted text
      target.selectionStart = target.selectionEnd = start + text.length;
      
      // Dispatch input event to trigger frameworks (React, Vue, etc.)
      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
    }
  } else {
    console.warn("Prompt Manager: No input field found.");
  }
}
