interface Observer {
  update(message: string): void;
}

interface Subject {
  registerObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(): void;
}

class Animal implements Subject {
  private observers: Observer[] = [];
  private age: number = 0;
  private harvestAge: number;

  constructor(harvestAge: number) {
    this.harvestAge = harvestAge;
  }

  registerObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notifyObservers(): void {
    const message = `Animal has reached the harvest age of ${this.harvestAge} years.`;
    this.observers.forEach((observer) => observer.update(message));
  }

  setAge(age: number): void {
    this.age = age;
    if (this.age >= this.harvestAge) {
      this.notifyObservers();
    }
  }

  getAge(): number {
    return this.age;
  }
}

class UserNotificationService implements Observer {
  update(message: string): void {
    console.log(`Notification: ${message}`);
    // Here you can also implement push notifications or any other type of notification
  }
}

export { Observer, Subject, Animal, UserNotificationService };
