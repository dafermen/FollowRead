import { lazy, Suspense } from "react";

import {
  DetailPage,
  DocumentationPage,
  DownloadsPage,
  FavoritesPage,
  HistoryPage,
  HomePage,
  LibraryPage,
  SettingsPage,
  VocabularyPage,
} from "./ReaderApp.js";

const StoryReaderPage = lazy(async () => ({
  default: (await import("./StoryReaderPage.js")).StoryReaderPage,
}));

/**
 * Lightweight route boundary for the dependency-free Reader.
 *
 * Phase 8 intentionally avoids adding a routing library for a small public surface. Links use
 * normal browser navigation, which also makes direct PWA routes and refresh behavior explicit.
 */
export const App = () => {
  const path = window.location.pathname;
  let page;
  if (path === "/library") {
    page = <LibraryPage />;
  } else if (path === "/favorites") {
    page = <FavoritesPage />;
  } else if (path === "/downloads") {
    page = <DownloadsPage />;
  } else if (path === "/history") {
    page = <HistoryPage />;
  } else if (path === "/vocabulary") {
    page = <VocabularyPage />;
  } else if (path === "/settings") {
    page = <SettingsPage />;
  } else if (path === "/documentation") {
    page = <DocumentationPage />;
  } else if (path.startsWith("/details/")) {
    page = <DetailPage slug={path.slice("/details/".length)} />;
  } else if (path.startsWith("/read/")) {
    page = <StoryReaderPage slug={path.slice("/read/".length)} />;
  } else {
    page = <HomePage />;
  }
  return (
    <Suspense
      fallback={
        <main className="route-loading">
          <p role="status">Preparando esta pantalla…</p>
        </main>
      }
    >
      {page}
    </Suspense>
  );
};
