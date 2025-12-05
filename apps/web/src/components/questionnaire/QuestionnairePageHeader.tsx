type QuestionnairePageHeaderProps = {
  title?: string;
  description?: string;
};

export function QuestionnairePageHeader({
  title = 'Dermo-Safety Questionnaire',
  description = 'Help us understand your scalp and hair conditions for personalized product recommendations.',
}: QuestionnairePageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
