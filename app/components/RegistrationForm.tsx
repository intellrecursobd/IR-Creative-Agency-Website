"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const accessOptions = [
  { value: "SHADOW CAMP", label: "Shadow Camp — BDT 7,000 · tent included" },
  { value: "INNER CIRCLE", label: "Inner Circle — BDT 6,000" },
  { value: "NIGHT SIGNAL", label: "Night Signal — BDT 4,500" },
  { value: "DUAL FREQUENCY", label: "Dual Frequency — BDT 7,000" },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function RegistrationForm() {
  const [originalName, setOriginalName] = useState("");
  const [clanName, setClanName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [variant, setVariant] = useState(0);
  const [suggesting, setSuggesting] = useState(false);
  const [formState, setFormState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [confirmedClanName, setConfirmedClanName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const formSplashRef = useRef<HTMLAudioElement>(null);
  const lastSplashAtRef = useRef(0);

  function playFormSplash() {
    if (document.documentElement.dataset.eclipseSound !== "on") return;

    const now = performance.now();
    if (now - lastSplashAtRef.current < 1200) return;
    lastSplashAtRef.current = now;

    const splash = formSplashRef.current;
    if (!splash) return;
    splash.currentTime = 0;
    splash.volume = 0.32;
    void splash.play().catch(() => undefined);
  }

  useEffect(() => {
    const cleanName = originalName.trim();
    if (cleanName.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSuggesting(true);
      try {
        const response = await fetch(
          `/api/suggest?name=${encodeURIComponent(cleanName)}&variant=${variant}`,
          { cache: "no-store", signal: controller.signal },
        );
        const data = (await response.json()) as { clanName?: string; error?: string };
        if (!response.ok || !data.clanName) throw new Error(data.error);
        setClanName(data.clanName);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setClanName("");
        }
      } finally {
        if (!controller.signal.aborted) setSuggesting(false);
      }
    }, 360);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [originalName, variant]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      originalName: form.get("originalName"),
      clanName,
      phone: form.get("phone"),
      email: form.get("email"),
      socialProfile: form.get("socialProfile"),
      accessCode,
      partnerName: form.get("partnerName"),
      tentAddon: form.get("tentAddon") === "on",
      photoPreference: form.get("photoPreference"),
      website: form.get("website"),
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        suggestedClanName?: string;
        registration?: { clanName: string };
      };

      if (!response.ok) {
        if (data.suggestedClanName) setClanName(data.suggestedClanName);
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setConfirmedClanName(data.registration?.clanName || clanName);
      setFormState("success");
      formRef.current?.reset();
    } catch (error) {
      setFormState("error");
      setMessage(error instanceof Error ? error.message : "Submission failed. Please try again.");
    }
  }

  if (formState === "success") {
    return (
      <div className="registration-success" role="status">
        <span className="success-mark" aria-hidden="true">✓</span>
        <p className="section-label">Transmission received</p>
        <h3>{confirmedClanName}</h3>
        <p>
          Your application is in review. If approved, the final coordinates and
          confirmation instructions will reach you privately.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Submit another profile
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="registration-form"
      onSubmit={handleSubmit}
      onPointerDown={playFormSplash}
    >
      <audio ref={formSplashRef} src="/form-splash.mp3" preload="auto" aria-hidden="true" />
      <div className="form-grid">
        <label className="field">
          <span>Original Name *</span>
          <input
            name="originalName"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={80}
            placeholder="Your legal or familiar name"
            value={originalName}
            onChange={(event) => {
              setOriginalName(event.target.value);
              setClanName("");
              setSuggesting(event.target.value.trim().length >= 2);
              setVariant(0);
            }}
            required
          />
        </label>

        <div className="field clan-field">
          <span>Your Clan Name *</span>
          <div className="clan-row">
            <input
              name="clanName"
              type="text"
              value={suggesting ? "Generating…" : clanName}
              placeholder="Your independent identity"
              readOnly
              aria-describedby="clan-note"
              required
            />
            <button
              className="regenerate"
              type="button"
              disabled={originalName.trim().length < 2 || suggesting}
              onClick={() => setVariant((current) => current + 1)}
            >
              Another
            </button>
          </div>
          <small id="clan-note">Random, unique and completely separate from your real name.</small>
        </div>

        <label className="field">
          <span>Phone Number *</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="+880 1XXX XXXXXX"
            required
          />
        </label>

        <label className="field">
          <span>Email *</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={120}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field full-field">
          <span>Instagram / Social Profile *</span>
          <input
            name="socialProfile"
            type="url"
            inputMode="url"
            autoComplete="url"
            maxLength={240}
            placeholder="https://instagram.com/yourprofile"
            required
          />
        </label>

        <label className="field">
          <span>Choose Access *</span>
          <select
            name="accessCode"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            required
          >
            <option value="" disabled>Select your access code</option>
            {accessOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        {accessCode === "DUAL FREQUENCY" && (
          <label className="field">
            <span>Partner&apos;s Name *</span>
            <input
              name="partnerName"
              type="text"
              maxLength={80}
              placeholder="Name of your plus-one"
              required
            />
          </label>
        )}

        {accessCode !== "SHADOW CAMP" && (
          <label className="checkbox-field full-field">
            <input name="tentAddon" type="checkbox" />
            <span>
              Add a Shelter Add-on
              <small>Additional tent rental · BDT 3,000 · only 7 tents total</small>
            </span>
          </label>
        )}

        <fieldset className="photo-choice full-field">
          <legend>Would you like us to take your photo? *</legend>
          <div className="photo-options">
            <label>
              <input name="photoPreference" type="radio" value="yes" required />
              <span>Yes, capture the moment</span>
            </label>
            <label>
              <input name="photoPreference" type="radio" value="no" required />
              <span>No, thank you</span>
            </label>
          </div>
        </fieldset>

        <label className="honeypot" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message && <p className="form-error" role="alert">{message}</p>}

      <div className="form-footer">
        <p>One application per email and phone number. Your details are private.</p>
        <button
          className="submit-button"
          type="submit"
          disabled={formState === "submitting" || suggesting || !clanName}
        >
          {formState === "submitting" ? "Transmitting…" : "Submit application"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}
