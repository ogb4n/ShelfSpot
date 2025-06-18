// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailTo = process.env.ALERT_EMAIL || ''

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
  };
}>) => {
  console.log('📧 [EMAIL] Début de sendTriggeredAlerts');
  console.log(`📧 [EMAIL] Nombre d'alertes déclenchées: ${triggeredAlerts.length}`);
  console.log('📧 [EMAIL] Détails des alertes:', triggeredAlerts.map(({ alert, item }) => 
    `${item.name} (qty: ${item.quantity}, seuil: ${alert.threshold}, alerteId: ${alert.id})`
  ));

  // Vérification de la clé API
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ [EMAIL] ERREUR: RESEND_API_KEY n\'est pas définie dans les variables d\'environnement');
    throw new Error('RESEND_API_KEY manquante');
  }
  console.log('✅ [EMAIL] Clé API Resend présente');

  // Vérification de l'email de destination
  if (!emailTo) {
    console.error('❌ [EMAIL] ERREUR: ALERT_EMAIL n\'est pas définie dans les variables d\'environnement');
    console.log('📧 [EMAIL] Utilisation de l\'email par défaut: contact@doniban.fr');
  } else {
    console.log(`📧 [EMAIL] Email de destination configuré: ${emailTo}`);
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #dc2626;">🚨 ALERTES DE STOCK DÉCLENCHÉES</h2>
      
      <p>Les alertes suivantes ont été déclenchées car les stocks sont passés en dessous des seuils configurés :</p>
      
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Article</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Alerte</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantité actuelle</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Seuil configuré</th>
        </tr>
        ${triggeredAlerts.map(({ alert, item }) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${item.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${alert.name || 'Alerte sans nom'}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #dc2626; font-weight: bold;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${alert.threshold}</td>
          </tr>
        `).join('')}
      </table>
      
      <p style="margin-top: 20px;">
        <strong>Action recommandée :</strong> Vérifiez votre stock et réapprovisionnez si nécessaire.
      </p>
      
      <p><small>Alerte envoyée le ${new Date().toLocaleString('fr-FR')}</small></p>
    </div>
  `;

  try {
    const subject = `🚨 ${triggeredAlerts.length} alerte${triggeredAlerts.length > 1 ? 's' : ''} de stock déclenchée${triggeredAlerts.length > 1 ? 's' : ''}`;
    
    // console.log(`📧 [EMAIL] Tentative d'envoi vers: ${emailTo}`);
    // console.log('📧 [EMAIL] Sujet:', subject);
    // console.log('📧 [EMAIL] Taille du contenu HTML:', htmlContent.length, 'caractères');
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [emailTo],
      subject: subject,
      html: htmlContent,
    });

    console.log('✅ [EMAIL] Email d\'alertes envoyé avec succès!');
    console.log('📧 [EMAIL] Résultat Resend:', result);
    console.log('📧 [EMAIL] ID de l\'email:', result.data?.id);
    
    return result;
  } catch (error) {
    console.error('❌ [EMAIL] Erreur lors de l\'envoi des alertes:', error);
    console.error('❌ [EMAIL] Type d\'erreur:', typeof error);
    console.error('❌ [EMAIL] Message d\'erreur:', error instanceof Error ? error.message : 'Message inconnu');
    console.error('❌ [EMAIL] Stack trace:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    // Log des détails spécifiques à Resend
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('❌ [EMAIL] Réponse de l\'API Resend:', error.response);
    }
    
    throw error;
  }
};
