import {
  BellOff,
  CirclePlay,
  CloudCheck,
  CloudOff,
  Download,
  MicOff,
  Moon,
  Rows3,
  Sparkles,
  Sun,
  SunMoon,
  Vibrate,
  Volume2,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { hasRemoteApi } from '@/api/httpClient';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/form';
import { Segmented } from '@/components/ui/segmented';
import { IconTile } from '@/components/ui/SessionChrome';
import { useTheme } from '@/context/ThemeContext';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { usePreferences } from '@/hooks/usePreferences';
import { cn } from '@/lib/utils';
import { celebrate, configureFeedback, feedback } from '@/services/feedbackService';
import type { ThemePreference } from '@/services/themePreference';
import { gradients } from '@/theme';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: 'light', label: 'Clair', icon: <Sun /> },
  { value: 'dark', label: 'Sombre', icon: <Moon /> },
  { value: 'system', label: 'Système', icon: <SunMoon /> },
];

function SettingRow({ icon, gradient, title, subtitle, checked, onChange }: {
  icon: ReactNode;
  gradient: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2.5">
      <IconTile icon={icon} gradient={gradient} size={40} radius={12} />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{title}</span>
        <span className="block text-[12.5px] text-muted">{subtitle}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </label>
  );
}

function InfoRow({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink/[0.045] text-faint [&_svg]:size-5">{icon}</span>
      <div>
        <p className="text-[14.5px] font-bold">{title}</p>
        <p className="text-[12.5px] text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();
  const theme = useTheme();
  const install = useInstallPrompt();

  return (
    <PageLayout reading>
      <PageHeader back title="Paramètres" subtitle="Apparence, sensations et installation" />
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent>
            <span className="type-overline text-violet-soft">Apparence</span>
            <p className="mb-3 mt-0.5 text-[13px] text-muted">
              {theme.preference === 'system'
                ? `Suit le réglage de l’appareil (actuellement ${theme.resolved === 'dark' ? 'sombre' : 'clair'}).`
                : 'Ton choix est enregistré sur cet appareil.'}
            </p>
            <Segmented
              aria-label="Thème de l’application"
              fullWidth
              value={theme.preference}
              onChange={theme.setPreference}
              options={THEME_OPTIONS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <span className="type-overline text-violet-soft">Sensations</span>
            <SettingRow
              icon={<Volume2 />} gradient={gradients.primary}
              title="Effets sonores" subtitle="Petits sons de réussite, d’erreur et de combo"
              checked={preferences.soundEnabled}
              onChange={(soundEnabled) => {
                updatePreferences({ soundEnabled });
                configureFeedback({ sound: soundEnabled, haptics: preferences.hapticsEnabled });
                if (soundEnabled) feedback('success');
              }}
            />
            <SettingRow
              icon={<Vibrate />} gradient={gradients.sunrise}
              title="Vibrations" subtitle="Retour haptique à chaque interaction"
              checked={preferences.hapticsEnabled}
              onChange={(hapticsEnabled) => {
                updatePreferences({ hapticsEnabled });
                configureFeedback({ sound: preferences.soundEnabled, haptics: hapticsEnabled });
                if (hapticsEnabled) feedback('select');
              }}
            />
            <Button
              variant="outline" className="mt-2 w-full"
              onClick={() => { feedback('complete'); void celebrate('big'); }}
            >
              <Sparkles />Tester la célébration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <span className="type-overline text-violet-soft">Application</span>
            <SettingRow
              icon={<Rows3 />} gradient={gradients.ocean}
              title="Interface dense" subtitle="Plus de contenu à l’écran"
              checked={preferences.denseMode}
              onChange={(denseMode) => updatePreferences({ denseMode })}
            />
            <SettingRow
              icon={<CirclePlay />} gradient={gradients.mint}
              title="Lecture audio automatique" subtitle="Lancer l’audio à l’ouverture d’un contenu"
              checked={preferences.autoPlayAudio}
              onChange={(autoPlayAudio) => updatePreferences({ autoPlayAudio })}
            />
            <div className="mt-3">
              {install.standalone ? (
                <Alert severity="success">L’application est ouverte en mode installé.</Alert>
              ) : install.canInstall ? (
                <Button size="lg" className="w-full" onClick={install.install}>
                  <Download />Installer English Fluency
                </Button>
              ) : (
                <Alert severity="info">
                  Pour installer l’application, utilise « Ajouter à l’écran d’accueil » dans le menu du navigateur.
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <span className="type-overline text-muted">Capacités Web</span>
            <InfoRow icon={<MicOff />} title="Enregistrement vocal désactivé" subtitle="Aucune permission microphone n’est demandée." />
            <InfoRow icon={<BellOff />} title="Notifications désactivées" subtitle="Aucun rappel ni Web Push." />
            <InfoRow icon={<CloudOff />} title="Mode online-first" subtitle="Les contenus ne sont pas mis en cache hors connexion." />
          </CardContent>
        </Card>

        <div className={cn('flex items-center gap-3 rounded-[20px] border p-4', hasRemoteApi ? 'border-mint/25 bg-mint/8' : 'border-border bg-ink/[0.035]')}>
          <CloudCheck className={cn('size-6 shrink-0', hasRemoteApi ? 'text-mint' : 'text-faint')} />
          <div>
            <p className="font-extrabold">{hasRemoteApi ? 'API distante configurée' : 'Mode démonstration local'}</p>
            <p className="text-[13px] text-muted">
              {hasRemoteApi ? 'Les données proviennent du backend configuré.' : 'Définis VITE_API_BASE_URL pour connecter un backend sécurisé, sans secret dans le navigateur.'}
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
