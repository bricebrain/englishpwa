import { BookOpen, BookOpenText, Brain, ChartColumn, ChevronRight, Hammer, Headphones, Layers, MoveHorizontal, Search, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { PageLayout } from '@/components/layout/PageLayout';
import { Pressable, Stagger, StaggerItem } from '@/components/ui/motion';
import { IconTile } from '@/components/ui/SessionChrome';
import { gradients } from '@/theme';

const sections = [
  {
    label: 'Pratique active',
    items: [
      { title: 'Lingvist', subtitle: 'Vocabulaire en contexte', path: '/lingvist', icon: BookOpen, gradient: gradients.primary },
      { title: 'Tri éclair', subtitle: 'Swipe les mots faciles', path: '/lingvist-triage', icon: MoveHorizontal, gradient: gradients.mint },
      { title: 'Construire des phrases', subtitle: 'Structures et transformations', path: '/phrases', icon: Hammer, gradient: gradients.sunrise },
      { title: 'Flashcards', subtitle: 'Cartes dues et nouveaux mots', path: '/flashcards', icon: Layers, gradient: gradients.ocean },
    ],
  },
  {
    label: 'Compréhension',
    items: [
      { title: 'Écouter', subtitle: 'Assimil et écoute guidée', path: '/ecouter', icon: Headphones, gradient: 'linear-gradient(135deg, #168CA8, #16875D)' },
      { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: BookOpenText, gradient: 'linear-gradient(135deg, #D83E88, #7055E8)' },
      { title: 'Histoire du jour', subtitle: 'Écrite avec tes mots à réviser', path: '/histoire', icon: BookOpen, gradient: gradients.sunrise },
      { title: 'Rechercher', subtitle: 'Par idée dans tous tes contenus', path: '/recherche', icon: Search, gradient: gradients.ocean },
    ],
  },
  {
    label: 'Suivi et compte',
    items: [
      { title: 'Progression', subtitle: 'Niveau, XP et rétention', path: '/statistics', icon: ChartColumn, gradient: 'linear-gradient(135deg, #B96D00, #D83E88)' },
      { title: 'Profil', subtitle: 'Niveau et objectif quotidien', path: '/profile', icon: User, gradient: 'linear-gradient(135deg, #8068DE, #7055E8)' },
      { title: 'Paramètres', subtitle: 'Thème, sons, vibrations, installation', path: '/settings', icon: Settings, gradient: 'linear-gradient(135deg, #8E8AAE, #5C5880)' },
    ],
  },
];

export function MorePage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageHeader eyebrow="Tout l’univers" title="Plus" subtitle="Parcours, suivi et compte" />

      <div className="mb-6 flex items-start gap-3 rounded-[20px] border border-violet/25 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--violet)_14%,transparent),color-mix(in_srgb,var(--pink)_9%,transparent))] p-4">
        <IconTile icon={<Brain />} size={40} />
        <div>
          <p className="font-extrabold">Le GPT Coach reste ton espace libre</p>
          <p className="mt-0.5 text-[13.5px] text-muted">
            Les conversations longues vivent dans ChatGPT ; l’application se concentre sur la pratique guidée.
          </p>
        </div>
      </div>

      <Stagger gap={0.04} className="flex flex-col gap-6">
        {sections.map((section) => (
          <section key={section.label}>
            <span className="type-overline mb-2 text-muted">{section.label}</span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {section.items.map(({ title, subtitle, path, icon: Icon, gradient }) => (
                <StaggerItem key={path}>
                  <Pressable onClick={() => navigate(path)} aria-label={title}>
                    <span className="flex items-center gap-3 rounded-[20px] border border-border bg-surface p-3">
                      <IconTile icon={<Icon />} gradient={gradient} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold">{title}</span>
                        <span className="block text-[12.5px] text-muted">{subtitle}</span>
                      </span>
                      <ChevronRight className="size-6 text-faint" />
                    </span>
                  </Pressable>
                </StaggerItem>
              ))}
            </div>
          </section>
        ))}
      </Stagger>
    </PageLayout>
  );
}
