// Script de test pour créer des messages avec différents statuts
const testMessages = [
  {
    type: 'REQUEST',
    senderName: 'KBlms',
    senderPhone: '+2250140916600',
    subject: 'Nouvelle demande - KBlms',
    content: 'Nouvelle demande d\'intervention électrique. Photo jointe disponible dans la demande.',
    priority: 'HIGH',
    status: 'UNREAD'
  },
  {
    type: 'REQUEST',
    senderName: 'Touré Mohamed',
    senderPhone: '+2250140916601',
    subject: 'Problème de climatisation',
    content: 'La climatisation ne fonctionne plus correctement, besoin d\'une intervention rapide.',
    priority: 'URGENT',
    status: 'URGENT'
  },
  {
    type: 'CONTACT',
    senderName: 'Konaté Aminata',
    senderPhone: '+2250140916602',
    subject: 'Demande de devis',
    content: 'Je souhaiterais obtenir un devis pour l\'installation électrique dans mon nouveau local.',
    priority: 'NORMAL',
    status: 'IN_PROGRESS'
  },
  {
    type: 'REQUEST',
    senderName: 'Kouassi Yves',
    senderPhone: '+2250140916603',
    subject: 'Installation prises électriques',
    content: 'Besoin d\'installer 3 nouvelles prises électriques dans la cuisine.',
    priority: 'NORMAL',
    status: 'COMPLETED'
  },
  {
    type: 'REVIEW',
    senderName: 'Soro Fatou',
    senderPhone: '+2250140916604',
    subject: 'Excellent service !',
    content: 'Très satisfait de l\'intervention rapide et professionnelle. Merci EBF Bouaké !',
    priority: 'LOW',
    status: 'READ'
  }
];

console.log('Script de test pour créer des messages');
console.log('Exécutez ce script dans votre navigateur console sur la page /messages');
console.log('ou utilisez fetch pour créer les messages via l\'API');

// Fonction pour créer un message via API
async function createTestMessage(messageData) {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ Message créé:', result.message.id);
    } else {
      console.error('❌ Erreur:', result.error);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }
}

// Exporter pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
  window.createTestMessages = async () => {
    console.log('Création des messages de test...');
    for (const message of testMessages) {
      await createTestMessage(message);
      // Attendre un peu entre chaque création
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('Messages de test créés !');
  };
  
  console.log('🎯 Exécutez createTestMessages() dans la console pour créer les messages de test');
}