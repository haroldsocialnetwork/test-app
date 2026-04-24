import type { JobsResponse, SubmitApplicationResponse } from '../types/recruitment';

export async function getJobs(): Promise<JobsResponse> {
  const response = await fetch('/api/jobs');
  const data: JobsResponse = await response.json();
  return data;
}

export async function submitApplication(
  jobId: number,
  resumeFile?: File,
  resumeText?: string,
  applicantEmail?: string,
): Promise<SubmitApplicationResponse> {
  const formData = new FormData();
  formData.append('jobId', String(jobId));

  if (resumeFile) {
    formData.append('resumeFile', resumeFile);
  }
  if (resumeText) {
    formData.append('resumeText', resumeText);
  }
  if (applicantEmail) {
    formData.append('applicantEmail', applicantEmail);
  }

  const response = await fetch('/api/applications', {
    method: 'POST',
    body: formData,
  });

  const data: SubmitApplicationResponse = await response.json();
  return data;
}
