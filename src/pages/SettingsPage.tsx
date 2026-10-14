import AddToHomeScreenRounded from '@mui/icons-material/AddToHomeScreenRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import CloudDoneRounded from '@mui/icons-material/CloudDoneRounded';
import CloudOffRounded from '@mui/icons-material/CloudOffRounded';
import MicOffRounded from '@mui/icons-material/MicOffRounded';
import NotificationsOffRounded from '@mui/icons-material/NotificationsOffRounded';
import PlayCircleRounded from '@mui/icons-material/PlayCircleRounded';
import VibrationRounded from '@mui/icons-material/VibrationRounded';
import ViewCompactRounded from '@mui/icons-material/ViewCompactRounded';
import VolumeUpRounded from '@mui/icons-material/VolumeUpRounded';
import { Alert, Box, Button, Card, CardContent, Stack, Switch, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { hasRemoteApi } from '@/api/httpClient';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { IconTile } from '@/components/ui/SessionChrome';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { usePreferences } from '@/hooks/usePreferences';
import { celebrate, configureFeedback, feedback } from '@/services/feedbackService';
import { gradients, tokens } from '@/theme';

function SettingRow({ icon, gradient, title, subtitle, checked, onChange }: {
  icon: ReactNode;
  gradient: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Stack component="label" direction="row" alignItems="center" gap={1.5} py={1.25} sx={{ cursor: 'pointer' }}>
      <IconTile icon={icon} gradient={gradient} size={40} radius={12} />
      <Box flex={1} minWidth={0}>
        <Typography fontWeight={750}>{title}</Typography>
        <Typography color="text.secondary" fontSize={12.5}>{subtitle}</Typography>
      </Box>
      <Switch checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </Stack>
  );
}

function InfoRow({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5} py={1}>
      <Box sx={{ width: 40, height: 40, borderRadius: 3, display: 'grid', placeItems: 'center', color: tokens.textFaint, background: 'rgba(255,255,255,0.04)' }}>{icon}</Box>
      <Box>
        <Typography fontWeight={700} fontSize={14.5}>{title}</Typography>
        <Typography color="text.secondary" fontSize={12.5}>{subtitle}</Typography>
      </Box>
    </Stack>
  );
}

export function SettingsPage() {
  const { preferences, updatePreferences } = usePreferences();
  const install = useInstallPrompt();

  return (
    <PageLayout reading>
      <PageHeader back title="Paramètres" subtitle="Sensations, préférences et installation" />
      <Stack gap={2}>
        <Card>
          <CardContent>
            <Typography variant="overline" color={tokens.violetSoft}>Sensations</Typography>
            <SettingRow
              icon={<VolumeUpRounded />} gradient={gradients.primary}
              title="Effets sonores" subtitle="Petits sons de réussite, d’erreur et de combo"
              checked={preferences.soundEnabled}
              onChange={(soundEnabled) => {
                updatePreferences({ soundEnabled });
                configureFeedback({ sound: soundEnabled, haptics: preferences.hapticsEnabled });
                if (soundEnabled) feedback('success');
              }}
            />
            <SettingRow
              icon={<VibrationRounded />} gradient={gradients.sunrise}
              title="Vibrations" subtitle="Retour haptique à chaque interaction"
              checked={preferences.hapticsEnabled}
              onChange={(hapticsEnabled) => {
                updatePreferences({ hapticsEnabled });
                configureFeedback({ sound: preferences.soundEnabled, haptics: hapticsEnabled });
                if (hapticsEnabled) feedback('select');
              }}
            />
            <Button
              fullWidth variant="outlined" startIcon={<AutoAwesomeRounded />} sx={{ mt: 1 }}
              onClick={() => { feedback('complete'); void celebrate('big'); }}
            >
              Tester la célébration
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="overline" color={tokens.violetSoft}>Application</Typography>
            <SettingRow
              icon={<ViewCompactRounded />} gradient={gradients.ocean}
              title="Interface dense" subtitle="Plus de contenu à l’écran"
              checked={preferences.denseMode}
              onChange={(denseMode) => updatePreferences({ denseMode })}
            />
            <SettingRow
              icon={<PlayCircleRounded />} gradient={gradients.mint}
              title="Lecture audio automatique" subtitle="Lancer l’audio à l’ouverture d’un contenu"
              checked={preferences.autoPlayAudio}
              onChange={(autoPlayAudio) => updatePreferences({ autoPlayAudio })}
            />
            <Box mt={1.5}>
              {install.standalone ? (
                <Alert severity="success">L’application est ouverte en mode installé.</Alert>
              ) : install.canInstall ? (
                <Button fullWidth size="large" variant="contained" startIcon={<AddToHomeScreenRounded />} onClick={install.install}>
                  Installer English Fluency
                </Button>
              ) : (
                <Alert severity="info">
                  Pour installer l’application, utilise « Ajouter à l’écran d’accueil » dans le menu du navigateur.
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Capacités Web</Typography>
            <InfoRow icon={<MicOffRounded />} title="Enregistrement vocal désactivé" subtitle="Aucune permission microphone n’est demandée." />
            <InfoRow icon={<NotificationsOffRounded />} title="Notifications désactivées" subtitle="Aucun rappel ni Web Push." />
            <InfoRow icon={<CloudOffRounded />} title="Mode online-first" subtitle="Les contenus ne sont pas mis en cache hors connexion." />
          </CardContent>
        </Card>

        <Stack direction="row" gap={1.5} alignItems="center" p={2} borderRadius={5} sx={{ background: hasRemoteApi ? 'rgba(52,229,160,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${hasRemoteApi ? 'rgba(52,229,160,0.25)' : tokens.border}` }}>
          <CloudDoneRounded sx={{ color: hasRemoteApi ? tokens.mint : tokens.textFaint }} />
          <Box>
            <Typography fontWeight={800}>{hasRemoteApi ? 'API distante configurée' : 'Mode démonstration local'}</Typography>
            <Typography color="text.secondary" fontSize={13}>
              {hasRemoteApi ? 'Les données proviennent du backend configuré.' : 'Définis VITE_API_BASE_URL pour connecter un backend sécurisé, sans secret dans le navigateur.'}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </PageLayout>
  );
}
