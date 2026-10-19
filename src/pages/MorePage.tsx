import { BookOpen, BookOpenText, ChartColumn, Headphones, Layers, MoveHorizontal, PenLine, Search, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@/components/common/PageHeader';
import { ThemeToggle } from '@/components/vivid/ThemeToggle';
import { PageLayout } from '@/components/layout/PageLayout';
import { ListGroup, ListRow, RowIcon, SectionFooter, SectionHeader } from '@/components/ui/list';
import { Stagger, StaggerItem } from '@/components/ui/motion';

const sections = [
  {
    label: 'Pratique',
    items: [
      { title: 'Lingvist', subtitle: 'Vocabulaire en contexte', path: '/lingvist', icon: BookOpen, color: '#5856D6' },
      { title: 'Tri rapide', subtitle: 'Classer les mots connus', path: '/lingvist-triage', icon: MoveHorizontal, color: '#30B0C7' },
      { title: 'Construire des phrases', subtitle: 'Structures et transformations', path: '/phrases', icon: PenLine, color: '#FF9500' },
      { title: 'Flashcards', subtitle: 'Cartes dues et nouveaux mots', path: '/flashcards', icon: Layers, color: '#007AFF' },
    ],
  },
  {
    label: 'Compréhension',
    items: [
      { title: 'Écouter', subtitle: 'Assimil et écoute guidée', path: '/ecouter', icon: Headphones, color: '#FF2D55' },
      { title: 'Lire', subtitle: 'Articles guidés', path: '/lire', icon: BookOpenText, color: '#AF52DE' },
      { title: 'Histoire du jour', subtitle: 'Écrite avec tes mots à réviser', path: '/histoire', icon: BookOpen, color: '#FF9500' },
      { title: 'Rechercher', subtitle: 'Par idée dans tous tes contenus', path: '/recherche', icon: Search, color: '#8E8E93' },
    ],
  },
  {
    label: 'Suivi et compte',
    items: [
      { title: 'Progression', subtitle: 'Niveau, XP et rétention', path: '/statistics', icon: ChartColumn, color: '#34A853' },
      { title: 'Profil', subtitle: 'Niveau et objectif quotidien', path: '/profile', icon: User, color: '#5856D6' },
      { title: 'Réglages', subtitle: 'Thème, sons, vibrations', path: '/settings', icon: Settings, color: '#8E8E93' },
    ],
  },
];

export function MorePage() {
  const navigate = useNavigate();

  return (
    <PageLayout reading>
      <PageHeader title="Plus" trailing={<ThemeToggle />} />

      <Stagger gap={0.05}>
        {sections.map((section) => (
          <StaggerItem key={section.label}>
            <SectionHeader>{section.label}</SectionHeader>
            <ListGroup>
              {section.items.map(({ title, subtitle, path, icon: Icon, color }, index) => (
                <ListRow
                  key={path}
                  icon={<RowIcon color={color}><Icon /></RowIcon>}
                  title={title}
                  subtitle={subtitle}
                  chevron
                  last={index === section.items.length - 1}
                  onClick={() => navigate(path)}
                />
              ))}
            </ListGroup>
          </StaggerItem>
        ))}
      </Stagger>
      <SectionFooter>Les longues conversations se font avec ton coach dans ChatGPT ; l’application se concentre sur la pratique guidée.</SectionFooter>
    </PageLayout>
  );
}
