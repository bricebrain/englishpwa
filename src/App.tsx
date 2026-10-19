import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { usePortraitOrientationLock } from '@/hooks/usePortraitOrientationLock';

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const AssimilLessonPage = lazy(() => import('@/pages/AssimilLessonPage').then((module) => ({ default: module.AssimilLessonPage })));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage').then((module) => ({ default: module.FlashcardsPage })));
const ListeningPage = lazy(() => import('@/pages/ListeningPage').then((module) => ({ default: module.ListeningPage })));
const LingvistPage = lazy(() => import('@/pages/LingvistPage').then((module) => ({ default: module.LingvistPage })));
const LivePage = lazy(() => import('@/pages/LivePage').then((module) => ({ default: module.LivePage })));
const MorePage = lazy(() => import('@/pages/MorePage').then((module) => ({ default: module.MorePage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ReadingPage = lazy(() => import('@/pages/ReadingPage').then((module) => ({ default: module.ReadingPage })));
const ScriptsPage = lazy(() => import('@/pages/ScriptsPage').then((module) => ({ default: module.ScriptsPage })));
const SentenceBuilderPage = lazy(() => import('@/pages/SentenceBuilderPage').then((module) => ({ default: module.SentenceBuilderPage })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const StoryPage = lazy(() => import('@/pages/StoryPage').then((module) => ({ default: module.StoryPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })));
const TriagePage = lazy(() => import('@/pages/TriagePage').then((module) => ({ default: module.TriagePage })));

export function App() {
  usePortraitOrientationLock();

  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center"><div className="shimmer size-16 rounded-2xl" /></div>}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="lingvist" element={<LingvistPage />} />
          <Route path="scripts" element={<ScriptsPage />} />
          <Route path="live" element={<LivePage />} />
          <Route path="plus" element={<MorePage />} />
          <Route path="phrases" element={<SentenceBuilderPage />} />
          <Route path="ecouter" element={<ListeningPage />} />
          <Route path="lire" element={<ReadingPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="lingvist-triage" element={<TriagePage />} />
          <Route path="assimil/lesson/:index" element={<AssimilLessonPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="recherche" element={<SearchPage />} />
          <Route path="histoire" element={<StoryPage />} />

          <Route path="scripts-audios" element={<Navigate to="/scripts" replace />} />
          <Route path="seance-live" element={<Navigate to="/live" replace />} />
          <Route path="review" element={<Navigate to="/flashcards" replace />} />
          <Route path="construire-phrases" element={<Navigate to="/phrases" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
