import type { AnalyzeResponse, Tone } from '../types/recruitment';

export interface AnalyzeRequest {
  resumeFile?: File;
  resumeText?: string;
  jobDescription: string;
  tone: Tone;
  applicantEmail?: string;
  applicationId?: number;
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

  if (request.applicantEmail) {
    formData.append('applicantEmail', request.applicantEmail);
  }
  if (request.applicationId !== undefined) {
    formData.append('applicationId', String(request.applicationId));
  }

  const response = await fetch('/api/recruitment/analyze', {
    method: 'POST',
    body: formData,
  });

  const data: AnalyzeResponse = await response.json();
  return data;
}
