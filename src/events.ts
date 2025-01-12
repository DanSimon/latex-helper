export type ConfigChangeListener = () => void;

export class EventEmitter {
    private listeners: ConfigChangeListener[] = [];

    public subscribe(listener: ConfigChangeListener): void {
        this.listeners.push(listener);
    }

    public unsubscribe(listener: ConfigChangeListener): void {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    public emit(): void {
        this.listeners.forEach((listener) => listener());
    }
}
