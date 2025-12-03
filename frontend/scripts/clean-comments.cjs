const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'state', 'AppStateProvider.tsx');

// Lecture du fichier
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Patterns de commentaires à supprimer
const patternsToRemove = [
    /^\/\/ Cette accolade (ferme|ouvre) un bloc/,
    /^\/\/ Cette ligne effectue une opération nécessaire/,
    /^\/\/ Elle marque la fin d'une fonction/,
    /^\/\/ L'indentation permet de visualiser/,
    /^\/\/ Elle définit le début d'une fonction/,
    /^\/\/ Le code à l'intérieur de ce bloc/,
    /^\/\/ Elle contribue à la logique globale/,
    /^\/\/\s*$/,
];

// Filtrage des lignes
const cleanedLines = lines.filter(line => {
    const trimmed = line.trim();
    return !patternsToRemove.some(pattern => pattern.test(trimmed));
});

// Écriture du fichier nettoyé
fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8');

console.log(`✅ Nettoyage terminé !`);
console.log(`📊 Commentaires supprimés : ${lines.length - cleanedLines.length}`);
console.log(`📄 Lignes avant : ${lines.length}`);
console.log(`📄 Lignes après : ${cleanedLines.length}`);
