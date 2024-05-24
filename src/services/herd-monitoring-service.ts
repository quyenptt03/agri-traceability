// herd-monitoring-service.ts
import { Herd } from '../models';
import { UserNotificationService } from './harvest-service';

class HerdMonitoringService {
  private notificationService: UserNotificationService;

  constructor() {
    this.notificationService = new UserNotificationService();
  }

  async monitorHerds(): Promise<void> {
    const herds = await Herd.find({
      status: 'Chưa thu hoạch',
      notified: false,
    }).exec();
    herds.forEach((herd) => {
      herd.registerObserver(this.notificationService);
      herd.checkHarvestStatus();
    });
  }
}

export default HerdMonitoringService;
