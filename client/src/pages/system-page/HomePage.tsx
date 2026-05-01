import { useState, type FormEvent, type ReactElement } from 'react';
import {
  DEFAULT_EMAIL_FORM_VALUES,
  EMAIL_PURPOSE_OPTIONS,
  EMAIL_REFINEMENT_OPTIONS,
  EMAIL_TONE_OPTIONS,
} from '../../config/watsonx';
import { useWatsonxEmailGenerator } from '../../hooks/useWatsonxEmailGenerator';
import type { EmailFormValues } from '../../utilities/system-utils/emailGenerator';

function HomePage(): ReactElement {
  const [formValues, setFormValues] = useState<EmailFormValues>(DEFAULT_EMAIL_FORM_VALUES);
  const { error, generateDraft, loading, metadata, reset, result } =
    useWatsonxEmailGenerator();

  const updateField = <TField extends keyof EmailFormValues>(
    field: TField,
    value: EmailFormValues[TField],
  ): void => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await generateDraft(formValues);
  };

  const handleReset = (): void => {
    setFormValues(DEFAULT_EMAIL_FORM_VALUES);
    reset();
  };

  return (
    <main className="min-h-screen px-4 py-10 text-slate-100 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-cyan-400/20 bg-slate-950/70 shadow-[0_30px_80px_rgba(7,14,26,0.45)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100">
                IBM watsonx AI smoke test
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl font-['IBM_Plex_Sans',_'Segoe_UI',_sans-serif] text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Email generator prototype for your AI enhancement layer
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  This sample only tests the Watsonx connection and a lightweight version of your
                  flow: rule-based input checks, AI drafting, and final email formatting.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 1</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Rule-Based Input</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Purpose, tone, role, company, and message points are validated before the AI
                    call.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 2</p>
                  <h2 className="mt-3 text-lg font-medium text-white">AI Enhancement</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Watsonx generates the actual email draft using one compact prompt template.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 3</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Final Output</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The response is parsed into subject and body so you can verify the full loop.
                  </p>
                </article>
              </div>
            </div>

            <aside className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/6 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                What you still need
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                <li>IBM Cloud API key</li>
                <li>Watsonx project ID</li>
                <li>Matching Watsonx region such as `us-south`</li>
              </ul>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm leading-6 text-slate-300">
                <p className="font-medium text-white">Where the secret goes</p>
                <p className="mt-2">
                  Put the API key in <code className="rounded bg-white/10 px-1.5 py-0.5">client/.env.local</code>.
                  The browser never receives it directly because the Vite dev server handles the
                  upstream Watsonx request.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Input layer</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Watsonx email test form</h2>
              </div>
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
                onClick={handleReset}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Purpose</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    onChange={(event) => updateField('purpose', event.target.value as EmailFormValues['purpose'])}
                    value={formValues.purpose}
                  >
                    {EMAIL_PURPOSE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    {
                      EMAIL_PURPOSE_OPTIONS.find((option) => option.value === formValues.purpose)
                        ?.description
                    }
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Tone</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    onChange={(event) => updateField('tone', event.target.value as EmailFormValues['tone'])}
                    value={formValues.tone}
                  >
                    {EMAIL_TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    {EMAIL_TONE_OPTIONS.find((option) => option.value === formValues.tone)?.description}
                  </p>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Job role</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                    onChange={(event) => updateField('jobRole', event.target.value)}
                    placeholder="Frontend Developer Intern"
                    type="text"
                    value={formValues.jobRole}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Company</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                    onChange={(event) => updateField('company', event.target.value)}
                    placeholder="IBM"
                    type="text"
                    value={formValues.company}
                  />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Key message points</span>
                <textarea
                  className="min-h-40 w-full rounded-[24px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                  onChange={(event) => updateField('keyPoints', event.target.value)}
                  placeholder="Add each point on a new line."
                  value={formValues.keyPoints}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Extra AI instruction</span>
                <textarea
                  className="min-h-28 w-full rounded-[24px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                  onChange={(event) => updateField('extraInstruction', event.target.value)}
                  placeholder="Example: Avoid sounding too robotic. Mention teamwork and willingness to learn."
                  value={formValues.extraInstruction}
                />
                <p className="text-xs leading-5 text-slate-400">
                  This becomes an extra prompt instruction sent to Watsonx.
                </p>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Optional refinement</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                  onChange={(event) =>
                    updateField('refinement', event.target.value as EmailFormValues['refinement'])
                  }
                  value={formValues.refinement}
                >
                  {EMAIL_REFINEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-400">
                  {
                    EMAIL_REFINEMENT_OPTIONS.find(
                      (option) => option.value === formValues.refinement,
                    )?.description
                  }
                </p>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/40"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Talking to watsonx...' : 'Generate test email'}
                </button>
                <div className="rounded-full border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                  Dev-only proxy keeps the API key off the page
                </div>
              </div>
            </div>
          </form>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Output layer</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Generated email preview</h2>

            {result ? (
              <div className="mt-8 space-y-6">
                <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Subject</p>
                  <p className="mt-2 text-lg font-medium text-white">{result.subject}</p>
                </article>

                <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Body</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
                    {result.body}
                  </p>
                </article>

                {metadata ? (
                  <article className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/8 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                      Request metadata
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                      <p>Model: {metadata.modelId}</p>
                      <p>Region: {metadata.region}</p>
                      <details className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <summary className="cursor-pointer text-slate-100">Prompt sent to Watsonx</summary>
                        <pre className="mt-3 whitespace-pre-wrap text-xs leading-6 text-slate-300">
                          {metadata.prompt}
                        </pre>
                      </details>
                    </div>
                  </article>
                ) : null}
              </div>
            ) : (
              <div className="mt-8 space-y-4 rounded-[24px] border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-slate-300">
                <p>
                  No AI output yet. After you add the Watsonx credentials and submit the form,
                  this panel will show the generated subject and email body.
                </p>
                <p className="text-slate-400">
                  Quick troubleshooting: 401 usually means the API key is invalid, 403 often means
                  the project or access policy is wrong, and a failed generation call can also
                  happen when the region does not match the project.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default HomePage;
