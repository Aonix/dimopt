import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
  type ReactNode,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ENVIRONMENTS,
  GOALS,
  ROADBLOCKS,
  type Environment,
  type FieldError,
  type Goal,
  type Roadblock,
} from '@/lib/lead';

/* ---------- Choice copy. Values are the union types from the validator. ---------- */

interface Choice<T extends string> {
  value: T;
  label: string;
  detail: string;
}

const GOAL_CHOICES: Choice<Goal>[] = [
  { value: GOALS[0], label: 'Drop body fat & lean out', detail: 'Visible change in the mirror and on the tape' },
  { value: GOALS[1], label: 'Build muscle & definition', detail: 'Add shape and fill a shirt properly' },
  { value: GOALS[2], label: 'Athletic conditioning', detail: 'Work capacity, engine, back on the pitch or the course' },
  { value: GOALS[3], label: 'Stress & longevity', detail: 'Bloods, sleep, resting heart rate, energy at 6pm' },
];

const ENV_CHOICES: Choice<Environment>[] = [
  { value: ENVIRONMENTS[0], label: 'Private Guildford studio', detail: 'In person with me, 1:1, membership included' },
  { value: ENVIRONMENTS[1], label: 'Hybrid', detail: 'In person when you are in Surrey, remote when you are not' },
  { value: ENVIRONMENTS[2], label: '100% bespoke & remote', detail: 'Programmed to your app, wherever you are training' },
];

const ROADBLOCK_CHOICES: Choice<Roadblock>[] = [
  { value: ROADBLOCKS[0], label: 'Lack of time or shift work', detail: 'The diary wins every time' },
  { value: ROADBLOCKS[1], label: 'Inconsistent nutrition', detail: 'Good until Thursday, then client dinners' },
  { value: ROADBLOCKS[2], label: 'Joint pain or old injury', detail: 'Something objects every time you push' },
  { value: ROADBLOCKS[3], label: 'Lack of accountability', detail: 'You know what to do, you just stop doing it' },
];

const STEPS = ['Goal', 'Environment', 'Roadblock', 'Details'] as const;

interface Details {
  fullName: string;
  town: string;
  phone: string;
  email: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface ApiResponse {
  success: boolean;
  message: string;
  reference?: string;
  errors?: FieldError[];
}

export default function Qualifier() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [roadblock, setRoadblock] = useState<Roadblock | null>(null);
  const [details, setDetails] = useState<Details>({ fullName: '', town: '', phone: '', email: '' });
  const [company, setCompany] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState('');
  const [reference, setReference] = useState('');
  const [direction, setDirection] = useState<1 | -1>(1);

  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const progress = useMemo(() => {
    const answered = [goal, environment, roadblock].filter(Boolean).length;
    const detailsDone = Object.values(details).every((v) => v.trim().length > 0);
    return Math.min(100, ((answered + (detailsDone ? 1 : 0)) / 4) * 100);
  }, [goal, environment, roadblock, details]);

  const go = useCallback((next: number, dir: 1 | -1) => {
    setDirection(dir);
    setStep(next);
  }, []);

  /* Move focus to the new panel so keyboard and screen-reader users follow the wizard. */
  useEffect(() => {
    if (status === 'success') return;
    panelRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  const pick = useCallback(
    <T,>(setter: (v: T) => void, value: T, nextStep: number) => {
      setter(value);
      setErrors({});
      // Brief pause so the selected state is visible before advancing.
      window.setTimeout(() => go(nextStep, 1), 190);
    },
    [go],
  );

  const validateDetails = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (details.fullName.trim().length < 2) next['fullName'] = 'Enter your full name.';
    if (details.town.trim().length < 2) next['town'] = 'Enter your town or postcode.';
    const digits = details.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) next['phone'] = 'Enter a valid UK mobile number.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim())) {
      next['email'] = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [details]);

  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validateDetails() || !goal || !environment || !roadblock) return;

      setStatus('submitting');
      setFormMessage('');

      try {
        const res = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            goal,
            environment,
            roadblock,
            company,
            ...Object.fromEntries(
              Object.entries(details).map(([k, v]) => [k, v.trim()]),
            ),
          }),
        });

        const data = (await res.json()) as ApiResponse;

        if (!res.ok || !data.success) {
          if (data.errors?.length) {
            setErrors(
              Object.fromEntries(data.errors.map((e) => [e.field, e.message])),
            );
          }
          setFormMessage(data.message || 'Something went wrong. Try again.');
          setStatus('error');
          return;
        }

        setReference(data.reference ?? '');
        setStatus('success');
      } catch {
        setFormMessage('Could not reach the server. Check your connection and try again.');
        setStatus('error');
      }
    },
    [validateDetails, goal, environment, roadblock, details, company],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setStep(0);
    setGoal(null);
    setEnvironment(null);
    setRoadblock(null);
    setDetails({ fullName: '', town: '', phone: '', email: '' });
    setErrors({});
    setReference('');
  }, []);

  if (status === 'success') {
    return <SuccessPanel reference={reference} onReset={reset} />;
  }

  return (
    <div className="relative overflow-hidden rounded-sm border border-seam bg-ink-3">
      <TapeProgress step={step} progress={progress} />

      <form onSubmit={submit} noValidate className="px-5 pb-6 pt-5 sm:px-7 sm:pb-8">
        {/* Honeypot — visually and semantically hidden from real users. */}
        <div aria-hidden="true" className="absolute left-[-9999px] top-0">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input
            id={`${uid}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div
          ref={panelRef}
          tabIndex={-1}
          key={step}
          className="outline-none"
          style={{
            animation: `qualifier-in 420ms cubic-bezier(0.22,1,0.36,1) both`,
            ['--slide-from' as string]: direction === 1 ? '26px' : '-26px',
          }}
        >
          {step === 0 && (
            <StepShell
              n="01"
              title="What is the primary goal?"
              hint="Pick the one that matters most in the next ninety days."
            >
              <ChoiceList
                name="goal"
                choices={GOAL_CHOICES}
                selected={goal}
                onSelect={(v) => pick(setGoal, v, 1)}
              />
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              n="02"
              title="Where do you want to train?"
              hint="This decides the shape of the programme, not the price."
            >
              <ChoiceList
                name="environment"
                choices={ENV_CHOICES}
                selected={environment}
                onSelect={(v) => pick(setEnvironment, v, 2)}
              />
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              n="03"
              title="What has stopped you before?"
              hint="Be honest. This is the part I actually build around."
            >
              <ChoiceList
                name="roadblock"
                choices={ROADBLOCK_CHOICES}
                selected={roadblock}
                onSelect={(v) => pick(setRoadblock, v, 3)}
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell
              n="04"
              title="Where do I send your call slots?"
              hint="I read every application personally, usually the same day."
            >
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field
                  id={`${uid}-name`}
                  label="Full name"
                  autoComplete="name"
                  value={details.fullName}
                  error={errors['fullName']}
                  onChange={(v) => setDetails((d) => ({ ...d, fullName: v }))}
                />
                <Field
                  id={`${uid}-town`}
                  label="Surrey town or postcode"
                  placeholder="Cobham / KT11"
                  autoComplete="address-level2"
                  value={details.town}
                  error={errors['town']}
                  onChange={(v) => setDetails((d) => ({ ...d, town: v }))}
                />
                <Field
                  id={`${uid}-phone`}
                  label="WhatsApp number"
                  type="tel"
                  inputMode="tel"
                  placeholder="07700 900184"
                  autoComplete="tel"
                  value={details.phone}
                  error={errors['phone']}
                  onChange={(v) => setDetails((d) => ({ ...d, phone: v }))}
                />
                <Field
                  id={`${uid}-email`}
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={details.email}
                  error={errors['email']}
                  onChange={(v) => setDetails((d) => ({ ...d, email: v }))}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn btn-primary mt-5 w-full"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Sending
                  </>
                ) : (
                  <>
                    Submit application
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-mist">
                <ShieldCheck className="mt-px size-3.5 shrink-0 text-brass" aria-hidden="true" />
                Your details go to me and nobody else. No list, no automated call
                centre, no third-party sharing.
              </p>
            </StepShell>
          )}
        </div>

        <p
          ref={liveRef}
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${status === 'error' ? 'text-claret-lift' : 'sr-only'}`}
        >
          {formMessage}
        </p>

        {step > 0 && (
          <button
            type="button"
            onClick={() => go(step - 1, -1)}
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-mist transition-colors hover:text-brass-lift"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to {STEPS[step - 1]?.toLowerCase()}
          </button>
        )}
      </form>

      <style>{`
        @keyframes qualifier-in {
          from { opacity: 0; transform: translateX(var(--slide-from, 26px)); }
          to   { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes qualifier-in { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The signature element in its progress form: a tailor's tape. Ticks every
 * 12px, a numbered mark at each step, and a brass indicator that travels it.
 */
function TapeProgress({ step, progress }: { step: number; progress: number }) {
  return (
    <div className="border-b border-seam bg-ink-2 px-5 pb-3.5 pt-4 sm:px-7">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="eyebrow">
          Step {String(step + 1).padStart(2, '0')} / 04 — {STEPS[step]}
        </span>
        <span className="font-mono text-[0.625rem] font-semibold tabular-nums text-mist">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="relative h-6">
        {/* tape body */}
        <div className="tape-rule absolute inset-x-0 top-2.5 h-3 rounded-[1px] bg-ink" />
        {/* travelled length */}
        <div
          className="absolute left-0 top-2.5 h-3 rounded-[1px] bg-claret/70 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progress}%` }}
        />
        {/* the slider on the tape */}
        <div
          className="absolute top-0 h-6 w-[3px] rounded-full bg-brass-lift shadow-[0_0_12px_rgba(212,173,104,0.55)] transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `calc(${progress}% - 1.5px)` }}
        />
        {/* step marks */}
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`absolute top-2 h-4 w-px transition-colors duration-300 ${
              i <= step ? 'bg-brass' : 'bg-seam'
            }`}
            style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function StepShell({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-[0.625rem] font-semibold tracking-[0.22em] text-brass">
        {n}
      </p>
      <h3 className="font-display text-[1.5rem] leading-[1.15] text-chalk">{title}</h3>
      <p className="mb-4 mt-1.5 text-[0.8125rem] leading-relaxed text-mist">{hint}</p>
      {children}
    </div>
  );
}

function ChoiceList<T extends string>({
  name,
  choices,
  selected,
  onSelect,
}: {
  name: string;
  choices: Choice<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2">
      {choices.map((choice) => {
        const isOn = selected === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={isOn}
            onClick={() => onSelect(choice.value)}
            className={`group flex w-full items-center gap-3.5 rounded-sm border px-4 py-3 text-left transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOn
                ? 'border-brass bg-brass/[0.07]'
                : 'border-seam bg-ink-2 hover:border-mist/60 hover:bg-ink-2/60'
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
                isOn ? 'border-brass bg-brass text-ink' : 'border-seam text-transparent'
              }`}
            >
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.9375rem] font-medium leading-snug text-chalk">
                {choice.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-mist">
                {choice.detail}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = 'text',
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'tel' | 'email' | 'text';
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-mist"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-sm border bg-ink px-3.5 py-2.5 text-[0.9375rem] text-chalk transition-colors placeholder:text-mist/50 focus:outline-none focus-visible:border-brass ${
          error ? 'border-claret-lift' : 'border-seam'
        }`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-claret-lift">
          {error}
        </p>
      )}
    </div>
  );
}

function SuccessPanel({ reference, onReset }: { reference: string; onReset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div
      role="alertdialog"
      aria-labelledby="qualifier-success-heading"
      className="relative overflow-hidden rounded-sm border border-brass/40 bg-ink-3 px-6 py-9 text-center sm:px-9"
      style={{ animation: 'qualifier-success 520ms cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full border border-brass/50 bg-brass/10">
        <Check className="size-5 text-brass-lift" strokeWidth={2.5} aria-hidden="true" />
      </span>

      <h3
        id="qualifier-success-heading"
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[1.75rem] leading-tight text-chalk outline-none"
      >
        Application received.
      </h3>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-chalk-dim">
        I read every one personally. If I think I can get you the result you have
        asked for, you will get a WhatsApp with call slots inside 48 hours.
      </p>

      {reference && (
        <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.14em] text-brass">
          REF {reference}
        </p>
      )}

      <div className="mx-auto mt-6 h-px w-16 bg-seam" />

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-mist transition-colors hover:text-brass-lift"
      >
        <X className="size-3.5" aria-hidden="true" />
        Submit another application
      </button>

      <style>{`
        @keyframes qualifier-success {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
