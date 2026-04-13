const sendQueue: Array<() => Promise<void>> = [];
let processing = false;

export async function enqueueSend(fn: () => Promise<void>): Promise<void> {
  sendQueue.push(fn);
  if (!processing) processQueue();
}

async function processQueue(): Promise<void> {
  processing = true;
  while (sendQueue.length > 0) {
    const task = sendQueue.shift()!;
    try {
      await task();
    } catch (e) {
      console.error("Send failed:", e);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  processing = false;
}
