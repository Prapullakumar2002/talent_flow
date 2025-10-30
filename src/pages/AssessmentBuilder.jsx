import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const QUESTION_TYPES = [
  { id: "single-choice", label: "Single Choice", icon: "○" },
  { id: "multi-choice", label: "Multi Choice", icon: "☑" },
  { id: "short-text", label: "Short Text", icon: "T" },
  { id: "long-text", label: "Long Text", icon: "📝" },
  { id: "numeric", label: "Numeric", icon: "#" },
  { id: "file-upload", label: "File Upload", icon: "📎" },
];

function QuestionEditor({ question, onUpdate, onDelete, allQuestions }) {
  const updateField = (field, value) => {
    onUpdate({ ...question, [field]: value });
  };

  const updateValidation = (field, value) => {
    onUpdate({
      ...question,
      validation: { ...question.validation, [field]: value },
    });
  };

  const updateConditional = (field, value) => {
    onUpdate({
      ...question,
      conditional: { ...question.conditional, [field]: value },
    });
  };

  const addOption = () => {
    const options = question.options || [];
    onUpdate({
      ...question,
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  const updateOption = (index, value) => {
    const options = [...question.options];
    options[index] = value;
    onUpdate({ ...question, options });
  };

  const removeOption = (index) => {
    const options = question.options.filter((_, i) => i !== index);
    onUpdate({ ...question, options });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {QUESTION_TYPES.find((t) => t.id === question.type)?.icon}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {QUESTION_TYPES.find((t) => t.id === question.type)?.label}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Delete
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Text
          </label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => updateField("text", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question..."
          />
        </div>

        {(question.type === "single-choice" ||
          question.type === "multi-choice") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            {(question.options || []).map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="px-3 py-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Option
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`required-${question.id}`}
            checked={question.validation?.required || false}
            onChange={(e) => updateValidation("required", e.target.checked)}
            className="rounded"
          />
          <label
            htmlFor={`required-${question.id}`}
            className="text-sm text-gray-700"
          >
            Required
          </label>
        </div>

        {(question.type === "short-text" || question.type === "long-text") && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={question.validation?.minLength || ""}
                onChange={(e) =>
                  updateValidation("minLength", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={question.validation?.maxLength || ""}
                onChange={(e) =>
                  updateValidation("maxLength", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max characters"
              />
            </div>
          </div>
        )}

        {question.type === "numeric" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={question.validation?.min || ""}
                onChange={(e) =>
                  updateValidation("min", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={question.validation?.max || ""}
                onChange={(e) =>
                  updateValidation("max", parseFloat(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conditional Logic (Show this question only if...)
          </label>
          <div className="space-y-2">
            <select
              value={question.conditional?.questionId || ""}
              onChange={(e) => updateConditional("questionId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Always show</option>
              {allQuestions
                .filter((q) => q.id !== question.id)
                .map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.text || "Untitled Question"}
                  </option>
                ))}
            </select>
            {question.conditional?.questionId && (
              <input
                type="text"
                value={question.conditional?.expectedValue || ""}
                onChange={(e) =>
                  updateConditional("expectedValue", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Expected answer"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionPreview({ question, value, onChange, error, visible }) {
  if (!visible) return null;

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {question.text}
        {question.validation?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      {question.type === "single-choice" && (
        <div className="space-y-2">
          {(question.options || []).map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "multi-choice" && (
        <div className="space-y-2">
          {(question.options || []).map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={option}
                checked={(value || []).includes(option)}
                onChange={(e) => {
                  const currentValues = value || [];
                  if (e.target.checked) {
                    onChange([...currentValues, option]);
                  } else {
                    onChange(currentValues.filter((v) => v !== option));
                  }
                }}
                className="text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === "short-text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your answer..."
        />
      )}

      {question.type === "long-text" && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your detailed answer..."
        />
      )}

      {question.type === "numeric" && (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a number..."
        />
      )}

      {question.type === "file-upload" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-500 text-sm">
            📎 File upload (stub - not functional in preview)
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function AssessmentBuilder() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewErrors, setPreviewErrors] = useState({});

  useEffect(() => {
    fetch(`/api/assessments?jobId=${jobId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setAssessment(data);
          setQuestions(data.questions || []);
        } else {
          setAssessment({ jobId: parseInt(jobId), title: "New Assessment" });
        }
        setLoading(false);
      })
      .catch(() => {
        setAssessment({ jobId: parseInt(jobId), title: "New Assessment" });
        setLoading(false);
      });
  }, [jobId]);

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      text: "",
      validation: { required: false },
      conditional: {},
      options:
        type === "single-choice" || type === "multi-choice"
          ? ["Option 1", "Option 2"]
          : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, updatedQuestion) => {
    setQuestions(questions.map((q) => (q.id === id ? updatedQuestion : q)));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
    // Clean up any conditionals that reference this question
    setQuestions((prev) =>
      prev.map((q) =>
        q.conditional?.questionId === id ? { ...q, conditional: {} } : q
      )
    );
  };

  const saveAssessment = async () => {
    setSaving(true);
    try {
      const method = assessment.id ? "PUT" : "POST";
      const url = assessment.id
        ? `/api/assessments/${assessment.id}`
        : "/api/assessments";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...assessment,
          questions,
        }),
      });

      if (!response.ok) throw new Error("Failed to save assessment");

      const saved = await response.json();
      setAssessment(saved);
      alert("Assessment saved successfully!");
    } catch (err) {
      alert("Failed to save assessment: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const validateQuestion = (question, value) => {
    const validation = question.validation || {};

    if (validation.required) {
      if (!value) {
        return "This field is required";
      }
      // For multi-choice, check if array is empty
      if (
        question.type === "multi-choice" &&
        Array.isArray(value) &&
        value.length === 0
      ) {
        return "Please select at least one option";
      }
    }

    if (
      (question.type === "short-text" || question.type === "long-text") &&
      validation.minLength
    ) {
      if ((value || "").length < validation.minLength) {
        return `Minimum ${validation.minLength} characters required`;
      }
    }

    if (
      (question.type === "short-text" || question.type === "long-text") &&
      validation.maxLength
    ) {
      if ((value || "").length > validation.maxLength) {
        return `Maximum ${validation.maxLength} characters allowed`;
      }
    }

    if (question.type === "numeric") {
      const num = parseFloat(value);
      if (validation.min !== undefined && num < validation.min) {
        return `Value must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Value must be at most ${validation.max}`;
      }
    }

    return null;
  };

  const handlePreviewChange = (questionId, value) => {
    setPreviewAnswers({ ...previewAnswers, [questionId]: value });
    const question = questions.find((q) => q.id === questionId);
    const error = validateQuestion(question, value);
    setPreviewErrors({ ...previewErrors, [questionId]: error });
  };

  const isQuestionVisible = (question) => {
    if (!question.conditional?.questionId) return true;

    const dependentAnswer = previewAnswers[question.conditional.questionId];
    return dependentAnswer === question.conditional.expectedValue;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600">Loading assessment...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate("/jobs")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Assessment Builder
          </h1>
        </div>
        <button
          onClick={saveAssessment}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {saving ? "Saving..." : "Save Assessment"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assessment Title
        </label>
        <input
          type="text"
          value={assessment.title}
          onChange={(e) =>
            setAssessment({ ...assessment, title: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Technical Assessment"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Panel - Builder */}
        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Add Question</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addQuestion(type.id)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Questions</h2>
            {questions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                No questions yet. Add one using the buttons above.
              </div>
            ) : (
              questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onUpdate={(updated) => updateQuestion(question.id, updated)}
                  onDelete={() => deleteQuestion(question.id)}
                  allQuestions={questions}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
            {questions.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Add questions to see the preview
              </div>
            ) : (
              <div>
                {questions.map((question) => (
                  <QuestionPreview
                    key={question.id}
                    question={question}
                    value={previewAnswers[question.id]}
                    onChange={(value) =>
                      handlePreviewChange(question.id, value)
                    }
                    error={previewErrors[question.id]}
                    visible={isQuestionVisible(question)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentBuilder;
