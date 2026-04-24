import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing jobs before seeding
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();

  await prisma.job.createMany({
    data: [
      {
        title: 'Software Engineer',
        description:
          'We are looking for a Software Engineer to join our product team. You will design and build scalable backend services and RESTful APIs, collaborate with cross-functional teams to deliver new features, and maintain high code quality through code reviews and automated testing. Requirements: 2+ years of experience in TypeScript or Python, familiarity with cloud platforms (AWS/GCP), experience with relational databases, and strong problem-solving skills.',
      },
      {
        title: 'Product Manager',
        description:
          'We are hiring a Product Manager to own the roadmap for our core platform. You will gather requirements from customers and stakeholders, define product strategy and success metrics, work closely with engineering and design to ship features, and analyse usage data to drive product decisions. Requirements: 3+ years of product management experience, strong analytical and communication skills, experience working in Agile teams, and a track record of launching successful products.',
      },
      {
        title: 'Data Analyst',
        description:
          'We are seeking a Data Analyst to turn raw data into actionable insights. You will build dashboards and reports, conduct ad hoc analyses to answer business questions, partner with product and engineering on instrumentation, and present findings to non-technical stakeholders. Requirements: Proficiency in SQL and at least one BI tool (Tableau, Looker, or similar), experience with Python or R for data manipulation, strong storytelling skills, and a Bachelor\'s degree in a quantitative field.',
      },
      {
        title: 'UX Designer',
        description:
          'We are looking for a UX Designer to create intuitive and delightful user experiences across our web and mobile products. You will conduct user research, produce wireframes and high-fidelity prototypes, collaborate with engineers during implementation, and iterate based on usability testing. Requirements: 3+ years of UX/product design experience, a strong portfolio demonstrating end-to-end design process, proficiency in Figma, and experience running user research sessions.',
      },
    ],
  });

  console.log('Seed complete — 4 jobs created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
