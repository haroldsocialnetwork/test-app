import type { AnalyzeResponse, Tone } from '../types/recruitment';

export interface AnalyzeRequest {
  resumeFile?: File;
  resumeText?: string;
  jobDescription: string;
  tone: Tone;
}

export async function analyzeCandidate(
  request: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  const formData = new FormData();

  if (request.resumeFile) {
    formData.append('resumeFile', request.resumeFile);
  } else if (request.resumeText) {
    formData.append('resumeText', request.resumeText);
  }

  formData.append('jobDescription', request.jobDescription);
  formData.append('tone', request.tone);

  const response = await fetch('/api/recruitment/analyze', {
    method: 'POST',
    body: formData,
  });

  const data: AnalyzeResponse = await response.json();
  return data;
}
