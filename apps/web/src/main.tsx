import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import type { DehydratedState } from '@tanstack/react-query';
import { App } from './App';
import './styles/index.css';
const root = document.getElementById('root');
if (!root) throw new Error('Root element missing');
const renderedPath = document.querySelector<HTMLMetaElement>('meta[name="artopus-rendered-path"]')?.content;
const requestedPath = window.location.pathname.replace(/\/+$/, '') || '/';
// SPA fallback documents and filtered URLs must mount their own route instead of hydrating another page.
const matchesDocument = renderedPath === requestedPath && !window.location.search;
const state = matchesDocument ? document.getElementById('artopus-query-state')?.textContent : undefined;
let initialState: DehydratedState | undefined;
try { if (state) initialState = JSON.parse(state) as DehydratedState; } catch { /* Recover by fetching public content normally. */ }
const application = <StrictMode><BrowserRouter><App initialState={initialState} /></BrowserRouter></StrictMode>;
if (root.childElementCount > 0 && matchesDocument) hydrateRoot(root, application);
else createRoot(root).render(application);
