export class PromiseQueue<T> {
  private queue: Promise<T>[] = [];
  private isProcessing = false;

  public getQueueLength() {
    return this.queue.length;
  }

  public enqueue = (promise: Promise<T>) => {
    this.queue.push(promise);
    console.log(`Enqueued promise. Queue length: ${this.queue.length}`);
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
        console.log(`Processing promise. Queue length: ${this.queue.length}`);
        await promise;
        console.log("Promise resolved");
      }
    }

    this.isProcessing = false;
  };
}
