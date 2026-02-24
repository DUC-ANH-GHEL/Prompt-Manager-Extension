declare namespace chrome {
  export namespace runtime {
    export const lastError: { message?: string } | undefined;
    export const onMessage: {
      addListener: (callback: (request: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
    export function sendMessage(extensionId: string, message: any, options?: any, callback?: (response: any) => void): void;
    export function sendMessage(message: any, options?: any, callback?: (response: any) => void): void;
    export function sendMessage(message: any, callback?: (response: any) => void): void;
  }

  export namespace tabs {
    export function query(queryInfo: any, callback: (result: any[]) => void): void;
    export function sendMessage(tabId: number, message: any, options?: any, callback?: (response: any) => void): void;
    export function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
  }

  export namespace storage {
    export const local: {
      get(keys: string | string[] | Object | null, callback: (items: { [key: string]: any }) => void): void;
      set(items: Object, callback?: () => void): void;
    };
  }
}
