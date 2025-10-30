import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableJobRow({ job, onArchiveToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {job.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            job.status === "open"
              ? "bg-green-100 text-green-800"
              : job.status === "closed"
              ? "bg-red-100 text-red-800"
              : job.status === "archived"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {job.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-1">
          {job.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex gap-3">
          <Link
            to={`/jobs/${job.id}/assessment`}
            className="text-blue-600 hover:text-blue-800"
          >
            Assessment
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchiveToggle(job);
            }}
            className={`${
              job.status === "archived"
                ? "text-green-600 hover:text-green-800"
                : "text-yellow-600 hover:text-yellow-800"
            }`}
          >
            {job.status === "archived" ? "Unarchive" : "Archive"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    status: "open",
    tags: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/jobs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredJobs.findIndex((job) => job.id === active.id);
    const newIndex = filteredJobs.findIndex((job) => job.id === over.id);

    // Optimistic update
    const reorderedJobs = arrayMove(filteredJobs, oldIndex, newIndex);
    const previousJobs = [...jobs];
    setJobs(reorderedJobs);

    try {
      const response = await fetch(`/api/jobs/${active.id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOrder: newIndex }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder job");
      }
    } catch {
      // Rollback on error
      setJobs(previousJobs);
      setError("Failed to reorder jobs. Changes have been reverted.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const isSlugUnique = (slug) => {
    return !jobs.some((job) => job.slug === slug);
  };

  const handleArchiveToggle = async (job) => {
    const newStatus = job.status === "archived" ? "open" : "archived";
    const previousJobs = [...jobs];

    // Optimistic update
    setJobs(
      jobs.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update job status");
    } catch {
      // Rollback on error
      setJobs(previousJobs);
      setError("Failed to update job status. Changes have been reverted.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title.trim()) {
      setFormError("Title is required");
      return;
    }

    const slug = formData.slug.trim() || generateSlug(formData.title);

    if (!isSlugUnique(slug)) {
      setFormError("Slug must be unique. This slug already exists.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          slug,
          status: formData.status,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error("Failed to create job");

      const newJob = await response.json();
      setJobs([...jobs, newJob]);
      setIsModalOpen(false);
      setFormData({ title: "", slug: "", status: "open", tags: "" });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesTitle = job.title
      .toLowerCase()
      .includes(titleFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesTitle && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Loading jobs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Jobs Board</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Job
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">{filteredJobs.length} jobs</div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <div className="flex-1">
          <label
            htmlFor="title-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search by Title
          </label>
          <input
            id="title-filter"
            type="text"
            placeholder="Filter by job title..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <SortableContext
              items={filteredJobs.map((job) => job.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No jobs found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <SortableJobRow
                      key={job.id}
                      job={job}
                      onArchiveToggle={handleArchiveToggle}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Job"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="job-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="job-title"
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({
                  ...formData,
                  title,
                  slug: formData.slug || generateSlug(title),
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div>
            <label
              htmlFor="job-slug"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="job-slug"
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Auto-generated from title"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier (auto-generated if left empty)
            </p>
          </div>

          <div>
            <label
              htmlFor="job-status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="job-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="job-tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags
            </label>
            <input
              id="job-tags"
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. tech, full-time, remote"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Jobs;
