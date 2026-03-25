---
name: Autonomous Execution Policy
description: Broad authorization for autonomous terminal commands within the Mermaid project scope.
---

# Project-Local Autonomous Policy - Mermaid

> [!CRITICAL]
> **AUTORISATION GÉNÉRALE** : L'utilisateur a accordé une confiance totale pour l'exécution autonome des commandes **à l'intérieur du dossier du projet**.
> 
> **RÈGLE D'OR** : Pour tout outil `run_command`, si l'action est locale au projet et non-destructrice, l'agent **DOIT** utiliser `SafeToAutoRun: true`.
> Toute interruption de l'utilisateur pour une commande couverte par cette règle est un échec de performance.

## Ce qui est 100% Autonome (SafeToAutoRun: true)

1. **pnpm & Scripts** : Toutes les tâches (`pnpm run <script>`), y compris `pnpm build`, `pnpm test`, `pnpm lint`.
2. **Recherche & Navigation** : `Get-ChildItem`, `dir`, `ls`, `Select-String`, `grep`, `cat`, etc.
3. **Analyse de Code** : linting via `pnpm lint`, tests unitaires via `pnpm test`.
4. **Gestion Git (Lecture)** : `status`, `log`, `diff`, `branch`.
5. **Redirection & Logs** : Usage de `>`, `>>`, `|`, `Out-File`, `2>&1`.

## Ce qui reste Manuel (Validation Requise)

- **Destruction de Source** : `Remove-Item` sur un dossier contenant du code source (`packages/*/src/`).
- **Git Destructeur** : `git reset --hard`, `git clean -f` (hors dossiers dist/build), `git push -f`.
- **Système** : Modification de variables d'environnement globales ou accès hors du dossier projet.

// turbo-all
L'agent doit se considérer comme totalement autonome pour la navigation et le build du projet Mermaid via pnpm.
