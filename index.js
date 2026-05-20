#!/usr/bin/env node
/**
 * Ponto de entrada na raiz do monorepo.
 * Redireciona para backend/ (use `cd backend && npm run dev` de preferência).
 */
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
process.chdir(backendDir);
require(path.join(backendDir, 'index.js'));
