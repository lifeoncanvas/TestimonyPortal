import { useState, useRef, useCallback, useEffect } from "react";
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

// ─── Step Definitions (dynamic based on format) ───────────────────────────────
const stepsFor = (formatId) => {
  return [
    { label: "Format",   icon: "◇" },
    { label: "Story",    icon: "✦" },
    { label: "Preview",  icon: "◉" },
    { label: "Done",     icon: "✧" },
  ];
};

const S = {
  FORMAT:  0,
  STORY:   1,
  PREVIEW: 2,
  DONE:    3,
};

// ─── useRecorder hook ─────────────────────────────────────────────────────────
function useRecorder(type /* "video" | "audio" */) {
  const [recState, setRecState] = useState("idle"); // idle | ready | recording | done
  const [elapsed,  setElapsed]  = useState(0);
  const [blobUrl,  setBlobUrl]  = useState(null);
  const [blobFile, setBlobFile] = useState(null);
  const [bars,     setBars]     = useState(Array(28).fill(8));
  const [error,    setError]    = useState(null);

  const mediaRef    = useRef(null); // <video> element for cam preview
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const streamRef   = useRef(null);
  const analyserRef = useRef(null);
  const animRef     = useRef(null);

  // Animate waveform from AnalyserNode
  const animateBars = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const newBars = Array.from({ length: 28 }, (_, i) => {
      const idx = Math.floor((i / 28) * data.length);
      return 6 + (data[idx] / 255) * 44;
    });
    setBars(newBars);
    animRef.current = requestAnimationFrame(animateBars);
  }, []);

  const stop = useCallback(() => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animRef.current);
    try {
      recorderRef.current?.stop();
    } catch (e) {}
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRef.current) mediaRef.current.srcObject = null;
  }, []);

  const init = useCallback(async () => {
    setError(null);
    setBlobUrl(null);
    setBlobFile(null);
    setElapsed(0);
    try {
      const constraints =
        type === "video" ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (type === "video" && mediaRef.current) {
        mediaRef.current.srcObject = stream;
        mediaRef.current.play().catch(() => {});
      }
      setRecState("ready");
    } catch (e) {
      console.error(e);
      setError(
        type === "video"
          ? "Could not access your camera or microphone. Please check browser permissions."
          : "Could not access your microphone. Please check browser permissions."
      );
      setRecState("idle");
    }
  }, [type]);

  const start = async () => {
    setBlobUrl(null);
    setBlobFile(null);
    setElapsed(0);
    setError(null);
    chunksRef.current = [];

    let stream = streamRef.current;
    if (!stream) {
      try {
        const constraints =
          type === "video" ? { video: true, audio: true } : { audio: true };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
      } catch (e) {
        console.error(e);
        setError(
          type === "video"
            ? "Could not access your camera or microphone. Please check browser permissions."
            : "Could not access your microphone. Please check browser permissions."
        );
        return;
      }
    }

    try {
      // Hook up audio analyser
      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;
      animRef.current = requestAnimationFrame(animateBars);

      if (type === "video" && mediaRef.current) {
        mediaRef.current.srcObject = stream;
        mediaRef.current.play().catch(() => {});
      }

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        cancelAnimationFrame(animRef.current);
        setBars(Array(28).fill(8));
        const mime = type === "video" ? "video/webm" : "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        const file = new File([blob], `recording.webm`, { type: mime });
        setBlobFile(file);
        setBlobUrl(URL.createObjectURL(blob));
        setRecState("done");
      };
      recorder.start();
      setRecState("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (e) {
      console.error(e);
      setError("Recording failed to start.");
    }
  };

  const reset = () => {
    stop();
    setBlobUrl(null);
    setBlobFile(null);
    setElapsed(0);
    setBars(Array(28).fill(8));
    setRecState("idle");
    init();
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return { recState, elapsed, blobUrl, blobFile, bars, error, mediaRef, start, stop, reset, init, fmt };
}

// ─── Waveform Component ───────────────────────────────────────────────────────
function Waveform({ bars, live }) {
  return (
    <div className="mms-waveform">
      {bars.map((h, i) => (
        <div
          key={i}
          className={`mms-wave-bar${live ? " live" : ""}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UploadStepper({ onSuccess, onSubmit }) {
  const [step,       setStep]       = useState(0);
  const [format,     setFormat]     = useState(null);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(null);
  const [testimonyId,setTestimonyId]= useState(null);
  const [progress,   setProgress]   = useState(0);
  const [dragOver,   setDragOver]   = useState(false);
  const [parsedStories, setParsedStories] = useState([]);
  const [editId,     setEditId]     = useState(null);

  const [form, setForm] = useState({
    title: "", categoryId: "", country: "", zone: "", description: "",
    state: "", city: "", fullName: "", telephoneNumber: "", age: "", gender: "",
    conditionProblem: "", conditionDuration: "", unableToDoBefore: "",
    whatHappenedDuringProgram: "", ableToDoNow: "", inviterOrNextOfKinDetails: "",
    healingCentreLocation: "", attendeesAtVenue: "", isGrc: false,
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const videoRec = useRecorder("video");
  const audioRec = useRecorder("audio");

  // ── Fetch categories from API on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const zoneParam = searchParams.get("zone") || "";
    const churchParam = searchParams.get("church") || "";
    if (zoneParam || churchParam) {
      setForm((prev) => ({
        ...prev,
        zone: prev.zone || zoneParam,
        church: prev.church || churchParam,
      }));
    }

    const editParam = searchParams.get("edit");
    if (editParam) {
      const id = Number(editParam);
      setEditId(id);
      setFormat(FORMATS.find(f => f.id === "text") || FORMATS[0]);
      setStep(1); // Go straight to STORY step
      api.get(`/api/testimonies/${id}`)
        .then((res) => {
          const t = res.data;
          setForm({
            title: t.title || "",
            categoryId: t.category?.id ? String(t.category.id) : "",
            country: t.country || "",
            church: t.church || "",
            zone: t.zone || "",
            description: t.description || "",
            state: t.state || "",
            city: t.city || "",
            fullName: t.fullName || "",
            telephoneNumber: t.telephoneNumber || "",
            age: t.age || "",
            gender: t.gender || "",
            conditionProblem: t.conditionProblem || "",
            conditionDuration: t.conditionDuration || "",
            unableToDoBefore: t.unableToDoBefore || "",
            whatHappenedDuringProgram: t.whatHappenedDuringProgram || "",
            ableToDoNow: t.ableToDoNow || "",
            inviterOrNextOfKinDetails: t.inviterOrNextOfKinDetails || "",
            healingCentreLocation: t.healingCentreLocation || "",
            attendeesAtVenue: t.attendeesAtVenue || "",
            isGrc: t.isGrc || false,
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
      })
      .finally(() => {});
  }, []);

  const set    = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const isText = format?.id === "text";
  const isBulk = format?.id === "bulk-csv";
  const steps  = stepsFor(format?.id);
  const PREVIEW = S.PREVIEW;
  const DONE    = S.DONE;

  // Auto-initialize and cleanup media streams based on stepper state
  useEffect(() => {
    if (step === S.STORY) {
      if (format?.id === "record-video") {
        videoRec.init();
      } else {
        videoRec.stop();
      }
      
      if (format?.id === "record-audio") {
        audioRec.init();
      } else {
        audioRec.stop();
      }
    } else {
      videoRec.stop();
      audioRec.stop();
    }
    
    // Cleanup on unmount
    return () => {
      videoRec.stop();
      audioRec.stop();
    };
  }, [step, format?.id]);

  const hasRequiredMedia =
    format?.id === "record-video"
      ? (videoRec.recState === "done" && videoRec.blobFile)
      : format?.id === "record-audio"
      ? (audioRec.recState === "done" && audioRec.blobFile)
      : format?.id === "upload"
      ? (uploadedFiles.length > 0)
      : true;

  const canContinueStory =
    form.title.trim() &&
    form.categoryId &&
    (isText ? form.description.trim().length > 20 : true) &&
    hasRequiredMedia;

  const addFiles = (sel) =>
    setUploadedFiles((p) => [
      ...p,
      ...Array.from(sel).map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    ]);
  const removeFile = (i) => setUploadedFiles((p) => p.filter((_, idx) => idx !== i));

  // ── Submit testimony text → get ID
  const handleSubmitStory = async () => {
    setError(null);
    setSubmitting(true);
    try {
      let id = testimonyId;
      const finalDescription = form.description.trim() || `[${format?.label || "Media"} Testimony]`;
        const reqBody = {
          title:       form.title,
          description: finalDescription,
          categoryId:  Number(form.categoryId),
          country:     form.country,
          church:      form.church,
          zone:        form.zone,
          state:       form.state,
          city:        form.city,
          fullName:    form.fullName,
          telephoneNumber: form.telephoneNumber,
          age:         form.age ? Number(form.age) : null,
          gender:      form.gender,
          conditionProblem: form.conditionProblem,
          conditionDuration: form.conditionDuration,
          unableToDoBefore: form.unableToDoBefore,
          whatHappenedDuringProgram: form.whatHappenedDuringProgram,
          ableToDoNow: form.ableToDoNow,
          inviterOrNextOfKinDetails: form.inviterOrNextOfKinDetails,
          healingCentreLocation: form.healingCentreLocation,
          attendeesAtVenue: form.attendeesAtVenue ? Number(form.attendeesAtVenue) : null,
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

  // ── Upload media files + recorded blobs
  const handleFinalSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const allFiles = [...uploadedFiles];
      if (format?.id === "record-video" && videoRec.blobFile)
        allFiles.push({ file: videoRec.blobFile, url: videoRec.blobUrl });
      if (format?.id === "record-audio" && audioRec.blobFile)
        allFiles.push({ file: audioRec.blobFile, url: audioRec.blobUrl });

      const total = Math.max(allFiles.length, 1);
      for (let i = 0; i < allFiles.length; i++) {
        const fd = new FormData();
        fd.append("file", allFiles[i].file);
        
        await api.post(API.media(testimonyId), fd, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setProgress(Math.round(((i + 1) / total) * 100));
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

  const handleCsvUpload = (e) => {
    setError(null);
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setError("CSV file is empty or missing data rows.");
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const titleIdx = headers.indexOf("title");
        const descIdx = headers.indexOf("description");
        const catIdx = headers.indexOf("category");
        const countryIdx = headers.indexOf("country");
        const churchIdx = headers.indexOf("church");
        const zoneIdx = headers.indexOf("zone");

        if (titleIdx === -1 || descIdx === -1) {
          setError("CSV must contain at least 'title' and 'description' columns.");
          return;
        }

        const list = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 2 || !row[titleIdx]?.trim()) continue;

          const catName = catIdx !== -1 ? row[catIdx]?.trim() : "";
          let catId = "";
          if (catName) {
            const matched = categories.find(
              c => c.name.toLowerCase() === catName.toLowerCase()
            );
            if (matched) catId = matched.id;
          }
          if (!catId) {
            const othersCat = categories.find(c => c.name.toLowerCase() === "others") || categories[0];
            catId = othersCat ? othersCat.id : "";
          }

          list.push({
            title: row[titleIdx]?.trim(),
            description: row[descIdx]?.trim() || "",
            categoryId: Number(catId),
            categoryName: catName || "Others",
            country: countryIdx !== -1 ? row[countryIdx]?.trim() : "",
            church: churchIdx !== -1 ? row[churchIdx]?.trim() : "",
            zone: zoneIdx !== -1 ? row[zoneIdx]?.trim() : "",
          });
        }

        if (list.length === 0) {
          setError("No valid testimony rows found in the CSV.");
        } else {
          setParsedStories(list);
        }
      } catch (err) {
        setError("Failed to parse CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const downloadCsvTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,title,description,category,country,church,zone\n"
      + "\"Miraculous Healing from Asthma\",\"I was healed completely after praying at the Healing Streams service.\",\"Healing Streams\",\"Nigeria\",\"Christ Embassy Lagos\",\"Zone 5\"\n"
      + "\"Business Breakthrough\",\"Received a major contract after partnering with the ministry.\",\"Partnership\",\"South Africa\",\"Christ Embassy Johannesburg\",\"SA Zone 2\"";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "testimonies_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    setError(null);
    setSubmitting(true);
    setProgress(0);
    try {
      const total = parsedStories.length;
      for (let i = 0; i < total; i++) {
        const item = parsedStories[i];
        await api.post(API.submit, {
          title: item.title,
          description: item.description,
          categoryId: item.categoryId,
          country: item.country,
          church: item.church,
          zone: item.zone,
        });
        setProgress(Math.round(((i + 1) / total) * 100));
      }
      setStep(DONE);
      onSuccess?.({ bulkCount: total });
    } catch (e) {
      setError("Import failed: " + (e.response?.data?.message || e.message));
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
  const fmt = FORMATS.find((f) => f.id === format?.id);

  // ── Preview media element
  const previewMedia = () => {
    if (format?.id === "record-video" && videoRec.blobUrl)
      return <video src={videoRec.blobUrl} controls />;
    if (format?.id === "record-audio" && audioRec.blobUrl)
      return <audio src={audioRec.blobUrl} controls />;
    if (uploadedFiles.length > 0) {
      const f = uploadedFiles[0];
      return f.file.type.startsWith("image")
        ? <img src={f.url} alt="" />
        : <video src={f.url} controls />;
    }
    return <span className="mms-preview-empty">✦</span>;
  };

  // ── Connector fill array (length = steps.length − 1)
  const connFill = steps.slice(0, -1).map((_, i) => step > i);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mms-root">

      {/* ── Header ── */}
      <header className="mms-header">
        <span className="mms-eyebrow">My Miracle Story</span>
        <h1>Share What <em>God</em> Has Done</h1>
        <p>Your testimony is someone else's miracle waiting to happen.</p>
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
          STEP 0 — Choose Format
      ══════════════════════════════════════════════ */}
      {step === S.FORMAT && (
        <div className="mms-card">
          <span className="mms-step-eyebrow">Step 1 of {steps.length}</span>
          <h2>Choose a Format</h2>
          <p className="mms-card-sub">How would you like to share your testimony?</p>

          <div className="mms-format-grid">
            {FORMATS.map((f) => (
              <div
                key={f.id}
                className={`mms-format-tile${format?.id === f.id ? " selected" : ""}`}
                onClick={() => setFormat(f)}
                role="radio"
                aria-checked={format?.id === f.id}
              >
                <div className="mms-format-check">✓</div>
                <f.Icon />
                <span className="mms-format-tile-label">{f.label}</span>
                <span className="mms-format-tile-desc">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          STEP 1 — Tell Your Story
      ══════════════════════════════════════════════ */}
      {step === S.STORY && (
        isBulk ? (
          <div className="mms-card">
            <span className="mms-step-eyebrow">Step 2 of {steps.length}</span>
            <h2>Bulk Import Testimonies</h2>
            <p className="mms-card-sub">Upload a CSV file containing your testimonies.</p>

            {error && <div className="mms-error">{error}</div>}

            <div className="mms-upload-box" style={{ padding: "30px 20px" }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={submitting}
              />
              <Icon.Csv />
              <h4>Select or drop CSV file</h4>
              <p>Filename must end with .csv</p>
            </div>

            <div style={{ marginTop: "20px", fontSize: "13px", color: "var(--muted)" }}>
              <h4 style={{ color: "var(--text)", marginBottom: "8px" }}>CSV Format Template</h4>
              <p>The CSV must have the following header columns:</p>
              <code style={{ display: "block", background: "var(--bg-card-hover)", padding: "10px", borderRadius: "8px", marginTop: "5px", color: "var(--gold)", overflowX: "auto" }}>
                title,description,category,country,church,zone
              </code>
              <button
                type="button"
                className="mms-btn-secondary"
                style={{ marginTop: "12px", padding: "6px 12px", fontSize: "12px" }}
                onClick={downloadCsvTemplate}
              >
                Download CSV Template
              </button>
            </div>

            {parsedStories.length > 0 && (
              <div style={{ marginTop: "25px" }}>
                <h4 style={{ marginBottom: "10px", color: "var(--text)" }}>Parsed Testimonies ({parsedStories.length})</h4>
                <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  {parsedStories.map((item, idx) => (
                    <div key={idx} style={{ padding: "10px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "14px", color: "var(--text)" }}>{item.title}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>Category: {item.categoryName} | {item.country}</div>
                      </div>
                      <span style={{ color: "var(--gold)", fontWeight: "600", fontSize: "12px" }}>✓ Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitting && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>Importing Testimonies: {progress}%</p>
                <div className="mms-progress-bar">
                  <div className="mms-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mms-card">
            <span className="mms-step-eyebrow">Step 2 of {steps.length}</span>
            <h2>Tell Your Story</h2>
            <p className="mms-card-sub">Write in your own words — God moves through testimony.</p>

            {/* Format context pill */}
            {fmt && (
              <div className="mms-format-pill">
                <fmt.Icon /> {fmt.label}
              </div>
            )}

            {error && <div className="mms-error">{error}</div>}

            <div className="mms-field">
              <label>Testimony Title</label>
              <input
                placeholder="e.g. God restored my health in three days"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>

            <div className="mms-field">
              <label>Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="mms-row">
              <div className="mms-field">
                <label>Country</label>
                <input placeholder="Nigeria" value={form.country} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div className="mms-field">
                <label>State</label>
                <input placeholder="e.g. Lagos" value={form.state} onChange={(e) => set("state", e.target.value)} />
              </div>
            </div>

            <div className="mms-row">
              <div className="mms-field">
                <label>City</label>
                <input placeholder="e.g. Ikeja" value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="mms-field">
                <label>Zone / Network</label>
                <input placeholder="e.g. Zone 4" value={form.zone} onChange={(e) => set("zone", e.target.value)} />
              </div>
            </div>

            <div className="mms-field">
              <label>Church / Affiliate</label>
              <input placeholder="Christ Embassy Lagos" value={form.church} onChange={(e) => set("church", e.target.value)} />
            </div>

            <div className="mms-row">
              <div className="mms-field">
                <label>Full Name</label>
                <input placeholder="e.g. John Doe" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              </div>
              <div className="mms-field">
                <label>Telephone Number (include country code)</label>
                <input placeholder="+234..." value={form.telephoneNumber} onChange={(e) => set("telephoneNumber", e.target.value)} />
              </div>
            </div>

            <div className="mms-row">
              <div className="mms-field">
                <label>Age</label>
                <input type="number" placeholder="e.g. 35" value={form.age} onChange={(e) => set("age", e.target.value)} />
              </div>
              <div className="mms-field">
                <label>Gender</label>
                <select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="mms-field">
              <label>Condition/Problem</label>
              <textarea rows={2} placeholder="Briefly describe the condition..." value={form.conditionProblem} onChange={(e) => set("conditionProblem", e.target.value)} />
            </div>

            <div className="mms-field">
              <label>Duration of Condition/Problem</label>
              <input placeholder="e.g. 5 years, 6 months" value={form.conditionDuration} onChange={(e) => set("conditionDuration", e.target.value)} />
            </div>

            <div className="mms-field">
              <label>What could you not do before?</label>
              <textarea rows={2} placeholder="Describe limitations..." value={form.unableToDoBefore} onChange={(e) => set("unableToDoBefore", e.target.value)} />
            </div>

            <div className="mms-field">
              <label>What happened during the program?</label>
              <textarea rows={3} placeholder="Describe the miracle..." value={form.whatHappenedDuringProgram} onChange={(e) => set("whatHappenedDuringProgram", e.target.value)} />
            </div>

            <div className="mms-field">
              <label>What can you do now?</label>
              <textarea rows={2} placeholder="Describe your current state..." value={form.ableToDoNow} onChange={(e) => set("ableToDoNow", e.target.value)} />
            </div>

            <div className="mms-field">
                <label>Name and Contact Details of the Person that invited you or Next of Kin/Guardian</label>
              <input placeholder="Details..." value={form.inviterOrNextOfKinDetails} onChange={(e) => set("inviterOrNextOfKinDetails", e.target.value)} />
            </div>

            <div className="mms-row">
              <div className="mms-field">
                <label>Location of Healing Centre/Crusade</label>
                <input placeholder="e.g. Online, Center A" value={form.healingCentreLocation} onChange={(e) => set("healingCentreLocation", e.target.value)} />
              </div>
              <div className="mms-field">
                <label>Number of attendees at Venue</label>
                <input type="number" placeholder="e.g. 150" value={form.attendeesAtVenue} onChange={(e) => set("attendeesAtVenue", e.target.value)} />
              </div>
            </div>

            <div className="mms-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <input
                type="checkbox"
                id="isGrcCheckbox"
                checked={form.isGrc}
                onChange={(e) => set("isGrc", e.target.checked)}
                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
              />
              <label htmlFor="isGrcCheckbox" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                Mark as GRC Testimony (Private)
              </label>
            </div>

            <div className="mms-field">
              <label>Your Testimony {isText ? "" : "(Optional)"}</label>
              <textarea
                rows={7}
                placeholder="Share what happened in your own words…"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={2000}
              />
              <div className={`mms-char${form.description.length > 1800 ? " warn" : ""}`}>
                {form.description.length} / 2000
              </div>
            </div>

            {/* Embedded Media Section */}
            <div className="mms-embedded-media-section" style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1.5px dashed var(--navy-border)"
            }}>
              {!isText && (
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: "600",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "12px"
                  }}>
                    {format?.id === "record-video" && "Record Your Video Testimony (Required)"}
                    {format?.id === "record-audio" && "Record Your Audio Testimony (Required)"}
                    {format?.id === "upload" && "Upload Video File (Required)"}
                  </label>

                  {videoRec.error && (
                    <div className="mms-error" style={{ whiteSpace: "pre-line", textAlign: "left", marginBottom: "16px" }}>
                      {videoRec.error}
                    </div>
                  )}
                  {audioRec.error && (
                    <div className="mms-error" style={{ whiteSpace: "pre-line", textAlign: "left", marginBottom: "16px" }}>
                      {audioRec.error}
                    </div>
                  )}

                  {format?.id === "record-video" && (
                    <div className="mms-record-area">
                      {videoRec.recState !== "done" && (
                        <video
                          ref={videoRec.mediaRef}
                          muted
                          playsInline
                          className="mms-cam-preview"
                          style={{ display: (videoRec.recState === "ready" || videoRec.recState === "recording") ? "block" : "none" }}
                        />
                      )}
                      {videoRec.recState === "done" && videoRec.blobUrl && (
                        <>
                          <div className="mms-playback">
                            <video src={videoRec.blobUrl} controls />
                          </div>
                          <button className="mms-redo-btn" onClick={videoRec.reset}>↺  Record Again</button>
                        </>
                      )}

                      {videoRec.recState !== "done" && (
                        <>
                          <Waveform bars={videoRec.bars} live={videoRec.recState === "recording"} />
                          <div className={`mms-rec-timer${videoRec.recState === "recording" ? " live" : ""}`}>
                            {videoRec.fmt(videoRec.elapsed)}
                          </div>
                          <div className="mms-rec-btn-wrap">
                            <button
                              className={`mms-rec-btn${videoRec.recState === "recording" ? " live" : ""}`}
                              onClick={videoRec.recState === "recording" ? videoRec.stop : videoRec.start}
                              aria-label={videoRec.recState === "recording" ? "Stop recording" : "Start recording"}
                            >
                              <div className="mms-rec-dot" />
                            </button>
                            <span className="mms-rec-hint">
                              {videoRec.recState === "idle" || videoRec.recState === "ready"
                                ? "Tap to start recording"
                                : "Tap to stop recording"}
                            </span>
                          </div>
                          {(videoRec.recState === "idle" && !videoRec.error) && (
                            <p className="mms-perm-tip">
                              Your browser will request camera and microphone permission — please allow it to continue.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {format?.id === "record-audio" && (
                    <div className="mms-record-area">
                      {audioRec.recState === "done" && audioRec.blobUrl ? (
                        <>
                          <div className="mms-playback">
                            <audio src={audioRec.blobUrl} controls />
                          </div>
                          <button className="mms-redo-btn" onClick={audioRec.reset}>↺  Record Again</button>
                        </>
                      ) : (
                        <>
                          <Waveform bars={audioRec.bars} live={audioRec.recState === "recording"} />
                          <div className={`mms-rec-timer${audioRec.recState === "recording" ? " live" : ""}`}>
                            {audioRec.fmt(audioRec.elapsed)}
                          </div>
                          <div className="mms-rec-btn-wrap">
                            <button
                              className={`mms-rec-btn${audioRec.recState === "recording" ? " live" : ""}`}
                              onClick={audioRec.recState === "recording" ? audioRec.stop : audioRec.start}
                              aria-label={audioRec.recState === "recording" ? "Stop recording" : "Start recording"}
                            >
                              <div className="mms-rec-dot" />
                            </button>
                            <span className="mms-rec-hint">
                              {audioRec.recState === "idle" || audioRec.recState === "ready"
                                ? "Tap to start recording"
                                : "Tap to stop recording"}
                            </span>
                          </div>
                          {(audioRec.recState === "idle" && !audioRec.error) && (
                            <p className="mms-perm-tip">
                              Your browser will request microphone permission — please allow it to continue.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {format?.id === "upload" && (
                    <div
                      className={`mms-upload-box${dragOver ? " over" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                    >
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                      <Icon.Upload />
                      <h4>Drop your testimony video here</h4>
                      <p>MP4, WebM · Max 50 MB</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medical Reports & Pictures */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "12px"
                }}>
                  Medical Reports & Before/After Pictures (Optional)
                </label>
                <div
                  className={`mms-upload-box${dragOver ? " over" : ""}`}
                  style={{ padding: "20px 15px", minHeight: "100px", borderStyle: "dashed" }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <Icon.Plus />
                  <h4>Add Pictures or Medical Reports</h4>
                  <p>Images, PDFs, Docs</p>
                </div>
              </div>

              {/* Shared Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="mms-media-grid" style={{ marginTop: "16px" }}>
                  {uploadedFiles.map((item, i) => (
                    <div key={i} className="mms-media-thumb">
                      {item.file.type.startsWith("image")
                        ? <img src={item.url} alt="" />
                        : item.file.type.startsWith("video")
                        ? <video src={item.url} />
                        : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#eee', color:'#555'}}><Icon.Text /></div>}
                      <span className="mms-thumb-type">
                        {item.file.type.startsWith("image") ? "IMG" : item.file.type.startsWith("video") ? "VID" : "DOC"}
                      </span>
                      <button className="mms-thumb-remove" onClick={() => removeFile(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* ══════════════════════════════════════════════
          PREVIEW STEP
      ══════════════════════════════════════════════ */}
      {step === PREVIEW && (
        <div className="mms-card">
          <span className="mms-step-eyebrow">Step {PREVIEW + 1} of {steps.length}</span>
          <h2>Review Before Submitting</h2>
          <p className="mms-card-sub">Make sure everything looks right.</p>

          <div className="mms-preview-media">{previewMedia()}</div>

          {selectedCategory && (
            <div className="mms-preview-badge">✦ {selectedCategory.name}</div>
          )}
          <h2 className="mms-preview-title">{form.title}</h2>
          <p className="mms-preview-story">{form.description}</p>

          <div className="mms-preview-meta">
            {form.country && (
              <div className="mms-meta-pill"><Icon.Pin />{form.country}</div>
            )}
            {form.church && (
              <div className="mms-meta-pill"><Icon.Church />{form.church}</div>
            )}
            {form.zone && (
              <div className="mms-meta-pill"><Icon.Tag />{form.zone}</div>
            )}
            {fmt && (
              <div className="mms-meta-pill"><fmt.Icon />{fmt.label}</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DONE
      ══════════════════════════════════════════════ */}
      {step === DONE && (
        <div className="mms-card">
          <div className="mms-success">
            <div className="mms-success-halo">🙏</div>
            <h2>{isBulk ? "Import Completed!" : "Testimony Received"}</h2>
            <p>
              {isBulk
                ? `Successfully imported ${parsedStories.length} testimonies into the portal for review.`
                : "Your story is under review and will be published shortly. Thank you for sharing what God has done."}
            </p>
            {!isBulk && testimonyId && (
              <div className="mms-success-ref">
                Reference ID: <strong>#{testimonyId}</strong>
              </div>
            )}
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

          {/* Format → Story */}
          {step === S.FORMAT && (
            <button
              className="mms-btn-primary"
              onClick={() => setStep(S.STORY)}
              disabled={!format}
            >
              Continue →
            </button>
          )}

          {/* Story → API → next */}
          {step === S.STORY && (
            isBulk ? (
              <button
                className="mms-btn-primary"
                onClick={handleBulkSubmit}
                disabled={parsedStories.length === 0 || submitting}
              >
                {submitting
                  ? <><span className="mms-spinner" /> Importing…</>
                  : <>Import Testimonies →</>}
              </button>
            ) : (
              <button
                className="mms-btn-primary"
                onClick={handleSubmitStory}
                disabled={!canContinueStory || submitting}
              >
                {submitting
                  ? <><span className="mms-spinner" /> Saving…</>
                  : <>Continue →</>}
              </button>
            )
          )}



          {/* Preview → Submit */}
          {step === PREVIEW && (
            <button
              className="mms-btn-primary"
              onClick={
                isText
                  ? () => { setStep(DONE); onSuccess?.({ ...form }); }
                  : handleFinalSubmit
              }
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
