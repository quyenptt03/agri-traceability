interface Observer {
  update(message: string): void;
}

class UserNotificationService implements Observer {
  update(message: string): void {
    console.log(`Notification: ${message}`);
    // Here you can also implement push notifications or any other type of notification
  }
}

export { Observer, UserNotificationService };
