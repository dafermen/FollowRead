import {
  DetailPage,
  DocumentationPage,
  FavoritesPage,
  HistoryPage,
  HomePage,
  LibraryPage,
  SettingsPage,
  VocabularyPage,
} from "./ReaderApp.js";
import { StoryReaderPage } from "./StoryReaderPage.js";

/**
 * Lightweight route boundary for the dependency-free Reader.
 *
 * Phase 8 intentionally avoids adding a routing library for a small public surface. Links use
 * normal browser navigation, which also makes direct PWA routes and refresh behavior explicit.
 */
export const App = () => {
  const path = window.location.pathname;
  if (path === "/library") {
    return <LibraryPage />;
  }
  if (path === "/favorites") {
    return <FavoritesPage />;
  }
  if (path === "/history") {
    return <HistoryPage />;
  }
  if (path === "/vocabulary") {
    return <VocabularyPage />;
  }
  if (path === "/settings") {
    return <SettingsPage />;
  }
  if (path === "/documentation") {
    return <DocumentationPage />;
  }
  if (path.startsWith("/details/")) {
    return <DetailPage slug={path.slice("/details/".length)} />;
  }
  if (path.startsWith("/read/")) {
    return <StoryReaderPage slug={path.slice("/read/".length)} />;
  }
  return <HomePage />;
};
