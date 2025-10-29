import Dexie from "dexie";

export const db = new Dexie("talentflow");
db.version(1).stores({
  jobs: "++id, title, slug, status, order, tags",
  candidates: "++id, name, email, stage, jobId",
  assessments: "++id, jobId, title",
  responses: "++id, assessmentId, candidateId",
  stageHistory: "++id, candidateId, timestamp",
  notes: "++id, candidateId, timestamp",
});

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    return; // Database is already seeded
  }

  const jobTitles = [
    "Software Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Recruiter",
  ];
  const jobStatuses = ["open", "closed", "draft"];
  const candidateStages = [
    "applied",
    "screening",
    "interview",
    "offer",
    "hired",
  ];

  // Seed jobs
  const jobsToSeed = [];
  for (let i = 0; i < 25; i++) {
    const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const slug = title.toLowerCase().replace(/\s+/g, "-") + "-" + i;
    jobsToSeed.push({
      title,
      slug,
      status: jobStatuses[Math.floor(Math.random() * jobStatuses.length)],
      order: i,
      tags: ["tech", "full-time"],
    });
  }
  await db.jobs.bulkAdd(jobsToSeed);

  // Seed candidates
  const candidatesToSeed = [];
  const allJobs = await db.jobs.toArray();
  for (let i = 0; i < 1000; i++) {
    candidatesToSeed.push({
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@example.com`,
      stage:
        candidateStages[Math.floor(Math.random() * candidateStages.length)],
      jobId: allJobs[Math.floor(Math.random() * allJobs.length)].id,
    });
  }
  await db.candidates.bulkAdd(candidatesToSeed);
}
