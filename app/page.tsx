"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Language = "en" | "pcm";
type Result = { translation: string; sourceLanguage: Language; targetLanguage: Language; warnings: string[]; requiresHumanReview: boolean };
type Turn = { id: number; sourceText: string; result: Result };
type RecognitionResultLike = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEventLike = { resultIndex: number; results: ArrayLike<RecognitionResultLike> };
type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionConstructor = new () => RecognitionLike;

const languageName: Record<Language, string> = { en: "English", pcm: "Nigerian Pidgin" };
const examples = [
  { category: "Courtroom conduct", text: "Please stand while the court is in session." },
  { category: "Courtroom conduct", text: "Please take your seat." },
  { category: "Waiting instructions", text: "Please wait until your name is called." },
  { category: "Hearing dates", text: "Please return to court on Monday at 9:00 AM." },
  { category: "Document submission", text: "Please submit the required documents." },
  { category: "Adjournments", text: "The hearing has been adjourned until the stated date." },
  { category: "Courtroom conduct", text: "Please speak clearly and wait for your turn." },
  { category: "Courtroom conduct", text: "Please listen carefully to the instructions." },
];

function getSpeechConstructor(): RecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

export default function Home() {
  const [sourceLanguage, setSourceLanguage] = useState<Language>("en");
  const [targetLanguage, setTargetLanguage] = useState<Language>("pcm");
  const [text, setText] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const audioRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nextTurnId = useRef(0);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      audioRef.current = window.speechSynthesis;
      setSpeechAvailable(true);
    }
    setRecognitionAvailable(Boolean(getSpeechConstructor()));
    return () => {
      audioRef.current?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  function stopAudio() {
    audioRef.current?.cancel();
    setStatus("Audio stopped.");
  }

  function swapLanguages() {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setError("");
    setStatus(`Direction changed to ${languageName[targetLanguage]} to ${languageName[sourceLanguage]}.`);
  }

  function startDictation() {
    const SpeechRecognition = getSpeechConstructor();
    if (!SpeechRecognition) {
      setStatus("Dictation is not supported in this browser. You can type the text instead.");
      return;
    }
    if (dictating) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-NG";
    recognition.continuous = true;
    recognition.interimResults = true;
    const baseText = text.trim();
    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];
      for (let index = 0; index < event.results.length; index += 1) {
        const item = event.results[index];
        if (!item) continue;
        (item.isFinal ? finalParts : interimParts).push(item[0].transcript);
      }
      setText([baseText, ...finalParts, ...interimParts].filter(Boolean).join(" ").slice(0, 2000));
      setError("");
    };
    recognition.onerror = (event) => {
      setDictating(false);
      const messages: Record<string, string> = {
        "not-allowed": "Microphone access was denied. Allow microphone access in your browser settings or type the text.",
        "service-not-allowed": "Browser speech recognition is unavailable. You can type the text instead.",
        "no-speech": "No speech was detected. Try again or type the text.",
        "language-not-supported": "This browser does not support the selected speech language. You can type the text instead.",
      };
      setError(messages[event.error] || "Dictation stopped unexpectedly. Please try again or type the text.");
    };
    recognition.onend = () => {
      setDictating(false);
      recognitionRef.current = null;
      setStatus("Dictation stopped. Review the transcript before translating.");
    };
    try {
      recognition.start();
      setDictating(true);
      setStatus(sourceLanguage === "pcm"
        ? "Listening. Browser recognition may not accurately recognize Nigerian Pidgin; review the transcript before translating."
        : "Listening. Review the recognized words before translating.");
      composerRef.current?.focus();
    } catch {
      setDictating(false);
      setError("Could not start dictation. Check microphone access and try again.");
    }
  }

  async function translate() {
    if (busy) return;
    const submittedText = text.trim();
    if (!submittedText) {
      setError("Type a message or use dictation before translating.");
      composerRef.current?.focus();
      return;
    }
    setBusy(true);
    setError("");
    setStatus("");
    audioRef.current?.cancel();
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: submittedText, sourceLanguage, targetLanguage }),
      });
      const data = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(data.error || "Translation could not be completed. Please try again.");
      if (typeof data.translation !== "string" || !Array.isArray(data.warnings)) {
        throw new Error("The translation service returned an unreadable response. Please retry.");
      }
      setTurns((current) => [...current, { id: nextTurnId.current++, sourceText: submittedText, result: data }]);
      setText("");
      setStatus("Translation complete. Verify important details with a qualified human.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Translation could not be completed. Please try again.");
    } finally {
      setBusy(false);
      composerRef.current?.focus();
    }
  }

  async function copyResult(result: Result) {
    try {
      await navigator.clipboard.writeText(result.translation);
      setStatus("Translation copied to clipboard.");
    } catch {
      setStatus("Copy failed. Select the translation text and copy it manually.");
    }
  }

  function playAudio(result: Result) {
    if (!audioRef.current || typeof SpeechSynthesisUtterance === "undefined") {
      setStatus("Audio playback is not available in this browser.");
      return;
    }
    audioRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(result.translation);
    const voices = audioRef.current.getVoices();
    const voice = result.targetLanguage === "en"
      ? voices.find((item) => item.lang.toLowerCase().startsWith("en"))
      : voices.find((item) => item.lang.toLowerCase() === "en-ng");
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setStatus(result.targetLanguage === "pcm" && !voice
      ? "Speaking with a default system voice. Nigerian Pidgin pronunciation is not assured."
      : "Playing translated speech.");
    utterance.onend = () => setStatus("Audio playback finished.");
    utterance.onerror = () => setStatus("Audio playback failed. The translation text is still available.");
    audioRef.current.speak(utterance);
  }

  function clearConversation() {
    recognitionRef.current?.stop();
    audioRef.current?.cancel();
    setTurns([]);
    setText("");
    setError("");
    setStatus("This conversation has been cleared from the page.");
  }

  const isEmpty = turns.length === 0 && !busy;

  return <main className="chat-shell">
    <header className="chat-header">
      <Link className="chat-brand" href="/" aria-label="Nigerian Court Interpreter Support Tool home">
        <span className="brand-icon" aria-hidden="true">N</span>
        <span>Nigerian Court Interpreter <span className="brand-muted">Support Tool</span></span>
        <span className="header-chevron" aria-hidden="true">v</span>
      </Link>
      <div className="header-actions">
        <span className="privacy-tag">AI translation support</span>
        {turns.length > 0 && <button className="header-button" onClick={clearConversation} title="Clear this conversation">Clear chat</button>}
      </div>
    </header>

    <section className={`conversation ${isEmpty ? "conversation-empty" : ""}`} aria-label="Translation conversation" ref={scrollRef}>
      {isEmpty ? <div className="welcome">
        <div className="welcome-orb" aria-hidden="true"><span /></div>
        <h1>What would you like to interpret?</h1>
        <p>Translate simple courtroom instructions between English and Nigerian Pidgin.</p>
      </div> : <div className="turn-list">
        {turns.map(({ id, sourceText, result }) => <article className="turn" key={id}>
          <div className="user-message">
            <span className="message-language">{languageName[result.sourceLanguage]}</span>
            <p>{sourceText}</p>
          </div>
          <div className="assistant-message">
            <div className="assistant-heading"><span className="assistant-mark" aria-hidden="true">N</span><strong>Translation</strong><span className="message-language">{languageName[result.targetLanguage]}</span><span className="ai-badge">AI-generated</span></div>
            <p className="translated-text">{result.translation}</p>
            <div className="message-tools">
              <button onClick={() => copyResult(result)} aria-label="Copy translation"><CopyIcon />Copy</button>
              {speechAvailable && <><button onClick={() => playAudio(result)} aria-label="Listen to translation"><SpeakerIcon />Listen</button><button onClick={stopAudio} aria-label="Stop audio"><StopIcon />Stop</button></>}
            </div>
            <div className="review-note"><strong>Human review required.</strong> Check names, dates, times, amounts, negations, and procedural details before relying on this. {result.warnings.length > 0 && <ul>{result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}</div>
          </div>
        </article>)}
        {busy && <div className="thinking" role="status"><span className="thinking-dot" />Preparing translation...</div>}
      </div>}
    </section>

    <footer className="composer-area">
      <div className="composer-wrap">
        <div className="composer-box">
          <textarea
            ref={composerRef}
            value={text}
            maxLength={2000}
            rows={1}
            aria-label="Message to translate"
            placeholder={sourceLanguage === "en" ? "Type or dictate a courtroom instruction..." : "Type or dictate Nigerian Pidgin..."}
            onChange={(event) => { setText(event.target.value); setError(""); }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void translate(); }
            }}
          />
          <div className="composer-controls">
            <div className="composer-left">
              <label className="sr-only" htmlFor="source-language">Translate from</label>
              <select id="source-language" value={sourceLanguage} onChange={(event) => {
                const value = event.target.value as Language;
                setSourceLanguage(value);
                if (value === targetLanguage) setTargetLanguage(targetLanguage === "en" ? "pcm" : "en");
              }}>
                <option value="en">English</option><option value="pcm">Nigerian Pidgin</option>
              </select>
              <button className="direction-button" onClick={swapLanguages} aria-label="Swap languages" title="Swap languages"><SwapIcon /></button>
              <label className="sr-only" htmlFor="target-language">Translate to</label>
              <select id="target-language" value={targetLanguage} onChange={(event) => {
                const value = event.target.value as Language;
                setTargetLanguage(value);
                if (value === sourceLanguage) setSourceLanguage(sourceLanguage === "en" ? "pcm" : "en");
              }}>
                <option value="pcm">Nigerian Pidgin</option><option value="en">English</option>
              </select>
              <label className="sr-only" htmlFor="example-phrase">Insert an example phrase</label>
              <select className="example-select" id="example-phrase" value="" onChange={(event) => {
                const example = examples[Number(event.target.value)];
                if (example) { setText(example.text); setError(""); setStatus(`${example.category} example loaded. Edit it before translating if needed.`); composerRef.current?.focus(); }
              }}>
                <option value="">Examples</option>{examples.map((example, index) => <option key={example.text} value={index}>{example.text}</option>)}
              </select>
            </div>
            <div className="composer-right">
              {text && <button className="icon-button clear-button" onClick={() => { setText(""); setError(""); setStatus("Draft cleared."); composerRef.current?.focus(); }} aria-label="Clear draft" title="Clear draft"><ClearIcon /></button>}
              {recognitionAvailable && <button className={`icon-button microphone-button ${dictating ? "is-recording" : ""}`} onClick={startDictation} aria-pressed={dictating} aria-label={dictating ? "Stop dictation" : "Start dictation"} title={dictating ? "Stop dictation" : "Dictate (browser speech recognition)"}><MicIcon /></button>}
              <button className="send-button" onClick={() => void translate()} disabled={busy || !text.trim()} aria-label={busy ? "Translating" : "Translate message"}>{busy ? <SpinnerIcon /> : <ArrowIcon />}</button>
            </div>
          </div>
        </div>
        <div className="composer-status" aria-live="polite" role={error ? "alert" : "status"}>
          {error || (dictating ? status : status)}
          {dictating && <span className="listening-indicator"><i />Listening</span>}
        </div>
        <p className="legal-note">AI translations may be inaccurate. Browser dictation may process audio using your browser provider; check the transcript. This tool is not a certified interpreter. Get qualified human verification for consequential courtroom communication.</p>
      </div>
    </footer>
  </main>;
}

function CopyIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="7" width="9" height="10" rx="1.5" /><path d="M13 7V4.5A1.5 1.5 0 0 0 11.5 3h-7A1.5 1.5 0 0 0 3 4.5v8A1.5 1.5 0 0 0 4.5 14H7" /></svg>; }
function SpeakerIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 8v4h3l4 3V5L6 8H3Z" /><path d="M13 7.5a4 4 0 0 1 0 5M15 5a7.5 7.5 0 0 1 0 10" /></svg>; }
function StopIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="5" width="10" height="10" rx="2" /></svg>; }
function SwapIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 6h11m0 0-3-3m3 3-3 3M16 14H5m0 0 3-3m-3 3 3 3" /></svg>; }
function MicIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="7" y="2.5" width="6" height="10" rx="3" /><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v3m-3 0h6" /></svg>; }
function ClearIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>; }
function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15V4m0 0L5.5 8.5M10 4l4.5 4.5" /></svg>; }
function SpinnerIcon() { return <svg className="spinner" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /></svg>; }
