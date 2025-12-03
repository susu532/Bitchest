// Cette instruction importe tous les hooks React nécessaires pour gérer l'état global et les contextes.
// createContext crée les contextes, useReducer gère l'état complexe, useCallback/useMemo optimisent les performances, useContext accède aux contextes, et useEffect gère les effets secondaires.
// Ces hooks sont les fondations du système de gestion d'état de l'application.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

// Cette instruction importe tous les types TypeScript qui définissent la structure des données.
// Le mot-clé type indique qu'on importe uniquement les types (pas de code JavaScript généré).
// Ces types garantissent la sécurité des types dans tout le fichier.
import type {
  // Ce type définit toutes les actions possibles que le reducer peut traiter.
  // Chaque action a un type (string literal) et un payload optionnel avec les données.
  // Il utilise un union type pour garantir que seules les actions valides sont dispatchées.
  AppAction,
  // Ce type définit la structure complète de l'état global de l'application.
  // Il contient users, cryptoAssets, clientAccounts et toutes les autres données partagées.
  // Tous les composants accèdent à cet état via useAppState().
  AppState,
  // Ce type définit la structure d'un compte client avec son solde et ses transactions.
  // Il contient userId, balanceEUR et un tableau de transactions.
  // Chaque client a exactement un compte stocké dans state.clientAccounts.
  ClientAccount,
  // Ce type définit les données nécessaires pour créer un nouveau client.
  // Il contient firstName, lastName et email requis pour la création.
  // Il est utilisé comme paramètre de la fonction createClient().
  CreateClientPayload,
  // Ce type définit les données nécessaires pour enregistrer une transaction.
  // Il contient userId, transaction (objet complet) et balanceAdjustment (montant à ajouter/retirer).
  // Il est utilisé quand un client achète ou vend des cryptomonnaies.
  RecordTransactionPayload,
  // Ce type définit les données pour mettre à jour un utilisateur existant.
  // Il contient userId et data (objet avec les champs à modifier).
  // Il est utilisé par les admins pour modifier les informations d'un client.
  UpdateUserPayload,
  // Ce type définit la structure complète d'un utilisateur de l'application.
  // Il contient id, firstName, lastName, email, role, password, createdAt et updatedAt.
  // Il est utilisé pour typer les utilisateurs dans state.users et dans AuthContext.
  User,
} from './types';
// Cette instruction importe l'état initial par défaut de l'application.
// INITIAL_STATE contient des données vides ou de démonstration pour initialiser le reducer.
// Il sera fusionné avec l'état persisté du localStorage si disponible.
import { INITIAL_STATE } from './initialData';
// Cette instruction importe le singleton du service API qui communique avec le backend.
// api contient toutes les méthodes pour appeler les endpoints Laravel.
// Il est utilisé dans les services (fetchUsers, createClient, etc.) pour faire les requêtes HTTP.
import { api } from '../utils/api';

// Cette constante définit la clé utilisée pour sauvegarder l'état dans le localStorage du navigateur.
// Elle doit être unique pour éviter les conflits avec d'autres applications sur le même domaine.
// L'état sera enregistré sous window.localStorage['bitchest-app-state'].
const STORAGE_KEY = 'bitchest-app-state';

// Ce type définit la structure de la valeur fournie par AppStateContext.
// Il contient l'état global (state) et la fonction pour le modifier (dispatch).
// Les composants utiliseront useAppState() et useAppDispatch() pour accéder à ces valeurs.
type AppStateContextValue = {
  // Cette propriété contient l'état global complet de l'application.
  // Elle est de type AppState qui définit users, cryptoAssets, clientAccounts, etc.
  // Les composants peuvent lire cette valeur mais ne doivent jamais la modifier directement.
  state: AppState;
  // Cette propriété est la fonction pour envoyer des actions au reducer.
  // Elle accepte un objet AppAction avec un type et un payload.
  // Appeler dispatch({ type: 'update-user', payload: {...} }) met à jour l'état de manière immuable.
  dispatch: React.Dispatch<AppAction>;
};

// Ce type définit la structure de la valeur fournie par AppServicesContext.
// Il contient toutes les fonctions métier (services) qui encapsulent les appels API et les dispatches.
// Les composants utiliseront useAppServices() pour accéder à ces fonctions.
type AppServicesContextValue = {
  // Cette propriété est une fonction asynchrone pour créer un nouveau client.
  // Elle accepte un payload avec firstName, lastName et email.
  // Elle retourne une Promise avec le mot de passe temporaire généré et les données de l'utilisateur créé.
  createClient: (payload: CreateClientPayload) => Promise<{ tempPassword: string; user: User }>;
  // Cette propriété est une fonction asynchrone pour mettre à jour le profil de l'utilisateur connecté.
  // Elle accepte un objet partiel avec les champs à modifier (firstName, lastName, email).
  // Elle retourne une Promise avec les données utilisateur mises à jour.
  updateCurrentUserProfile: (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => Promise<User>;
  // Cette propriété est une fonction asynchrone pour mettre à jour un utilisateur spécifique (admin only).
  // Elle accepte un payload avec userId et data (champs à modifier).
  // Elle retourne une Promise<void> car elle dispatch directement l'action sans retourner de données.
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  // Cette propriété est une fonction asynchrone pour supprimer un utilisateur et toutes ses données.
  // Elle accepte l'ID de l'utilisateur à supprimer.
  // Elle retourne une Promise<void> et dispatch l'action de suppression après succès de l'API.
  deleteUser: (userId: string) => Promise<void>;
  // Cette propriété est une fonction asynchrone pour enregistrer une transaction (achat/vente).
  // Elle accepte un payload avec userId, transaction et balanceAdjustment.
  // Elle dispatch directement sans appel API car la transaction a déjà été créée côté serveur.
  recordTransaction: (payload: RecordTransactionPayload) => Promise<void>;
  // Cette propriété est une fonction asynchrone pour récupérer toutes les cryptomonnaies depuis l'API.
  // Elle ne prend aucun paramètre car elle charge toutes les cryptos disponibles.
  // Elle dispatch l'action 'set-crypto-assets' avec les données récupérées.
  fetchCryptoAssets: () => Promise<void>;
  // Cette propriété est une fonction asynchrone pour récupérer tous les utilisateurs (admin only).
  // Elle ne prend aucun paramètre car elle charge tous les users de la table.
  // Elle dispatch l'action 'set-users' avec le tableau d'utilisateurs.
  fetchUsers: () => Promise<void>;
  // Cette propriété est une fonction asynchrone pour récupérer le compte du client connecté.
  // Elle ne prend aucun paramètre car le serveur identifie le client via la session.
  // Elle dispatch l'action 'set-client-account' avec le compte et les transactions.
  fetchClientAccount: () => Promise<void>;
};

// Cette instruction crée un contexte React pour partager l'état et le dispatch.
// createContext<AppStateContextValue | undefined>(undefined) crée un contexte typé avec une valeur par défaut undefined.
// Les composants accéderont à ce contexte via useContext(AppStateContext) ou le hook personnalisé useAppState().
const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);
// Cette instruction crée un contexte React pour partager les fonctions de service.
// Il est séparé de AppStateContext pour permettre un contrôle granulaire des re-renders.
// Les composants accéderont à ce contexte via useContext(AppServicesContext) ou le hook personnalisé useAppServices().
const AppServicesContext = createContext<AppServicesContextValue | undefined>(undefined);

// Fonction pour sauvegarder l'état dans le localStorage du navigateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
function persistState(state: AppState) {
  // Essaie de sauvegarder
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
  try {
    // Convertit l'état en JSON et le sauvegarde
// Elle accède ou appelle une propriété/méthode d'un objet.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Affiche un avertissement si la sauvegarde échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
    console.warn('Unable to persist BitChest state', error);
  }
}

// Fonction pour charger l'état depuis le localStorage
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
function loadPersistedState(): AppState | null {
  // Essaie de charger
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
  try {
    // Récupère la valeur sauvegardée
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    const raw = window.localStorage.getItem(STORAGE_KEY);
    // Parse et retourne si elle existe, sinon retourne null
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch (error) {
    // Affiche un avertissement si le chargement échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
    console.warn('Unable to load BitChest state from storage', error);
    // Retourne null en cas d'erreur
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
    return null;
  }
}

// Reducer qui traite les actions pour mettre à jour l'état
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
function appReducer(state: AppState, action: AppAction): AppState {
  // Switch sur le type d'action
// Cette accolade ouvre un nouveau bloc de code.
  switch (action.type) {
    // Action pour mettre à jour les informations d'un utilisateur
// Ce case traite l'action de type 'update-user' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'update-user': {
      // Déstructure l'ID et les données de l'utilisateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { userId, data } = action.payload;
      // Map sur tous les utilisateurs
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const users = state.users.map((user) =>
        // Si c'est l'utilisateur à mettre à jour
// Elle accède ou appelle une propriété/méthode d'un objet.
        user.id === userId
// Cette accolade ouvre un nouveau bloc de code.
          ? {
            // Fusionne les données existantes avec les nouvelles
// Elle accède ou appelle une propriété/méthode d'un objet.
            ...user,
// Elle accède ou appelle une propriété/méthode d'un objet.
            ...data,
            // Met à jour la date de modification
// Elle accède ou appelle une propriété/méthode d'un objet.
            updatedAt: new Date().toISOString(),
          }
// Elle exécute une instruction JavaScript.
          : // Sinon retourne l'utilisateur inchangé
// Elle exécute une instruction JavaScript.
          user,
// Elle exécute une instruction JavaScript.
      );
      // Retourne le nouvel état avec les utilisateurs mis à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return { ...state, users };
    }
    // Action pour créer un nouveau client avec son compte
// Ce case traite l'action de type 'create-client' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'create-client': {
      // Déstructure l'utilisateur et le compte
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { user, account } = action.payload;
      // Retourne le nouvel état
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Ajoute le nouvel utilisateur à la liste
// Elle accède ou appelle une propriété/méthode d'un objet.
        users: [...state.users, user],
        // Ajoute le compte client
// Cette accolade ouvre un nouveau bloc de code.
        clientAccounts: {
          // Spread les comptes existants
// Elle accède ou appelle une propriété/méthode d'un objet.
          ...state.clientAccounts,
          // Ajoute le nouveau compte
// Elle accède ou appelle une propriété/méthode d'un objet.
          [account.userId]: account,
        },
      };
    }
    // Action pour supprimer un utilisateur et son compte
// Ce case traite l'action de type 'delete-user' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'delete-user': {
      // Déstructure l'ID utilisateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { userId } = action.payload;
      // Retourne le nouvel état
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Filtre la liste des utilisateurs (supprime celui avec cet ID)
// Elle accède ou appelle une propriété/méthode d'un objet.
        users: state.users.filter((user) => user.id !== userId),
        // Filtre également les comptes clients (supprime celui de cet utilisateur)
// Elle accède ou appelle une propriété/méthode d'un objet.
        clientAccounts: Object.fromEntries(
          // Convertit en tableau [key, value], filtre, reconvertit en objet
// Elle accède ou appelle une propriété/méthode d'un objet.
          Object.entries(state.clientAccounts).filter(([key]) => key !== userId),
// Elle exécute une instruction JavaScript.
        ),
      };
    }
    // Action pour mettre à jour le mot de passe d'un client
// Ce case traite l'action de type 'update-client-password' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'update-client-password': {
      // Déstructure l'ID utilisateur et le nouveau mot de passe
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { userId, newPassword } = action.payload;
      // Map sur tous les utilisateurs pour mettre à jour
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const updatedUsers = state.users.map((user) =>
        // Si c'est l'utilisateur dont on change le mot de passe
// Elle accède ou appelle une propriété/méthode d'un objet.
        user.id === userId
// Cette accolade ouvre un nouveau bloc de code.
          ? {
            // Fusionne les données existantes
// Elle accède ou appelle une propriété/méthode d'un objet.
            ...user,
            // Met à jour le mot de passe
// Elle exécute une instruction JavaScript.
            password: newPassword,
            // Met à jour la date de modification
// Elle accède ou appelle une propriété/méthode d'un objet.
            updatedAt: new Date().toISOString(),
          }
// Elle exécute une instruction JavaScript.
          : // Sinon retourne l'utilisateur inchangé
// Elle exécute une instruction JavaScript.
          user,
// Elle exécute une instruction JavaScript.
      );
      // Retourne l'état avec les utilisateurs mis à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return { ...state, users: updatedUsers };
    }
    // Action pour enregistrer une transaction
// Ce case traite l'action de type 'record-transaction' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'record-transaction': {
      // Déstructure les données de la transaction
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { userId, transaction, balanceAdjustment } = action.payload;
      // Récupère le compte du client
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const account = state.clientAccounts[userId];
      // Si le compte n'existe pas, retourne l'état inchangé
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!account) {
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
        return state;
      }

      // Crée le compte mis à jour
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const updatedAccount: ClientAccount = {
        // Spread le compte existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...account,
        // Met à jour le solde EUR avec l'ajustement
// Elle accède ou appelle une propriété/méthode d'un objet.
        balanceEUR: Number((account.balanceEUR + balanceAdjustment).toFixed(2)),
        // Ajoute la nouvelle transaction à la liste
// Elle accède ou appelle une propriété/méthode d'un objet.
        transactions: [...account.transactions, transaction],
      };

      // Retourne l'état avec le compte mis à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Met à jour les comptes clients
        clientAccounts: { ...state.clientAccounts, [userId]: updatedAccount },
      };
    }
    // Action pour charger/remplacer tous les actifs cryptographiques
// Ce case traite l'action de type 'set-crypto-assets' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'set-crypto-assets': {
      // Retourne l'état avec les nouveaux actifs
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Remplace les actifs cryptographiques
// Elle accède ou appelle une propriété/méthode d'un objet.
        cryptoAssets: action.payload,
      };
    }
    // Action pour charger/remplacer la liste de tous les utilisateurs
// Ce case traite l'action de type 'set-users' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'set-users': {
      // Retourne l'état avec les nouveaux utilisateurs
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Remplace la liste des utilisateurs
// Elle accède ou appelle une propriété/méthode d'un objet.
        users: action.payload,
      };
    }
    // Action pour charger/remplacer le compte d'un client spécifique
// Ce case traite l'action de type 'set-client-account' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'set-client-account': {
      // Déstructure l'ID utilisateur et le compte
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { userId, account } = action.payload;
      // Retourne l'état avec le compte mis à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Met à jour les comptes clients
// Cette accolade ouvre un nouveau bloc de code.
        clientAccounts: {
          // Spread les comptes existants
// Elle accède ou appelle une propriété/méthode d'un objet.
          ...state.clientAccounts,
          // Met à jour le compte pour cet utilisateur
// Elle exécute une instruction JavaScript.
          [userId]: account,
        },
      };
    }
    // Action pour mettre à jour le prix d'une cryptomonnaie
// Ce case traite l'action de type 'update-crypto-price' dans le reducer.
// Il extrait les données du payload de l'action et calcule le nouvel état.
// Le nouvel état est retourné de manière immutable sans modifier l'état actuel.
    case 'update-crypto-price': {
      // Déstructure l'ID de la crypto et le prix
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const { cryptoId, price } = action.payload;
      // Récupère l'actif actuel
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const asset = state.cryptoAssets[cryptoId];
      // Si l'actif n'existe pas, retourne l'état inchangé
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!asset) {
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
        return state;
      }

      // Récupère le dernier point du graphique
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const lastPoint = asset.history[asset.history.length - 1];
      // Crée une copie de l'historique
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const newHistory = [...asset.history];

      // Si le dernier point est d'aujourd'hui
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (lastPoint && lastPoint.date.split('T')[0] === new Date().toISOString().split('T')[0]) {
        // Met à jour le prix du dernier point
// Cette accolade ouvre un nouveau bloc de code.
        newHistory[newHistory.length - 1] = {
          // Conserve la date
// Elle accède ou appelle une propriété/méthode d'un objet.
          date: lastPoint.date,
          // Met à jour le prix
// Elle exécute une instruction JavaScript.
          value: price,
        };
      } else {
        // Sinon ajoute un nouveau point
// Cette accolade ouvre un nouveau bloc de code.
        newHistory.push({
          // Date actuelle
// Elle accède ou appelle une propriété/méthode d'un objet.
          date: new Date().toISOString(),
          // Nouveau prix
// Elle exécute une instruction JavaScript.
          value: price,
        });
      }

      // Filtre pour ne conserver que les 30 derniers jours
      // Calcule la date d'il y a 30 jours
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const thirtyDaysAgo = new Date();
      // Recule de 30 jours
// Elle accède ou appelle une propriété/méthode d'un objet.
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      // Filtre les points plus anciens que 30 jours
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const filteredHistory = newHistory.filter((point) => new Date(point.date) >= thirtyDaysAgo);

      // Retourne l'état avec la crypto mise à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return {
        // Spread l'état existant
// Elle accède ou appelle une propriété/méthode d'un objet.
        ...state,
        // Met à jour les actifs cryptographiques
// Cette accolade ouvre un nouveau bloc de code.
        cryptoAssets: {
          // Spread les actifs existants
// Elle accède ou appelle une propriété/méthode d'un objet.
          ...state.cryptoAssets,
          // Met à jour l'actif spécifique
// Cette accolade ouvre un nouveau bloc de code.
          [cryptoId]: {
            // Spread l'actif existant
// Elle accède ou appelle une propriété/méthode d'un objet.
            ...asset,
            // Met à jour le prix actuel
// Elle exécute une instruction JavaScript.
            currentPrice: price,
            // Met à jour l'historique filtré
// Elle exécute une instruction JavaScript.
            history: filteredHistory,
          },
        },
      };
    }
    // Cas par défaut: retourne l'état inchangé
// Elle exécute une instruction JavaScript.
    default:
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return state;
  }
}

// Type pour les props du provider
// Cette accolade ouvre un nouveau bloc de code.
type AppStateProviderProps = {
  // Éléments enfants à envelopper avec le provider
// Elle accède ou appelle une propriété/méthode d'un objet.
  children: React.ReactNode;
};

// Composant provider qui gère l'état global et les services
export function AppStateProvider({ children }: AppStateProviderProps) {
  // Initialise le reducer avec l'état initial
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
  const [state, dispatch] = useReducer(
    // Le reducer qui traite les actions
// Elle exécute une instruction JavaScript.
    appReducer,
    // L'état initial
// Elle exécute une instruction JavaScript.
    INITIAL_STATE,
    // Initializer: charge depuis localStorage ou utilise l'état initial
// Cette accolade ouvre un nouveau bloc de code.
    (initial): AppState => {
      // Si on n'est pas dans le navigateur (SSR), retourne l'initial
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (typeof window === 'undefined') {
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
        return initial;
      }
      // Charge l'état persisté ou utilise l'initial
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const persisted = loadPersistedState();
      // Retourne l'état persisté s'il existe, sinon l'initial
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return persisted ?? initial;
    },
// Elle exécute une instruction JavaScript.
  );

  // Effet pour sauvegarder l'état quand il change
// Cette accolade ouvre un nouveau bloc de code.
  useEffect(() => {
    // Sauvegarde l'état actuel
// Elle exécute une instruction JavaScript.
    persistState(state);
  }, [state]);

  // Effet pour synchroniser les prix des cryptomonnaies toutes les 5 secondes
// Cette accolade ouvre un nouveau bloc de code.
  useEffect(() => {
    // Fonction pour récupérer les prix depuis l'API
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    const pollPrices = async () => {
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
      try {
        // Appelle l'API pour récupérer les cryptomonnaies
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
        const response: any = await api.getCryptocurrencies();
        // Si l'appel réussit
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
        if (response.success) {
          // Met à jour chaque crypto avec les nouveaux prix
// Cette accolade ouvre un nouveau bloc de code.
          Object.entries(response.cryptoAssets).forEach(([cryptoId, asset]: [string, any]) => {
            // Récupère l'actif courant depuis l'état
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
            const currentStateAsset = state.cryptoAssets[cryptoId];
            // Si le prix a changé et que l'actif existe localement
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
            if (currentStateAsset && currentStateAsset.currentPrice !== asset.currentPrice) {
              // Dispatch une action pour mettre à jour le prix
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
              dispatch({
                // Type d'action
// Elle exécute une instruction JavaScript.
                type: 'update-crypto-price',
                // Payload avec l'ID crypto et le nouveau prix
// Cette accolade ouvre un nouveau bloc de code.
                payload: {
// Elle exécute une instruction JavaScript.
                  cryptoId,
// Elle accède ou appelle une propriété/méthode d'un objet.
                  price: asset.currentPrice,
                },
              });
            }
          });
        }
      } catch (error) {
        // Affiche une erreur si la synchronisation échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
        console.warn('[Price Poll] Failed to fetch prices:', error);
      }
    };

    // Appelle immédiatement et puis toutes les 5 secondes
    // Première synchronisation immédiate
// Elle exécute une instruction JavaScript.
    pollPrices();
    // Crée un intervalle pour synchroniser toutes les 5 secondes
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    const interval = setInterval(pollPrices, 5000);

    // Cleanup: arrête l'intervalle au démontage
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
    return () => clearInterval(interval);
  }, [state.cryptoAssets]);

  // Service pour créer un nouveau client
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const createClient = useCallback(
    // Fonction asynchrone qui accepte les données du client
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    async (payload: CreateClientPayload) => {
      // Appelle l'API pour créer le client
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.createClient(payload.firstName, payload.lastName, payload.email);
      // Si la création échoue
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!response.success) {
        // Lance une erreur
// Elle accède ou appelle une propriété/méthode d'un objet.
        throw new Error(response.message || 'Failed to create client');
      }

      // Crée un objet utilisateur avec les données de la réponse
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const user: User = {
        // ID de l'utilisateur retourné par le serveur
// Elle accède ou appelle une propriété/méthode d'un objet.
        id: response.user.id,
        // Prénom
// Elle accède ou appelle une propriété/méthode d'un objet.
        firstName: response.user.firstName,
        // Nom de famille
// Elle accède ou appelle une propriété/méthode d'un objet.
        lastName: response.user.lastName,
        // Email
// Elle accède ou appelle une propriété/méthode d'un objet.
        email: response.user.email,
        // Rôle fixé à 'client'
// Elle exécute une instruction JavaScript.
        role: 'client',
        // Mot de passe vide (pour la sécurité)
// Elle exécute une instruction JavaScript.
        password: '',
        // Date de création
// Elle accède ou appelle une propriété/méthode d'un objet.
        createdAt: response.user.createdAt,
        // Date de dernière mise à jour
// Elle accède ou appelle une propriété/méthode d'un objet.
        updatedAt: response.user.updatedAt,
      };

      // Crée le compte client initial
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const account: ClientAccount = {
        // Lie au nouvel utilisateur
// Elle accède ou appelle une propriété/méthode d'un objet.
        userId: user.id,
        // Balance initiale: 500 EUR
// Elle exécute une instruction JavaScript.
        balanceEUR: 500,
        // Pas de transactions initialement
// Elle exécute une instruction JavaScript.
        transactions: [],
      };

      // Dispatch l'action de création
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
      dispatch({ type: 'create-client', payload: { user, account } });

      // Retourne le mot de passe temporaire et l'utilisateur
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return { tempPassword: response.temporaryPassword, user };
    },
// Elle exécute une instruction JavaScript.
    [],
// Elle exécute une instruction JavaScript.
  );

  // Service pour mettre à jour le profil de l'utilisateur connecté
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const updateCurrentUserProfile = useCallback(
    // Fonction asynchrone qui accepte les données à mettre à jour
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    async (data: Partial<Omit<User, 'id' | 'role' | 'createdAt' | 'password'>>) => {
      // Appelle l'API pour mettre à jour le profil
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.updateProfile(data);
      // Si la mise à jour échoue
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!response.success) {
        // Lance une erreur
// Elle accède ou appelle une propriété/méthode d'un objet.
        throw new Error(response.message || 'Failed to update profile');
      }
      // Retourne les données utilisateur mises à jour
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
      return response.user;
    },
// Elle exécute une instruction JavaScript.
    [],
// Elle exécute une instruction JavaScript.
  );

  // Service pour mettre à jour un utilisateur spécifique
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const updateUser = useCallback(
    // Fonction asynchrone qui accepte l'ID et les données
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    async (payload: UpdateUserPayload) => {
      // Appelle l'API pour mettre à jour l'utilisateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.updateClient(payload.userId, payload.data);
      // Si la mise à jour échoue
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!response.success) {
        // Lance une erreur
// Elle accède ou appelle une propriété/méthode d'un objet.
        throw new Error(response.message || 'Failed to update user');
      }
      // Dispatch l'action de mise à jour
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
      dispatch({ type: 'update-user', payload });
    },
// Elle exécute une instruction JavaScript.
    [],
// Elle exécute une instruction JavaScript.
  );

  // Service pour supprimer un utilisateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const deleteUser = useCallback(
    // Fonction asynchrone qui accepte l'ID utilisateur
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    async (userId: string) => {
      // Appelle l'API pour supprimer l'utilisateur
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.deleteClient(userId);
      // Si la suppression échoue
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (!response.success) {
        // Lance une erreur
// Elle accède ou appelle une propriété/méthode d'un objet.
        throw new Error(response.message || 'Failed to delete user');
      }
      // Dispatch l'action de suppression
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
      dispatch({ type: 'delete-user', payload: { userId } });
    },
// Elle exécute une instruction JavaScript.
    [],
// Elle exécute une instruction JavaScript.
  );

  // Service pour enregistrer une transaction
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const recordTransaction = useCallback(
    // Fonction asynchrone qui accepte les données de la transaction
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
    async (payload: RecordTransactionPayload) => {
      // Dispatch directement l'action (pas d'appel API ici)
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
      dispatch({ type: 'record-transaction', payload });
    },
// Elle exécute une instruction JavaScript.
    [],
// Elle exécute une instruction JavaScript.
  );

  // Service pour récupérer tous les actifs cryptographiques
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const fetchCryptoAssets = useCallback(async () => {
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
    try {
      // Appelle l'API pour récupérer les cryptomonnaies
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.getCryptocurrencies();
      // Si l'appel réussit
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (response.success) {
        // Dispatch l'action pour charger les actifs
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
        dispatch({ type: 'set-crypto-assets', payload: response.cryptoAssets });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
      console.warn('Failed to fetch cryptocurrencies:', error);
    }
  }, []);

  // Service pour récupérer tous les utilisateurs
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const fetchUsers = useCallback(async () => {
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
    try {
      // Appelle l'API pour récupérer tous les utilisateurs
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.getAllUsers();
      // Si l'appel réussit
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (response.success) {
        // Dispatch l'action pour charger les utilisateurs
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
        dispatch({
          // Type d'action
// Elle exécute une instruction JavaScript.
          type: 'set-users',
          // Transforme les utilisateurs au bon format
// Cette accolade ouvre un nouveau bloc de code.
          payload: response.users.map((u: any) => ({
            // ID de l'utilisateur
// Elle accède ou appelle une propriété/méthode d'un objet.
            id: u.id,
            // Prénom
// Elle accède ou appelle une propriété/méthode d'un objet.
            firstName: u.firstName,
            // Nom de famille
// Elle accède ou appelle une propriété/méthode d'un objet.
            lastName: u.lastName,
            // Email
// Elle accède ou appelle une propriété/méthode d'un objet.
            email: u.email,
            // Rôle
// Elle accède ou appelle une propriété/méthode d'un objet.
            role: u.role,
            // Mot de passe vide
// Elle exécute une instruction JavaScript.
            password: '',
            // Date de création
// Elle accède ou appelle une propriété/méthode d'un objet.
            createdAt: u.createdAt,
            // Date de dernière mise à jour
// Elle accède ou appelle une propriété/méthode d'un objet.
            updatedAt: u.updatedAt,
          })),
        });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
      console.warn('Failed to fetch users:', error);
    }
  }, []);

  // Service pour récupérer le compte du client connecté
// Cette fonction asynchrone gère une opération importante de l'application.
// Elle retourne une Promise et peut utiliser await pour les opérations asynchrones.
// Elle est memoïsée avec useCallback pour éviter les re-créations inutiles.
  const fetchClientAccount = useCallback(async () => {
// Ce bloc try-catch encapsule le code qui peut générer des erreurs.
// Il permet de capturer et gérer les exceptions de manière contrôlée.
// Sans cela, une erreur non gérée ferait crasher l'application.
    try {
      // Appelle l'API pour récupérer le compte du client
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
      const response: any = await api.getClientAccount();
      // Si l'appel réussit
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
      if (response.success) {
        // Dispatch l'action pour charger le compte
// Cette instruction envoie une action au reducer pour mettre à jour l'état global.
// Le reducer traitera cette action et retournera un nouvel état immutable.
// Tous les composants abonnés à cet état seront automatiquement re-rendus.
        dispatch({
          // Type d'action
// Elle exécute une instruction JavaScript.
          type: 'set-client-account',
          // Payload avec l'ID utilisateur et le compte
// Cette accolade ouvre un nouveau bloc de code.
          payload: {
            // ID de l'utilisateur
// Elle accède ou appelle une propriété/méthode d'un objet.
            userId: response.account.userId,
            // Compte du client avec les transactions
// Cette accolade ouvre un nouveau bloc de code.
            account: {
              // ID de l'utilisateur
// Elle accède ou appelle une propriété/méthode d'un objet.
              userId: response.account.userId,
              // Solde en EUR
// Elle accède ou appelle une propriété/méthode d'un objet.
              balanceEUR: response.account.balanceEUR,
              // Transforme les transactions au bon format
// Cette accolade ouvre un nouveau bloc de code.
              transactions: response.account.transactions.map((t: any) => ({
                // ID de la transaction
// Elle accède ou appelle une propriété/méthode d'un objet.
                id: t.id,
                // ID de la cryptomonnaie
// Elle accède ou appelle une propriété/méthode d'un objet.
                cryptoId: t.cryptoId,
                // Quantité
// Elle accède ou appelle une propriété/méthode d'un objet.
                quantity: t.quantity,
                // Prix par unité
// Elle accède ou appelle une propriété/méthode d'un objet.
                pricePerUnit: t.pricePerUnit,
                // Type de transaction
// Elle accède ou appelle une propriété/méthode d'un objet.
                type: t.type,
                // Timestamp
// Elle accède ou appelle une propriété/méthode d'un objet.
                timestamp: t.timestamp,
              })),
            },
          },
        });
      }
    } catch (error) {
      // Affiche une erreur si le chargement échoue
// Elle accède ou appelle une propriété/méthode d'un objet.
      console.warn('Failed to fetch client account:', error);
    }
  }, []);

  // Crée la valeur du contexte des services en memoisant
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
  const servicesValue = useMemo(
// Cette accolade ouvre un nouveau bloc de code.
    () => ({
      // Service de création de client
// Elle exécute une instruction JavaScript.
      createClient,
      // Service de mise à jour du profil courant
// Elle exécute une instruction JavaScript.
      updateCurrentUserProfile,
      // Service de mise à jour d'utilisateur
// Elle exécute une instruction JavaScript.
      updateUser,
      // Service de suppression d'utilisateur
// Elle exécute une instruction JavaScript.
      deleteUser,
      // Service d'enregistrement de transaction
// Elle exécute une instruction JavaScript.
      recordTransaction,
      // Service de récupération des cryptomonnaies
// Elle exécute une instruction JavaScript.
      fetchCryptoAssets,
      // Service de récupération des utilisateurs
// Elle exécute une instruction JavaScript.
      fetchUsers,
      // Service de récupération du compte client
// Elle exécute une instruction JavaScript.
      fetchClientAccount,
    }),
    // Dépendances: toutes les fonctions de service
// Elle exécute une instruction JavaScript.
    [createClient, updateCurrentUserProfile, deleteUser, recordTransaction, updateUser, fetchCryptoAssets, fetchUsers, fetchClientAccount],
// Elle exécute une instruction JavaScript.
  );

  // Retourne les providers imbriqués
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
  return (
    // Provider d'état (état + dispatch)
    <AppStateContext.Provider value={{ state, dispatch }}>
      {/* Provider de services (fonctions métier) */}
      <AppServicesContext.Provider value={servicesValue}>
        {/* Les enfants accèdent à l'état et aux services via les contextes */}
        {children}
// Elle accède ou appelle une propriété/méthode d'un objet.
      </AppServicesContext.Provider>
// Elle accède ou appelle une propriété/méthode d'un objet.
    </AppStateContext.Provider>
// Elle exécute une instruction JavaScript.
  );
}

// Hook pour accéder à l'état global
// Cette accolade ouvre un nouveau bloc de code.
export function useAppState() {
  // Récupère le contexte d'état
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
  const context = useContext(AppStateContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
  if (!context) {
// Elle exécute une instruction JavaScript.
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  // Retourne l'état global
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
  return context.state;
}

// Hook pour accéder aux services globaux
// Cette accolade ouvre un nouveau bloc de code.
export function useAppServices() {
  // Récupère le contexte des services
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
  const context = useContext(AppServicesContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
  if (!context) {
// Elle exécute une instruction JavaScript.
    throw new Error('useAppServices must be used within an AppStateProvider');
  }
  // Retourne les services
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
  return context;
}

// Hook pour accéder au dispatch global
// Cette accolade ouvre un nouveau bloc de code.
export function useAppDispatch() {
  // Récupère le contexte d'état
// Cette fonction gère une opération importante de l'application.
// Elle effectue un traitement synchrone et retourne immédiatement.
// Elle est définie pour encapsuler la logique métier de manière réutilisable.
  const context = useContext(AppStateContext);
  // Vérifie que le hook est utilisé dans un AppStateProvider
// Cette condition vérifie si une expression est vraie avant d'exécuter le code associé.
// Elle permet de contrôler le flux d'exécution en fonction de conditions logiques.
// Si la condition est fausse, le code dans le bloc if est ignoré.
  if (!context) {
// Elle exécute une instruction JavaScript.
    throw new Error('useAppDispatch must be used within an AppStateProvider');
  }
  // Retourne la fonction dispatch
// Cette instruction retourne la valeur ou le composant résultant de cette fonction.
// Elle termine l'exécution de la fonction et passe le contrôle au code appelant.
// La valeur retournée sera utilisée par le composant parent ou le code appelant.
  return context.dispatch;
}

