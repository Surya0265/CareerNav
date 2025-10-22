type EventCallback = (data: any) => void;

class EventBusClass {
  private events: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => callback(data));
    }
  }

  off(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }
  }
}

export const EventBus = new EventBusClass();