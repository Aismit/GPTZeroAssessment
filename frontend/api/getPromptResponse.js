import { backendUrl } from "./constants";

export const getPromptResponse = (prompt, onMessage, onEnd) => {
  const eventSource = new EventSource(`${backendUrl}/api/chat?prompt=${prompt}`);

  eventSource.onmessage = function (event) {
    onMessage(event.data);
  };

  eventSource.onerror = function () {
    eventSource.close();
  };

  eventSource.addEventListener('end', () => {
    onEnd();
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
};
