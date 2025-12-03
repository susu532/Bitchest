const fs = require('fs');
const path = require('path');

// Configuration
const frontendDir = path.join(__dirname, '..', 'src');
const backendDir = path.join(__dirname, '..', '..', 'backend');

// Extensions à traiter
const tsExtensions = ['.ts', '.tsx', '.js', '.jsx'];
const phpExtensions = ['.php'];

let totalFilesProcessed = 0;
let totalCommentsRemoved = 0;

/**
 * Supprime tous les commentaires d'un fichier TypeScript/JavaScript
 */
function removeJSComments(content) {
    let result = content;
    let commentsRemoved = 0;

    // Supprime les commentaires multi-lignes /* ... */
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;
    const multiLineMatches = result.match(multiLineRegex) || [];
    commentsRemoved += multiLineMatches.length;
    result = result.replace(multiLineRegex, '');

    // Supprime les commentaires JSX {/* ... */}
    const jsxCommentRegex = /\{\s*\/\*[\s\S]*?\*\/\s*\}/g;
    const jsxMatches = result.match(jsxCommentRegex) || [];
    commentsRemoved += jsxMatches.length;
    result = result.replace(jsxCommentRegex, '');

    // Supprime les commentaires une ligne //
    const lines = result.split('\n');
    const cleanedLines = lines.map(line => {
        // Vérifie si la ligne contient un commentaire //
        const commentIndex = line.indexOf('//');
        if (commentIndex !== -1) {
            // Vérifie que // n'est pas dans une string
            const beforeComment = line.substring(0, commentIndex);
            const singleQuotes = (beforeComment.match(/'/g) || []).length;
            const doubleQuotes = (beforeComment.match(/"/g) || []).length;
            const backticks = (beforeComment.match(/`/g) || []).length;

            // Si nombre impair de quotes avant //, on est dans une string
            if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0 && backticks % 2 === 0) {
                commentsRemoved++;
                return beforeComment.trimEnd();
            }
        }
        return line;
    });

    result = cleanedLines.join('\n');

    // Supprime les lignes vides multiples consécutives
    result = result.replace(/\n\n\n+/g, '\n\n');

    return { content: result, removed: commentsRemoved };
}

/**
 * Supprime tous les commentaires d'un fichier PHP
 */
function removePHPComments(content) {
    let result = content;
    let commentsRemoved = 0;

    // Supprime les commentaires multi-lignes /* ... */
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;
    const multiLineMatches = result.match(multiLineRegex) || [];
    commentsRemoved += multiLineMatches.length;
    result = result.replace(multiLineRegex, '');

    // Supprime les commentaires une ligne // et #
    const lines = result.split('\n');
    const cleanedLines = lines.map(line => {
        // Commentaires //
        let commentIndex = line.indexOf('//');
        if (commentIndex !== -1) {
            const beforeComment = line.substring(0, commentIndex);
            const singleQuotes = (beforeComment.match(/'/g) || []).length;
            const doubleQuotes = (beforeComment.match(/"/g) || []).length;

            if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
                commentsRemoved++;
                return beforeComment.trimEnd();
            }
        }

        // Commentaires #
        commentIndex = line.indexOf('#');
        if (commentIndex !== -1) {
            const beforeComment = line.substring(0, commentIndex);
            const singleQuotes = (beforeComment.match(/'/g) || []).length;
            const doubleQuotes = (beforeComment.match(/"/g) || []).length;

            if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
                commentsRemoved++;
                return beforeComment.trimEnd();
            }
        }

        return line;
    });

    result = cleanedLines.join('\n');

    // Supprime les lignes vides multiples
    result = result.replace(/\n\n\n+/g, '\n\n');

    return { content: result, removed: commentsRemoved };
}

/**
 * Traite récursivement tous les fichiers d'un répertoire
 */
function processDirectory(dir, extensions, removeCommentsFn) {
    if (!fs.existsSync(dir)) {
        console.log(`⚠️  Répertoire non trouvé: ${dir}`);
        return;
    }

    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Ignore node_modules, vendor, etc.
            if (!['node_modules', 'vendor', 'dist', 'build', '.git'].includes(item)) {
                processDirectory(fullPath, extensions, removeCommentsFn);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(fullPath);
            if (extensions.includes(ext)) {
                processFile(fullPath, removeCommentsFn);
            }
        }
    });
}

/**
 * Traite un fichier individuel
 */
function processFile(filePath, removeCommentsFn) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { content: cleaned, removed } = removeCommentsFn(content);

        if (removed > 0) {
            fs.writeFileSync(filePath, cleaned, 'utf8');
            totalFilesProcessed++;
            totalCommentsRemoved += removed;
            console.log(`✅ ${path.relative(process.cwd(), filePath)} - ${removed} commentaires supprimés`);
        }
    } catch (error) {
        console.error(`❌ Erreur: ${filePath}`, error.message);
    }
}

// Exécution
console.log('🚀 Début de la suppression des commentaires...\n');

console.log('📂 Traitement du Frontend (TypeScript/JavaScript)...');
processDirectory(frontendDir, tsExtensions, removeJSComments);

console.log('\n📂 Traitement du Backend (PHP)...');
processDirectory(backendDir, phpExtensions, removePHPComments);

console.log('\n' + '='.repeat(50));
console.log('✅ Terminé !');
console.log(`📊 Fichiers modifiés: ${totalFilesProcessed}`);
console.log(`📊 Commentaires supprimés: ${totalCommentsRemoved}`);
console.log('='.repeat(50));
