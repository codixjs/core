export abstract class HistoryMode {
  public abstract getLocation(): string;
  public abstract listen(callback: () => void): () => void;
  public abstract redirect(url: string): void;
  public abstract replace(url: string): void;
}
