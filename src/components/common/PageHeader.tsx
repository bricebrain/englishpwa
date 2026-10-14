import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MotionBox } from '@/components/ui/motion';
import { softSpring } from '@/components/ui/springs';
import { tokens } from '@/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, back = false, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box mb={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} minHeight={44} mb={back ? 1 : 0}>
        {back ? (
          <IconButton
            aria-label="Revenir en arrière"
            onClick={() => navigate(-1)}
            sx={{ ml: -0.5, background: 'rgba(255,255,255,0.05)', border: `1px solid ${tokens.border}` }}
          >
            <ArrowBackRounded />
          </IconButton>
        ) : <span />}
        {action}
      </Stack>
      <MotionBox initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={softSpring}>
        {eyebrow ? <Typography variant="overline" color={tokens.violetSoft} display="block">{eyebrow}</Typography> : null}
        <Typography component="h1" variant="h1">{title}</Typography>
        {subtitle ? <Typography color="text.secondary" mt={0.75} fontSize={15} lineHeight={1.5}>{subtitle}</Typography> : null}
      </MotionBox>
    </Box>
  );
}
