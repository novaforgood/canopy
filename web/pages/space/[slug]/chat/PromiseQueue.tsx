export class PromiseQueue {
  private queue: Promise<any>[] = [];
  private isProcessing = false;

  public enqueue = (promise: Promise<any>) => {
    this.queue.push(promise);
    this.processQueue();
  };

  private processQueue = async () => {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const promise = this.queue.shift();
      if (promise) {
        await promise;
      }
    }

    this.isProcessing = false;
  };
}
