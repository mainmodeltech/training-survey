export const DEPARTMENTS = [
  "Administration",
  "Finance & Comptabilité",
  "Suivi-Évaluation",
  "Programmes / Projets",
  "Ressources Humaines",
  "Communication",
  "Direction générale",
  "Autre",
];

export const FEATURES = [
  "Formules de base (SOMME, MOYENNE, NB)",
  "Formule SI / SI imbriqués",
  "RECHERCHEV / RECHERCHEH",
  "Mise en forme conditionnelle",
  "Tableaux croisés dynamiques (TCD)",
  "Graphiques et visualisations",
  "Filtres et tris avancés",
  "Protection de feuilles / classeurs",
  "Power Query / Connexion de données",
  "Macros / VBA",
];

export const LEVELS = [
  {
    value: "debutant",
    label: "Débutant",
    desc: "Je sais ouvrir un fichier, saisir des données et faire des opérations simples (+, -, SOMME)",
    color: "#3B8BD4",
    emoji: "🔵",
  },
  {
    value: "intermediaire",
    label: "Intermédiaire",
    desc: "J'utilise des formules courantes (SI, RECHERCHEV), je mets en forme mes tableaux, je fais des graphiques basiques",
    color: "#EF9F27",
    emoji: "🟡",
  },
  {
    value: "avance",
    label: "Avancé",
    desc: "J'utilise les TCD, des formules imbriquées, je commence à automatiser certaines tâches",
    color: "#E8440A",
    emoji: "🟠",
  },
  {
    value: "expert",
    label: "Expert",
    desc: "Je maîtrise VBA, Power Query, les formules complexes (INDIRECT, DECALER, matricielles)",
    color: "#1D9E75",
    emoji: "🟢",
  },
];

export const DAILY_TASKS = [
  "Suivi budgétaire et financier (dépenses, prévisions, écarts)",
  "Reporting de projets (indicateurs, tableaux de bord, rapports d'avancement)",
  "Suivi-évaluation (collecte d'indicateurs, analyse des performances)",
  "Gestion RH (congés, présences, salaires)",
  "Consolidation de données provenant de plusieurs sources",
  "Préparation de présentations et rapports pour la direction",
  "Analyse de données de terrain (enquêtes, collectes)",
  "Autre",
];

export const DAILY_TIMES = [
  "Moins d'1 heure par jour",
  "1 à 2 heures par jour",
  "3 à 4 heures par jour",
  "Plus de 4 heures — c'est mon outil principal",
];

export const DIFFICULTIES = [
  "Je perds beaucoup de temps à faire des tâches répétitives manuellement",
  "Mes formules renvoient des erreurs que je ne sais pas corriger",
  "Je ne sais pas comment faire des graphiques professionnels et lisibles",
  "Mes fichiers sont lents ou plantent avec de gros volumes de données",
  "Je consolide des données depuis plusieurs fichiers manuellement",
  "Mes tableaux de bord ne sont pas automatisés — je les refais chaque mois",
  "Je ne maîtrise pas les tableaux croisés dynamiques",
  "Autre",
];

export const MOTIVATIONS = [
  "Améliorer ma productivité personnelle et gagner du temps",
  "Produire des reportings plus professionnels pour la direction",
  "Mieux analyser les données de mes projets (indicateurs, S&E)",
  "Développer une compétence clé pour mon évolution de carrière",
  "Pouvoir former ou accompagner mes collègues ensuite",
  "Je suis mandaté(e) par ma hiérarchie — je découvrirai sur place",
];

export const EXPECTED_RESULTS = [
  "Créer un tableau de bord de suivi de projet automatisé",
  "Automatiser mon reporting mensuel (plus d'heures à copier-coller)",
  "Maîtriser les formules avancées (INDEX/EQUIV, XLOOKUP, SOMME.SI.ENS)",
  "Analyser rapidement de grands volumes de données avec les TCD",
  "Construire des visualisations convaincantes pour mes présentations",
  "Nettoyer et consolider des données provenant de plusieurs sources (Power Query)",
  "Créer des outils de gestion sur-mesure (plannings, trackers de budget)",
  "Apprendre les bases de la macro-automation (VBA débutant)",
];

export const AMBITIONS = [
  {
    value: "Je veux juste être à l'aise avec les fonctionnalités du quotidien",
    sub: "Consolidation des bases + quelques formules utiles",
  },
  {
    value: "Je veux devenir la personne référente Excel dans mon équipe",
    sub: "TCD, formules avancées, tableaux de bord automatisés",
  },
  {
    value: "Je veux découvrir les outils avancés comme Power BI ou Power Query",
    sub: "Prêt(e) à aller plus loin que Excel après",
  },
];

export const DURATIONS = [
  { value: "1 journée intensive (8h)", sub: "Idéal pour une consolidation ciblée" },
  { value: "2 journées (16h sur 2 jours consécutifs)", sub: "Bon équilibre profondeur / disponibilité" },
  { value: "3 journées (24h — formation complète)", sub: "Pour aller du niveau intermédiaire à avancé" },
  { value: "Sessions courtes sur plusieurs semaines (demi-journées)", sub: "Pour minimiser l'impact sur le travail quotidien" },
];

export const MODALITIES = [
  "Formation en présentiel dans vos locaux (Dakar / lieu à définir)",
  "Formation en ligne (à distance) via Teams / Zoom",
  "Format hybride (1 journée en ligne + 1 journée en présentiel)",
  "Pas de préférence — l'essentiel est le contenu",
];

export const COMPUTERS = [
  "Oui, j'ai mon propre ordinateur avec Excel (version Office)",
  "Oui, mais j'utilise Excel Online (version web)",
  "Non, je partage un ordinateur de bureau",
  "Je ne sais pas encore",
];

export const FILE_SIZES = [
  "Petits fichiers (moins de 500 lignes)",
  "Fichiers moyens (500 à 5 000 lignes)",
  "Grands fichiers (plus de 5 000 lignes)",
  "Je travaille avec plusieurs fichiers liés entre eux",
];

export const STEP_LABELS = [
  "Identification",
  "Niveau actuel",
  "Usage quotidien",
  "Ambitions",
  "Modalités",
];
