"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="w-full p-4 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Link>
            <h1 className="ml-4 text-2xl font-bold text-blue-900">Politique de Confidentialité</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Collecte des informations</h2>
              <div className="text-gray-700 space-y-2">
                <p>Nous collectons les informations suivantes lorsque vous soumettez une demande :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom (facultatif)</li>
                  <li>Numéro de téléphone (obligatoire)</li>
                  <li>Quartier/Ville (facultatif)</li>
                  <li>Description du problème électrique</li>
                  <li>Fichiers audio et photos (si fournis)</li>
                  <li>Adresse IP et données de navigation</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Utilisation des données</h2>
              <div className="text-gray-700 space-y-2">
                <p>Vos informations sont utilisées pour :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Vous contacter pour planifier un diagnostic gratuit</li>
                  <li>Vous fournir les services d'électricité demandés</li>
                  <li>Améliorer nos services et votre expérience</li>
                  <li>Vous envoyer des informations pertinentes (avec votre consentement)</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Conservation des données</h2>
              <div className="text-gray-700 space-y-2">
                <p>Nous conservons vos données selon les durées suivantes :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Informations de contact : 5 ans après le dernier service</li>
                  <li>Dossiers clients : 10 ans à des fins comptables et légales</li>
                  <li>Fichiers audio et photos : 2 ans après la résolution du problème</li>
                  <li>Données de navigation : 13 mois maximum</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Partage des données</h2>
              <div className="text-gray-700 space-y-2">
                <p>Ne partageons vos informations qu'avec :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nos techniciens qualifiés pour la prestation de services</li>
                  <li>Prestataires de services techniques (hébergement, transcription IA)</li>
                  <li>Autorités légales lorsque requis par la loi</li>
                </ul>
                <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Sécurité des données</h2>
              <div className="text-gray-700 space-y-2">
                <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Chiffrement des données sensibles</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Protocoles de sécurité informatique</li>
                  <li>Formation du personnel à la protection des données</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Vos droits</h2>
              <div className="text-gray-700 space-y-2">
                <p>Conformément à la législation ivoirienne sur la protection des données, vous avez le droit de :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Accéder à vos données personnelles</li>
                  <li>Rectifier des informations inexactes</li>
                  <li>Supprimer vos données (droit à l'oubli)</li>
                  <li>Vous opposer au traitement de vos données</li>
                  <li>Porter plainte auprès de l'autorité de contrôle</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <div className="text-gray-700 space-y-2">
                <p>Nous utilisons des cookies pour améliorer votre expérience sur notre site :</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cookies essentiels pour le fonctionnement du site</li>
                  <li>Cookies de performance pour analyser l'utilisation</li>
                  <li>Cookies de fonctionnalité pour mémoriser vos préférences</li>
                </ul>
                <p>Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Modifications de la politique</h2>
              <div className="text-gray-700 space-y-2">
                <p>Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications entreront en vigueur dès leur publication sur notre site.</p>
                <p>Nous vous encourageons à consulter régulièrement cette page pour rester informé des éventuelles modifications.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contact</h2>
              <div className="text-gray-700 space-y-2">
                <p>Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter à :</p>
                <p>Téléphone : +225 27 31 96 46 04</p>
                <p>Mobile : +225 07 08 05 84 97</p>
                <p>Adresse : Bouaké Tchêlêkro, Côte d'Ivoire</p>
                <p>Nous nous engageons à répondre à votre demande dans un délai de 30 jours.</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">10. Consentement</h2>
              <div className="text-gray-700 space-y-2">
                <p>En utilisant notre site et en soumettant une demande, vous consentez à la collecte et à l'utilisation de vos informations conformément à cette politique de confidentialité.</p>
                <p>Si vous n'êtes pas d'accord avec cette politique, nous vous demandons de ne pas utiliser nos services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            © 2025 EBF Bouaké - Électricité - Bâtiment - Froid
          </p>
        </div>
      </footer>
    </main>
  );
}