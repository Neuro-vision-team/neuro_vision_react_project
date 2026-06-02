import { PageTitle, GlassCard } from '../components/ui';
import { AIConfidenceMeter } from '../components/featureBlocks';
import { useI18n } from '../app/i18n';

export default function AiPage() {
  const { t, isArabic } = useI18n();

  return (
    <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <PageTitle 
        title={t('AI Intelligence Center')} 
        subtitle={t('Explainable injury classification and confidence reasoning.')} 
      />
      <GlassCard>
        <AIConfidenceMeter value={96} />
      </GlassCard>
    </div>
  );
}
