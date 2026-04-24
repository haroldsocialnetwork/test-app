import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface DashboardStats {
  total: number;
  avgScore: number;
  highFit: number;
  medFit: number;
  lowFit: number;
}

export interface CandidateDetail {
  id: number;
  name: string;
  matchScore: number;
  strongPoints: string[];
  weakPoints: string[];
  interviewQuestions: string[];
}

export interface JobScoreDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface JobGroup {
  id: string;
  title: string;
  jobDescription: string;
  candidateCount: number;
  avgScore: number;
  scoreDistribution: JobScoreDistribution;
  candidates: CandidateDetail[];
}

export interface GroupedData {
  jobs: JobGroup[];
}

const DUMMY_GROUPED_DATA: GroupedData = {
  jobs: [
    {
      id: 'job-1',
      title: 'Senior Frontend Engineer',
      jobDescription:
        'Senior Frontend Engineer with 5+ years of React and TypeScript experience. Must have experience leading engineering teams, performance optimization, and building scalable component libraries. GraphQL API integration required.',
      candidateCount: 4,
      avgScore: 62,
      scoreDistribution: { high: 2, medium: 1, low: 1 },
      candidates: [
        {
          id: 1,
          name: 'Alice Chen',
          matchScore: 88,
          strongPoints: [
            '5+ years React with advanced patterns (hooks, context, portals)',
            'TypeScript proficiency across multiple enterprise projects',
            'Led a team of 6 frontend engineers for 2 years',
            'Reduced bundle size by 40% through code splitting and lazy loading',
            'Strong design-system and component-library experience',
          ],
          weakPoints: [
            'No backend or Node.js experience mentioned in resume',
            'GraphQL not referenced — role requires GraphQL API integration',
            'No automated testing mentioned (Jest, Cypress, RTL)',
          ],
          interviewQuestions: [
            "Walk me through the most complex React architecture you've designed — how did you structure state and data flow?",
            'Describe a performance bottleneck you identified and resolved in a production React app. What was the measurable impact?',
            "The role involves GraphQL. How quickly can you get up to speed, and what's your plan for learning it?",
            'How do you approach a testing strategy for a large component library — what layers of coverage do you prioritize?',
            "Tell me about a time your technical decision significantly impacted the team's velocity or quality.",
          ],
        },
        {
          id: 2,
          name: 'David Park',
          matchScore: 71,
          strongPoints: [
            'Solid React fundamentals with 4 years of production experience',
            'Strong CSS and responsive design skills across complex UIs',
            'Agile/Scrum practitioner with sprint planning experience',
            'Experience integrating REST APIs and third-party services',
          ],
          weakPoints: [
            'TypeScript usage appears basic — only prop type annotations found',
            'No testing frameworks mentioned (Jest, Cypress, Playwright)',
            'No team leadership or mentoring experience described',
            'No performance optimization examples in resume',
          ],
          interviewQuestions: [
            "How are you currently deepening your TypeScript knowledge? Walk me through the most advanced types you've used.",
            "What's your experience with unit and integration testing? Why wasn't this reflected in your resume?",
            "How do you approach reviewing a junior developer's PR — what do you look for?",
            'Describe a scenario where you had to balance delivery speed with code quality.',
          ],
        },
        {
          id: 3,
          name: 'Sofia Rodriguez',
          matchScore: 54,
          strongPoints: [
            'Portfolio shows clean, accessible UI with strong design sensibility',
            'Solid JavaScript fundamentals with 2 years React experience',
            '3 personal open-source contributions demonstrating initiative',
          ],
          weakPoints: [
            'Only 2 years total experience — role requires 5+',
            'No team lead or mentoring experience',
            'No TypeScript in any listed project',
            'No experience with CI/CD pipelines or deployment',
            'REST API integration limited to simple fetch calls',
          ],
          interviewQuestions: [
            "Where do you see yourself in 2 years and how does this senior role fit into that trajectory?",
            "Walk me through the most challenging UI problem you've solved — what was the impact?",
            "How are you building your TypeScript skills? Show me something you're working on.",
            "What's your approach when you're blocked or working on something outside your comfort zone?",
          ],
        },
        {
          id: 4,
          name: 'James Liu',
          matchScore: 35,
          strongPoints: [
            'Strong React Native skills for mobile (3 years)',
            'Basic HTML and CSS proficiency',
            'Demonstrated ability to learn new tools quickly through self-study',
          ],
          weakPoints: [
            'Experience is React Native (mobile) — role requires web React',
            'No TypeScript experience at all',
            'No team collaboration experience — all solo projects',
            'No knowledge of web performance, bundlers (Webpack/Vite), or SSR',
            'Junior profile — fewer than 2 years total professional experience',
          ],
          interviewQuestions: [
            'Your background is React Native — how have you been preparing for web React development specifically?',
            "Walk me through a web project (not mobile) you've built. What did you learn?",
            'How do you plan to bridge the gap between mobile and web development practices?',
            "What does your TypeScript learning plan look like for the next 3 months?",
          ],
        },
      ],
    },
    {
      id: 'job-2',
      title: 'Product Manager — B2B SaaS',
      jobDescription:
        'Product Manager for a fast-growing B2B SaaS platform. Requires 4+ years of PM experience, strong data analysis skills, cross-functional collaboration with engineering, design, and sales, and experience managing a product roadmap end-to-end.',
      candidateCount: 3,
      avgScore: 69,
      scoreDistribution: { high: 1, medium: 2, low: 0 },
      candidates: [
        {
          id: 5,
          name: 'Priya Sharma',
          matchScore: 92,
          strongPoints: [
            '6 years of B2B SaaS product management at scale (50K+ users)',
            'Data-driven decision maker with SQL and Mixpanel proficiency',
            'Managed cross-functional collaboration across 4 engineering teams simultaneously',
            'Owned full roadmap for 2 major product lines from 0→1 through growth phase',
            'Deep expertise in customer discovery and Jobs-to-be-Done framework',
          ],
          weakPoints: [
            'No engineering background — may struggle with technical trade-off discussions',
            'Previous company was Series A stage vs this role at Series C scale',
          ],
          interviewQuestions: [
            'Describe the most complex product decision you made with conflicting stakeholder input. How did you resolve it?',
            "How do you facilitate productive conversations with engineering when you can't evaluate technical complexity yourself?",
            'Walk me through how you set and track OKRs for a product. Give a specific example with actual numbers.',
            'Tell me about a product you shipped that underperformed. What did you do next?',
            'How do you distinguish between a feature request and a real underlying customer problem?',
          ],
        },
        {
          id: 6,
          name: 'Marcus Johnson',
          matchScore: 67,
          strongPoints: [
            'Engineering background (3 years as SWE) gives strong technical credibility',
            'Naturally data-oriented — built internal analytics dashboards in past role',
            'Currently 2 years as Associate PM with ownership of one product area',
          ],
          weakPoints: [
            'Only 2 years PM experience — role requires 4+',
            'All PM experience is B2C (consumer mobile) — no B2B exposure',
            'No experience with sales-assisted or enterprise buying cycles',
            'Limited roadmap ownership — was Associate PM, not lead PM',
          ],
          interviewQuestions: [
            "How are you actively accelerating your PM growth to bridge the 2-to-4-year gap?",
            'B2B and B2C buying cycles are very different. How would you approach learning our enterprise customer segment?',
            'Describe a product initiative you owned end-to-end — from discovery to launch to iteration.',
            'How do you involve engineering early in discovery without creating scope creep?',
          ],
        },
        {
          id: 7,
          name: 'Emma Walsh',
          matchScore: 48,
          strongPoints: [
            'Exceptional customer research skills — led 30+ user interviews in prior role',
            'Strong written and verbal communication across all seniority levels',
            'Skilled at translating qualitative research into actionable product insights',
          ],
          weakPoints: [
            'Never owned a product roadmap — was embedded researcher in a PM team',
            'No sprint planning or agile delivery experience as a PM',
            'B2C only — no understanding of B2B procurement or enterprise dynamics',
            'No metrics or quantitative analysis experience cited',
            'No experience with prioritization frameworks (RICE, ICE, MoSCoW)',
          ],
          interviewQuestions: [
            "You've done research but haven't owned a roadmap. Walk me through how you'd prioritize 10 competing features.",
            'How do you see your researcher background translating to full PM ownership and delivery accountability?',
            'Describe a time your research changed a product direction. What was the downstream business impact?',
            'What metrics would you track in the first 90 days of this PM role, and why those specifically?',
          ],
        },
      ],
    },
    {
      id: 'job-3',
      title: 'Senior Data Engineer',
      jobDescription:
        'Senior Data Engineer with strong Python, PySpark, and cloud (AWS/GCP) experience. Must have experience designing large-scale data pipelines, working with orchestration tools (Airflow, Prefect), dbt for analytics engineering, and mentoring junior engineers.',
      candidateCount: 3,
      avgScore: 71,
      scoreDistribution: { high: 2, medium: 1, low: 0 },
      candidates: [
        {
          id: 8,
          name: 'Ravi Krishnan',
          matchScore: 94,
          strongPoints: [
            'Expert-level Python and PySpark — 7 years of large-scale data processing',
            'AWS Certified Solutions Architect with hands-on Glue, EMR, and Redshift',
            'Led migration of 200TB data warehouse to lakehouse architecture',
            'Mentored 4 junior data engineers; led a team of 8 through a major rewrite',
            'Strong Airflow DAG design with complex dependency and retry management',
          ],
          weakPoints: [
            'dbt not mentioned — role requires modern analytics engineering practices',
            'Limited real-time streaming experience (Kafka/Kinesis) — mostly batch-oriented',
          ],
          interviewQuestions: [
            "Describe the most complex data pipeline you've designed. What were the key architectural decisions and trade-offs?",
            'How do you approach data quality — what validations and monitoring do you put in place at each stage?',
            'Your resume shows batch processing. How would you approach adding real-time streaming to an existing batch pipeline?',
            'Tell me about a time a pipeline failure had downstream business impact. How did you handle the incident?',
            'How do you evaluate when to use dbt vs custom Python transforms — what factors drive that decision?',
          ],
        },
        {
          id: 9,
          name: 'Yuki Tanaka',
          matchScore: 78,
          strongPoints: [
            'Expert-level SQL with deep experience in query optimization and data modeling',
            'Strong ETL pipeline design using Python and Airflow',
            'Dimensional modeling experience (star/snowflake schema design)',
            'dbt proficiency — built 200+ models in a production analytics platform',
          ],
          weakPoints: [
            'Limited cloud experience — on-premises Hadoop only, no AWS/GCP certifications',
            'No Kafka or Kinesis experience — role expects streaming familiarity',
            'No team leadership or mentoring experience mentioned',
            'PySpark usage appears limited to single-node processing',
          ],
          interviewQuestions: [
            'Walk me through how you would approach migrating an on-prem Hadoop pipeline to AWS EMR or GCP Dataproc.',
            'Describe your most impactful SQL optimization — what was the before/after performance improvement?',
            'How have you handled schema evolution in your dbt models when upstream data sources change?',
            'The role involves mentoring juniors. How would you structure the first 30 days of onboarding for a new data engineer?',
          ],
        },
        {
          id: 10,
          name: 'Chris Nguyen',
          matchScore: 41,
          strongPoints: [
            'Strong Python proficiency with 3 years of scripting and automation experience',
            'Solid foundational SQL — comfortable with joins, aggregations, and CTEs',
            'Demonstrated curiosity and self-learning (AWS Cloud Practitioner certification)',
          ],
          weakPoints: [
            'No distributed systems experience — all work is single-machine Python scripts',
            'Junior profile — 3 years total, role requires 5+',
            'No Spark, Airflow, dbt, or orchestration tool experience',
            'No cloud infrastructure experience beyond basic S3 usage',
            'No data modeling or schema design background',
          ],
          interviewQuestions: [
            "Walk me through a data engineering concept you've been studying recently — what's your current learning focus?",
            "You have strong Python but no distributed systems experience. What's your concrete plan for getting hands-on with Spark?",
            'Describe the most complex data problem you have solved. What were the constraints and your approach?',
            'How would you design a pipeline to process 1TB of log files daily? Talk through your thought process even if you have not done it before.',
          ],
        },
      ],
    },
  ],
};

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardStats> {
    const all = await this.prisma.candidateAnalysis.findMany({
      select: { matchScore: true },
    });
    const total = all.length;
    const avgScore = total
      ? Math.round(all.reduce((s, r) => s + r.matchScore, 0) / total)
      : 0;
    const highFit = all.filter((r) => r.matchScore >= 70).length;
    const medFit = all.filter((r) => r.matchScore >= 40 && r.matchScore < 70).length;
    const lowFit = all.filter((r) => r.matchScore < 40).length;
    return { total, avgScore, highFit, medFit, lowFit };
  }

  async getCandidates(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.candidateAnalysis.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          candidateName: true,
          jobTitle: true,
          matchScore: true,
          tone: true,
          createdAt: true,
          jobDescription: true,
        },
      }),
      this.prisma.candidateAnalysis.count(),
    ]);
    return { items, total, page, limit };
  }

  async getGroupedData(): Promise<GroupedData> {
    const count = await this.prisma.candidateAnalysis.count();
    if (count === 0) return DUMMY_GROUPED_DATA;
    return this.buildGroupedFromDb();
  }

  private async buildGroupedFromDb(): Promise<GroupedData> {
    const all = await this.prisma.candidateAnalysis.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const jobMap = new Map<string, typeof all>();
    for (const record of all) {
      const key = record.jobDescription.trim().replace(/\s+/g, ' ').slice(0, 100);
      if (!jobMap.has(key)) jobMap.set(key, []);
      jobMap.get(key)!.push(record);
    }

    const jobs: JobGroup[] = [];
    let counter = 1;

    for (const [, records] of jobMap.entries()) {
      const scores = records.map((r) => r.matchScore);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const high = scores.filter((s) => s >= 70).length;
      const medium = scores.filter((s) => s >= 40 && s < 70).length;
      const low = scores.filter((s) => s < 40).length;

      const candidates: CandidateDetail[] = records.map((r) => {
        const missingSkills = (JSON.parse(r.missingSkills) as string[]).slice(0, 3);
        const unclearExp = (JSON.parse(r.unclearExperience) as string[]).slice(0, 2);
        const qualGaps = (JSON.parse(r.qualificationGaps) as string[]).slice(0, 2);
        const strengths = (JSON.parse(r.strengths) as string[]).slice(0, 5);
        const weakPoints = [...missingSkills, ...unclearExp, ...qualGaps].slice(0, 5);
        const interviewQuestions = weakPoints.map(
          (wp) => `Can you elaborate on your experience with "${wp}"? How have you addressed this gap in previous roles?`,
        );
        return {
          id: r.id,
          name: r.candidateName,
          matchScore: r.matchScore,
          strongPoints: strengths,
          weakPoints,
          interviewQuestions: interviewQuestions.slice(0, 5),
        };
      });

      const first = records[0];
      const title =
        first.jobTitle !== 'Unknown Position'
          ? first.jobTitle
          : first.jobDescription.trim().slice(0, 60);

      jobs.push({
        id: `job-${counter++}`,
        title,
        jobDescription: first.jobDescription,
        candidateCount: records.length,
        avgScore,
        scoreDistribution: { high, medium, low },
        candidates,
      });
    }

    return { jobs };
  }

  // ── Chat ──────────────────────────────────────────────────────────

  async chat(
    candidateId: number,
    message: string,
    _conversationHistory: Array<{ role: string; content: string }>,
  ): Promise<{ reply: string; candidateId: number; timestamp: string }> {
    const count = await this.prisma.candidateAnalysis.count();

    if (count === 0) {
      return this.getDummyReply(candidateId, message);
    }

    const record = await this.prisma.candidateAnalysis.findUnique({
      where: { id: candidateId },
    });

    if (!record) {
      return {
        reply: "I couldn't find data for this candidate. They may have been analyzed in a previous session.",
        candidateId,
        timestamp: new Date().toISOString(),
      };
    }

    const strengths = JSON.parse(record.strengths) as string[];
    const missing = JSON.parse(record.missingSkills) as string[];
    const unclear = JSON.parse(record.unclearExperience) as string[];
    const qualGaps = JSON.parse(record.qualificationGaps) as string[];
    const weakPoints = [...missing, ...unclear, ...qualGaps];

    const dbCandidate: CandidateDetail = {
      id: record.id,
      name: record.candidateName,
      matchScore: record.matchScore,
      strongPoints: strengths,
      weakPoints,
      interviewQuestions: weakPoints.map(
        (wp) => `Can you elaborate on your experience with "${wp}"?`,
      ),
    };

    return this.buildReply(dbCandidate, 'this role', message);
  }

  private getDummyReply(
    candidateId: number,
    message: string,
  ): { reply: string; candidateId: number; timestamp: string } {
    const match = this.findCandidateInDummy(candidateId);

    if (!match) {
      return {
        reply: "I don't have profile data for this candidate ID in the current dataset.",
        candidateId,
        timestamp: new Date().toISOString(),
      };
    }

    return this.buildReply(match.candidate, match.jobTitle, message, candidateId);
  }

  private buildReply(
    candidate: CandidateDetail,
    jobTitle: string,
    message: string,
    candidateId?: number,
  ): { reply: string; candidateId: number; timestamp: string } {
    const id = candidateId ?? candidate.id;
    const msg = message.toLowerCase();

    let reply: string;

    if (/(strength|strong|good at|excel|skill|best)/.test(msg)) {
      const points = candidate.strongPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
      reply = `**${candidate.name}'s key strengths for ${jobTitle}:**\n\n${points}\n\nThese demonstrate a strong alignment with the role requirements.`;
    } else if (/(weak|concern|gap|issue|probe|miss|lack|problem)/.test(msg)) {
      const points = candidate.weakPoints.map((p, i) => `${i + 1}. ${p}`).join('\n');
      reply = `**Areas to probe for ${candidate.name}:**\n\n${points}\n\nI recommend addressing these directly during the interview to get a clearer picture.`;
    } else if (/(interview|question|ask)/.test(msg)) {
      const qs = candidate.interviewQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      reply = `**Suggested interview questions for ${candidate.name}:**\n\n${qs}`;
    } else if (/(hire|recommend|advance|next stage|should we|decision|offer)/.test(msg)) {
      const score = candidate.matchScore;
      if (score >= 80) {
        reply = `**Recommendation: Strongly Recommend ✓**\n\n${candidate.name} scores ${score}/100 — an excellent match for ${jobTitle}. Fast-track to the next stage.\n\nKey differentiators:\n• ${candidate.strongPoints[0]}\n• ${candidate.strongPoints[1] ?? candidate.strongPoints[0]}`;
      } else if (score >= 70) {
        reply = `**Recommendation: Recommend ✓**\n\n${candidate.name} scores ${score}/100 — a strong fit. Proceed to the next stage, but probe: ${candidate.weakPoints[0]}.`;
      } else if (score >= 40) {
        reply = `**Recommendation: Proceed with Caution ⚠**\n\n${candidate.name} scores ${score}/100. Consider a phone screen first to probe: ${candidate.weakPoints.slice(0, 2).join(' and ')}.\n\nPositive signal: ${candidate.strongPoints[0]}.`;
      } else {
        reply = `**Recommendation: Not Recommended at this time ✗**\n\n${candidate.name} scores ${score}/100 — significant gaps for ${jobTitle}.\n\nMain concerns:\n• ${candidate.weakPoints[0]}\n• ${candidate.weakPoints[1] ?? ''}`;
      }
    } else if (/(score|match|fit|rating|percent)/.test(msg)) {
      const score = candidate.matchScore;
      const tier = score >= 70 ? 'High Fit' : score >= 40 ? 'Medium Fit' : 'Low Fit';
      reply = `${candidate.name} has a match score of **${score}/100** (${tier}) for ${jobTitle}.\n\nThis reflects strong alignment in: ${candidate.strongPoints[0]}.\n\nKey gap that reduced the score: ${candidate.weakPoints[0]}.`;
    } else if (/(summar|overview|tell me about|who is|profile)/.test(msg)) {
      const score = candidate.matchScore;
      const tier = score >= 70 ? 'High Fit' : score >= 40 ? 'Medium Fit' : 'Low Fit';
      reply = `**${candidate.name} — ${jobTitle} (${score}/100 · ${tier})**\n\nTop strength: ${candidate.strongPoints[0]}\n\nMain concern: ${candidate.weakPoints[0]}\n\n${score >= 70 ? 'Overall: Strong candidate, recommend advancing.' : score >= 40 ? 'Overall: Worth a deeper conversation.' : 'Overall: May be better suited for a junior opening.'}`;
    } else {
      reply = `I'm your AI recruitment assistant for **${candidate.name}** (${jobTitle} · ${candidate.matchScore}/100).\n\nI can help you with:\n• **Strengths** — what they excel at\n• **Concerns** — gaps and areas to probe\n• **Interview questions** — tailored to their profile\n• **Hiring recommendation** — should you advance them?\n\nWhat would you like to know?`;
    }

    return { reply, candidateId: id, timestamp: new Date().toISOString() };
  }

  private findCandidateInDummy(
    candidateId: number,
  ): { candidate: CandidateDetail; jobTitle: string } | null {
    for (const job of DUMMY_GROUPED_DATA.jobs) {
      const found = job.candidates.find((c) => c.id === candidateId);
      if (found) return { candidate: found, jobTitle: job.title };
    }
    return null;
  }
}
