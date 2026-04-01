
// ============================================================================
// Cette ligne vide marque le début du fichier source App.tsx.
// Elle permet de séparer visuellement le contenu du métadonnées d'import.
// L'absence de code ici signifie que le fichier commence par des imports.
// ============================================================================


// ============================================================================
// Import React Router DOM : Ce module est une bibliothèque de routage pour React.
// Navigate est un composant qui redirige l'utilisateur vers une autre route programmatiquement.
// Outlet est un composant qui affiche les composants enfants des routes imbriquées.
// Route est un composant qui définit une correspondance entre une URL et un composant React.
// Routes est un conteneur qui englobe tous les composants Route de l'application.
// useLocation est un hook qui retourne l'objet location actuel contenant les informations de l'URL.
// ============================================================================
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

// ============================================================================
// Import useEffect de React : Ce hook permet d'exécuter des effets secondaires.
// Les effets secondaires incluent les appels API, les abonnements, et les modifications du DOM.
// useEffect s'exécute après le rendu du composant et peut être configuré avec des dépendances.
// ============================================================================
import { useEffect } from 'react';

// ============================================================================
// Import AppStateProvider : Ce composant fournit l'état global de l'application.
// Il utilise le pattern Context pour partager l'état entre tous les composants enfants.
// Ce provider gère les cryptomonnaies, les utilisateurs, et les comptes clients.
// ============================================================================
import { AppStateProvider } from './state/AppStateProvider';

// ============================================================================
// Import AuthProvider et useAuth : AuthProvider fournit le contexte d'authentification.
// useAuth est un hook personnalisé qui permet d'accéder à l'état d'authentification.
// Ces imports permettent de gérer la connexion, déconnexion, et les informations utilisateur.
// ============================================================================
import { AuthProvider, useAuth } from './state/AuthContext';

// ============================================================================
// Import système de notifications : useNotifications est un hook pour ajouter des notifications.
// NotificationContainer est le composant qui affiche visuellement les notifications.
// NotificationProvider fournit le contexte de gestion des notifications à l'application.
// ============================================================================
import { useNotifications, NotificationContainer, NotificationProvider } from './components/common/Notifications';

// ============================================================================
// Import echoService : Ce service gère les communications WebSocket en temps réel.
// Il permet de s'abonner aux événements du serveur comme les changements de solde.
// Echo est basé sur Laravel Echo pour la communication avec le backend Laravel.
// ============================================================================
import { echoService } from './utils/echo';

// ============================================================================
// Import LoginPage : Ce composant affiche la page de connexion de l'application.
// Il contient le formulaire d'authentification avec email et mot de passe.
// Cette page est la première vue que l'utilisateur non connecté voit.
// ============================================================================
import LoginPage from './pages/LoginPage';

// ============================================================================
// Import AdminDashboard : Ce composant affiche le tableau de bord administrateur.
// Il contient les fonctionnalités de gestion des clients et des cryptomonnaies.
// Seuls les utilisateurs avec le rôle 'admin' peuvent accéder à cette page.
// ============================================================================
import AdminDashboard from './pages/AdminDashboard';

// ============================================================================
// Import ClientDashboard : Ce composant affiche le tableau de bord client.
// Il permet aux clients de voir leur portefeuille et d'acheter/vendre des cryptos.
// Seuls les utilisateurs avec le rôle 'client' peuvent accéder à cette page.
// ============================================================================
import ClientDashboard from './pages/ClientDashboard';

// ============================================================================
// Définition du type RequireAuthProps : Ce type TypeScript définit les propriétés attendues.
// C'est une interface qui spécifie la structure des props du composant RequireAuth.
// Le mot-clé 'type' déclare un alias de type personnalisé pour la vérification statique.
// ============================================================================
type RequireAuthProps = {

  // ============================================================================
  // Propriété allowedRoles : C'est un tableau qui contient les rôles autorisés.
  // Array<'admin' | 'client'> signifie que seuls 'admin' ou 'client' sont acceptés.
  // Cette propriété détermine quels utilisateurs peuvent accéder à la route protégée.
  // ============================================================================
  allowedRoles: Array<'admin' | 'client'>;
};

// ============================================================================
// Déclaration de la fonction RequireAuth : Ce composant protège les routes nécessitant une authentification.
// Le mot-clé 'function' déclare une fonction nommée en JavaScript/TypeScript.
// { allowedRoles } utilise la déstructuration pour extraire la propriété des props.
// : RequireAuthProps spécifie le type TypeScript des paramètres de la fonction.
// ============================================================================
function RequireAuth({ allowedRoles }: RequireAuthProps) {

  // ============================================================================
  // Appel du hook useLocation : Ce hook retourne l'objet location de React Router.
  // 'const' déclare une variable constante qui ne peut pas être réassignée.
  // 'location' contient les informations sur l'URL actuelle (pathname, search, hash).
  // ============================================================================
  const location = useLocation();

  // ============================================================================
  // Appel du hook useAuth : Ce hook accède au contexte d'authentification.
  // La déstructuration { user, isAuthenticated, isLoading } extrait trois propriétés.
  // 'user' contient les données de l'utilisateur connecté ou null.
  // 'isAuthenticated' est un booléen indiquant si l'utilisateur est connecté.
  // 'isLoading' est un booléen indiquant si la vérification d'auth est en cours.
  // ============================================================================
  const { user, isAuthenticated, isLoading } = useAuth();

  // ============================================================================
  // Vérification de l'état de chargement : Cette condition vérifie si l'auth est en cours.
  // 'if' est une structure conditionnelle qui exécute le bloc si la condition est vraie.
  // 'isLoading' étant true signifie que l'application vérifie encore l'authentification.
  // ============================================================================
  if (isLoading) {

    // ============================================================================
    // Retour d'un indicateur de chargement : Ce JSX affiche "Loading..." pendant la vérification.
    // 'return' termine l'exécution de la fonction et retourne une valeur.
    // <div> est un élément HTML générique utilisé comme conteneur.
    // ============================================================================
    return <div>Loading...</div>;
  }

  // ============================================================================
  // Vérification de l'authentification : Cette condition vérifie si l'utilisateur est connecté.
  // '!' est l'opérateur de négation logique qui inverse la valeur booléenne.
  // '||' est l'opérateur OU logique : vrai si au moins une condition est vraie.
  // !user vérifie que l'objet user existe (n'est pas null ou undefined).
  // ============================================================================
  if (!isAuthenticated || !user) {

    // ============================================================================
    // Redirection vers la page de connexion : Navigate redirige vers la route "/".
    // 'to="/"' spécifie la route de destination (page de connexion).
    // 'state={{ from: location }}' passe la location actuelle pour redirection post-login.
    // 'replace' remplace l'entrée dans l'historique au lieu d'en ajouter une nouvelle.
    // ============================================================================
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // ============================================================================
  // Vérification des rôles autorisés : Cette condition vérifie si le rôle est permis.
  // '!' inverse le résultat de includes() pour vérifier si le rôle N'EST PAS inclus.
  // 'allowedRoles.includes(user.role)' vérifie si le rôle de l'utilisateur est dans la liste.
  // ============================================================================
  if (!allowedRoles.includes(user.role)) {

    // ============================================================================
    // Calcul de la route de destination : Cette ligne détermine où rediriger l'utilisateur.
    // 'const' déclare une constante nommée 'target'.
    // L'opérateur ternaire '? :' retourne '/admin' si admin, sinon '/client'.
    // 'user.role === 'admin'' compare le rôle de l'utilisateur avec la chaîne 'admin'.
    // ============================================================================
    const target = user.role === 'admin' ? '/admin' : '/client';

    // ============================================================================
    // Redirection vers le tableau de bord approprié : Navigate redirige vers la bonne page.
    // 'to={target}' utilise la variable target comme destination dynamique.
    // 'replace' empêche l'utilisateur de revenir à cette page avec le bouton retour.
    // Cette redirection assure que chaque rôle accède uniquement à son tableau de bord.
    // ============================================================================
    return <Navigate to={target} replace />;
  }

  // ============================================================================
  // Rendu des routes enfants : Outlet affiche le composant de la route imbriquée.
  // Si toutes les vérifications passent, l'utilisateur peut voir le contenu protégé.
  // Outlet est un placeholder qui sera remplacé par le composant de la route enfant.
  // ============================================================================
  return <Outlet />;
}

// ============================================================================
// Déclaration de la fonction AppRoutes : Ce composant définit toutes les routes de l'application.
// 'function' est le mot-clé JavaScript pour déclarer une fonction.
// 'AppRoutes' est le nom du composant, conventionnellement en PascalCase.
// Ce composant centralise la configuration du routage de l'application.
// ============================================================================
function AppRoutes() {

  // ============================================================================
  // Extraction de isLoading et user du contexte Auth : useAuth retourne l'état d'authentification.
  // 'const' déclare des constantes qui ne peuvent pas être réassignées.
  // '{ isLoading, user }' utilise la déstructuration d'objet pour extraire ces propriétés.
  // Ces valeurs sont utilisées pour gérer l'affichage conditionnel et les abonnements.
  // ============================================================================
  const { isLoading, user } = useAuth();

  // ============================================================================
  // Extraction de addNotification du contexte Notifications : Ce hook gère les notifications.
  // 'addNotification' est une fonction pour afficher des messages à l'utilisateur.
  // Cette fonction prend un titre, un type (success, error, info) et un message optionnel.
  // ============================================================================
  const { addNotification } = useNotifications();

  // ============================================================================
  // Hook useEffect pour les abonnements WebSocket : Configure les événements en temps réel.
  // 'useEffect' est un hook React qui exécute du code après le rendu.
  // '() => {...}' est une fonction fléchée qui définit l'effet à exécuter.
  // ============================================================================
  useEffect(() => {

    // ============================================================================
    // Vérification de l'existence de l'ID utilisateur : Cette condition vérifie si l'utilisateur est connecté.
    // 'user?.id' utilise l'optional chaining pour accéder à id seulement si user existe.
    // '?' empêche une erreur si user est null ou undefined.
    // ============================================================================
    if (user?.id) {

      // ============================================================================
      // Abonnement aux événements utilisateur : Cette méthode s'abonne au canal WebSocket.
      // 'echoService' est le service qui gère les connexions WebSocket Laravel Echo.
      // 'subscribeToUserEvents' prend l'ID utilisateur et des callbacks pour les événements.
      // ============================================================================
      echoService.subscribeToUserEvents(

        // ============================================================================
        // Passage de l'ID utilisateur : Ce paramètre identifie le canal WebSocket privé.
        // 'user.id' est l'identifiant unique de l'utilisateur connecté.
        // Chaque utilisateur a son propre canal pour recevoir ses notifications.
        // ============================================================================
        user.id,

        // ============================================================================
        // Callback pour les changements de solde : Cette fonction est appelée quand le solde change.
        // '(data) => {...}' est une fonction fléchée qui reçoit les données de l'événement.
        // 'data' contient les informations sur le changement de solde envoyées par le serveur.
        // ============================================================================
        (data) => {

          // ============================================================================
          // Ajout d'une notification de changement de solde : addNotification affiche le message.
          // Le premier paramètre est le titre : "Balance Changed: " + la raison du changement.
          // 'data.reason' est la description du changement (achat, vente, etc.).
          // ============================================================================
          addNotification(

            // ============================================================================
            // Création du titre de notification : Template literal pour le message.
            // Le backtick (`) permet d'incorporer des variables avec ${}.
            // 'data.reason' contient la raison du changement envoyée par le serveur.
            // ============================================================================
            `Balance Changed: ${data.reason}`,

            // ============================================================================
            // Type de notification 'info' : Indique une notification informative (bleu).
            // 'info' est une des valeurs possibles : 'success', 'error', 'info', 'warning'.
            // Ce type détermine le style visuel de la notification affichée.
            // ============================================================================
            'info',

            // ============================================================================
            // Message détaillé de la notification : Affiche le nouveau solde et la variation.
            // 'data.newBalance.toFixed(2)' formate le nombre avec 2 décimales.
            // L'opérateur ternaire ajoute '+' si le changement est positif.
            // 'data.balanceChange' contient le montant de la variation (positif ou négatif).
            // ============================================================================
            `New balance: €${data.newBalance.toFixed(2)} (${data.balanceChange > 0 ? '+' : ''}€${data.balanceChange.toFixed(2)})`,
          );
        },

        // ============================================================================
        // Callback pour les transactions complétées : Appelé après un achat ou une vente.
        // '(data) => {...}' est la fonction qui traite les données de la transaction.
        // 'data' contient le type de transaction, le message, et d'autres détails.
        // ============================================================================
        (data) => {

          // ============================================================================
          // Ajout de notification de transaction : Affiche un message de succès.
          // 'addNotification' ajoute une notification visible à l'utilisateur.
          // Cette notification confirme que la transaction a été effectuée.
          // ============================================================================
          addNotification(

            // ============================================================================
            // Titre dynamique selon le type de transaction : Affiche "Purchase" ou "Sale".
            // 'data.type === 'buy'' compare le type à 'buy'.
            // L'opérateur ternaire '? :' choisit entre 'Purchase' et 'Sale'.
            // " Completed" est concaténé pour former le titre complet.
            // ============================================================================
            `${data.type === 'buy' ? 'Purchase' : 'Sale'} Completed`,

            // ============================================================================
            // Type 'success' pour la notification : Indique une action réussie (vert).
            // 'success' applique un style visuel positif à la notification.
            // L'utilisateur voit immédiatement que l'opération a réussi.
            // ============================================================================
            'success',

            // ============================================================================
            // Message de confirmation : Affiche le message envoyé par le serveur.
            // 'data.message' contient la description détaillée de la transaction.
            // Les backticks créent un template literal (même sans interpolation ici).
            // ============================================================================
            `${data.message}`,
          );
        },
      );

      // ============================================================================
      // Fonction de nettoyage : Cette fonction est retournée pour le cleanup de useEffect.
      // 'return () => {...}' définit ce qui se passe quand le composant est démonté.
      // Le nettoyage est crucial pour éviter les fuites mémoire et les abonnements orphelins.
      // ============================================================================
      return () => {

        // ============================================================================
        // Désabonnement du canal utilisateur : Libère les ressources WebSocket.
        // 'echoService.unsubscribe' retire l'abonnement au canal spécifié.
        // Le template literal crée le nom du canal : "user.{id}".
        // Ceci empêche la réception d'événements après la déconnexion.
        // ============================================================================
        echoService.unsubscribe(`user.${user.id}`);
      };
    }

  // ============================================================================
  // Tableau de dépendances du useEffect : Spécifie quand l'effet doit être ré-exécuté.
  // '[user?.id, addNotification]' liste les valeurs dont dépend cet effet.
  // Si user.id change (connexion/déconnexion), l'effet est ré-exécuté.
  // 'addNotification' est inclus car il est utilisé dans l'effet.
  // ============================================================================
  }, [user?.id, addNotification]);

  // ============================================================================
  // Vérification de l'état de chargement : Affiche un loader pendant la vérification.
  // 'if (isLoading)' vérifie si l'authentification est encore en cours de vérification.
  // Ceci évite un flash de contenu non autorisé pendant le chargement initial.
  // ============================================================================
  if (isLoading) {

    // ============================================================================
    // Retour du composant de chargement : Affiche "Loading..." à l'utilisateur.
    // 'return' termine l'exécution et retourne le JSX.
    // '<div>Loading...</div>' est un indicateur de chargement simple.
    // ============================================================================
    return <div>Loading...</div>;
  }

  // ============================================================================
  // Retour du JSX principal : Définit la structure de routage de l'application.
  // 'return (...)' retourne le JSX qui sera rendu dans le DOM.
  // Les parenthèses permettent d'écrire du JSX multi-lignes.
  // ============================================================================
  return (
    // ============================================================================
    // Composant Routes : Conteneur principal pour toutes les définitions de routes.
    // <Routes> englobe tous les composants Route de l'application.
    // React Router utilise ce composant pour faire correspondre l'URL aux composants.
    // ============================================================================
    <Routes>
      
      {/* ============================================================================
      Route de la page de connexion : Définit la route racine "/" pour LoginPage.
      'path="/"' indique que cette route correspond à l'URL racine.
      'element={<LoginPage />}' spécifie le composant à rendre pour cette route.
      Cette route est accessible à tous, même sans authentification.
      ============================================================================ */}
      <Route path="/" element={<LoginPage />} />

      
      {/* ============================================================================
      Route protégée pour les administrateurs : RequireAuth vérifie l'authentification.
      'element={<RequireAuth allowedRoles={['admin']} />}' applique la protection.
      'allowedRoles={['admin']}' limite l'accès aux utilisateurs avec le rôle admin.
      Les routes enfants ne sont accessibles que si l'utilisateur est admin.
      ============================================================================ */}
      <Route element={<RequireAuth allowedRoles={['admin']} />}>
        
        {/* ============================================================================
        Route du tableau de bord admin : Définit le chemin pour AdminDashboard.
        'path="/admin/*"' correspond à /admin et toutes les sous-routes (/admin/...).
        Le '*' est un wildcard qui capture tous les segments de chemin après /admin.
        'element={<AdminDashboard />}' rend le composant AdminDashboard.
        ============================================================================ */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      
      {/* ============================================================================
      Route protégée pour les clients : RequireAuth vérifie l'authentification client.
      'element={<RequireAuth allowedRoles={['client']} />}' applique la protection.
      'allowedRoles={['client']}' limite l'accès aux utilisateurs avec le rôle client.
      Les routes enfants ne sont accessibles que si l'utilisateur est client.
      ============================================================================ */}
      <Route element={<RequireAuth allowedRoles={['client']} />}>
    
        {/* ============================================================================
        Route du tableau de bord client : Définit le chemin pour ClientDashboard.
        'path="/client/*"' correspond à /client et toutes les sous-routes.
        Le '*' wildcard permet la navigation interne dans le dashboard client.
        'element={<ClientDashboard />}' rend le composant ClientDashboard.
        ============================================================================ */}
        <Route path="/client/*" element={<ClientDashboard />} />
      </Route>

   
      {/* ============================================================================
      Route de fallback : Redirige toutes les URLs non reconnues vers la racine.
      'path="*"' capture toutes les routes qui ne correspondent à aucune autre.
      '<Navigate to="/" replace />' redirige vers la page de connexion.
      'replace' évite d'ajouter cette entrée dans l'historique de navigation.
      ============================================================================ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================================================
// Déclaration de la fonction NotificationWrapper : Encapsule le conteneur de notifications.
// 'function' déclare une fonction composant React.
// 'NotificationWrapper' extrait les notifications du contexte et les passe au container.
// Ce pattern sépare la logique d'accès au contexte de l'affichage.
// ============================================================================
function NotificationWrapper() {

  // ============================================================================
  // Extraction des notifications et de la fonction de suppression : Depuis le contexte.
  // 'useNotifications()' appelle le hook pour accéder au contexte des notifications.
  // 'notifications' est le tableau des notifications actives à afficher.
  // 'removeNotification' est la fonction pour fermer une notification spécifique.
  // ============================================================================
  const { notifications, removeNotification } = useNotifications();

  // ============================================================================
  // Retour du conteneur de notifications : Affiche les notifications à l'écran.
  // '<NotificationContainer ... />' est le composant qui rend visuellement les notifications.
  // 'notifications={notifications}' passe le tableau des notifications actives.
  // 'onRemove={removeNotification}' passe la fonction de callback pour fermer une notification.
  // ============================================================================
  return <NotificationContainer notifications={notifications} onRemove={removeNotification} />;
}

// ============================================================================
// Export du composant App : C'est le point d'entrée principal de l'application React.
// 'export default' rend ce composant accessible comme export par défaut du module.
// 'function App()' déclare le composant fonctionnel principal.
// Ce composant assemble tous les providers et le routage de l'application.
// ============================================================================
export default function App() {

  // ============================================================================
  // Retour de la structure JSX de l'application : Définit la hiérarchie des providers.
  // 'return (...)' retourne le JSX qui sera monté dans le DOM.
  // Les parenthèses permettent d'écrire du JSX sur plusieurs lignes.
  // ============================================================================
  return (

    // ============================================================================
    // AppStateProvider : Provider de niveau supérieur pour l'état global de l'application.
    // Ce composant fournit l'accès aux cryptomonnaies, utilisateurs, et comptes.
    // Tous les composants enfants peuvent accéder à cet état via useAppState.
    // ============================================================================
    <AppStateProvider>
  
      {/* ============================================================================
      AuthProvider : Provider d'authentification imbriqué dans AppStateProvider.
      Ce composant gère l'état de connexion, l'utilisateur actuel, et les fonctions auth.
      Tous les composants enfants peuvent utiliser useAuth pour accéder à l'authentification.
      ============================================================================ */}
      <AuthProvider>
       
        {/* ============================================================================
        NotificationProvider : Provider de notifications imbriqué.
        Ce composant gère la liste des notifications et les fonctions add/remove.
        Tous les composants enfants peuvent afficher des notifications via useNotifications.
        ============================================================================ */}
        <NotificationProvider>
        
          {/* ============================================================================
          AppRoutes : Composant de routage principal de l'application.
          Ce composant définit toutes les routes et la logique de navigation.
          Il est rendu à l'intérieur de tous les providers pour avoir accès aux contextes.
          ============================================================================ */}
          <AppRoutes />
        
          {/* ============================================================================
          NotificationWrapper : Composant qui affiche les notifications à l'écran.
          Il est placé à côté d'AppRoutes pour être rendu au même niveau.
          Les notifications apparaissent au-dessus du contenu de l'application.
          ============================================================================ */}
          <NotificationWrapper />
        </NotificationProvider>
      </AuthProvider>
    </AppStateProvider>
  );
}

