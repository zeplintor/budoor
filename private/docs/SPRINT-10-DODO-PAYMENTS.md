# Sprint 10: Intégration DODO Payments

## Statut: Implémentation terminée - En attente de configuration

## Objectif
Intégrer DODO Payments comme solution de paiement pour gérer les abonnements (Plan Gratuit et Plan Pro à 29€/mois).

## À propos de DODO Payments
DODO Payments est un **Merchant of Record (MoR)** - ils gèrent pour vous :
- Le traitement des paiements
- La conformité fiscale (TVA, taxes locales)
- Les remboursements et litiges
- La facturation et les reçus
- La gestion des abonnements

**Documentation officielle** : https://docs.dodopayments.com/

---

## Implémentation réalisée

### Fichiers créés

| Fichier | Description |
|---------|-------------|
| `src/lib/payments/dodo.ts` | Service DODO Payments (checkout, subscription, webhook) |
| `src/app/api/payments/create-checkout/route.ts` | API pour créer une session de checkout |
| `src/app/api/payments/cancel-subscription/route.ts` | API pour annuler un abonnement |
| `src/app/api/payments/webhook/route.ts` | Webhook pour les événements DODO |
| `src/hooks/useSubscription.ts` | Hook React pour gérer l'état d'abonnement |
| `src/app/dashboard/pricing/page.tsx` | Page de tarification dans le dashboard |

### Fichiers modifiés

| Fichier | Modification |
|---------|--------------|
| `src/types/index.ts` | Ajout de `subscriptionId` et `subscriptionStatus` au type User |
| `src/components/dashboard/Sidebar.tsx` | Ajout du lien vers /dashboard/pricing avec icône Crown |
| `messages/fr.json` | Traductions pricing en français |
| `messages/ar.json` | Traductions pricing en arabe |
| `.env.local` | Variables d'environnement DODO |

---

## Configuration requise

### 1. Variables d'environnement

Les variables suivantes ont été ajoutées à `.env.local` :

```env
# DODO Payments
NEXT_PUBLIC_DODO_MODE=test          # 'test' ou 'live'
DODO_API_KEY_TEST=                  # Clé API de test (à remplir)
DODO_API_KEY_LIVE=                  # Clé API de production (à remplir)
DODO_WEBHOOK_SECRET=                # Secret pour vérifier les webhooks (à remplir)
DODO_PRO_PRODUCT_ID=                # ID du produit Pro dans DODO (à remplir)

NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL de l'app
```

### 2. Étapes dans le Dashboard DODO

1. **Récupérer les clés API**
   - Aller dans Settings > API Keys
   - Copier `sk_test_...` dans `DODO_API_KEY_TEST`

2. **Créer le produit "Budoor Pro"**
   - Aller dans Products > Create Product
   - Type: Subscription
   - Prix: 29€/mois
   - Période d'essai: 14 jours (optionnel)
   - Copier le Product ID dans `DODO_PRO_PRODUCT_ID`

3. **Configurer le webhook**
   - Aller dans Settings > Webhooks
   - URL: `https://votre-domaine.com/api/payments/webhook`
   - Copier le Webhook Secret dans `DODO_WEBHOOK_SECRET`
   - Événements à activer:
     - `subscription.active`
     - `subscription.created`
     - `subscription.cancelled`
     - `subscription.expired`
     - `payment.succeeded`
     - `payment.failed`
     - `refund.succeeded`

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Routes    │────▶│  DODO Payments  │
│  (pricing page) │     │  (Next.js)      │     │    (External)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  useSubscription│     │   Firestore     │◀────│   Webhook       │
│     (hook)      │────▶│  (user.plan)    │     │  (mise à jour)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Flux de souscription

1. L'utilisateur clique sur "Passer au Pro" sur `/dashboard/pricing`
2. `useSubscription.upgradeToPro()` appelle `/api/payments/create-checkout`
3. L'API crée une session DODO et retourne le `payment_link`
4. L'utilisateur est redirigé vers DODO Checkout
5. Après paiement, DODO envoie un webhook `subscription.active`
6. Le webhook met à jour Firestore (`user.subscription = "pro"`)
7. `useSubscription` détecte le changement via `onSnapshot` en temps réel

---

## Limites par plan

Définies dans `src/hooks/useSubscription.ts` :

```typescript
export const PLAN_LIMITS = {
  free: {
    maxParcelles: 3,
    maxReportsPerMonth: 5,
    whatsappFrequency: "weekly",
    dataHistoryDays: 30,
  },
  pro: {
    maxParcelles: Infinity,
    maxReportsPerMonth: Infinity,
    whatsappFrequency: "daily",
    dataHistoryDays: 365,
  },
};
```

---

## Tests

### Cartes de test DODO

| Carte | Résultat |
|-------|----------|
| 4242 4242 4242 4242 | Paiement réussi |
| 4000 0000 0000 0002 | Carte refusée |
| 4000 0000 0000 9995 | Fonds insuffisants |

### Tester les webhooks localement

```bash
# Installer ngrok
brew install ngrok

# Exposer le port local
ngrok http 3000

# Configurer l'URL webhook dans DODO:
# https://xxxxx.ngrok.io/api/payments/webhook
```

---

## Checklist pour finaliser

### Configuration DODO
- [ ] Créer le produit Pro dans DODO Dashboard
- [ ] Copier les clés API dans `.env.local`
- [ ] Configurer le webhook dans DODO Dashboard
- [ ] Copier le webhook secret dans `.env.local`

### Tests
- [ ] Tester un paiement en mode test
- [ ] Vérifier que le webhook met à jour Firestore
- [ ] Tester l'annulation d'abonnement
- [ ] Vérifier le flux complet (upgrade + downgrade)

### Production (Netlify)
- [ ] Ajouter les variables d'environnement dans Netlify
- [ ] Mettre `NEXT_PUBLIC_DODO_MODE=live`
- [ ] Configurer le webhook avec l'URL de production
- [ ] Tester un paiement réel (petit montant)

---

## Améliorations futures

- [ ] Badge "Pro" dans la sidebar pour les utilisateurs Pro
- [ ] Bloquer création de parcelles si limite Free atteinte
- [ ] Bloquer génération de rapports si limite Free atteinte
- [ ] Notification WhatsApp après paiement réussi
- [ ] Page de gestion d'abonnement (factures, changer de carte)
- [ ] Période d'essai gratuite de 14 jours

---

## Ressources

- [DODO Payments Docs](https://docs.dodopayments.com/)
- [DODO TypeScript SDK](https://github.com/dodopayments/dodopayments-node)
- [Webhooks Documentation](https://docs.dodopayments.com/webhooks)
