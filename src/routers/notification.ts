import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middlewares/authentication';
import { Notification } from '../models';

const router = Router();

router.get('/', authenticateUser, async (req: Request, res: Response) => {
  //@ts-ignore
  const userId = req.user.userId;
  try {
    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ notifications, count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

export default router;
