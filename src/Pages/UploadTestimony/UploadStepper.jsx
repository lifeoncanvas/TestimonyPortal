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
    customCategory: "",
    description: "",
  });

  // Separate upload file states
  const [medicalFiles, setMedicalFiles] = useState([]);
  const [beforeFiles, setBeforeFiles]   = useState([]);
  const [afterFiles, setAfterFiles]     = useState([]);

  // Testimony Media & Recording states
  const [testimonyMode, setTestimonyMode] = useState("voice"); // "voice", "video", "upload", "write"
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null); // { blob, url, file, duration }

  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState(null); // { blob, url, file, duration }
  const [isCameraActive, setIsCameraActive] = useState(false);

  const [uploadedMedia, setUploadedMedia] = useState([]); // [{ file, url, type, name, size }]

  const audioRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const liveVideoRef = useRef(null);

  useEffect(() => {
    let t;
    if (isRecordingAudio) {
      t = setInterval(() => setAudioDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecordingAudio]);

  useEffect(() => {
    let t;
    if (isRecordingVideo) {
      t = setInterval(() => setVideoDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecordingVideo]);

  useEffect(() => {
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
            customCategory: t.customCategory || "",
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

  const selectedCategory = categories.find((c) => String(c.id) === String(form.categoryId));
  const catName = (selectedCategory?.name || "").toLowerCase();
  const isHealing = catName.includes("healing") || catName.includes("stream");
  const isPartnership = catName.includes("partnership");
  const isCrusade = catName.includes("crusade");
  const isOther = catName.includes("other");

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

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── Voice Recording
  const startAudioRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      let options = {};
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
          options = { mimeType: "audio/webm;codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      audioRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `voice_testimony_${Date.now()}.${ext}`, { type: mimeType });
        setRecordedAudio({ blob, url, file, duration: audioDuration });
        stream.getTracks().forEach((t) => t.stop());
        audioStreamRef.current = null;
      };

      recorder.start(100);
      setIsRecordingAudio(true);
      setAudioDuration(0);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone permission was denied or not supported. You can upload an audio file instead.");
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && isRecordingAudio) {
      audioRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const removeRecordedAudio = () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setAudioDuration(0);
  };

  // ── Video Recording
  const startCameraPreview = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      videoStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(console.error);
        }
      }, 100);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera or microphone permission was denied. You can upload a video file instead.");
    }
  };

  const stopCameraPreview = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startVideoRecording = async () => {
    try {
      setError(null);
      let stream = videoStreamRef.current;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        videoStreamRef.current = stream;
        setIsCameraActive(true);
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(console.error);
        }
      }

      let options = {};
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          options = { mimeType: "video/webm;codecs=vp9,opus" };
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
          options = { mimeType: "video/webm;codecs=vp8,opus" };
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          options = { mimeType: "video/webm" };
        } else if (MediaRecorder.isTypeSupported("video/mp4")) {
          options = { mimeType: "video/mp4" };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      videoRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "video/webm";
        const ext = mimeType.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `video_testimony_${Date.now()}.${ext}`, { type: mimeType });
        setRecordedVideo({ blob, url, file, duration: videoDuration });
        stopCameraPreview();
      };

      recorder.start(100);
      setIsRecordingVideo(true);
      setVideoDuration(0);
    } catch (err) {
      console.error("Video recording error:", err);
      setError("Could not start video recording. Please ensure camera and microphone are allowed.");
    }
  };

  const stopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  const removeRecordedVideo = () => {
    if (recordedVideo?.url) {
      URL.revokeObjectURL(recordedVideo.url);
    }
    setRecordedVideo(null);
    setVideoDuration(0);
    stopCameraPreview();
  };

  // ── Upload Media Files
  const handleUploadedMedia = (sel) => {
    const files = Array.from(sel || []);
    if (!files.length) return;
    const newItems = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : f.type.startsWith("audio") ? "audio" : "media",
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
    }));
    setUploadedMedia((p) => [...p, ...newItems]);
  };

  const removeUploadedMedia = (i) => {
    setUploadedMedia((p) => {
      const item = p[i];
      if (item?.url) URL.revokeObjectURL(item.url);
      return p.filter((_, idx) => idx !== i);
    });
  };

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
    if (isOther && !form.customCategory.trim()) {
      setError("Please specify your category / testimony theme under Others.");
      return false;
    }
    if (!form.country.trim()) {
      setError("Please enter Country.");
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

    const hasMedia = Boolean(recordedAudio || recordedVideo || uploadedMedia.length > 0);
    if (!form.description.trim() && !hasMedia) {
      setError("Please write your testimony summary or record/upload an audio or video testimony.");
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
      if (!finalDescription) {
        if (recordedVideo) finalDescription = "Recorded Video Testimony";
        else if (recordedAudio) finalDescription = "Recorded Voice Note Testimony";
        else if (uploadedMedia.length > 0) finalDescription = "Uploaded Media Testimony (Video/Audio)";
        else finalDescription = "Testimony shared via Testimony Portal";
      }

      const fullName = form.fillerType === "Zonal Manager"
        ? form.testifierName.trim()
        : `${form.firstName} ${form.lastName}`.trim();

      const reqBody = {
        title:       form.title,
        description: finalDescription,
        categoryId:  Number(form.categoryId),
        country:     form.country,
        state:       form.state || "",
        city:        form.city || "",
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
        inviterOrNextOfKinDetails: form.inviterDetails || "",
        healingCentreLocation: form.healingCentreLocation || "",
        zone: form.fillerType === "Zonal Manager" ? form.zone : "",
        fillerType: form.fillerType,
        fillerOther: form.fillerOther,
        customCategory: form.customCategory || "",
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
      const allFiles = [
        ...medicalFiles,
        ...beforeFiles,
        ...afterFiles,
        ...(recordedAudio ? [{ file: recordedAudio.file }] : []),
        ...(recordedVideo ? [{ file: recordedVideo.file }] : []),
        ...uploadedMedia.map((m) => ({ file: m.file })),
      ];

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

          {/* When 'Others' is selected: Open field to state their category / testimony title */}
          {isOther && (
            <div className="mms-field" style={{
              background: "rgba(217, 119, 6, 0.08)",
              border: "1px solid rgba(217, 119, 6, 0.35)",
              borderRadius: "10px",
              padding: "16px",
              marginTop: "-4px",
              marginBottom: "16px",
            }}>
              <label style={{ color: "var(--gold-light)", fontWeight: "600", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✨</span> Specify Your Category / Testimony Theme <span style={{ color: "#d97706" }}>*</span>
              </label>
              <input
                placeholder="e.g. Financial Miracle, Salvation, Academic Excellence, Job Promotion, Miracle Child..."
                value={form.customCategory}
                onChange={(e) => {
                  const val = e.target.value;
                  set("customCategory", val);
                  if (!form.title || form.title.startsWith("Testimony: ")) {
                    set("title", val ? `Testimony: ${val}` : "");
                  }
                }}
                style={{
                  background: "var(--navy-card)",
                  borderColor: "var(--gold)",
                  color: "var(--white)",
                  fontWeight: "500",
                }}
              />
              <p style={{ fontSize: "11px", color: "var(--cream-muted)", marginTop: "6px", marginBottom: 0 }}>
                Since you selected &quot;Others&quot;, please specify what type or topic of testimony you are sharing.
              </p>
            </div>
          )}

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
              <label>State <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span></label>
              <input
                placeholder="e.g. Lagos (Optional)"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
            <div className="mms-field">
              <label>City <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span></label>
              <input
                placeholder="e.g. Ikeja (Optional)"
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
            <label>Email address <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span></label>
            <input
              type="email"
              placeholder="e.g. john@example.com (Optional)"
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

          {/* Condition / Problem or Previous Situation */}
          <div className="mms-field">
            <label>
              {isHealing ? "Condition / Problem" : isPartnership ? "Challenge or Financial / Project Goal Before" : "Previous Situation or Challenge"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder={isHealing ? "Briefly describe the condition..." : isPartnership ? "Describe the challenge, project, or financial goal..." : "Briefly describe the situation or challenge..."}
              value={form.conditionProblem}
              onChange={(e) => set("conditionProblem", e.target.value)}
            />
          </div>

          {/* Duration of Condition/Problem */}
          <div className="mms-field">
            <label>
              {isHealing ? "Duration of Condition/Problem" : "Duration of Situation / Challenge"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <input
              placeholder="e.g. 5 years, 6 months"
              value={form.conditionDuration}
              onChange={(e) => set("conditionDuration", e.target.value)}
            />
          </div>

          {/* What could you not do before? (Physical limitations or obstacles) */}
          <div className="mms-field">
            <label>
              {isHealing ? "What could you not do before?" : "Difficulties or Limitations Faced Before"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder={isHealing ? "Describe physical limitations..." : "Describe difficulties or limitations experienced..."}
              value={form.unableToDoBefore}
              onChange={(e) => set("unableToDoBefore", e.target.value)}
            />
          </div>

          {/* What happened during the program? */}
          <div className="mms-field">
            <label>
              {isHealing ? "What happened during the program / prayer?" : isPartnership ? "What happened through your partnership / outreach?" : "What happened? (e.g. during prayer, reading, or program)"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder={isHealing ? "Describe the healing miracle..." : isPartnership ? "Describe the miracle breakthrough..." : "Describe how God intervened..."}
              value={form.whatHappenedDuringProgram}
              onChange={(e) => set("whatHappenedDuringProgram", e.target.value)}
            />
          </div>

          {/* What can you do now? */}
          <div className="mms-field">
            <label>
              {isHealing ? "What can you do now?" : "Current Outcome / Breakthrough"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder={isHealing ? "Describe what you can do now after healing..." : "Describe the breakthrough, victory, or current outcome..."}
              value={form.ableToDoNow}
              onChange={(e) => set("ableToDoNow", e.target.value)}
            />
          </div>

          {/* Person that invited you */}
          <div className="mms-field">
            <label>Name and Contact Details of the Person that invited you <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span></label>
            <input
              placeholder="e.g. Pastor John (+234...) (Optional)"
              value={form.inviterDetails}
              onChange={(e) => set("inviterDetails", e.target.value)}
            />
          </div>

          {/* Location of Healing Centre/Crusade */}
          <div className="mms-field">
            <label>
              {isHealing || isCrusade ? "Location of Healing Centre/Crusade" : "Location of Centre / Outreach / Event"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <input
              placeholder={isHealing || isCrusade ? "e.g. Online, Centre A, Crusade Venue (Optional)" : "e.g. Online, Church, Outreach Venue (Optional)"}
              value={form.healingCentreLocation}
              onChange={(e) => set("healingCentreLocation", e.target.value)}
            />
          </div>

          {/* ── Testimony Media Presentation: Voice, Video, Upload, or Text ── */}
          <div className="mms-media-section">
            <div style={{ marginBottom: "16px" }}>
              <span className="mms-step-eyebrow" style={{ color: "var(--gold)" }}>Testimony Media</span>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.45rem", color: "var(--white)", fontWeight: 400, margin: "2px 0 4px" }}>
                How would you like to share your testimony?
              </h3>
              <p style={{ fontSize: "12px", color: "var(--cream-muted)" }}>
                You can record a voice note, record a video, upload existing media, or write your story.
              </p>
            </div>

            {/* Mode selection tabs */}
            <div className="mms-mode-tabs">
              <button
                type="button"
                className={`mms-mode-tab${testimonyMode === "voice" ? " active" : ""}`}
                onClick={() => setTestimonyMode("voice")}
              >
                {recordedAudio && <span className="mms-mode-check">✓</span>}
                <span className="mms-mode-icon">🎙️</span>
                <span className="mms-mode-title">Voice Note</span>
              </button>

              <button
                type="button"
                className={`mms-mode-tab${testimonyMode === "video" ? " active" : ""}`}
                onClick={() => setTestimonyMode("video")}
              >
                {recordedVideo && <span className="mms-mode-check">✓</span>}
                <span className="mms-mode-icon">📹</span>
                <span className="mms-mode-title">Record Video</span>
              </button>

              <button
                type="button"
                className={`mms-mode-tab${testimonyMode === "upload" ? " active" : ""}`}
                onClick={() => setTestimonyMode("upload")}
              >
                {uploadedMedia.length > 0 && <span className="mms-mode-check">✓</span>}
                <span className="mms-mode-icon">📁</span>
                <span className="mms-mode-title">Upload Video/Audio</span>
              </button>

              <button
                type="button"
                className={`mms-mode-tab${testimonyMode === "write" ? " active" : ""}`}
                onClick={() => setTestimonyMode("write")}
              >
                {form.description.trim() && <span className="mms-mode-check">✓</span>}
                <span className="mms-mode-icon">✍️</span>
                <span className="mms-mode-title">Written Story</span>
              </button>
            </div>

            {/* Active Tab Panel */}
            {testimonyMode === "voice" && (
              <div className="mms-rec-box">
                {recordedAudio ? (
                  <div className="mms-recorded-preview">
                    <span className="mms-recorded-chip">
                      <span>✓</span> Voice Note Recorded ({formatDuration(recordedAudio.duration)})
                    </span>
                    <audio controls src={recordedAudio.url} style={{ width: "100%", maxWidth: "420px" }} />
                    <button
                      type="button"
                      className="mms-redo-btn"
                      onClick={removeRecordedAudio}
                    >
                      Delete & Re-record Voice Note
                    </button>
                  </div>
                ) : isRecordingAudio ? (
                  <div className="mms-record-area" style={{ width: "100%" }}>
                    <div className="mms-rec-timer live">
                      ● REC {formatDuration(audioDuration)}
                    </div>
                    {/* Animated waveform bars */}
                    <div className="mms-waveform">
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div
                          key={i}
                          className="mms-wave-bar live animated"
                          style={{
                            animationDelay: `${(i % 7) * 0.12}s`,
                            animationDuration: `${0.6 + ((i % 5) * 0.1)}s`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="mms-rec-btn-wrap">
                      <button
                        type="button"
                        className="mms-rec-btn live"
                        onClick={stopAudioRecording}
                        aria-label="Stop Voice Recording"
                      >
                        <div className="mms-rec-dot" style={{ borderRadius: "4px", width: "20px", height: "20px" }} />
                      </button>
                      <span className="mms-rec-hint" style={{ color: "var(--gold-light)" }}>
                        Recording in progress... Tap to finish
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mms-record-area" style={{ width: "100%" }}>
                    <div className="mms-waveform" style={{ opacity: 0.4 }}>
                      {Array.from({ length: 28 }).map((_, i) => (
                        <div key={i} className="mms-wave-bar" style={{ height: "10px" }} />
                      ))}
                    </div>
                    <div className="mms-rec-btn-wrap">
                      <button
                        type="button"
                        className="mms-rec-btn"
                        onClick={startAudioRecording}
                        aria-label="Start Voice Recording"
                      >
                        <div className="mms-rec-dot" />
                      </button>
                      <span className="mms-rec-hint">
                        Tap the red button to record your voice note
                      </span>
                      <p className="mms-perm-tip">
                        Speak clearly into your microphone. No typing required!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {testimonyMode === "video" && (
              <div className="mms-rec-box">
                {recordedVideo ? (
                  <div className="mms-recorded-preview">
                    <span className="mms-recorded-chip">
                      <span>✓</span> Video Testimony Recorded ({formatDuration(recordedVideo.duration)})
                    </span>
                    <video
                      controls
                      playsInline
                      src={recordedVideo.url}
                      style={{ width: "100%", maxWidth: "480px", borderRadius: "12px", background: "#000" }}
                    />
                    <button
                      type="button"
                      className="mms-redo-btn"
                      onClick={removeRecordedVideo}
                    >
                      Delete & Re-record Video
                    </button>
                  </div>
                ) : (
                  <div className="mms-record-area" style={{ width: "100%" }}>
                    <div className="mms-cam-container">
                      <video
                        ref={liveVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="mms-cam-preview"
                        style={{ display: isCameraActive ? "block" : "none" }}
                      />
                      {!isCameraActive && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "20px" }}>
                          <span style={{ fontSize: "36px" }}>📹</span>
                          <span style={{ fontSize: "12px", color: "var(--cream-muted)" }}>Camera viewfinder</span>
                        </div>
                      )}
                      {isRecordingVideo && (
                        <div className="mms-rec-badge">
                          <div className="mms-rec-badge-dot" />
                          <span>REC {formatDuration(videoDuration)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mms-rec-btn-wrap">
                      {isRecordingVideo ? (
                        <>
                          <button
                            type="button"
                            className="mms-rec-btn live"
                            onClick={stopVideoRecording}
                            aria-label="Stop Video Recording"
                          >
                            <div className="mms-rec-dot" style={{ borderRadius: "4px", width: "20px", height: "20px" }} />
                          </button>
                          <span className="mms-rec-hint" style={{ color: "var(--gold-light)" }}>
                            Recording your video... Tap to stop
                          </span>
                        </>
                      ) : isCameraActive ? (
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                          <button
                            type="button"
                            className="mms-btn-primary"
                            onClick={startVideoRecording}
                            style={{ padding: "10px 22px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                          >
                            <span style={{ color: "#ef4444" }}>●</span> Start Recording
                          </button>
                          <button
                            type="button"
                            className="mms-redo-btn"
                            onClick={stopCameraPreview}
                          >
                            Cancel Camera
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="mms-btn-primary"
                            onClick={startCameraPreview}
                            style={{ padding: "12px 24px", fontSize: "13px" }}
                          >
                            Turn on Camera
                          </button>
                          <span className="mms-rec-hint">
                            Position yourself in good lighting and tap start when ready
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {testimonyMode === "upload" && (
              <div className="mms-rec-box">
                <div className="mms-upload-box" style={{ width: "100%", padding: "28px 16px" }}>
                  <input
                    type="file"
                    multiple
                    accept="video/*,audio/*"
                    onChange={(e) => handleUploadedMedia(e.target.files)}
                  />
                  <Icon.Upload />
                  <h4>Upload Video or Audio Testimony</h4>
                  <p>Choose an MP4, MOV, WEBM, MP3, M4A, or WAV file from your device</p>
                </div>

                {uploadedMedia.length > 0 && (
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {uploadedMedia.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--navy-card)",
                          border: "1px solid var(--navy-border)",
                          borderRadius: "10px",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--cream)" }}>
                            {m.type === "video" ? "📹" : "🎙️"} {m.name} ({m.size})
                          </span>
                          <button
                            type="button"
                            className="mms-file-chip-remove"
                            onClick={() => removeUploadedMedia(idx)}
                            style={{ background: "transparent", border: "none", color: "#e05555", cursor: "pointer", fontSize: "16px" }}
                          >
                            ×
                          </button>
                        </div>
                        {m.type === "video" ? (
                          <video controls playsInline src={m.url} style={{ width: "100%", maxHeight: "200px", borderRadius: "8px", background: "#000" }} />
                        ) : (
                          <audio controls src={m.url} style={{ width: "100%" }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {testimonyMode === "write" && (
              <div style={{ background: "var(--navy-input)", border: "1px solid var(--navy-border)", borderRadius: "12px", padding: "14px 16px", marginBottom: "6px" }}>
                <p style={{ fontSize: "12px", color: "var(--cream-muted)", lineHeight: 1.6 }}>
                  ✍️ Write down the details of your miracle below in your own words. If you also wish to add a voice recording or video, select the tabs above anytime.
                </p>
              </div>
            )}
          </div>

          {/* Testimony Summary field (Optional if audio/video recorded/uploaded) */}
          <div className="mms-field" style={{ marginTop: '22px' }}>
            <label>
              Your Testimony / Written Summary{" "}
              {recordedAudio || recordedVideo || uploadedMedia.length > 0 ? (
                <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional - Audio/Video attached)</span>
              ) : (
                <span style={{ color: "#d97706" }}>*</span>
              )}
            </label>
            <textarea
              rows={4}
              placeholder={
                recordedAudio || recordedVideo || uploadedMedia.length > 0
                  ? "Add any optional notes, scripture, or written summary..."
                  : "Write your testimony in your own words..."
              }
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={2000}
            />
            <div className={`mms-char${form.description.length > 1800 ? " warn" : ""}`}>
              {form.description.length} / 2000
            </div>
          </div>

          {/* Medical Reports Upload (Optional) */}
          <div className="mms-field" style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px dashed var(--navy-border)' }}>
            <label style={{ color: 'var(--gold-light)', fontSize: '11px', fontWeight: '700' }}>
              {isHealing ? "Medical Reports & Documents" : "Supporting Documents & Files"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '8px' }}>
              {isHealing ? "Separate upload for documents and pictures of the medical report" : "Upload any documents, certificates, receipts, or letters of testimony"}
            </p>
            <div className="mms-upload-box-small">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => addMedicalFiles(e.target.files)}
              />
              <Icon.Plus />
              <h5>{isHealing ? "Upload Medical Reports & Documents" : "Upload Supporting Documents"}</h5>
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

          {/* Before & After Pictures Upload (Optional) */}
          <div className="mms-field" style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px dashed var(--navy-border)' }}>
            <label style={{ color: 'var(--gold-light)', fontSize: '11px', fontWeight: '700' }}>
              {isHealing ? "Before & After Pictures" : "Testimony Photos & Media"}{" "}
              <span style={{ color: "var(--cream-muted)", fontSize: "11px", fontWeight: "normal", textTransform: "none" }}>(Optional)</span>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--cream-muted)', marginBottom: '10px' }}>
              {isHealing ? "Upload pictures for before and after (side by side, multiple images supported)" : "Upload photos or media related to your testimony"}
            </p>
            <div className="mms-before-after-grid">
              
              {/* Before Pictures Column */}
              <div className="mms-field">
                <label style={{ fontSize: '10px', color: 'var(--cream)' }}>{isHealing ? "Before Media (Pictures/Videos)" : "Media Before (Optional)"}</label>
                <div className="mms-upload-box-small">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={(e) => addBeforeFiles(e.target.files)}
                  />
                  <Icon.Upload />
                  <h5>Add Picture(s) / Media</h5>
                  <p>{isHealing ? "Multiple images before healing" : "Upload photos or files"}</p>
                </div>
                {beforeFiles.length > 0 && (
                  <div className="mms-file-chips">
                    {beforeFiles.map((f, i) => (
                      <div key={i} className="mms-file-chip">
                        <img src={f.url} alt="Before" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span>File {i + 1}</span>
                        <button type="button" className="mms-file-chip-remove" onClick={() => removeBeforeFile(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Pictures Column */}
              <div className="mms-field">
                <label style={{ fontSize: '10px', color: 'var(--cream)' }}>{isHealing ? "After Media (Pictures/Videos/Audio)" : "Media After (Optional)"}</label>
                <div className="mms-upload-box-small">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={(e) => addAfterFiles(e.target.files)}
                  />
                  <Icon.Upload />
                  <h5>Add Picture(s) / Media</h5>
                  <p>{isHealing ? "Multiple images after healing" : "Upload photos or files"}</p>
                </div>
                {afterFiles.length > 0 && (
                  <div className="mms-file-chips">
                    {afterFiles.map((f, i) => (
                      <div key={i} className="mms-file-chip">
                        <img src={f.url} alt="After" style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span>File {i + 1}</span>
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
              <span className="mms-preview-badge">
                ✦ {selectedCategory.name} {isOther && form.customCategory ? `(${form.customCategory})` : ""}
              </span>
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
            <p><strong>Location:</strong> {[form.city, form.state, form.country].filter(Boolean).join(", ") || "Not specified"} {form.healingCentreLocation ? `(${form.healingCentreLocation})` : ''}</p>
            <p><strong>Contact:</strong> {form.telephoneNumber} {form.email ? `| ${form.email}` : ''}</p>
            <p><strong>Age / Gender:</strong> {form.age} yrs | {form.gender}</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--gold-light)', fontSize: '13px', marginBottom: '6px' }}>Testimony & Miracle Details</h4>
            {isOther && form.customCategory && (
              <p className="mms-preview-story"><strong>Category / Theme:</strong> {form.customCategory}</p>
            )}
            <p className="mms-preview-story"><strong>{isHealing ? "Condition:" : "Previous Situation / Challenge:"}</strong> {form.conditionProblem || "Not specified"} {form.conditionDuration ? `(${form.conditionDuration})` : ''}</p>
            {form.unableToDoBefore && <p className="mms-preview-story"><strong>{isHealing ? "Unable to do before:" : "Limitations / Difficulties:"}</strong> {form.unableToDoBefore}</p>}
            {form.whatHappenedDuringProgram && <p className="mms-preview-story"><strong>What happened:</strong> {form.whatHappenedDuringProgram}</p>}
            {form.ableToDoNow && <p className="mms-preview-story"><strong>{isHealing ? "Able to do now:" : "Current Outcome / Breakthrough:"}</strong> {form.ableToDoNow}</p>}
            {form.inviterDetails && <p className="mms-preview-story"><strong>Invited by:</strong> {form.inviterDetails}</p>}
            {form.healingCentreLocation && <p className="mms-preview-story"><strong>{isHealing || isCrusade ? "Healing Centre / Crusade:" : "Location / Venue:"}</strong> {form.healingCentreLocation}</p>}
            {form.description && (
              <div style={{ marginTop: "10px", padding: "10px", background: "var(--navy-card)", borderRadius: "8px" }}>
                <strong style={{ color: "var(--gold-light)", fontSize: "11px", display: "block", marginBottom: "4px" }}>Written Summary:</strong>
                <p style={{ fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-line" }}>{form.description}</p>
              </div>
            )}
          </div>

          {/* Recorded Video Testimony Preview */}
          {recordedVideo && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📹</span> Recorded Video Testimony ({formatDuration(recordedVideo.duration)})
              </h4>
              <video
                controls
                playsInline
                src={recordedVideo.url}
                style={{ width: '100%', maxHeight: '300px', borderRadius: '10px', background: '#000' }}
              />
            </div>
          )}

          {/* Recorded Voice Note Preview */}
          {recordedAudio && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎙️</span> Recorded Voice Note ({formatDuration(recordedAudio.duration)})
              </h4>
              <audio controls src={recordedAudio.url} style={{ width: '100%' }} />
            </div>
          )}

          {/* Uploaded Media (Video/Audio) Preview */}
          {uploadedMedia.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ color: 'var(--gold-light)', fontSize: '13px', marginBottom: '8px' }}>
                Attached Media Files ({uploadedMedia.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uploadedMedia.map((m, idx) => (
                  <div key={idx} style={{ background: 'var(--navy-input)', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--cream-muted)', display: 'block', marginBottom: '4px' }}>
                      {m.type === 'video' ? '📹 Video' : '🎙️ Audio'}: {m.name} ({m.size})
                    </span>
                    {m.type === 'video' ? (
                      <video controls playsInline src={m.url} style={{ width: '100%', maxHeight: '220px', borderRadius: '8px', background: '#000' }} />
                    ) : (
                      <audio controls src={m.url} style={{ width: '100%' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    customCategory: "",
                    description: "",
                  });
                  setMedicalFiles([]);
                  setBeforeFiles([]);
                  setAfterFiles([]);
                  removeRecordedAudio();
                  removeRecordedVideo();
                  setUploadedMedia([]);
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
