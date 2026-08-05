import { ProjectLayer, ProjectType, SkillProficiency } from "../src/generated/prisma/client";
import { prisma } from "../src/config/db";
import { GeminiEmbeddingClient } from "../src/integrations/gemini.embedding.client";

const embeddingClient = new GeminiEmbeddingClient();

const pages = [
  {
    name: "Projects",
    sections: [
      { name: "Backend Projects", elementId: "backend-projects" },
      { name: "Frontend Projects", elementId: "frontend-projects" },
      { name: "Fullstack Projects", elementId: "fullstack-projects" },
    ]
  },
  {
    name: "Skills",
    sections: [
      { name: "Languages", elementId: "languages" },
      { name: "Frameworks", elementId: "frameworks" },
      { name: "DevOps", elementId: "devops" },
    ]
  },
  {
    name: "Experience",
    sections: [
      { name: "Work Experience", elementId: "work-experience" },
      { name: "Internships", elementId: "internships" },
    ]
  },
  {
    name: "About",
    sections: [
      { name: "Bio", elementId: "bio" },
      { name: "Contact", elementId: "contact" },
    ]
  },
  {
    name: "Contact",
    sections: [
      { name: "Contact Form", elementId: "contact-form" },
    ]
  }
];

const projects = [
  {
    name: "Payment Orchestrator",
    description: "Multi-provider payment orchestration system routing transactions across 6 payment providers including Clearbank, MFB, TrustPayment, Lightning, NIP, and Providus. Achieves 99.9% uptime and sub-2-second response times through intelligent failover and rule-based channel selection.",
    githubUrl: "https://github.com/Ishmael-a",
    liveUrl: null,
    techStack: ["Node.js", "MongoDB", "Python", "AWS"],
    highlights: ["99.9% uptime", "95%+ transaction success rate", "6 payment providers integrated", "Sub-2-second response times"],
    type: ProjectType.PROFESSIONAL,
    layer: ProjectLayer.BACKEND,
  },
  {
    name: "Atlas Portfolio",
    description: "AI-powered developer portfolio with a natural language chat interface, RAG pipeline using OpenAI embeddings and pgvector, SSE streaming, and a Node.js/Express/TypeScript backend with React frontend.",
    githubUrl: "https://github.com/Ishmael-a",
    liveUrl: null,
    techStack: ["Node.js", "Express", "TypeScript", "React", "PostgreSQL", "pgvector", "OpenAI"],
    highlights: ["RAG pipeline", "SSE streaming", "AI-driven navigation", "Semantic search"],
    type: ProjectType.PERSONAL,
    layer: ProjectLayer.FULLSTACK,
  },
  {
    name: "Secret Chat-AI",
    description: "Interactive AI puzzle platform built in a 2-week sprint serving 1,103 concurrent users at the Amdocs Tech Conference. Integrates dual-AI safety system using LangChain and LangGraph to prevent prompt injection.",
    githubUrl: "https://github.com/Ishmael-a",
    liveUrl: null,
    techStack: ["Next.js", "LangChain", "LangGraph", "JWT"],
    highlights: ["1,103 concurrent users", "Dual-AI safety system", "Prompt injection prevention"],
    type: ProjectType.PROFESSIONAL,
    layer: ProjectLayer.FULLSTACK,
  },
  {
    name: "OfficeDays Allocation System",
    description: "Production-ready employee scheduling system built solo in a 5-day sprint. Features recursive constraint-based allocation logic preventing consecutive office day assignments while optimizing team collaboration across hybrid, onsite, and remote employees.",
    githubUrl: "https://github.com/Ishmael-a",
    liveUrl: null,
    techStack: ["Next.js", "PostgreSQL", "TypeScript"],
    highlights: ["Built solo in 5 days", "Recursive constraint algorithm", "Role-based auth", "Automated monthly reshuffling"],
    type: ProjectType.PROFESSIONAL,
    layer: ProjectLayer.FULLSTACK,
  },
];

const skills = [
  { name: "TypeScript", description: "Strongly typed JavaScript used across fullstack projects. Used extensively in backend Express services, React frontends, and system design work.", category: "LANGUAGE", proficiency: SkillProficiency.ADVANCED },
  { name: "JavaScript", description: "Core language for both frontend and backend development across all projects.", category: "LANGUAGE", proficiency: SkillProficiency.ADVANCED },
  { name: "Python", description: "Used for backend services including cross-border payout systems with CloudHSM/KMS digital signature authentication and rate engines.", category: "LANGUAGE", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "Node.js", description: "Primary backend runtime. Used to build payment orchestrators, REST APIs, microservices, and webhook handlers in production fintech systems.", category: "BACKEND", proficiency: SkillProficiency.ADVANCED },
  { name: "Express.js", description: "Primary Node.js framework for building REST APIs and backend services across multiple production projects.", category: "BACKEND", proficiency: SkillProficiency.ADVANCED },
  { name: "NestJS", description: "Used for structured backend services with dependency injection and modular architecture.", category: "BACKEND", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "Flask", description: "Python web framework used for lightweight backend services and APIs.", category: "BACKEND", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "React", description: "Primary frontend framework. Used to build dashboards, lending platforms, scheduling systems, and AI-powered interfaces.", category: "FRONTEND", proficiency: SkillProficiency.ADVANCED },
  { name: "Next.js", description: "Used for fullstack applications including the OfficeDays scheduling system and Secret Chat-AI puzzle platform.", category: "FRONTEND", proficiency: SkillProficiency.ADVANCED },
  { name: "Tailwind CSS", description: "Utility-first CSS framework used for responsive design across frontend projects.", category: "FRONTEND", proficiency: SkillProficiency.ADVANCED },
  { name: "PostgreSQL", description: "Relational database used for structured data storage, complex queries, and vector search via pgvector extension.", category: "DATABASE", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "MongoDB", description: "NoSQL database used in payment orchestrator and other backend services for flexible document storage.", category: "DATABASE", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "Firebase", description: "Used for real-time data and authentication in frontend projects.", category: "DATABASE", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "Prisma ORM", description: "Primary ORM for PostgreSQL-backed projects. Used for schema management, migrations, and type-safe queries.", category: "DATABASE", proficiency: SkillProficiency.ADVANCED },
  { name: "Docker", description: "Used for containerization and consistent development environments across projects.", category: "DEVOPS", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "JWT Authentication", description: "Implemented secure authentication flows across multiple fullstack projects.", category: "BACKEND", proficiency: SkillProficiency.ADVANCED },
  { name: "RabbitMQ", description: "Message queue used for microservices communication achieving 96% message delivery reliability.", category: "ARCHITECTURE", proficiency: SkillProficiency.INTERMEDIATE },
  { name: "LangChain", description: "Used for LLM orchestration and dual-AI safety systems in AI-powered applications.", category: "AI", proficiency: SkillProficiency.BEGINNER },
  { name: "System Design", description: "Experienced designing scalable microservices architectures, payment orchestration systems, and multi-provider routing engines with failover strategies.", category: "ARCHITECTURE", proficiency: SkillProficiency.INTERMEDIATE },
];

const experiences = [
  {
    title: "Mid-level Fullstack Developer",
    company: "MyDevConnect",
    role: "Intermediate Fullstack Developer",
    description: "Lead developer on a multi-provider payment orchestration system routing transactions across 6 providers with 99.9% uptime. Built payment links integration, led 3-person frontend team on Sycamore lending platform, and developed Python-based cross-border payout system with CloudHSM/KMS authentication.",
    startDate: new Date("2025-09-01"),
    endDate: null,
    location: "Remote",
  },
  {
    title: "Full Stack Developer (National Service)",
    company: "Really Great Tech",
    role: "Full Stack Developer",
    description: "Built HR management system serving 100+ users, cutting onboarding time from 3 hours to 30 minutes. Developed IFC-based building compliance verification frontend and DeFi sports betting platform with wallet connectivity.",
    startDate: new Date("2024-10-01"),
    endDate: new Date("2025-10-01"),
    location: "Remote (Tel Aviv)",
  },
  {
    title: "Software Engineering Intern",
    company: "Progpharma Digital Ltd",
    role: "Software Engineering Intern",
    description: "Collaborated on Risk Assessment Framework frontend using React and Express.js. Resolved 15+ critical UI/UX bugs enabling on-time delivery. Gained hands-on experience with Agile methodologies and CI/CD pipelines.",
    startDate: new Date("2023-08-01"),
    endDate: new Date("2023-10-01"),
    location: "Accra, Ghana",
  },
];

const about = {
  email: "walkwithishmael@gmail.com",
  phone: "+233-55-253-3569",
  LinkedIn: "https://linkedin.com/in/yusif-abu-ishmael",
  GitHub: "https://github.com/Ishmael-a",
  bio: `
    Fullstack Software Engineer with 2+ years building production-grade fintech and enterprise systems. 
    Strong systems thinker who gravitates toward real-world complexity, asking what happens in production rather than just locally. 
    Self-directed learner comfortable moving across the stack — backend architecture, databases, APIs, frontend, system design, and infrastructure. 
    Strengths: Strong systems thinking, gravitates toward real-world complexity, persistent on difficult problems, good product intuition, self-directed learner, comfortable across the full stack, intellectually curious, willing to challenge ideas, good at identifying hidden assumptions. 
    Weaknesses: Tendency to over-engineer before validating, execution sometimes loses to planning, can become trapped in possibility space, perfectionism disguised as preparation, underestimates simple solutions, can spend too long on edge cases, sometimes optimizes for engineering elegance over business validation, harder on self than on others.
  `,
};

function vectorizeText(text: string): Promise<number[]> {
  return embeddingClient.embed(text);
}

async function generateEmbeddings() {
  console.log("Generating embeddings...");

  const projects = await prisma.project.findMany();
  for (const project of projects) {
    const embedding = await vectorizeText(project.description);
    await prisma.$executeRawUnsafe(
      `UPDATE "Project" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      project.id
    );
    console.log(`Embedded project: ${project.name}`);
  }

  const skills = await prisma.skill.findMany();
  for (const skill of skills) {
    const embedding = await vectorizeText(skill.description);
    await prisma.$executeRawUnsafe(
      `UPDATE "Skill" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      skill.id
    );
    console.log(`Embedded skill: ${skill.name}`);
  }

  const experiences = await prisma.experience.findMany();
  for (const experience of experiences) {
    const embedding = await vectorizeText(experience.description);
    await prisma.$executeRawUnsafe(
      `UPDATE "Experience" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      experience.id
    );
    console.log(`Embedded experience: ${experience.title}`);
  }

  const abouts = await prisma.about.findMany();
  for (const about of abouts) {
    const embedding = await vectorizeText(about.bio);
    await prisma.$executeRawUnsafe(
      `UPDATE "About" SET embedding = $1::vector WHERE id = $2`,
      `[${embedding.join(",")}]`,
      about.id
    );
    console.log(`Embedded about: ${about.email}`);
  }

  console.log("All embeddings generated successfully.");
}

const seed = async () => {
  const t0 = performance.now();
  try {
    // Clear existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.pageSection.deleteMany();
    await prisma.page.deleteMany();
    await prisma.project.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.about.deleteMany();

    // Seed pages and sections
    for (const page of pages) {
      await prisma.page.create({
        data: {
          name: page.name,
          PageSections: {
            create: page.sections
          }
        }
      });
    }

    // Seed projects
    await prisma.project.createMany({ data: projects });

    // Seed skills
    await prisma.skill.createMany({ data: skills });

    // Seed experiences
    await prisma.experience.createMany({ data: experiences });

    // Seed about
    await prisma.about.create({ data: about });

    // Generate embeddings for vector search
    await generateEmbeddings();

    const t1 = performance.now();
    console.log(`Seed completed successfully in ${(t1 - t0).toFixed(2)}ms`);
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seed();