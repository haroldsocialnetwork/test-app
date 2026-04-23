# Feature Specification: AI Recruitment Co-Pilot

**Feature Branch**: `001-ai-recruitment-copilot`
**Created**: April 23, 2026
**Status**: Draft
**Input**: User description: "AI Recruitment Co-Pilot — An AI-native tool to instantly evaluate candidate fit and eliminate back-and-forth in hiring"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resume and Job Description Analysis (Priority: P1)

A recruiter has a candidate's resume and a job description. They upload or paste both into the tool, click "Analyze Candidate," and within seconds receive a structured report: a match score from 0–100, a list of the candidate's key strengths aligned to the role, and a relevance summary explaining the scoring rationale.

**Why this priority**: Core value proposition of the tool. Without this, nothing else is meaningful. Delivers immediate, measurable value — the recruiter knows within seconds whether to proceed with a candidate.

**Independent Test**: Can be fully tested by uploading a sample resume and pasting a job description, clicking "Analyze Candidate," and verifying the match score, strengths list, and relevance summary are returned.

**Acceptance Scenarios**:

1. **Given** a recruiter has a PDF resume and a job description text, **When** they upload the resume and paste the job description and click "Analyze Candidate," **Then** the system returns a match score (0–100), a list of strengths aligned to the role, and a relevance summary within 30 seconds.
2. **Given** a recruiter pastes resume text directly (no file upload), **When** they click "Analyze Candidate," **Then** the system processes the pasted text and returns the same structured results.
3. **Given** a recruiter submits an empty job description, **When** they click "Analyze Candidate," **Then** the system displays a validation error requesting a job description before proceeding.

---

### User Story 2 - Missing Information Detection (Priority: P2)

After receiving the initial analysis, the recruiter can clearly see what critical information is missing from the candidate's resume relative to the job requirements — including missing skills, unclear experience, and qualification gaps — presented in a structured, easy-to-review format.

**Why this priority**: Directly enables the follow-up message generation and reduces manual effort in identifying what to ask candidates. Without this, recruiters still perform gap analysis manually.

**Independent Test**: Can be tested by providing a deliberately incomplete resume against a detailed job description and verifying the gap report identifies the missing and unclear items accurately.

**Acceptance Scenarios**:

1. **Given** a candidate's resume lacks a skill listed as required in the job description, **When** the analysis completes, **Then** that skill appears in the "Missing Information" section of the results.
2. **Given** a candidate lists experience without dates or measurable outcomes, **When** the analysis completes, **Then** the system flags it as "unclear experience" in the gap report.
3. **Given** a fully matching resume with no gaps, **When** the analysis completes, **Then** the missing information section states no critical gaps were identified.

---

### User Story 3 - AI-Generated Follow-Up Message (Priority: P3)

The recruiter receives a ready-to-use, personalized follow-up message addressed to the candidate, requesting only the specific information identified as missing. The recruiter can select from tone options (formal, friendly, concise) and copy the message for immediate use.

**Why this priority**: Eliminates the most repetitive manual communication task in early-stage hiring. Saves significant time per candidate and ensures consistent, professional outreach.

**Independent Test**: Can be tested by completing an analysis with identified gaps and verifying the generated message specifically references those gaps and changes appropriately when a different tone is selected.

**Acceptance Scenarios**:

1. **Given** the analysis has identified missing skills, **When** the recruiter views the results, **Then** a follow-up message is auto-generated that addresses the candidate by name (if available from the resume) and specifically requests details about the identified gaps.
2. **Given** the recruiter selects "formal" tone, **When** they view the follow-up message, **Then** the message uses formal professional language (e.g., "Dear [Name]," "We kindly request").
3. **Given** the recruiter selects "friendly" tone, **When** they view the follow-up message, **Then** the message uses a warm, conversational tone (e.g., "Hi [Name]," "We'd love to learn more about your experience with…").
4. **Given** the recruiter selects "concise" tone, **When** they view the follow-up message, **Then** the message is brief, direct, and free of filler language.
5. **Given** the recruiter clicks the "Copy Message" button, **When** the action completes, **Then** the full message text is copied to the clipboard for immediate use.

---

### User Story 4 - Candidate Ranking (Priority: P4 — Stretch)

A recruiter with multiple candidates for the same role uploads several resumes at once, views all match scores side by side, and quickly identifies the top candidates ranked by score and relevance.

**Why this priority**: Valuable for high-volume hiring but not required for the MVP. Core value is delivered with single-candidate analysis.

**Independent Test**: Can be tested by uploading 3 or more resumes against a single job description and verifying a ranked list is returned with individual scores per candidate.

**Acceptance Scenarios**:

1. **Given** a recruiter has uploaded multiple resumes, **When** they click "Analyze Candidates," **Then** all candidates are analyzed and displayed in a ranked list from highest to lowest match score.
2. **Given** two candidates have identical match scores, **When** the ranking is displayed, **Then** both are shown at the same rank position.

---

### Edge Cases

- What happens when a PDF resume cannot be parsed (e.g., scanned image-only PDF)? → System displays an error prompting the user to paste resume text instead.
- What happens when the job description is very short (e.g., one sentence)? → System proceeds but displays a low-confidence warning alongside the results.
- What happens when the resume is in a language other than English? → Results quality may vary; no specific multilingual guarantee is made for MVP.
- What happens when the AI service is unavailable or times out? → System shows a user-friendly error message and suggests retrying.
- What happens when the candidate's name cannot be detected in the resume? → The follow-up message uses a generic placeholder such as "Hi there," or "Dear Applicant,".
- What happens when both resume and job description fields are empty on submission? → Both fields are highlighted with validation messages; no analysis is initiated.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept resume input via PDF file upload.
- **FR-002**: System MUST accept resume input via direct text paste as an alternative to file upload.
- **FR-003**: System MUST accept job description input via a text entry field.
- **FR-004**: System MUST validate that both a resume and a job description are provided before initiating analysis, and display informative validation messages if either is missing.
- **FR-005**: System MUST analyze the resume against the job description and return a numeric match score between 0 and 100.
- **FR-006**: System MUST return a list of the candidate's key strengths that align with the job description requirements.
- **FR-007**: System MUST return a relevance summary explaining the basis for the match score.
- **FR-008**: System MUST identify and return a list of missing skills, unclear experience entries, and qualification gaps from the resume relative to the job description.
- **FR-009**: System MUST automatically generate a personalized follow-up message that references only the specific identified gaps from the analysis.
- **FR-010**: System MUST offer at least three tone options for the generated follow-up message: formal, friendly, and concise.
- **FR-011**: System MUST update the generated follow-up message when the recruiter changes the selected tone.
- **FR-012**: System MUST provide a one-click mechanism to copy the generated follow-up message to the clipboard.
- **FR-013**: System MUST display an informative error message when PDF parsing fails, with instructions to use text paste instead.
- **FR-014** *(Stretch)*: System MUST support uploading multiple resumes simultaneously and return a ranked list of candidates ordered by match score.
- **FR-015** *(Stretch)*: System SHOULD provide a mechanism to send the follow-up message directly via email or a messaging platform; a mock or simulated send is acceptable for demo purposes.

### Key Entities

- **Resume**: The candidate's background document containing work experience, education, skills, and qualifications. Accepted as a PDF file or plain text.
- **Job Description**: The role requirements provided by the recruiter, including responsibilities, required skills, preferred qualifications, and expectations. Provided as plain text.
- **Analysis Result**: The structured output produced from comparing a Resume to a Job Description, containing: match score (0–100), strengths list, relevance summary, and missing information list.
- **Follow-Up Message**: An AI-generated communication draft addressed to the candidate, requesting clarification on identified gaps, with selectable tone (formal, friendly, concise).
- **Candidate** *(Stretch)*: An entity representing a person associated with a Resume, used for ranking when multiple candidates are compared against the same job description.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A recruiter completes a full candidate evaluation — from input submission to actionable results including a ready-to-use follow-up message — in under 2 minutes.
- **SC-002**: Analysis results (score, strengths, gaps, and follow-up message) are returned within 30 seconds of the recruiter clicking "Analyze Candidate."
- **SC-003**: Generated follow-up messages specifically reference at least one identified gap from the candidate's resume in 100% of cases where gaps are detected.
- **SC-004**: Recruiter manual screening effort is reduced by at least 70% compared to a fully manual workflow (validated by time-on-task comparison in demo scenario).
- **SC-005**: 90% of analyzed resumes return a non-empty strengths list and at least one actionable insight.
- **SC-006**: Selecting a different tone option produces a visibly distinct follow-up message in 100% of cases.

---

## Assumptions

- Resume PDFs submitted are text-selectable (not scanned images); image-only PDFs are out of scope for v1.
- The tool is a single-page web application accessible via desktop browser; mobile optimization is not required for the MVP.
- No persistent storage of candidate data is required; analysis results exist only for the duration of the browser session.
- Candidate name extraction from resume text is best-effort; a generic placeholder is used as fallback when a name cannot be identified.
- The AI engine for analysis, matching, scoring, and message generation is available and accessible during demo and testing.
- Email and messaging platform integration (WhatsApp, Email) is stretch scope; a mock or simulated send is acceptable for hackathon demo purposes.
- Job descriptions are provided in plain text by the recruiter; no file upload format is required for job descriptions.
- A single recruiter user interacts with the tool at a time; multi-user collaboration is out of scope for the MVP.
- The tool will be demonstrated in a controlled hackathon environment; production-scale performance hardening and security compliance are not MVP requirements.
- Claude is used as the underlying AI model for all resume parsing, semantic matching, gap detection, and message generation.
