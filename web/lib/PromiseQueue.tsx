export class PromiseQueue<T> {
  private queue: Promise<T>[] = [];
  private isProcessing = false;

  public enqueue = (promise: Promise<T>) => {
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
