import Browser from 'webextension-polyfill';
import { getSettings } from './settings';

/**
 * Types of notifications
 */
export type NotificationType = 'gameDetected' | 'analysisReady' | 'error';

/**
 * Show a notification if notifications are enabled
 */
export async function showNotification(
  type: NotificationType,
  title: string,
  message: string,
  iconUrl?: string
): Promise<string | undefined> {
  const settings = await getSettings();
  
  // Skip if notifications are disabled
  if (!settings.notifications) {
    return;
  }
  
  // Default icon based on notification type
  if (!iconUrl) {
    iconUrl = Browser.runtime.getURL('icon-128.png');
  }
  
  try {
    const notificationId = await Browser.notifications.create({
      type: 'basic',
      iconUrl,
      title,
      message,
    });
    return notificationId;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return undefined;
  }
}

/**
 * Handle notification click
 */
export function setupNotificationClickHandler(callback: (notificationId: string) => void): void {
  Browser.notifications.onClicked.addListener(callback);
}
