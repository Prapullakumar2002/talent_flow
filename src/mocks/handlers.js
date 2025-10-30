import { http, HttpResponse } from "msw";
import { db } from "../db";

// Simulate network latency (200-1200ms)
const delay = () => {
  const ms = Math.random() * 1000 + 200; // Random delay between 200-1200ms
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Simulate random errors (5-10% chance on write operations)
const shouldFail = () => {
  return Math.random() < 0.075; // 7.5% error rate (middle of 5-10%)
};

export const handlers = [
  http.get("/api/jobs", async () => {
    await delay();
    const jobs = await db.jobs.toArray();
    return HttpResponse.json(jobs);
  }),

  http.post("/api/jobs", async ({ request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const newJob = await request.json();
    const id = await db.jobs.add({
      ...newJob,
      order: await db.jobs.count(),
    });
    const job = await db.jobs.get(id);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.patch("/api/jobs/:id", async ({ params, request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { id } = params;
    const updates = await request.json();

    await db.jobs.update(Number(id), updates);
    const job = await db.jobs.get(Number(id));
    return HttpResponse.json(job);
  }),

  http.patch("/api/jobs/:id/reorder", async ({ params, request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { id } = params;
    const { newOrder } = await request.json();

    await db.jobs.update(Number(id), { order: newOrder });
    const job = await db.jobs.get(Number(id));
    return HttpResponse.json(job);
  }),

  http.get("/api/candidates", async () => {
    await delay();
    const candidates = await db.candidates.toArray();
    return HttpResponse.json(candidates);
  }),

  http.patch("/api/candidates/:id", async ({ params, request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { id } = params;
    const { stage } = await request.json();
    const candidateId = Number(id);

    // Get current stage before updating
    const candidate = await db.candidates.get(candidateId);
    const previousStage = candidate?.stage;

    // Update candidate stage
    await db.candidates.update(candidateId, { stage });

    // Record stage change in history
    await db.stageHistory.add({
      candidateId,
      previousStage,
      newStage: stage,
      timestamp: Date.now(),
    });

    const updatedCandidate = await db.candidates.get(candidateId);
    return HttpResponse.json(updatedCandidate);
  }),

  http.get("/api/assessments", async ({ request }) => {
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");

    if (jobId) {
      const assessment = await db.assessments
        .where("jobId")
        .equals(Number(jobId))
        .first();
      return HttpResponse.json(assessment || null);
    }

    const assessments = await db.assessments.toArray();
    return HttpResponse.json(assessments);
  }),

  http.post("/api/assessments", async ({ request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const newAssessment = await request.json();
    const id = await db.assessments.add(newAssessment);
    const assessment = await db.assessments.get(id);
    return HttpResponse.json(assessment, { status: 201 });
  }),

  http.put("/api/assessments/:id", async ({ params, request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { id } = params;
    const updates = await request.json();

    await db.assessments.update(Number(id), updates);
    const assessment = await db.assessments.get(Number(id));
    return HttpResponse.json(assessment);
  }),

  http.get("/api/responses", async ({ request }) => {
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get("assessmentId");

    if (assessmentId) {
      const responses = await db.responses
        .where("assessmentId")
        .equals(Number(assessmentId))
        .toArray();
      return HttpResponse.json(responses);
    }

    const responses = await db.responses.toArray();
    return HttpResponse.json(responses);
  }),

  http.post("/api/responses", async ({ request }) => {
    const newResponse = await request.json();
    const id = await db.responses.add(newResponse);
    const response = await db.responses.get(id);
    return HttpResponse.json(response, { status: 201 });
  }),

  http.get("/api/candidates/:id", async ({ params }) => {
    const { id } = params;
    const candidate = await db.candidates.get(Number(id));
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(candidate);
  }),

  http.get("/api/candidates/:id/timeline", async ({ params }) => {
    const { id } = params;
    const candidateId = Number(id);

    // Get stage history
    const stageHistory = await db.stageHistory
      .where("candidateId")
      .equals(candidateId)
      .toArray();

    // Get notes
    const notes = await db.notes
      .where("candidateId")
      .equals(candidateId)
      .toArray();

    // Combine and sort by timestamp
    const timeline = [
      ...stageHistory.map((h) => ({ ...h, type: "stage_change" })),
      ...notes.map((n) => ({ ...n, type: "note" })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return HttpResponse.json(timeline);
  }),

  http.post("/api/candidates/:id/notes", async ({ params, request }) => {
    await delay();
    if (shouldFail()) {
      return new HttpResponse(null, { status: 500 });
    }
    const { id } = params;
    const noteData = await request.json();

    const note = {
      candidateId: Number(id),
      content: noteData.content,
      author: noteData.author || "Anonymous",
      timestamp: Date.now(),
    };

    const noteId = await db.notes.add(note);
    const savedNote = await db.notes.get(noteId);

    return HttpResponse.json({ ...savedNote, type: "note" }, { status: 201 });
  }),
];
