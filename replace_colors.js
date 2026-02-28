const fs = require('fs');
const path = require('path');

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = getFiles('src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Mobile layout header
    content = content.replace(/bg-blue-600/g, 'bg-gradient-to-r from-blue-600 to-blue-900');

    // Remove old button overrides
    content = content.replace(/bg-emerald-600 hover:bg-emerald-700 border-emerald-600\/50/g, 'bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30');
    content = content.replace(/bg-purple-600 hover:bg-purple-700 border-purple-600\/50/g, 'bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30');
    content = content.replace(/bg-orange-600 hover:bg-orange-700 border-orange-600\/50/g, 'bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30');
    content = content.replace(/bg-[a-z]+-600 hover:bg-[a-z]+-700 border-[a-z]+-600\/50/g, 'bg-gradient-to-r from-blue-600 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:from-blue-700 active:to-blue-950 border-blue-700/50 shadow-md shadow-blue-900/30');

    // Dashboard Icons and cards
    content = content.replace(/'text-purple-400', bg: 'bg-purple-500\\/10'/g, "'text - blue - 300', bg: 'bg - gradient - to - r from - blue - 900 / 40 to - blue - 800 / 40 mask - icon'");
    content = content.replace(/'text-emerald-400', bg: 'bg-emerald-500\\/10'/g, "'text - blue - 300', bg: 'bg - gradient - to - r from - blue - 900 / 40 to - blue - 800 / 40 mask - icon'");
    content = content.replace(/'text-orange-400', bg: 'bg-orange-500\\/10'/g, "'text - blue - 300', bg: 'bg - gradient - to - r from - blue - 900 / 40 to - blue - 800 / 40 mask - icon'");

    // Specifically for Dashboard map: hover gradient
    // Card uses: hover:bg-gradient-to-br hover:from-blue-900/40 hover:to-transparent hover:border-blue-800/50 (already correct)

    // Form cards backgrounds and borders
    content = content.replace(/border-emerald-500\/30/g, 'border-blue-700/50 shadow-lg shadow-blue-900/20');
    content = content.replace(/bg-emerald-500\/5/g, 'bg-gradient-to-b from-blue-950/30 to-blue-900/10');

    content = content.replace(/border-purple-500\/30/g, 'border-blue-700/50 shadow-lg shadow-blue-900/20');
    content = content.replace(/bg-purple-500\/5/g, 'bg-gradient-to-b from-blue-950/30 to-blue-900/10');

    // Focus rings
    content = content.replace(/focus:border-emerald-500/g, 'focus:border-blue-600');
    content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-blue-600');

    content = content.replace(/focus:border-purple-500/g, 'focus:border-blue-600');
    content = content.replace(/focus:ring-purple-500/g, 'focus:ring-blue-600');

    content = content.replace(/focus:border-orange-500/g, 'focus:border-blue-600');
    content = content.replace(/focus:ring-orange-500/g, 'focus:ring-blue-600');

    // Headers in forms
    content = content.replace(/text-emerald-100/g, 'text-blue-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300');
    content = content.replace(/text-purple-100/g, 'text-blue-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300');
    content = content.replace(/text-orange-100/g, 'text-blue-100 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-blue-300');

    // Card icons and small text
    content = content.replace(/text-emerald-400([^`]*?)bg-emerald-500\/10/g, 'text-blue-400$1bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-700/30');
    content = content.replace(/text-purple-400([^`]*?)bg-purple-500\/10/g, 'text-blue-400$1bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-700/30');
    content = content.replace(/text-orange-400([^`]*?)bg-orange-500\/10/g, 'text-blue-400$1bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-700/30');

    // Fallback if regex missed some
    content = content.replace(/text-emerald-400/g, 'text-blue-300');
    content = content.replace(/text-purple-400/g, 'text-blue-300');
    content = content.replace(/text-orange-400/g, 'text-blue-300');

    content = content.replace(/bg-emerald-500\/10/g, 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 shadow-inner shadow-blue-500/10');
    content = content.replace(/bg-purple-500\/10/g, 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 shadow-inner shadow-blue-500/10');
    content = content.replace(/bg-orange-500\/10/g, 'bg-gradient-to-r from-blue-900/40 to-blue-800/40 text-blue-300 shadow-inner shadow-blue-500/10');

    // Badges / Indicators
    content = content.replace(/bg-emerald-500\/10 text-emerald-400 border-emerald-500\/20/g, 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]');
    content = content.replace(/bg-emerald-500\/10 text-emerald-400 border border-emerald-500\/20/g, 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 text-blue-300 border border-blue-700/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]');

    // Replace hover colors for edit delete buttons (currently hover text-purple/red and hover bg-red/purple)
    // Make them unify to blue hover
    content = content.replace(/hover:text-purple-400 rounded-md hover:bg-purple-500\/10/g, 'hover:text-blue-300 rounded-md hover:bg-gradient-to-r from-blue-900/40 to-blue-800/40');
    content = content.replace(/hover:text-emerald-400 rounded-md hover:bg-emerald-500\/10/g, 'hover:text-blue-300 rounded-md hover:bg-gradient-to-r from-blue-900/40 to-blue-800/40');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + file);
    }
});
