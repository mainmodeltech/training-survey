"""
Moteur de scoring automatique des soumissions.
Calcule le niveau recommandé (Curriculat A ou B) et un score détaillé.
"""

LEVEL_WEIGHTS = {
    "debutant": 1,
    "intermediaire": 2,
    "avance": 3,
    "expert": 4,
}

FEATURE_WEIGHTS = {
    "Formules de base (SOMME, MOYENNE, NB)": {"jamais": 0, "parfois": 1, "souvent": 2},
    "Formule SI / SI imbriqués": {"jamais": 0, "parfois": 2, "souvent": 4},
    "RECHERCHEV / RECHERCHEH": {"jamais": 0, "parfois": 3, "souvent": 5},
    "Mise en forme conditionnelle": {"jamais": 0, "parfois": 2, "souvent": 3},
    "Tableaux croisés dynamiques (TCD)": {"jamais": 0, "parfois": 4, "souvent": 7},
    "Graphiques et visualisations": {"jamais": 0, "parfois": 2, "souvent": 4},
    "Filtres et tris avancés": {"jamais": 0, "parfois": 2, "souvent": 3},
    "Protection de feuilles / classeurs": {"jamais": 0, "parfois": 1, "souvent": 2},
    "Power Query / Connexion de données": {"jamais": 0, "parfois": 5, "souvent": 9},
    "Macros / VBA": {"jamais": 0, "parfois": 6, "souvent": 10},
}

ADVANCED_RESULTS = {
    "Nettoyer et consolider des données provenant de plusieurs sources (Power Query)",
    "Créer des outils de gestion sur-mesure (plannings, trackers de budget)",
    "Apprendre les bases de la macro-automation (VBA débutant)",
}

AMBITION_WEIGHTS = {
    "Je veux juste être à l'aise avec les fonctionnalités du quotidien": 0,
    "Je veux devenir la personne référente Excel dans mon équipe": 5,
    "Je veux découvrir les outils avancés comme Power BI ou Power Query": 10,
}


def compute_score(submission_data: dict) -> dict:
    score = 0
    breakdown = {}

    # 1. Score sur le niveau auto-déclaré (max 16)
    level_score = LEVEL_WEIGHTS.get(submission_data.get("self_level", "debutant"), 1) * 4
    breakdown["self_level"] = level_score
    score += level_score

    # 2. Score sur les fonctionnalités utilisées (max ~55)
    features = submission_data.get("features_usage", {})
    features_score = 0
    for feature, usage in features.items():
        w = FEATURE_WEIGHTS.get(feature, {})
        features_score += w.get(usage, 0)
    breakdown["features_usage"] = features_score
    score += features_score

    # 3. Score sur les résultats attendus (max 15)
    expected = submission_data.get("expected_results", [])
    advanced_count = sum(1 for r in expected if r in ADVANCED_RESULTS)
    results_score = advanced_count * 5
    breakdown["expected_results"] = results_score
    score += results_score

    # 4. Score sur l'ambition (max 10)
    ambition = submission_data.get("ambition_level", "")
    ambition_score = AMBITION_WEIGHTS.get(ambition, 0)
    breakdown["ambition"] = ambition_score
    score += ambition_score

    # Score normalisé sur 100
    max_possible = 16 + 55 + 15 + 10
    normalized = round((score / max_possible) * 100, 1)
    breakdown["raw_score"] = score
    breakdown["normalized"] = normalized

    # Décision curriculat
    if normalized >= 45:
        recommended_level = "B"
        recommended_label = "Curriculat B — Excel Avancé & Reporting Automatisé"
        recommended_duration = "3 jours"
        key_topics = [
            "Formules avancées : INDEX/EQUIV, XLOOKUP, SOMME.SI.ENS",
            "Power Query — consolidation et nettoyage de données",
            "Tableaux de bord dynamiques automatisés",
            "Introduction aux macros VBA",
            "Visualisations professionnelles et mise en page rapport",
        ]
    else:
        recommended_level = "A"
        recommended_label = "Curriculat A — Excel Opérationnel"
        recommended_duration = "2 jours"
        key_topics = [
            "Fondamentaux consolidés : formules courantes, mise en forme",
            "Formule SI, RECHERCHEV, NB.SI.ENS",
            "Tableaux croisés dynamiques — création et analyse",
            "Graphiques professionnels pour reportings",
            "Organisation et protection des classeurs",
        ]

    return {
        "score_total": normalized,
        "score_breakdown": breakdown,
        "computed_level": recommended_level,
        "recommended_label": recommended_label,
        "recommended_duration": recommended_duration,
        "key_topics": key_topics,
    }
