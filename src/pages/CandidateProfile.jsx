import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const STAGE_LABELS = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
};

function MentionText({ text }) {
  // Split text by @mentions and render them differently
  const parts = text.split(/(@\w+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          return (
            <span key={index} className="text-blue-600 font-medium">
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

function TimelineItem({ item }) {
  const date = new Date(item.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
      </div>
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium text-gray-900">
                Stage changed to{" "}
                <span className="text-blue-600">
                  {STAGE_LABELS[item.newStage]}
                </span>
              </span>
              {item.previousStage && (
                <span className="text-gray-500 text-sm ml-2">
                  from {STAGE_LABELS[item.previousStage]}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          {item.note && (
            <p className="text-sm text-gray-600 mt-2">
              <MentionText text={item.note} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteItem({ note }) {
  const date = new Date(note.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
      </div>
      <div className="flex-1 pb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-medium text-gray-900">Note added</span>
            <span className="text-sm text-gray-500">{timeAgo}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            <MentionText text={note.content} />
          </p>
          {note.author && (
            <p className="text-xs text-gray-500 mt-2">By {note.author}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

  return date.toLocaleDateString();
}

function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/candidates/${id}`).then((res) => res.json()),
      fetch(`/api/candidates/${id}/timeline`).then((res) => res.json()),
    ])
      .then(([candidateData, timelineData]) => {
        setCandidate(candidateData);
        setTimeline(timelineData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/candidates/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteText,
          author: "Current User",
        }),
      });

      if (!response.ok) throw new Error("Failed to add note");

      const newNote = await response.json();
      setTimeline([newNote, ...timeline]);
      setNoteText("");
    } catch (err) {
      alert("Failed to add note: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Loading candidate...</div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Candidate not found
        </h2>
        <button
          onClick={() => navigate("/candidates")}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate("/candidates")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          ← Back to Candidates
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {candidate.name}
              </h1>
              <p className="text-gray-600 mt-1">{candidate.email}</p>
            </div>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                candidate.stage === "hired"
                  ? "bg-green-100 text-green-800"
                  : candidate.stage === "offer"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {STAGE_LABELS[candidate.stage]}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Timeline</h2>
            {timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity yet
              </div>
            ) : (
              <div className="space-y-0">
                {timeline.map((item) =>
                  item.type === "stage_change" ? (
                    <TimelineItem key={item.id} item={item} />
                  ) : (
                    <NoteItem key={item.id} note={item} />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Add Note</h2>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                  placeholder="Add a note... Use @name to mention someone"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Tip: Type @username to mention someone
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting || !noteText.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {submitting ? "Adding..." : "Add Note"}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Candidate Info
              </h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs text-gray-500">Job ID</dt>
                  <dd className="text-sm text-gray-900">{candidate.jobId}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Current Stage</dt>
                  <dd className="text-sm text-gray-900">
                    {STAGE_LABELS[candidate.stage]}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
