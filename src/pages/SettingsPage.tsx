import { CirclePlay, Download, Rows3, Sparkles, Vibrate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { hasRemoteApi } from '@/api/httpClient';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { Switch } from '@/components/ui/form';
import { ListGroup, ListRow, RowIcon, SectionFooter, SectionHeader } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { useTheme } from '@/context/ThemeContext';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { usePreferences } from '@/hooks/usePreferences';
import { celebrate, configureFeedback, feedback } from '@/services/feedbackService';
import type { ThemePreference } from '@/services/themePreference';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Automatique' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { preferences, updatePreferences } = usePreferences();
  const theme = useTheme();
  const install = useInstallPrompt();

  return (
    <PageLayout reading>
      <PageHeader back backLabel="Plus" title="Réglages" />

      <SectionHeader>Apparence</SectionHeader>
      <div className="rounded-xl bg-surface p-2.5">
        <Segmented aria-label="Thème de l’application" fullWidth value={theme.preference} onChange={theme.setPreference} options={THEME_OPTIONS} />
      </div>
      <SectionFooter>
        {theme.preference === 'system'
          ? `« Automatique » suit le réglage de ton téléphone (actuellement ${theme.resolved === 'dark' ? 'sombre' : 'clair'}).`
          : 'Ton choix est enregistré sur cet appareil.'}
      </SectionFooter>

      <SectionHeader>Retours</SectionHeader>
      <ListGroup>
        <ListRow
          as="label"
          icon={<RowIcon color="#FF9500"><Vibrate /></RowIcon>}
          title="Vibrations"
          trailing={(
            <Switch
              checked={preferences.hapticsEnabled}
              onCheckedChange={(hapticsEnabled) => {
                updatePreferences({ hapticsEnabled });
                configureFeedback({ haptics: hapticsEnabled });
                if (hapticsEnabled) feedback('select');
              }}
            />
          )}
        />
        <ListRow
          icon={<RowIcon color="#AF52DE"><Sparkles /></RowIcon>}
          title="Tester une célébration"
          last
          onClick={() => { feedback('complete'); void celebrate('big'); }}
        />
      </ListGroup>

      <SectionHeader>Application</SectionHeader>
      <ListGroup>
        <ListRow
          as="label"
          icon={<RowIcon color="#0A84FF"><Rows3 /></RowIcon>}
          title="Interface dense"
          trailing={<Switch checked={preferences.denseMode} onCheckedChange={(denseMode) => updatePreferences({ denseMode })} />}
        />
        <ListRow
          as="label"
          icon={<RowIcon color="#34A853"><CirclePlay /></RowIcon>}
          title="Lecture audio automatique"
          last
          trailing={<Switch checked={preferences.autoPlayAudio} onCheckedChange={(autoPlayAudio) => updatePreferences({ autoPlayAudio })} />}
        />
      </ListGroup>

      <SectionHeader>Compte</SectionHeader>
      <ListGroup>
        <ListRow
          title="Profil"
          detail={`${preferences.profile.level} · ${preferences.profile.dailyGoal} mots / jour`}
          chevron
          last={install.standalone}
          onClick={() => navigate('/profile')}
        />
        {install.standalone ? null : install.canInstall ? (
          <ListRow
            icon={<RowIcon color="#5856D6"><Download /></RowIcon>}
            title={<span className="text-violet">Installer sur l’écran d’accueil</span>}
            last
            onClick={install.install}
          />
        ) : (
          <ListRow title="Installer l’application" subtitle="Menu du navigateur › « Ajouter à l’écran d’accueil »" last />
        )}
      </ListGroup>
      <SectionFooter>
        {hasRemoteApi ? 'Données synchronisées avec ton serveur.' : 'Mode démonstration : aucune donnée n’est envoyée.'} Pas de micro, pas de notifications, pas de cache hors connexion.
      </SectionFooter>
    </PageLayout>
  );
}
