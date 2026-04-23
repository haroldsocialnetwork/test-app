# API Contract: AI Recruitment Co-Pilot

**Version**: 1.0.0
**Date**: April 23, 2026
**Base URL**: `/api/recruitment`

---

## Endpoints

### POST /api/recruitment/analyze

Analyzes a candidate resume against a job description and returns a structured evaluation with a match score, strengths, identified gaps, and a personalized follow-up message.

#### Request

**Content-Type**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resumeFile` | `File (PDF)` | Conditional | PDF resume upload. Required if `resumeText` is absent. Max 5 MB. MIME: `application/pdf`. |
| `resumeText` | `string` | Conditional | Plain-text resume. Required if `resumeFile` is absent. |
| `jobDescription` | `string` | **Required** | Plain-text job description. Minimum 10 characters. |
| `tone` | `"formal" \| "friendly" \| "concise"` | Optional | Tone of the generated follow-up message. Defaults to `"friendly"`. |

**Constraint**: At least one of `resumeFile` or `resumeText` must be present. If both are provided, `resumeFile` takes precedence (its parsed text is used).

---

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "matchScore": 74,
    "strengths": [
      "5 years of React experience directly aligns with the frontend requirement",
      "Demonstrated TypeScript expertise matches the tech stack",
      "Leadership of a 4-person team evidences the team-lead requirement"
    ],
    "relevanceSummary": "The candidate has strong frontend engineering foundations that closely match the core technical requirements. However, the absence of Node.js backend experience and unclear deployment background represent meaningful gaps for this full-stack role.",
    "missingInformation": {
      "missingSkills": ["Node.js", "Docker", "CI/CD pipeline experience"],
      "unclearExperience": [
        "Role at Acme Corp (2020–2021) lists 'backend work' without specifying technologies or scope"
      ],
      "qualificationGaps": ["Bachelor's degree in Computer Science or equivalent — not mentioned"]
    },
    "followUpMessage": "Hi Alex, thank you for applying for the Senior Full-Stack Engineer position. We were impressed by your React and TypeScript background. Could you share more about your experience with Node.js and any backend projects you've worked on? Additionally, it would be helpful to hear about your exposure to Docker and CI/CD pipelines. Looking forward to learning more!",
    "tone": "friendly"
  },
  "error": null
}
```

---

#### Error Responses

**`400 Bad Request` — Validation Error**

Returned when required fields are missing or inputs fail validation.

```json
{
  "success": false,
  "data": null,
  "error": "Job description is required and must be at least 10 characters."
}
```

```json
{
  "success": false,
  "data": null,
  "error": "Please provide a resume — either upload a PDF or paste resume text."
}
```

---

**`422 Unprocessable Entity` — PDF Parse Failure**

Returned when an uploaded PDF file cannot be parsed as text (e.g., image-only scan).

```json
{
  "success": false,
  "data": null,
  "error": "Could not extract text from the uploaded PDF. Please paste your resume text directly instead."
}
```

---

**`504 Gateway Timeout` — AI Service Timeout**

Returned when the Claude API call exceeds the 30-second timeout budget.

```json
{
  "success": false,
  "data": null,
  "error": "The analysis took too long to complete. Please try again."
}
```

---

**`500 Internal Server Error` — Unexpected Error**

```json
{
  "success": false,
  "data": null,
  "error": "An unexpected error occurred. Please try again."
}
```

---

## Data Types

### AnalysisResult

```typescript
interface AnalysisResult {
  matchScore: number;              // Integer 0–100
  strengths: string[];             // Non-empty array
  relevanceSummary: string;        // 2–4 sentence narrative
  missingInformation: {
    missingSkills: string[];        // May be empty
    unclearExperience: string[];    // May be empty
    qualificationGaps: string[];    // May be empty
  };
  followUpMessage: string;         // Ready-to-copy message
  tone: "formal" | "friendly" | "concise";
}
```

### AnalyzeResponse (envelope)

```typescript
interface AnalyzeResponse {
  success: boolean;
  data: AnalysisResult | null;
  error: string | null;
}
```

---

## Notes

- The API key for Claude is **never** returned to the client. All AI calls are server-side only.
- No data is persisted. Each request is stateless; results exist only in the HTTP response and the client's memory.
- The `multipart/form-data` content type is required even when only text fields are submitted (no file), to maintain a consistent request contract.
- CORS is configured to accept requests from the frontend origin (`http://localhost:3000`) during development.
