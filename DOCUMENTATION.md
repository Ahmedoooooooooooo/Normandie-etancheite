# Documentation Technique — Normandie Étanchéité

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Site web (Next.js)](#site-web-nextjs)
4. [Flux de réservation](#flux-de-réservation)
5. [Calcul du devis](#calcul-du-devis)
6. [n8n — Webhook](#n8n--webhook)
7. [Zoho Flow — Automatisation](#zoho-flow--automatisation)
8. [Zoho Calendar](#zoho-calendar)
9. [Déploiement GitHub Pages](#déploiement-github-pages)
10. [Accès et identifiants](#accès-et-identifiants)
11. [Fichiers importants](#fichiers-importants)
12. [Maintenance](#maintenance)

---

## Vue d'ensemble

Site vitrine + système de prise de rendez-vous automatisé pour **Normandie Étanchéité** (couvreur, Flers 61100).

**Fonctionnement résumé :**
1. Le client remplit un formulaire de prise de RDV sur le site
2. Un devis est généré automatiquement (honoraires + déplacement calculé par distance)
3. Le client signe électroniquement le devis
4. **Seulement après la signature**, le RDV est créé dans Zoho Calendar via n8n + Zoho Flow

---

## Architecture

```
Site GitHub Pages (Next.js statique)
         │
         │  sessionStorage (données devis)
         ▼
   Page /rendez-vous  ──────────►  Page /devis
   (formulaire 3 étapes)           (devis + signature)
                                         │
                                         │ POST (après signature)
                                         ▼
                               n8n Webhook (self-hosted)
                                         │
                                         │ POST
                                         ▼
                                    Zoho Flow
                                         │
                                         │
                                         ▼
                                   Zoho Calendar
                                  (RDV créé ✓)
```

---

## Site web (Next.js)

| Paramètre | Valeur |
|-----------|--------|
| Framework | Next.js 14 App Router |
| Langage | TypeScript + Tailwind CSS |
| Mode | Statique (`output: 'export'`) |
| Base path | `/Normandie-etancheite` |
| URL live | `https://ahmedoooooooooooo.github.io/Normandie-etancheite` |
| Branche de développement | `claude/normandie-etancheite-site-weEyV` |
| Branche de déploiement | `gh-pages` |

### Pages

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | `src/app/page.tsx` | Page d'accueil |
| `/rendez-vous` | `src/app/rendez-vous/page.tsx` | Formulaire de réservation (3 étapes) |
| `/devis` | `src/app/devis/page.tsx` | Devis + signature électronique |

---

## Flux de réservation

### Étape 1 — Formulaire (`/rendez-vous`)

Le formulaire se déroule en 3 étapes :

- **Étape 1** : Date et heure (créneaux : 08h–11h, 14h–17h)
- **Étape 2** : Coordonnées client (prénom, nom, tél, email, société, adresse)
- **Étape 3** : Informations chantier (surface, type toiture, état général, accessibilité, description)

À la validation du formulaire :
- Le devis est calculé automatiquement (voir section suivante)
- Les données sont sauvegardées dans `sessionStorage` sous la clé `normandie_devis`
- Le client est redirigé vers `/devis`

> **Note** : Aucun appel réseau n'est fait à ce stade. Le RDV n'est pas encore créé.

### Étape 2 — Devis et signature (`/devis`)

- Les données sont lues depuis `sessionStorage`
- Le devis complet est affiché (entreprise, client, tableau de prix)
- Le client signe avec la souris ou le doigt (canvas)
- Au clic sur **"Valider et confirmer"** → appel POST vers n8n → création du RDV Zoho Calendar

---

## Calcul du devis

### Honoraires (basés sur la surface)

| Surface | Honoraires HT |
|---------|--------------|
| ≤ 50 m² | 150 € |
| 51–100 m² | 200 € |
| 101–200 m² | 300 € |
| 201–500 m² | 450 € |
| > 500 m² | 600 € |

### Déplacement (basé sur la distance depuis Flers)

**Coordonnées entreprise** : `48.7480° N, -0.5636° E` (Flers, 61100)

Calcul de la distance : formule **Haversine** (vol d'oiseau) via l'API adresse française `api-adresse.data.gouv.fr`

| Distance | Tarif déplacement HT |
|----------|---------------------|
| ≤ 20 km | 30 € |
| 21–40 km | 50 € |
| 41–60 km | 80 € |
| 61–80 km | 120 € |
| > 80 km | 180 € |

### TVA
- TVA : 20 %
- Affichée sur le devis : HT + TVA + TTC

### Numéro de devis
Format : `NE-AAAA-XXXX` (ex: `NE-2025-4782`) — généré aléatoirement côté client.

---

## n8n — Webhook

| Paramètre | Valeur |
|-----------|--------|
| Instance | `https://n8n.srv1591454.hstgr.cloud` |
| Webhook URL | `https://n8n.srv1591454.hstgr.cloud/webhook/18bc0126-ec6f-433c-89be-85f90b0a4bad` |
| Méthode | `POST` |
| Content-Type | `application/json` |

### Workflow importé
Fichier : `n8n-workflow-zohoflow.json` (à importer dans n8n via *Workflows → Import*)

### Payload envoyé par le site (après signature)

```json
{
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "0612345678",
  "email": "jean@example.com",
  "societe": "",
  "adresse": "12 rue de la Paix, 61000 Alençon",
  "date": "2025-07-15",
  "date_formatee": "mardi 15 juillet 2025",
  "heure": "09:00",
  "surface_m2": 120,
  "type_toiture": "Ardoise",
  "etat_general": "Bon état",
  "accessibilite": "Facile",
  "description": "Fuite en rive droite",
  "devis_numero": "NE-2025-4782",
  "devis_honoraires": 300,
  "devis_deplacement": 50,
  "devis_distance_km": 35,
  "devis_total_ht": 350,
  "devis_total_ttc": 420,
  "devis_signe": true
}
```

### Ce que fait n8n

1. Reçoit le payload
2. Calcule `start_datetime` = `date + 'T' + heure + ':00+02:00'`
3. Calcule `end_datetime` = même chose + 1 heure
4. Envoie tout vers Zoho Flow

---

## Zoho Flow — Automatisation

| Paramètre | Valeur |
|-----------|--------|
| Plateforme | `flow.zoho.eu` |
| Webhook d'entrée | `https://flow.zoho.eu/20115276691/flow/webhook/incoming?zapikey=1001.0357498613ad66f38eac5f7da439eaf6.19e9fad4d6cc446074c97203f552a1b7&isdebug=false` |

### Configuration du flow

Le flow Zoho contient deux actions :
1. **Webhook trigger** — reçoit les données depuis n8n
2. **Zoho Calendar → Create Event** — crée l'événement

### Champs mappés dans Zoho Calendar (Create Event)

| Champ Zoho Calendar | Valeur |
|--------------------|--------|
| Title | `RDV - {{prenom}} {{nom}}` |
| Start datetime | `{{start_datetime}}` |
| End datetime | `{{end_datetime}}` |
| Description | `Tel: {{telephone}} \| Email: {{email}} \| Adresse: {{adresse}} \| Surface: {{surface_m2}}m² \| Type: {{type_toiture}} \| Devis: {{devis_numero}} \| TTC: {{devis_total_ttc}}€` |

> **Format datetime requis par Zoho** : `YYYY-MM-DDTHH:MM:00+02:00`
> Exemple : `2025-07-15T09:00:00+02:00`

---

## Zoho Calendar

- Calendrier utilisé : calendrier par défaut du compte Zoho
- Les RDV apparaissent directement dans l'app Zoho Calendar (web et mobile)
- Chaque événement dure **1 heure** (durée fixe)

---

## Déploiement GitHub Pages

### Workflow CI/CD
Fichier : `.github/workflows/deploy.yml`

- **Déclencheur** : push sur la branche `claude/normandie-etancheite-site-weEyV`
- **Action** : `peaceiris/actions-gh-pages@v4`
- **Sortie** : dossier `out/` (build statique Next.js) → branche `gh-pages`

### Commandes

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Pousser (déclenche le déploiement automatiquement)
git push origin claude/normandie-etancheite-site-weEyV
```

---

## Accès et identifiants

> ⚠️ **Ne pas partager ces informations publiquement. Régénérer les clés si compromises.**

### n8n

| Élément | Valeur |
|---------|--------|
| URL | `https://n8n.srv1591454.hstgr.cloud` |
| Webhook path | `18bc0126-ec6f-433c-89be-85f90b0a4bad` |
| Workflow à importer | `n8n-workflow-zohoflow.json` |

### Zoho Flow

| Élément | Valeur |
|---------|--------|
| URL de connexion | `https://flow.zoho.eu` |
| Webhook zapikey | `1001.0357498613ad66f38eac5f7da439eaf6.19e9fad4d6cc446074c97203f552a1b7` |
| Compte Zoho | Compte associé à l'organisation `20115276691` |

### GitHub

| Élément | Valeur |
|---------|--------|
| Repo | `ahmedoooooooooooo/Normandie-etancheite` |
| Branche dev | `claude/normandie-etancheite-site-weEyV` |
| Branche prod | `gh-pages` |

### Entreprise (données dans le devis)

| Élément | Valeur |
|---------|--------|
| Nom | NORMANDIE ÉTANCHÉITÉ |
| Adresse | 16 Impasse Beau Vallon, 61100 Flers |
| Coordonnées GPS | `48.7480° N, -0.5636° E` |
| SIRET | *(à renseigner dans `src/app/devis/page.tsx`)* |
| N° assurance | *(à renseigner dans `src/app/devis/page.tsx`)* |

---

## Fichiers importants

```
Normandie-etancheite/
├── src/
│   └── app/
│       ├── page.tsx                  # Page d'accueil
│       ├── rendez-vous/
│       │   └── page.tsx              # Formulaire RDV (3 étapes + calcul devis)
│       └── devis/
│           └── page.tsx              # Devis + signature électronique + appel n8n
├── n8n-workflow-zohoflow.json        # Workflow n8n à importer (Webhook → Zoho Flow)
├── n8n-workflow-caldav.json          # Ancien workflow CalDAV (abandonné)
├── n8n-caldav-discover.json          # Outil debug CalDAV (abandonné)
├── .github/
│   └── workflows/
│       └── deploy.yml                # CI/CD GitHub Actions → GitHub Pages
├── next.config.mjs                   # Config Next.js (output: export, basePath)
└── DOCUMENTATION.md                  # Ce fichier
```

---

## Maintenance

### Modifier les tarifs
Fichier : `src/app/rendez-vous/page.tsx`
- Honoraires → fonction `getHonorairesTarif()` (vers la ligne 90)
- Déplacement → fonction `getDeplacementTarif()` (vers la ligne 105)

### Modifier les créneaux horaires
Fichier : `src/app/rendez-vous/page.tsx`
- Constante `TIME_SLOTS` en haut du fichier

### Ajouter le SIRET et l'assurance
Fichier : `src/app/devis/page.tsx`
- Chercher `XXX XXX XXX XXXXX` et remplacer par le vrai SIRET
- Chercher le numéro d'assurance et le renseigner

### Régénérer le webhook n8n
Si le webhook n8n est compromis :
1. Aller dans n8n → le workflow → nœud Webhook → changer le path
2. Mettre à jour l'URL dans `src/app/devis/page.tsx` (fonction `handleSign`)

### Régénérer la clé Zoho Flow
Si la zapikey Zoho Flow est compromise :
1. Zoho Flow → Webhooks → régénérer la clé
2. Mettre à jour le workflow n8n (nœud "Zoho Flow" → URL)

### Fonctionnalités prévues (non implémentées)
- **Zoho Sign** : intégrer la signature dans Zoho Sign (via Zoho Flow) à la place du canvas maison
- **Créneaux intelligents** : analyser l'adresse du client, calculer le trajet, bloquer les heures incompatibles avec les RDV déjà pris
