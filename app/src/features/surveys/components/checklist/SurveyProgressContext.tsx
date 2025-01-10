import React, { createContext, useContext, useState } from 'react';

// Define the context
const SurveyProgressContext = createContext<{
  surveyTypes: string[];
  submissionStatus: Record<string, boolean>;
  setSurveyTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setSubmissionStatus: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
} | null>(null);

// Context Provider Component
export const SurveyProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, boolean>>({});

  return (
    <SurveyProgressContext.Provider value={{ surveyTypes, submissionStatus, setSurveyTypes, setSubmissionStatus }}>
      {children}
    </SurveyProgressContext.Provider>
  );
};

// Hook to use the context
export const useSurveyProgress = () => {
  const context = useContext(SurveyProgressContext);
  if (!context) {
    throw new Error('useSurveyProgress must be used within a SurveyProgressProvider');
  }
  return context;
};
