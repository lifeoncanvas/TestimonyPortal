import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import "./styles.css";
import api from "../../services/axiosConfig";

// ─── SVG Icon Set ─────────────────────────────────────────────────────────────
// Pure inline SVGs so no icon library dependency is needed.

const Icon = {
  Text: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h10M4 14h12M4 18h8" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8Z" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3M8 22h8" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 13 8 13s8-7.6 8-13a8 8 0 0 0-8-8Z" />
    </svg>
  ),
  Church: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M10 4h4M3 10h18M5 10v11h14V10M10 21v-5h4v5" />
    </svg>
  ),
  Tag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H7a2 2 0 0 0-2 2v5l8.5 8.5a2 2 0 0 0 2.83 0l4.17-4.17a2 2 0 0 0 0-2.83L12 2Z" /><circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.9 6.1L22 9.3l-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8-5-4.9 7.1-1.2L12 2Z" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  Csv: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

// ─── Format Definitions ───────────────────────────────────────────────────────
const FORMATS = [
  {
    id: "text",
    Icon: Icon.Text,
    label: "Text Only",
    desc: "Write your testimony in your own words",
    hasMedia: false,
  },
  {
    id: "record-video",
    Icon: Icon.Video,
    label: "Record Video",
    desc: "Share your story face to face on camera",
    hasMedia: true,
  },
  {
    id: "record-audio",
    Icon: Icon.Mic,
    label: "Record Audio",
    desc: "Speak your testimony as a voice note",
    hasMedia: true,
  },
  {
    id: "upload",
    Icon: Icon.Upload,
    label: "Upload Video",
    desc: "Attach an existing video of your testimony",
    hasMedia: true,
  },
];

// ─── API ──────────────────────────────────────────────────────────────────────
const API = {
  categories: "/api/categories",
  submit:     "/api/testimonies",
  media:      (id) => `/api/testimonies/${id}/media`,
};

// ─── Step Definitions ─────────────────────────────────────────────────────────
const stepsFor = () => {
  return [
    { label: "Role",     icon: "◇" },
    { label: "Story",    icon: "✦" },
    { label: "Preview",  icon: "◉" },
    { label: "Done",     icon: "✧" },
  ];
};

const S = {
  ROLE:    0,
  STORY:   1,
  PREVIEW: 2,
  DONE:    3,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UploadStepper({ onSuccess, onSubmit }) {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(0);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [testimonyId,setTestimonyId]= useState(null);
  const [editId,     setEditId]     = useState(null);

  const [form, setForm] = useState({
    fillerType: "",
    fillerOther: "",
    firstName: "",
    lastName: "",
    testifierName: "",
    zone: "",
    title: "",
    categoryId: "",
    country: "",
    state: "",
    city: "",
    telephoneNumber: "",
    email: "",
    age: "",
    gender: "",
    conditionProblem: "",
    conditionDuration: "",
    unableToDoBefore: "",
    whatHappenedDuringProgram: "",
    ableToDoNow: "",
    inviterDetails: "",
    healingCentreLocation: "",
    description: "",
  });

  // Separate upload file states
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [beforeFiles, setBeforeFiles]   = useState([]);
  const [afterFiles, setAfterFiles]     = useState([]);

  // ── Fetch categories from API on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editParam = searchParams.get("edit");
    if (editParam) {
      const id = Number(editParam);
      setEditId(id);
      setStep(1);
      api.get(`/api/testimonies/${id}`)
        .then((res) => {
          const t = res.data;
          const nameParts = (t.fullName || "").split(" ");
          setForm({
            fillerType: t.fillerType || "GRC Office",
            fillerOther: t.fillerOther || "",
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            testifierName: t.fullName || "",
            zone: t.zone || "",
            title: t.title || "",
            categoryId: t.category?.id ? String(t.category.id) : "",
            country: t.country || "",
            state: t.state || "",
            city: t.city || "",
            telephoneNumber: t.telephoneNumber || "",
            email: t.email || "",
            age: t.age ? String(t.age) : "",
            gender: t.gender || "",
            conditionProblem: t.conditionProblem || "",
            conditionDuration: t.conditionDuration || "",
            unableToDoBefore: t.unableToDoBefore || "",
            whatHappenedDuringProgram: t.whatHappenedDuringProgram || "",
            ableToDoNow: t.ableToDoNow || "",
            inviterDetails: t.inviterOrNextOfKinDetails || "",
            healingCentreLocation: t.healingCentreLocation || "",
            description: t.description || "",
          });
        })
        .catch((err) => {
          console.error("Error loading testimony for edit:", err);
          setError("Failed to load testimony details.");
        });
    }

    api.get(API.categories)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setError("Could not load categories from backend.");
      });
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const steps = stepsFor();
  const PREVIEW = S.PREVIEW;
  const DONE    = S.DONE;

  const addMedicalFiles = (sel) =>
    setMedicalFiles((p) => [
      ...p,
      ...Array.from(sel).map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
  const removeMedicalFile = (i) => setMedicalFiles((p) => p.filter((_, idx) => idx !== i));

  const addBeforeFiles = (sel) =>
    setBeforeFiles((p) => [
      ...p,
      ...Array.from(sel).map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
  const removeBeforeFile = (i) => setBeforeFiles((p) => p.filter((_, idx) => idx !== i));

  const addAfterFiles = (sel) =>
    setAfterFiles((p) => [
      ...p,
      ...Array.from(sel).map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
  const removeAfterFile = (i) => setAfterFiles((p) => p.filter((_, idx) => idx !== i));

  const validateRoleForm = () => {
    if (!form.fillerType) {
      setError("Please select who is filling the form.");
      return false;
    }
    if (form.fillerType === "Other" && !form.fillerOther.trim()) {
      setError("Please state your name or department.");
      return false;
    }
    return true;
  };

  const validateStoryForm = () => {
    if (!validateRoleForm()) return false;

    if (form.fillerType === "Zonal Manager") {
      if (!form.zone.trim()) {
        setError("Please enter the Name of Zone.");
        return false;
      }
      if (!form.testifierName.trim()) {
        setError("Please enter the Name of the Testifier.");
        return false;
      }
    } else {
      if (!form.firstName.trim()) {
        setError("Please enter First Name.");
        return false;
      }
      if (!form.lastName.trim()) {
        setError("Please enter Last Name.");
        return false;
      }
    }

    if (!form.title.trim()) {
      setError("Please enter Testimony Title.");
      return false;
    }
    if (!form.categoryId) {
      setError("Please select a Category.");
      return false;
    }
    if (!form.country.trim()) {
      setError("Please enter Country.");
      return false;
    }
    if (!form.state.trim()) {
      setError("Please enter State.");
      return false;
    }
    if (!form.city.trim()) {
      setError("Please enter City.");
      return false;
    }
    if (!form.telephoneNumber.trim()) {
      setError("Please enter Telephone Number.");
      return false;
    }
    if (!form.age) {
      setError("Please enter Age.");
      return false;
    }
    if (!form.gender) {
      setError("Please select Gender.");
      return false;
    }
    if (!form.conditionProblem.trim()) {
      setError("Please describe the Condition/Problem.");
      return false;
    }
    if (!form.conditionDuration.trim()) {
      setError("Please enter Duration of Condition/Problem.");
      return false;
    }
    if (!form.unableToDoBefore.trim()) {
      setError("Please fill out 'What could you not do before?'.");
      return false;
    }
    if (!form.whatHappenedDuringProgram.trim()) {
      setError("Please fill out 'What happened during the program?'.");
      return false;
    }
    if (!form.ableToDoNow.trim()) {
      setError("Please fill out 'What can you do now?'.");
      return false;
    }
    if (!form.inviterDetails.trim()) {
      setError("Please enter Name and Contact Details of the Person that invited you.");
      return false;
    }
    if (!form.healingCentreLocation.trim()) {
      setError("Please enter Location of Healing Centre/Crusade.");
      return false;
    }
    if (!form.description.trim()) {
      setError("Please write Your Testimony / Testimony Summary.");
      return false;
    }
    if (medicalFiles.length === 0) {
      setError("Please upload at least one Medical Report document or picture.");
      return false;
    }
    if (beforeFiles.length === 0) {
      setError("Please upload at least one 'Before' picture.");
      return false;
    }
    if (afterFiles.length === 0) {
      setError("Please upload at least one 'After' picture.");
      return false;
    }

    return true;
  };

  // ── Submit testimony details → get ID
  const handleSubmitStory = async () => {
    setError(null);
    if (!validateStoryForm()) return;
    setSubmitting(true);
    try {
      let id = testimonyId;
      let finalDescription = form.description.trim();

      const fullName = form.fillerType === "Zonal Manager"
        ? form.testifierName.trim()
        : `${form.firstName} ${form.lastName}`.trim();

      const reqBody = {
        title:       form.title,
        description: finalDescription,
        categoryId:  Number(form.categoryId),
        country:     form.country,
        state:       form.state,
        city:        form.city,
        fullName:    fullName,
        telephoneNumber: form.telephoneNumber,
        email:       form.email,
        age:         form.age ? Number(form.age) : null,
        gender:      form.gender,
        conditionProblem: form.conditionProblem,
        conditionDuration: form.conditionDuration,
        unableToDoBefore: form.unableToDoBefore,
        whatHappenedDuringProgram: form.whatHappenedDuringProgram,
        ableToDoNow: form.ableToDoNow,
        inviterOrNextOfKinDetails: form.inviterDetails,
        healingCentreLocation: form.healingCentreLocation,
        zone: form.fillerType === "Zonal Manager" ? form.zone : "",
        fillerType: form.fillerType,
        fillerOther: form.fillerOther,
      };
      
      if (editId) {
        await api.put(`${API.submit}/${editId}`, reqBody);
        id = editId;
      } else {
        const res = await api.post(API.submit, reqBody);
        id = res.data.id;
      }

      setTestimonyId(id);
      setStep(PREVIEW);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Upload media files
  const handleFinalSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const allFiles = [...medicalFiles, ...beforeFiles, ...afterFiles];
      for (let i = 0; i < allFiles.length; i++) {
        const fd = new FormData();
        fd.append("file", allFiles[i].file);
        
        await api.post(API.media(testimonyId), fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setStep(DONE);
      const finalData = { id: testimonyId, ...form };
      onSuccess?.(finalData);
      onSubmit?.(finalData);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(form.categoryId)
  );

  const connFill = steps.slice(0, -1).map((_, i) => step > i);

  return (
    <div className="mms-root">

      {/* ── Header ── */}
      <header className="mms-header">
        <span className="mms-eyebrow">Testimony Portal</span>
        <h1>Share Your <em>Miracle</em> Story</h1>
      </header>

      {/* ── Stepper ── */}
      <nav className="mms-stepper" aria-label="Progress">
        {steps.map((s, i) => (
          <div key={s.label} style={{ display: "contents" }}>
            <div className={[
              "mms-step-item",
              i === step ? "active" : "",
              i <  step ? "done"   : "",
            ].join(" ").trim()}>
              <div className={[
                "mms-step-node",
                i === step ? "active" : "",
                i <  step ? "done"   : "",
              ].join(" ").trim()}>
                {i < step ? "✓" : s.icon}
              </div>
              <span className="mms-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="mms-step-connector">
                <div className={`mms-step-connector-fill${connFill[i] ? " filled" : ""}`} />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ══════════════════════════════════════════════
          STEP 0 — Role Selection
      ══════════════════════════════════════════════ */}
      {step === S.ROLE && (
        <div className="mms-card">
          <span className="mms-step-eyebrow">Step 1 of {steps.length}</span>
          <h2>Who is filling the form?</h2>
          <p className="mms-card-sub">Please select an option to open the appropriate testimony form.</p>

          {error && <div className="mms-error">{error}</div>}

          <div className="mms-field" style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gold-light)' }}>
              Select Role / Department <span style={{ color: "#d97706" }}>*</span>
            </label>
            <select
              className={!form.fillerType ? "is-placeholder" : ""}
              value={form.fillerType}
              onChange={(e) => { set("fillerType", e.target.value); setError(null); }}
              style={{ fontWeight: '600', padding: '14px 16px', fontSize: '15px' }}
            >
              <option value="" disabled hidden>Select an option</option>
              <option value="GRC Office">GRC Office</option>
              <option value="Zonal Manager">Zonal Manager</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {form.fillerType === "Other" && (
            <div className="mms-field" style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '600' }}>
                Please state your name or department <span style={{ color: "#d97706" }}>*</span>
              </label>
              <input
                placeholder="Please specify..."
                value={form.fillerOther}
                onChange={(e) => set("fillerOther", e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STEP 1 — Story Form Input
      ══════════════════════════════════════════════ */}
      {step === S.STORY && (
        <div className="mms-card">
          <span className="mms-step-eyebrow">Step 2 of {steps.length} — {form.fillerType} Form</span>

          {error && <div className="mms-error">{error}</div>}

          {/* Active Role Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            background: 'var(--navy-input)',
            border: '1px solid var(--gold-muted)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--gold-light)', fontWeight: '600' }}>
              Form Type: <strong>{form.fillerType}</strong> {form.fillerType === "Other" && `(${form.fillerOther})`}
            </span>
            <button
              type="button"
              className="mms-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setStep(S.ROLE)}
            >
              Change Role
            </button>
          </div>

          {/* Dynamic Row 1 & 2: Name / Zone fields */}
          {form.fillerType === "Zonal Manager" ? (
            <div className="mms-row">
              <div className="mms-field">
                <label>1. Name of Zone <span style={{ color: "#d97706" }}>*</span></label>
                <input
                  placeholder="e.g. Zone 1"
                  value={form.zone}
                  onChange={(e) => set("zone", e.target.value)}
                />
              </div>
              <div className="mms-field">
                <label>2. Name of the Testifier <span style={{ color: "#d97706" }}>*</span></label>
                <input
                  placeholder="e.g. John Doe"
                  value={form.testifierName}
                  onChange={(e) => set("testifierName", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="mms-row">
              <div className="mms-field">
                <label>First Name <span style={{ color: "#d97706" }}>*</span></label>
                <input
                  placeholder="e.g. John"
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                />
              </div>
              <div className="mms-field">
                <label>Last Name <span style={{ color: "#d97706" }}>*</span></label>
                <input
                  placeholder="e.g. Doe"
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Testimony Title */}
          <div className="mms-field">
            <label>Testimony Title <span style={{ color: "#d97706" }}>*</span></label>
            <input
              placeholder="e.g. God restored my health in three days"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="mms-field">
            <label>Category <span style={{ color: "#d97706" }}>*</span></label>
            <select
              className={!form.categoryId ? "is-placeholder" : ""}
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            >
              <option value="" disabled hidden>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Country, State, City */}
          <div className="mms-row-3">
            <div className="mms-field">
              <label>Country <span style={{ color: "#d97706" }}>*</span></label>
              <input
                placeholder="Nigeria"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
            </div>
            <div className="mms-field">
              <label>State <span style={{ color: "#d97706" }}>*</span></label>
              <input
                placeholder="e.g. Lagos"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
            <div className="mms-field">
              <label>City <span style={{ color: "#d97706" }}>*</span></label>
              <input
                placeholder="e.g. Ikeja"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
          </div>

          {/* Telephone Number */}
          <div className="mms-field">
            <label>Telephone Number (include country code) <span style={{ color: "#d97706" }}>*</span></label>
            <input
              placeholder="+234..."
              value={form.telephoneNumber}
              onChange={(e) => set("telephoneNumber", e.target.value)}
            />
          </div>

          {/* Email Address */}
          <div className="mms-field">
            <label>Email address</label>
            <input
              type="email"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          {/* Age & Gender */}
          <div className="mms-row">
            <div className="mms-field">
              <label>Age <span style={{ color: "#d97706" }}>*</span></label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
              />
            </div>
            <div className="mms-field">
              <label>Gender <span style={{ color: "#d97706" }}>*</span></label>
              <select
                className={!form.gender ? "is-placeholder" : ""}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
              >
                <option value="" disabled hidden>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Condition / Problem */}
          <div className="mms-field">
            <label>Condition/Problem <span style={{ color: "#d97706" }}>*</span></label>
            <textarea
              rows={2}
              placeholder="Briefly describe the condition..."
              value={form.conditionProblem}
              onChange={(e) => set("conditionProblem", e.target.value)}
            />
          </div>

          {/* Duration of Condition/Problem */}
          <div className="mms-field">
            <label>Duration of Condition/Problem <span style={{ color: "#d97706" }}>*</span></label>
            <input
              placeholder="e.g. 5 years, 6 months"
              value={form.conditionDuration}
              onChange={(e) => set("conditionDuration", e.target.value)}
            />
          </div>

          {/* What could you not do before? */}
          <div className="mms-field">
            <label>What could you not do before? <span style={{ color: "#d97706" }}>*</span></label>
            <textarea
              rows={2}
              placeholder="Describe limitations..."
              value={form.unableToDoBefore}
              onChange={(e) => set("unableToDoBefore", e.target.value)}
            />
          </div>

          {/* What happened during the program? */}
          <div className="mms-field">
            <label>What happened during the program? <span style={{ color: "#d97706" }}>*</span></label>
            <textarea
              rows={3}
              placeholder="Describe the miracle..."
              value={form.whatHappenedDuringProgram}
              onChange={(e) => set("whatHappenedDuringProgram", e.target.value)}
            />
          </div>

          {/* What can you do now? */}
          <div className="mms-field">
            <label>What can you do now? <span style={{ color: "#d97706" }}>*</span></label>
            <textarea
              rows={2}
              placeholder="Describe your current state..."
              value={form.ableToDoNow}
              onChange={(e) => set("ableToDoNow", e.target.value)}
            />
          </div>

          {/* Person that invited you */}
          <div className="mms-field">
            <label>Name and Contact Details of the Person that invited you <span style={{ color: "#d97706" }}>*</span></label>
            <input
              placeholder="Details..."
              value={form.inviterDetails}
              onChange={(e) => set("inviterDetails", e.target.value)}
            />
          </div>

          {/* Location of Healing Centre/Crusade */}
          <div className="mms-field">
            <label>Location of Healing Centre/Crusade <span style={{ color: "#d97706" }}>*</span></label>
            <input
              placeholder="e.g. Online, Center A"
              value={form.healingCentreLocation}
              onChange={(e) => set("healingCentreLocation", e.target.value)}
            />
          </div>

          {/* Required Testimony Summary field BEFORE Medical Reports */}
          <div className="mms-field" style={{ marginTop: '20px' }}>
            <label>Your Testimony / Testimony Summary <span style={{ color: "#d97706" }}>*</span></label>
            <textarea
              rows={5}
              placeholder="Write your testimony in your own words..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={2000}
            />
            <div className={`mms-char${form.description.length > 1800 ? " warn" : ""}`}>
              {form.description.length} / 2000
            </div>
          </div>

          {/* Medical Reports Upload (Required) */}
          <div className="mms-field" style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px dashed var(--navy-border)' }}>
            <label style={{ color: 'var(--gold-light)', fontSize: '11px', fontWeight: '700' }}>
              Medical Reports <span style={{ color: "#d97706" }}>*</span>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '8px' }}>
              Separate upload for documents and pictures of the medical report
            </p>
            <div className="mms-upload-box-small">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => addMedicalFiles(e.target.files)}
              />
              <Icon.Plus />
              <h5>Upload Medical Reports & Documents</h5>
              <p>Images, PDFs, Word documents (Multiple allowed)</p>
            </div>
            {medicalFiles.length > 0 && (
              <div className="mms-file-chips">
                {medicalFiles.map((f, i) => (
                  <div key={i} className="mms-file-chip">
                    <span>📄 {f.file.name}</span>
                    <button type="button" className="mms-file-chip-remove" onClick={() => removeMedicalFile(i)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Before & After Pictures Upload (Required) */}
          <div className="mms-field" style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px dashed var(--navy-border)' }}>
            <label style={{ color: 'var(--gold-light)', fontSize: '11px', fontWeight: '700' }}>
              Before & After Pictures <span style={{ color: "#d97706" }}>*</span>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '10px' }}>
              Upload pictures for before and after (side by side, multiple images supported)
            </p>
            <div className="mms-before-after-grid">
              
              {/* Before Pictures Column */}
              <div className="mms-field">
                <label style={{ fontSize: '10px', color: 'var(--cream)' }}>Before Picture(s) <span style={{ color: "#d97706" }}>*</span></label>
                <div className="mms-upload-box-small">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => addBeforeFiles(e.target.files)}
                  />
                  <Icon.Upload />
                  <h5>Add Before Picture(s)</h5>
                  <p>Multiple images before healing</p>
                </div>
                {beforeFiles.length > 0 && (
                  <div className="mms-file-chips">
                    {beforeFiles.map((f, i) => (
                      <div key={i} className="mms-file-chip">
                        <img src={f.url} alt="Before" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span>Before {i + 1}</span>
                        <button type="button" className="mms-file-chip-remove" onClick={() => removeBeforeFile(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Pictures Column */}
              <div className="mms-field">
                <label style={{ fontSize: '10px', color: 'var(--cream)' }}>After Picture(s) <span style={{ color: "#d97706" }}>*</span></label>
                <div className="mms-upload-box-small">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => addAfterFiles(e.target.files)}
                  />
                  <Icon.Upload />
                  <h5>Add After Picture(s)</h5>
                  <p>Multiple images after healing</p>
                </div>
                {afterFiles.length > 0 && (
                  <div className="mms-file-chips">
                    {afterFiles.map((f, i) => (
                      <div key={i} className="mms-file-chip">
                        <img src={f.url} alt="After" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span>After {i + 1}</span>
                        <button type="button" className="mms-file-chip-remove" onClick={() => removeAfterFile(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════
          PREVIEW STEP
      ══════════════════════════════════════════════ */}
      {step === PREVIEW && (
        <div className="mms-card">
          <span className="mms-step-eyebrow">Step 3 of {steps.length}</span>
          <h2>Review Before Submitting</h2>
          <p className="mms-card-sub">Make sure all testimony information is accurate.</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="mms-preview-badge">Form: {form.fillerType}</span>
            {selectedCategory && (
              <span className="mms-preview-badge">✦ {selectedCategory.name}</span>
            )}
          </div>

          <h2 className="mms-preview-title">{form.title}</h2>

          <div style={{ background: 'var(--navy-input)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
            {form.fillerType === "Zonal Manager" ? (
              <>
                <p><strong>Zone:</strong> {form.zone}</p>
                <p><strong>Testifier:</strong> {form.testifierName}</p>
              </>
            ) : (
              <p><strong>Name:</strong> {form.firstName} {form.lastName}</p>
            )}
            <p><strong>Location:</strong> {form.state}, {form.country} ({form.healingCentreLocation})</p>
            <p><strong>Contact:</strong> {form.telephoneNumber} {form.email ? `| ${form.email}` : ''}</p>
            <p><strong>Age / Gender:</strong> {form.age} yrs | {form.gender}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '13px', marginBottom: '6px' }}>Condition / Miracle Details</h4>
            <p className="mms-preview-story"><strong>Condition:</strong> {form.conditionProblem} ({form.conditionDuration})</p>
            <p className="mms-preview-story"><strong>Unable to do before:</strong> {form.unableToDoBefore}</p>
            <p className="mms-preview-story"><strong>What happened during program:</strong> {form.whatHappenedDuringProgram}</p>
            <p className="mms-preview-story"><strong>Able to do now:</strong> {form.ableToDoNow}</p>
            <p className="mms-preview-story"><strong>Invited by:</strong> {form.inviterDetails}</p>
          </div>

          {/* Medical reports attached preview */}
          {medicalFiles.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '12px', marginBottom: '6px' }}>Medical Reports ({medicalFiles.length})</h4>
              <div className="mms-file-chips">
                {medicalFiles.map((f, i) => (
                  <div key={i} className="mms-file-chip">📄 {f.file.name}</div>
                ))}
              </div>
            </div>
          )}

          {/* Before & After Pictures Side by Side Preview */}
          {(beforeFiles.length > 0 || afterFiles.length > 0) && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '12px', marginBottom: '8px' }}>Before & After Comparison</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--cream-muted)', marginBottom: '4px' }}>Before Healing</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {beforeFiles.map((f, i) => (
                      <img key={i} src={f.url} alt="Before" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                    {beforeFiles.length === 0 && <span style={{ fontSize: '11px', color: 'var(--navy-border)' }}>None uploaded</span>}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', display: 'block', color: 'var(--cream-muted)', marginBottom: '4px' }}>After Healing</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {afterFiles.map((f, i) => (
                      <img key={i} src={f.url} alt="After" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    ))}
                    {afterFiles.length === 0 && <span style={{ fontSize: '11px', color: 'var(--navy-border)' }}>None uploaded</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════
          DONE STEP
      ══════════════════════════════════════════════ */}
      {step === DONE && (
        <div className="mms-card">
          <div className="mms-success">
            <div className="mms-success-halo">🙏</div>
            <h2>Testimony Submitted for Admin Approval</h2>
            <p>
              Your testimony has been successfully submitted and sent to the Admin for approval. Once approved, it will be published and visible on the website.
            </p>
            {testimonyId && (
              <div className="mms-success-ref" style={{ margin: "16px 0", padding: "10px", background: "rgba(217, 119, 6, 0.1)", borderRadius: "8px", border: "1px solid rgba(217, 119, 6, 0.3)" }}>
                Status: <strong style={{ color: "#d97706" }}>PENDING ADMIN APPROVAL</strong> | Reference ID: <strong>#{testimonyId}</strong>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
              <button
                className="mms-btn-primary"
                onClick={() => navigate("/my-testimonies")}
                style={{ padding: "10px 20px", fontSize: "14px" }}
              >
                View My Testimonies
              </button>
              <button
                className="mms-btn-secondary"
                onClick={() => {
                  setStep(0);
                  setTestimonyId(null);
                  setForm({
                    fillerType: "",
                    fillerOther: "",
                    firstName: "",
                    lastName: "",
                    testifierName: "",
                    zone: "",
                    title: "",
                    categoryId: "",
                    country: "",
                    state: "",
                    city: "",
                    telephoneNumber: "",
                    email: "",
                    age: "",
                    gender: "",
                    conditionProblem: "",
                    conditionDuration: "",
                    unableToDoBefore: "",
                    whatHappenedDuringProgram: "",
                    ableToDoNow: "",
                    inviterDetails: "",
                    healingCentreLocation: "",
                    description: "",
                  });
                  setMedicalFiles([]);
                  setBeforeFiles([]);
                  setAfterFiles([]);
                }}
                style={{ padding: "10px 20px", fontSize: "14px" }}
              >
                Submit Another Testimony
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ACTION BUTTONS
      ══════════════════════════════════════════════ */}
      {step < DONE && (
        <div className="mms-actions">

          {step > 0 && (
            <button className="mms-btn-secondary" onClick={goBack} disabled={submitting}>
              Back
            </button>
          )}

          {step === S.ROLE && (
            <button
              className="mms-btn-primary"
              onClick={() => {
                if (validateRoleForm()) {
                  setError(null);
                  setStep(S.STORY);
                }
              }}
              disabled={!form.fillerType || (form.fillerType === "Other" && !form.fillerOther.trim())}
            >
              Continue →
            </button>
          )}

          {step === S.STORY && (
            <button
              className="mms-btn-primary"
              onClick={handleSubmitStory}
              disabled={submitting}
            >
              {submitting
                ? <><span className="mms-spinner" /> Saving…</>
                : <>Continue to Preview →</>}
            </button>
          )}

          {step === PREVIEW && (
            <button
              className="mms-btn-primary"
              onClick={handleFinalSubmit}
              disabled={submitting}
            >
              {submitting
                ? <><span className="mms-spinner" /> Uploading…</>
                : <>Submit Testimony</>}
            </button>
          )}

        </div>
      )}

    </div>
  );
}
