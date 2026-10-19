import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import ConstructionRounded from '@mui/icons-material/ConstructionRounded';
import HeadphonesRounded from '@mui/icons-material/HeadphonesRounded';
import InsightsRounded from '@mui/icons-material/InsightsRounded';
import LayersRounded from '@mui/icons-material/LayersRounded';
import MenuBookRounded from '@mui/icons-material/MenuBookRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import PsychologyRounded from '@mui/icons-material/PsychologyRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import SwipeRounded from '@mui/icons-material/SwipeRounded';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { IconTile } from '@/components/ui/SessionChrome';
import { gradients, tokens } from '@/theme';

const sections = [
  {
    label: 'Pratique active',
    items: [
      { title: 'Lingvist', subtitle: 'Vocabulaire en contexte', path: '/lingvist', icon: AutoStoriesRounded, gradient: gradients.primary },
      { title: 'Tri éclair', subtitle: 'Swipe les mots faciles', path: '/lingvist-triage', icon: SwipeRounded, gradient: gradients.mint },
      { title: 'Construire des phrases', subtitle: 'Structures et transformations', path: '/phrases', icon: ConstructionRounded, gradient: gradients.sunrise },
      { title: 'Flashcards', subtitle: 'Cartes dues et nouveaux mots', path: '/flashcards', icon: LayersRounded, gradient: gradients.ocean },
    ],
  },
  {
    label: 'Compréhension',
    items: [
      { title: 'Écouter', subtitle: 'Assimil et écoute guidée', path: '/ecouter', icon: HeadphonesRounded, gradient: `linear-gradient(135deg, ${tokens.cyan}, ${tokens.mint})` },
      { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: MenuBookRounded, gradient: `linear-gradient(135deg, ${tokens.pink}, ${tokens.violet})` },
      { title: 'Histoire du jour', subtitle: 'Écrite avec tes mots à réviser', path: '/histoire', icon: AutoStoriesRounded, gradient: gradients.sunrise },
      { title: 'Rechercher', subtitle: 'Par idée dans tous tes contenus', path: '/recherche', icon: SearchRounded, gradient: gradients.ocean },
    ],
  },
  {
    label: 'Suivi et compte',
    items: [
      { title: 'Progression', subtitle: 'Niveau, XP et rétention', path: '/statistics', icon: InsightsRounded, gradient: `linear-gradient(135deg, ${tokens.amber}, ${tokens.pink})` },
      { title: 'Profil', subtitle: 'Niveau et objectif quotidien', path: '/profile', icon: PersonRounded, gradient: `linear-gradient(135deg, ${tokens.violetSoft}, ${tokens.violet})` },
      { title: 'Paramètres', subtitle: 'Sons, vibrations, installation', path: '/settings', icon: SettingsRounded, gradient: `linear-gradient(135deg, #8E8AAE, #5C5880)` },
    ],
  },
];

export function MorePage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageHeader eyebrow="Tout l’univers" title="Plus" subtitle="Parcours, suivi et compte" />

      <Box sx={{ mb: 3, p: 2, borderRadius: 5, display: 'flex', gap: 1.5, alignItems: 'flex-start', background: 'linear-gradient(135deg, rgba(139,108,255,0.16), rgba(255,93,162,0.1))', border: '1px solid rgba(139,108,255,0.25)' }}>
        <IconTile icon={<PsychologyRounded />} size={40} />
        <Box>
          <Typography fontWeight={800}>Le GPT Coach reste ton espace libre</Typography>
          <Typography color="text.secondary" fontSize={13.5} mt={0.3}>
            Les conversations longues vivent dans ChatGPT ; l’application se concentre sur la pratique guidée.
          </Typography>
        </Box>
      </Box>

      <Stagger gap={0.04}>
        <Stack gap={3}>
          {sections.map((section) => (
            <Box key={section.label}>
              <Typography variant="overline" color="text.secondary" display="block" mb={1}>{section.label}</Typography>
              <Grid container spacing={1.25}>
                {section.items.map(({ title, subtitle, path, icon: Icon, gradient }) => (
                  <Grid item xs={12} sm={6} key={path}>
                    <StaggerItem>
                      <Pressable onClick={() => navigate(path)} aria-label={title}>
                        <Stack
                          direction="row" alignItems="center" gap={1.5} p={1.5} borderRadius={5}
                          sx={{ background: tokens.surface, border: `1px solid ${tokens.border}` }}
                        >
                          <IconTile icon={<Icon />} gradient={gradient} />
                          <Box flex={1} minWidth={0}>
                            <Typography fontWeight={800}>{title}</Typography>
                            <Typography color="text.secondary" fontSize={12.5}>{subtitle}</Typography>
                          </Box>
                          <ChevronRightRounded sx={{ color: tokens.textFaint }} />
                        </Stack>
                      </Pressable>
                    </StaggerItem>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      </Stagger>
    </PageLayout>
  );
}
