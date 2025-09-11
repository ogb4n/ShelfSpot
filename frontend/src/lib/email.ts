// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const emailTo = process.env.ALERT_EMAIL_RECIPIENT || ''

export const sendTriggeredAlerts = async (triggeredAlerts: Array<{
  alert: {
    id: number;
    itemId: number;
    threshold: number;
    name?: string | null;
    isActive: boolean;
    lastSent?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  item: {
    id: number;
    name: string;
    quantity: number;
    status?: string | null;
    itemLink?: string | null;
  };
}>) => {
  console.log('📧 [EMAIL] Starting sendTriggeredAlerts');
  console.log(`📧 [EMAIL] Number of triggered alerts: ${triggeredAlerts.length}`);
  console.log('📧 [EMAIL] Alert details:', triggeredAlerts.map(({ alert, item }) => 
    `${item.name} (qty: ${item.quantity}, threshold: ${alert.threshold}, alertId: ${alert.id})`
  ));

  // API key verification
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ [EMAIL] ERROR: RESEND_API_KEY is not defined in environment variables');
    throw new Error('Missing RESEND_API_KEY');
  }
  console.log('✅ [EMAIL] Resend API key present');

  // Destination email verification
  if (!emailTo) {
    console.error('❌ [EMAIL] ERROR: ALERT_EMAIL_RECIPIENT is not defined in environment variables');
  } else {
    console.log(`📧 [EMAIL] Destination email configured: ${emailTo}`);
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #dc2626;">🚨 TRIGGERED STOCK ALERTS</h2>

      <p>Alerts have been triggered for the following items: ${triggeredAlerts.map(({ item }) => item.name).join(', ')} </p>

      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Alert</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Current Quantity</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Configured Threshold</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Action</th>
        </tr>
        ${triggeredAlerts.map(({ alert, item }) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${alert.name || 'Unnamed alert'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #dc2626; font-weight: bold;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${alert.threshold}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">
              ${item.itemLink ? 
                `<a href="${item.itemLink}" target="_blank" style="background-color: #3b82f6; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 12px;">🛒 Reorder</a>` 
                : '<span style="color: #6b7280; font-size: 12px;">No purchase link</span>'
              }
            </td>
          </tr>
        `).join('')}
      </table>
      
      <p style="margin-top: 20px;">
        <strong>Recommended action:</strong> Check your stock and refill it. Use the "Reorder" buttons above to purchase items directly.
      </p>
      
      <p><small>Alert sent on ${new Date().toLocaleString('en-US')}</small></p>
    </div>
  `;

  try {
    const subject = `🚨 ${triggeredAlerts.length} stock alert${triggeredAlerts.length > 1 ? 's' : ''} triggered`;
    
    const result = await resend.emails.send({
      from: emailFrom,
      to: [emailTo],
      subject: subject,
      html: htmlContent,
    });

    console.log('✅ [EMAIL] Alert email sent successfully!');
    console.log('📧 [EMAIL] Resend result:', result);
    console.log('📧 [EMAIL] Email ID:', result.data?.id);
    
    return result;
  } catch (error) {
    console.error('❌ [EMAIL] Error sending alerts:', error);
    console.error('❌ [EMAIL] Error type:', typeof error);
    console.error('❌ [EMAIL] Error message:', error instanceof Error ? error.message : 'Unknown message');
    console.error('❌ [EMAIL] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Log Resend-specific details
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('❌ [EMAIL] Resend API response:', error.response);
    }
    
    throw error;
  }
};
