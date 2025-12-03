// Cette instruction importe les composants essentiels de react-router-dom pour gérer la navigation.
// Navigate permet de rediriger programmatiquement, Outlet affiche les routes enfants, Route définit une route, Routes est le conteneur de routes, et useLocation donne la position actuelle.
// Ces imports sont nécessaires pour créer un système de routing complet avec protection par rôle.
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
// Cette instruction importe le hook useEffect qui permet d'exécuter du code lors du montage du composant.
// Il est utilisé pour s'abonner aux événements WebSocket quand l'utilisateur se connecte.
// useEffect est un hook fondamental de React pour gérer les effets secondaires comme les subscriptions.
import { useEffect } from 'react';

// Cette instruction importe le provider d'état global qui enveloppe toute l'application.
// AppStateProvider fournit l'accès aux données partagées (utilisateurs, cryptos, transactions) via le Context API.
// Il permet à tous les composants enfants d'accéder et de modifier l'état global sans prop drilling.
import { AppStateProvider } from './state/AppStateProvider';
// Cette instruction importe le provider d'authentification et son hook pour accéder au contexte auth.
// AuthProvider gère l'état de connexion et les données de l'utilisateur connecté.
// useAuth est un hook personnalisé qui permet d'accéder à user, isAuthenticated et isLoading depuis n'importe quel composant.
import { AuthProvider, useAuth } from './state/AuthContext';
// Cette instruction importe les outils nécessaires pour gérer les notifications toast dans l'application.
// useNotifications permet d'ajouter/supprimer des notifications, NotificationContainer les affiche, et NotificationProvider fournit le contexte.
// Ce système permet d'afficher des messages de succès, d'erreur ou d'information en temps réel à l'utilisateur.
import { useNotifications, NotificationContainer, NotificationProvider } from './components/common/Notifications';
// Cette instruction importe le service echo qui gère les connexions WebSocket avec Reverb.
// echoService permet de s'abonner aux canaux privés pour recevoir des événements en temps réel.
// Il est utilisé pour écouter les changements de balance, les transactions complétées et les mises à jour de prix.
import { echoService } from './utils/echo';
// Cette instruction importe les trois pages principales de l'application.
// LoginPage est la page publique de connexion, AdminDashboard pour les administrateurs, et ClientDashboard pour les clients.
import LoginPage from './pages/LoginPage';
// Cette ligne importe le tableau de bord destiné aux administrateurs.
// Ce composant contient la gestion des clients, l'affichage des statistiques et les outils d'administration.
// Il est uniquement accessible aux utilisateurs ayant le rôle 'admin'.
import AdminDashboard from './pages/AdminDashboard';
// Cette ligne importe le tableau de bord destiné aux clients.
// Ce composant permet aux clients de voir leur portefeuille, acheter/vendre des cryptos et consulter leurs transactions.
// Il est uniquement accessible aux utilisateurs ayant le rôle 'client'.
import ClientDashboard from './pages/ClientDashboard';

// Cette déclaration de type définit la structure des props attendues par le composant RequireAuth.
// Elle spécifie que allowedRoles doit être un tableau contenant 'admin' et/ou 'client'.
// Ce type garantit que seuls les rôles valides peuvent être passés au composant de protection.
type RequireAuthProps = {
  // Cette propriété définit les rôles autorisés à accéder à la route protégée.
  // Le type Array<'admin' | 'client'> garantit que seules ces deux valeurs littérales sont acceptées.
  // Si le rôle de l'utilisateur ne correspond pas, il sera redirigé vers son dashboard approprié.
  allowedRoles: Array<'admin' | 'client'>;
};

// Cette déclaration de fonction définit un composant de protection des routes basé sur le rôle.
// Il vérifie l'authentification et le rôle de l'utilisateur avant d'autoriser l'accès aux routes enfants.
// Si l'utilisateur n'est pas autorisé, il est automatiquement redirigé vers la page appropriée.
function RequireAuth({ allowedRoles }: RequireAuthProps) {
  // Cette ligne utilise le hook useLocation pour obtenir l'emplacement actuel dans l'application.
  // Elle permet de sauvegarder la page que l'utilisateur tentait d'accéder avant d'être redirigé.
  // Cette information sera utilisée pour rediriger l'utilisateur après une connexion réussie.
  const location = useLocation();
  // Cette ligne extrait les données d'authentification depuis le contexte AuthContext.
  // user contient les informations de l'utilisateur connecté, isAuthenticated indique s'il est connecté, et isLoading indique si la vérification est en cours.
  // Ces valeurs sont fournies par AuthProvider et se mettent à jour automatiquement lors de login/logout.
  const { user, isAuthenticated, isLoading } = useAuth();

  // Cette condition vérifie si la vérification de l'authentification est encore en cours.
  // Pendant le chargement initial, on ne sait pas encore si l'utilisateur est connecté ou non.
  // Afficher un message de chargement évite un flash de redirection vers la page de login.
  if (isLoading) {
    // Cette instruction retourne un élément div simple avec le texte "Loading...".
    // C'est un placeholder temporaire affiché pendant que getCurrentUser() vérifie la session.
    // Dans une vraie application, ce serait remplacé par un spinner ou un skeleton screen.
    return <div>Loading...</div>;
  }

  // Cette condition vérifie si l'utilisateur n'est pas authentifié ou si l'objet user est null.
  // Si l'une de ces conditions est vraie, l'utilisateur doit être redirigé vers la page de login.
  // L'opérateur || (OU logique) retourne true si l'une des deux conditions est vraie.
  if (!isAuthenticated || !user) {
    // Cette instruction retourne un composant Navigate qui effectue une redirection.
    // to="/" indique la destination (page de login), state={{ from: location }} sauvegarde la page d'origine, et replace évite d'ajouter à l'historique.
    // L'utilisateur pourra être redirigé vers sa destination initiale après connexion grâce au state.
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Cette condition vérifie si le rôle de l'utilisateur est autorisé à accéder à cette route.
  // includes() retourne true si user.role ('admin' ou 'client') est dans allowedRoles.
  // L'opérateur ! inverse le résultat, donc cette condition est vraie si le rôle n'est PAS autorisé.
  if (!allowedRoles.includes(user.role)) {
    // Cette ligne calcule la destination de redirection en fonction du rôle de l'utilisateur.
    // Un admin essayant d'accéder à une route client sera redirigé vers /admin, et vice versa.
    // L'opérateur ternaire (? :) sélectionne '/admin' si user.role === 'admin', sinon '/client'.
    const target = user.role === 'admin' ? '/admin' : '/client';
    // Cette instruction redirige l'utilisateur vers son dashboard approprié.
    // replace évite d'ajouter cette redirection à l'historique du navigateur.
    // L'utilisateur ne pourra pas revenir en arrière vers la page non autorisée avec le bouton retour.
    return <Navigate to={target} replace />;
  }

  // Cette instruction retourne le composant Outlet qui affiche les routes enfants.
  // Si toutes les vérifications (authentification + rôle) passent, les routes enfants sont rendues.
  // Outlet est un placeholder fourni par react-router-dom pour afficher les routes imbriquées.
  return <Outlet />;
}

// Cette déclaration de fonction définit le composant principal de configuration des routes.
// Il gère la structure complète du routing de l'application et les abonnements WebSocket.
// C'est ici que la logique d'écoute des événements temps réel est implémentée.
function AppRoutes() {
  // Cette ligne extrait isLoading et user depuis le contexte d'authentification.
  // isLoading indique si la vérification de session est en cours, et user contient les données de l'utilisateur connecté.
  // Ces valeurs permettent de décider quoi afficher pendant le chargement et après l'authentification.
  const { isLoading, user } = useAuth();
  // Cette ligne extrait la fonction addNotification du contexte des notifications.
  // addNotification permet d'ajouter une nouvelle notification toast à afficher à l'utilisateur.
  // Elle sera utilisée pour informer l'utilisateur des changements de balance et des transactions complétées.
  const { addNotification } = useNotifications();

  // Cette ligne démarre un effet secondaire qui s'exécute quand user?.id ou addNotification changent.
  // L'effet s'abonne aux événements WebSocket pour l'utilisateur connecté.
  // Il se nettoie automatiquement (unsubscribe) quand le composant se démonte ou que l'utilisateur change.
  useEffect(() => {
    // Cette condition vérifie que l'utilisateur est bien connecté avant de s'abonner aux événements.
    // user?.id utilise l'optional chaining pour éviter une erreur si user est null.
    // Si l'utilisateur n'est pas connecté, on ne fait rien (pas de subscription WebSocket).
    if (user?.id) {
      // Cette instruction s'abonne aux événements WebSocket spécifiques à cet utilisateur.
      // Le premier paramètre est l'ID utilisateur, les deux suivants sont les callbacks pour balance-changed et transaction-completed.
      // echoService.subscribeToUserEvents gère la connexion au canal privé user.{userId}.
      echoService.subscribeToUserEvents(
        // Ce paramètre passe l'ID de l'utilisateur connecté au service echo.
        // Il sera utilisé pour construire le nom du canal privé: user.{userId}.
        // Seul cet utilisateur pourra recevoir les événements de ce canal.
        user.id,
        // Cette fonction callback est exécutée quand un événement UserBalanceChanged est reçu.
        // data contient newBalance (nouveau solde), balanceChange (différence), et reason (raison du changement).
        // La fonction affiche une notification informant l'utilisateur du changement de son solde.
        (data) => {
          // Cette instruction crée une notification informative pour l'utilisateur.
          // Le premier paramètre est le titre, le second est le type ('info'), et le troisième est la description détaillée.
          // toFixed(2) formate les nombres avec 2 décimales pour un affichage monétaire propre.
          addNotification(
            // Ce paramètre définit le titre de la notification affiché en gras.
            // Template literals (backticks) permettent d'inclure la raison du changement dynamiquement.
            // Par exemple: "Balance Changed: Buy crypto" ou "Balance Changed: Sell crypto".
            `Balance Changed: ${data.reason}`,
            // Ce paramètre définit le type de notification qui détermine la couleur et l'icône.
            // 'info' affiche généralement une couleur bleue et une icône d'information.
            // D'autres types possibles sont 'success', 'warning' et 'error'.
            'info',
            // Ce paramètre fournit une description détaillée du changement de balance.
            // Il affiche le nouveau solde et le montant du changement (positif ou négatif).
            // L'opérateur ternaire ajoute un '+' pour les augmentations mais pas pour les diminutions (le '-' est déjà présent).
            `New balance: €${data.newBalance.toFixed(2)} (${data.balanceChange > 0 ? '+' : ''}€${data.balanceChange.toFixed(2)})`,
          );
        },
        // Cette fonction callback est exécutée quand un événement TransactionCompleted est reçu.
        // data contient type ('buy' ou 'sell'), message (description complète), et les détails de la transaction.
        // La fonction affiche une notification de succès pour informer que la transaction est terminée.
        (data) => {
          // Cette instruction crée une notification de succès pour confirmer la transaction.
          // Le titre change selon le type: "Purchase Completed" pour un achat ou "Sale Completed" pour une vente.
          // Le message contient les détails complets de la transaction (crypto, quantité, prix).
          addNotification(
            // Ce paramètre construit le titre de la notification en fonction du type de transaction.
            // L'opérateur ternaire vérifie si data.type === 'buy' pour choisir "Purchase" ou "Sale".
            // Le résultat est "Purchase Completed" pour un achat ou "Sale Completed" pour une vente.
            `${data.type === 'buy' ? 'Purchase' : 'Sale'} Completed`,
            // Ce paramètre définit le type de notification comme 'success'.
            // 'success' affiche généralement une couleur verte et une icône de validation (checkmark).
            // Cela indique clairement à l'utilisateur que l'opération s'est bien déroulée.
            'success',
            // Ce paramètre utilise le message détaillé fourni par le serveur.
            // Le message contient typiquement: "Bought 0.5 BTC at €50000/unit" ou similaire.
            // Il est construit côté serveur pour être clair et informatif.
            `${data.message}`,
          );
        },
      );

      // Cette fonction de nettoyage est retournée par useEffect pour être exécutée au démontage.
      // Elle se désabonne du canal WebSocket pour éviter les fuites de mémoire.
      // Sans cela, les événements continueraient d'être reçus même après la déconnexion de l'utilisateur.
      return () => {
        // Cette instruction se désabonne du canal privé de l'utilisateur.
        // Elle ferme la connexion WebSocket pour ce canal spécifique.
        // Le template literal construit le nom exact du canal: user.{userId}.
        echoService.unsubscribe(`user.${user.id}`);
      };
    }
    // Ce tableau de dépendances détermine quand l'effet doit se réexécuter.
    // Si user?.id ou addNotification change, l'effet se réexécutera (unsubscribe puis resubscribe).
    // Sans ce tableau, l'effet s'exécuterait à chaque render, causant des subscriptions multiples.
  }, [user?.id, addNotification]);

  // Cette condition vérifie si la vérification d'authentification est en cours.
  // Pendant le chargement, on ne peut pas encore savoir quelles routes afficher.
  // Afficher un message de chargement évite un flash de contenu incorrect.
  if (isLoading) {
    // Cette instruction retourne un élément div avec un message de chargement.
    // C'est affiché pendant que AuthProvider appelle getCurrentUser() pour vérifier la session.
    // Dans une application de production, ce serait un spinner animé ou un skeleton screen.
    return <div>Loading...</div>;
  }


  // Cette instruction retourne la structure complète du routing de l'application.
  // Routes est le conteneur qui analyse l'URL courante et affiche la route correspondante.
  // Chaque Route définit un chemin et le composant à afficher pour ce chemin.
  // Ce composant Routes de react-router-dom v6 contient toutes les routes de l'application.
  // Il remplace Switch de la v5 et gère automatiquement le matching et le rendu des routes.
  // Les routes sont testées dans l'ordre et la première correspondance est affichée.
  return (
    <Routes>
      {/* Cette route définit la page de connexion comme route racine publique. */}
      {/* path="/" signifie que cette route correspond à l'URL de base de l'application. */}
      {/* element={<LoginPage />} spécifie le composant à afficher quand l'utilisateur visite cette route. */}
      <Route path="/" element={<LoginPage />} />

      {/* Cette route wrapper protège toutes les routes admin avec RequireAuth. */}
      {/* element={<RequireAuth allowedRoles={['admin']} />} vérifie que l'utilisateur est un admin. */}
      {/* Les routes imbriquées ne seront accessibles qu'aux utilisateurs ayant le rôle 'admin'. */}
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
        {/* Cette route imbriquée gère tous les chemins commençant par /admin. */}
        {/* L'astérisque (*) dans path="/admin/*" capture tous les sous-chemins. */}
        {/* AdminDashboard gérera son propre routing interne pour /admin/users, /admin/stats, etc. */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* Cette route wrapper protège toutes les routes client avec RequireAuth. */}
      {/* element={<RequireAuth allowedRoles={['client']} />} vérifie que l'utilisateur est un client. */}
      {/* Les routes imbriquées ne seront accessibles qu'aux utilisateurs ayant le rôle 'client'. */}
      <Route element={<RequireAuth allowedRoles={['client']} />}>
        {/* Cette route imbriquée gère tous les chemins commençant par /client. */}
        {/* L'astérisque (*) dans path="/client/*" capture tous les sous-chemins. */}
        {/* ClientDashboard gérera son propre routing interne pour /client/portfolio, /client/market, etc. */}
        <Route path="/client/*" element={<ClientDashboard />} />
      </Route>

      {/* Cette route catch-all redirige toutes les URLs non reconnues vers la page de login. */}
      {/* path="*" correspond à n'importe quel chemin qui n'a pas matché les routes précédentes. */}
      {/* element={<Navigate to="/" replace />} redirige l'utilisateur vers la racine (page de login). */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Cette déclaration de fonction définit un composant wrapper pour le conteneur de notifications.
// Il doit être à l'intérieur de NotificationProvider pour accéder au contexte des notifications.
// Ce wrapper sépare la logique d'affichage du contexte pour une meilleure organisation du code.
function NotificationWrapper() {
  // Cette ligne extrait notifications (tableau) et removeNotification (fonction) du contexte.
  // notifications contient toutes les notifications actives à afficher.
  // removeNotification permet de fermer une notification quand l'utilisateur clique sur X ou après timeout.
  const { notifications, removeNotification } = useNotifications();
  // Cette instruction retourne le composant NotificationContainer avec les props nécessaires.
  // notifications est le tableau de notifications à afficher, onRemove est la fonction de suppression.
  // NotificationContainer gérera le positionnement et l'animation des toasts.
  return <NotificationContainer notifications={notifications} onRemove={removeNotification} />;
}

// Cette déclaration de fonction définit le composant racine de l'application React.
// Il enveloppe toute l'application avec les différents providers de contexte.
// L'ordre des providers est important: AppStateProvider > AuthProvider > NotificationProvider.
export default function App() {
  // Cette instruction retourne la structure complète de l'application avec tous les providers.
  // Les providers sont imbriqués pour permettre l'accès aux contextes dans les composants enfants.
  // L'ordre garantit que chaque provider a accès aux contextes dont il dépend.
  return (
    // Ce provider fournit l'état global de l'application à tous les composants enfants.
    // Il gère les utilisateurs, les cryptomonnaies, les comptes clients et les transactions.
    // Tous les composants peuvent accéder et modifier ces données via useAppState et useAppServices.
    <AppStateProvider>
      // Ce provider gère l'authentification et les données de l'utilisateur connecté.
      // Il fournit user, isAuthenticated, login et logout à tous les composants.
      // Il dépend d'AppStateProvider car il utilise certaines fonctions de l'état global.
      <AuthProvider>
        // Ce provider gère le système de notifications toast de l'application.
        // Il fournit addNotification, removeNotification et le tableau notifications.
        // Il permet d'afficher des messages de succès, erreur ou info depuis n'importe quel composant.
        <NotificationProvider>
          // Ce composant configure toutes les routes et gère les abonnements WebSocket.
          // Il affiche LoginPage, AdminDashboard ou ClientDashboard selon l'URL et le rôle.
          // Il s'abonne également aux événements temps réel pour l'utilisateur connecté.
          <AppRoutes />
          // Ce composant affiche toutes les notifications actives dans un conteneur fixe.
          // Il se positionne généralement en haut à droite de l'écran.
          // Les notifications apparaissent avec une animation et disparaissent automatiquement après quelques secondes.
          <NotificationWrapper />
        </NotificationProvider>
      </AuthProvider>
    </AppStateProvider>
  );
}
