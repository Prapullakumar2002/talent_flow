import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const STAGES = {
  applied: "Applied",
  screening: "Screen",
  interview: "Tech",
  offer: "Offer",
  hired: "Rejected",
};

function CandidateCard({ candidate, isDragging, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="font-medium text-sm text-gray-900">{candidate.name}</div>
      <div className="text-xs text-gray-500 mt-1">{candidate.email}</div>
    </div>
  );
}

function SortableCandidate({ candidate, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CandidateCard
        candidate={candidate}
        isDragging={isDragging}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      />
    </div>
  );
}

function KanbanColumn({ stage, candidates, onCandidateClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 flex flex-col h-full transition-colors ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{STAGES[stage]}</h3>
        <span className="text-sm text-gray-500">{candidates.length}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <SortableContext
          items={candidates.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="h-full overflow-y-auto pr-2">
            {candidates.map((candidate) => (
              <SortableCandidate
                key={candidate.id}
                candidate={candidate}
                onClick={() => onCandidateClick(candidate.id)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function Candidates() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetch("/api/candidates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch candidates");
        return res.json();
      })
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Filter candidates by search query
  const filteredCandidates = candidates.filter((candidate) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(query) ||
      candidate.email.toLowerCase().includes(query)
    );
  });

  const candidatesByStage = Object.keys(STAGES).reduce((acc, stage) => {
    acc[stage] = filteredCandidates.filter((c) => c.stage === stage);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id;
    const candidate = candidates.find((c) => c.id === candidateId);

    // Determine the new stage - check if dropped on column or another card
    let newStage = over.id;
    if (!Object.keys(STAGES).includes(over.id)) {
      // Dropped on a card, find which column it belongs to
      const targetCandidate = candidates.find((c) => c.id === over.id);
      if (targetCandidate) {
        newStage = targetCandidate.stage;
      }
    }

    if (!newStage || candidate.stage === newStage) return;

    // Optimistic update
    const previousCandidates = [...candidates];
    setCandidates(
      candidates.map((c) =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
    );

    try {
      const response = await fetch(`/api/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) throw new Error("Failed to update candidate");
    } catch {
      // Rollback on error
      setCandidates(previousCandidates);
      setError("Failed to update candidate. Changes have been reverted.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDragOver = (event) => {
    const { over } = event;
    if (!over) return;

    // Allow dropping on stage columns
    for (const stage of Object.keys(STAGES)) {
      if (over.id === stage) {
        return;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Loading candidates...</div>
        </div>
      </div>
    );
  }

  const activeCandidate = activeId
    ? candidates.find((c) => c.id === activeId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <div className="text-sm text-gray-600">
          {filteredCandidates.length} of {candidates.length} candidates
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label
          htmlFor="candidate-search"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Search Candidates
        </label>
        <input
          id="candidate-search"
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredCandidates.length} results for "{searchQuery}"
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="grid grid-cols-5 gap-4"
          style={{ height: "calc(100vh - 250px)" }}
        >
          {Object.keys(STAGES).map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage]}
              onCandidateClick={(id) => navigate(`/candidates/${id}`)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeCandidate ? (
            <CandidateCard candidate={activeCandidate} isDragging={false} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default Candidates;
