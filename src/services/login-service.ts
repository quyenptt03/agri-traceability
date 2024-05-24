import AuthenticationService from './authentication-service';

interface Observer {
  update(data: { email: string }, action: string): void;
}

class LoginService {
  private observers: Observer[];
  private activeSessions: Set<string>;

  constructor() {
    this.observers = [];
    this.activeSessions = new Set();
  }

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async register(
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<object | null> {
    const authService = AuthenticationService.getInstance();
    const result = await authService.register(
      email,
      password,
      first_name,
      last_name
    );
    if (result) {
      this.activeSessions.add(email);
      this.notifyObservers({ email }, 'register');
      return result;
    }
    return null;
  }

  async login(email: string, password: string): Promise<object | null> {
    const authService = AuthenticationService.getInstance();
    const result = await authService.login(email, password);
    if (result) {
      this.activeSessions.add(email);
      this.notifyObservers({ email }, 'login');
      return result;
    }
    return null;
  }

  async logout(user: any): Promise<boolean> {
    if (this.activeSessions.has(user.email)) {
      this.activeSessions.delete(user.email);
      this.notifyObservers({ email: user.email }, 'logout');
      return true;
    }
    return false;
  }

  private notifyObservers(data: { email: string }, action: string): void {
    this.observers.forEach((observer) => observer.update(data, action));
  }

  public getActiveUsers(): string[] {
    return Array.from(this.activeSessions);
  }
}

class LoggingService implements Observer {
  update(data: { email: string }, action: string): void {
    if (action === 'register') {
      console.log(`LoggingService: User ${data.email} just register.`);
    } else if (action === 'login') {
      console.log(`LoggingService: User ${data.email} logged in.`);
    } else if (action == 'logout') {
      console.log(`LoggingService: User ${data.email} logged out.`);
    }
  }
}

class AnalyticsService implements Observer {
  update(data: { email: string }): void {
    console.log(
      `AnalyticsService: Capturing analytics for user ${data.email}.`
    );
  }
}

export { LoginService, LoggingService, AnalyticsService };
