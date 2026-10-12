import { useState } from 'react';
import { ChevronDown, CheckCircle2, XCircle, Trees, ListOrdered, HelpCircle, FlaskConical, BookA } from 'lucide-react';
import { QUIZ } from '../content/quiz';
import { FORESTRY_CONNECTIONS, GUIDED_SEQUENCE, SYLLABUS_MAP } from '../content/forestry';
import { GLOSSARY, MISCONCEPTIONS, REFERENCES, shortReference } from '../content/glossary';
import { useOrbitalStore } from '../store/useOrbitalStore';

/**
 * APRENDIZAXE: SECUENCIA GUIADA, CONTEXTO FORESTAL E AUTOAVALIACIÓN
 * ===============================================================
 * Tres pestanas accesibles desde o panel. Cada unha responde a unha necesidade
 * distinta, todas elas identificadas na auditoría:
 *
 *  - SECUENCIA (D16): percorrido guiado con PREDICIÓN explícita antes de cada
 *    observación, que é o mecanismo que mellor combate as concepcións erróneas.
 *  - FORESTAL (D17): a conexión coa Enxeñaría Forestal, que responde a «para
 *    que me ensinan isto?».
 *  - PROBA (D15): autoavaliación con distractores construídos a partir das
 *    ideas erróneas documentadas, con retroalimentación explicativa.
 */

type Tab = 'secuencia' | 'forestal' | 'proba' | 'vocabulario';

const TABS: Array<{ id: Tab; label: string; Icon: typeof ListOrdered }> = [
  { id: 'secuencia', label: 'Secuencia', Icon: ListOrdered },
  { id: 'forestal', label: 'Forestal', Icon: Trees },
  { id: 'proba', label: 'Probar', Icon: HelpCircle },
  { id: 'vocabulario', label: 'Vocabulario', Icon: BookA },
];

/** Aplica ao visor o control que indica un paso da secuencia. */
function useApplyStep() {
  const setN = useOrbitalStore((s) => s.setN);
  const setL = useOrbitalStore((s) => s.setL);
  const setM = useOrbitalStore((s) => s.setM);
  const setOrbitalType = useOrbitalStore((s) => s.setOrbitalType);
  const setVisualizationMode = useOrbitalStore((s) => s.setVisualizationMode);
  const setShowAxes = useOrbitalStore((s) => s.setShowAxes);

  return (step: (typeof GUIDED_SEQUENCE)[number]) => {
    switch (step.control) {
      case 'n':
        setOrbitalType('real');
        setN(3);
        setL(0);
        setM(0);
        break;
      case 'l':
        setOrbitalType('real');
        setN(3);
        setL(0);
        break;
      case 'm':
        setOrbitalType('real');
        setN(2);
        setL(1);
        setM(0);
        break;
      case 'tipo':
        setOrbitalType('real');
        break;
      case 'modo':
        setOrbitalType('real');
        setN(2);
        setL(1);
        setM(0);
        setVisualizationMode('cloud');
        break;
      case 'hibrido':
        setOrbitalType('hybrid');
        break;
    }
    setShowAxes(true);
  };
}

const GuidedPanel = () => {
  const apply = useApplyStep();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <p className="text-[11px] leading-snug text-ink-2">
        Percorrido de ~40 minutos. O importante é <strong className="text-white">predicir antes de
        mirar</strong>: formula a túa hipótese e só despois compróbaa no visor.
      </p>
      {GUIDED_SEQUENCE.map((step, i) => {
        const isOpen = open === i;
        return (
          <div key={step.n} className="overflow-hidden rounded-card border border-white/8 bg-surface-2">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-[11px] font-semibold text-ink-2 transition-colors hover:bg-white/8 hover:text-ink-1"
            >
              <span
                aria-hidden="true"
                className="tnum flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-300"
              >
                {step.n}
              </span>
              <span className="flex-1">{step.title}</span>
              <ChevronDown
                size={13}
                aria-hidden="true"
                className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-white/8 px-2.5 py-2.5 text-[11px] leading-snug">
                <p className="text-ink-2">
                  <span className="font-semibold text-brand-300">Fai: </span>
                  {step.action}
                </p>
                <p className="rounded border border-amber-400/30 bg-amber-500/10 p-1.5 text-white/90">
                  <span className="font-semibold text-amber-200">Predí: </span>
                  {step.predict}
                </p>
                <p className="text-ink-2">
                  <span className="font-semibold text-ok-400">Observa: </span>
                  {step.observe}
                </p>
                <button
                  type="button"
                  onClick={() => apply(step)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand-400/40 bg-brand-500/20 py-1.5 text-[10px] font-semibold text-brand-300 transition-colors hover:bg-brand-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <FlaskConical size={12} aria-hidden="true" />
                  Preparar o visor para este paso
                </button>
                <p className="text-[10px] leading-snug text-ink-3">{step.prepareNote}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ForestryPanel = () => (
  <div className="space-y-3">
    <p className="text-[11px] leading-snug text-ink-2">
      As conexións coa Enxeñaría Forestal. A guía de Química cobre estes contidos no Tema 2
      («Estructura atómica e enlace químico»).
    </p>
    {FORESTRY_CONNECTIONS.map((c) => (
      <details key={c.id} className="rounded-lg border border-white/12 bg-white/5">
        <summary className="cursor-pointer px-2.5 py-2 text-[11px] font-semibold text-ok-400 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
          {c.title}
        </summary>
        <div className="space-y-1.5 border-t border-white/10 px-2.5 py-2 text-[11px] leading-snug">
          <p className="text-ink-2">
            <span className="font-semibold text-brand-300">No visor: </span>
            {c.orbitalBasis}
          </p>
          <p className="text-ink-1">
            <span className="font-semibold text-ok-400">Na madeira e no monte: </span>
            {c.forestry}
          </p>
          <p className="text-[10px] text-white/70">
            <span className="font-semibold">Contido da guía: </span>
            {c.syllabus}
          </p>
        </div>
      </details>
    ))}

    <div className="rounded-lg border border-white/12 bg-white/5 p-2.5">
      <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
        Cobertura da guía docente
      </h3>
      <ul className="space-y-1 text-[10px]">
        {SYLLABUS_MAP.map((s) => (
          <li key={s.syllabus} className="flex items-center justify-between gap-2">
            <span className="text-ink-2">{s.syllabus}</span>
            <span
              className={
                s.covered === 'si'
                  ? 'font-semibold text-emerald-300'
                  : s.covered === 'parcial'
                    ? 'font-semibold text-amber-300'
                    : 'text-white/60'
              }
            >
              {s.covered === 'si' ? 'cuberto' : s.covered === 'parcial' ? 'parcial' : 'non cuberto'}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[10px] leading-snug text-white/65">
        O que non está cuberto hai que traballalo con outros materiais: esta aplicación céntrase na
        descrición mecano-cuántica e na hibridación.
      </p>
    </div>
  </div>
);

const QuizPanel = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const correctCount = QUIZ.filter((q) => {
    const chosen = answers[q.id];
    return chosen !== undefined && q.options[chosen]?.correct;
  }).length;
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-snug text-ink-2">
        {QUIZ.length} preguntas. Cada resposta incorrecta explica <strong className="text-white">que
        idea errónea</strong> hai detrás, así que convén lela con atención.
      </p>

      {answered > 0 && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-blue-100"
        >
          {correctCount} de {answered} correctas
          {answered === QUIZ.length ? ` (de ${QUIZ.length})` : ''}
        </p>
      )}

      {QUIZ.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <fieldset key={q.id} className="rounded-lg border border-white/12 bg-white/5 p-2.5">
            <legend className="px-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
              Pregunta {qi + 1}
            </legend>
            <p className="mb-2 text-[11px] font-medium leading-snug text-white/95">{q.question}</p>
            <div className="space-y-1.5">
              {q.options.map((o, oi) => {
                const isChosen = chosen === oi;
                const showState = chosen !== undefined;
                return (
                  <div key={oi}>
                    <button
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      aria-pressed={isChosen}
                      className={`flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] leading-snug transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                        isChosen
                          ? o.correct
                            ? 'border-emerald-400/60 bg-emerald-500/20 text-white'
                            : 'border-amber-400/60 bg-amber-500/20 text-white'
                          : 'border-white/15 bg-white/5 text-white/85 hover:bg-white/12'
                      }`}
                    >
                      {showState && isChosen && (
                        <span aria-hidden="true" className="mt-0.5 shrink-0">
                          {o.correct ? (
                            <CheckCircle2 size={13} className="text-emerald-300" />
                          ) : (
                            <XCircle size={13} className="text-amber-300" />
                          )}
                        </span>
                      )}
                      <span>{o.text}</span>
                    </button>
                    {isChosen && (
                      <p
                        className={`mt-1 ml-1 border-l-2 pl-2 text-[10px] leading-snug ${
                          o.correct ? 'border-emerald-400/60 text-emerald-100' : 'border-amber-400/60 text-amber-100'
                        }`}
                      >
                        {o.feedback}
                        {o.misconception && (
                          <span className="mt-0.5 block text-[10px] text-amber-200/80">
                            Idea errónea: {o.misconception}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-white/70">
              <span className="font-semibold">Compóbao no visor: </span>
              {q.verify}
            </p>
          </fieldset>
        );
      })}
    </div>
  );
};

const VocabularyPanel = () => (
  <div className="space-y-3">
    <p className="text-[11px] leading-snug text-ink-2">
      O vocabulario mínimo do tema, en galego, coa definición que se usa nesta aplicación.
    </p>

    <details open className="rounded-lg border border-white/12 bg-white/5">
      <summary className="cursor-pointer px-2.5 py-2 text-[11px] font-semibold text-brand-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        Glosario ({GLOSSARY.length} termos)
      </summary>
      <dl className="space-y-2 border-t border-white/10 px-2.5 py-2">
        {GLOSSARY.map((g) => (
          <div key={g.term}>
            <dt className="text-[11px] font-semibold text-white">{g.term}</dt>
            <dd className="text-[10px] leading-snug text-white/85">{g.definition}</dd>
          </div>
        ))}
      </dl>
    </details>

    <details className="rounded-lg border border-amber-400/30 bg-amber-500/10">
      <summary className="cursor-pointer px-2.5 py-2 text-[11px] font-semibold text-amber-200 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
        Ideas erróneas frecuentes ({MISCONCEPTIONS.length})
      </summary>
      <div className="space-y-2 border-t border-amber-400/20 px-2.5 py-2">
        <p className="text-[10px] leading-snug text-white/80">
          Estas ideas están documentadas na investigación en didáctica da química e son
          resistentes: só se corrixen se se nomean e se confrontan de forma explícita. A
          segunda columna é a corrección.
        </p>
        {MISCONCEPTIONS.map((m) => (
          <div key={m.wrong} className="rounded border border-white/10 bg-black/25 p-2">
            <p className="flex gap-1.5 text-[10px] text-amber-100">
              <span aria-hidden="true" className="font-bold">✗</span>
              <span>{m.wrong}</span>
            </p>
            <p className="mt-1 flex gap-1.5 text-[10px] text-white/90">
              <span aria-hidden="true" className="font-bold text-emerald-300">✓</span>
              <span>{m.right}</span>
            </p>
            <p className="mt-1 text-[9px] text-white/60">{shortReference(m.source)}</p>
          </div>
        ))}
      </div>
    </details>

    <details className="rounded-lg border border-white/12 bg-white/5">
      <summary className="cursor-pointer px-2.5 py-2 text-[11px] font-semibold text-brand-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        Referencias ({Object.keys(REFERENCES).length})
      </summary>
      <ol className="space-y-2 border-t border-white/10 px-2.5 py-2 text-[9px] leading-snug text-white/80">
        {Object.entries(REFERENCES).map(([key, ref]) => (
          <li key={key} className="pl-1">
            <span className="font-semibold text-white/90">{shortReference(key)}</span> {ref}
          </li>
        ))}
      </ol>
      <p className="border-t border-white/10 px-2.5 py-2 text-[9px] text-white/65">
        Metadatos bibliográficos verificados vía Crossref. Os textos completos de dous destes
        artigos non foron accesibles durante a elaboración (a editorial devolveu erro 403), polo
        que as ideas atribúeselles como referencia xeral e non como cita textual.
      </p>
    </details>
  </div>
);

export const LearnPanel = () => {
  const [tab, setTab] = useState<Tab>('secuencia');

  return (
    <section aria-label="Material de aprendizaxe" className="space-y-3">
      <div role="tablist" aria-label="Seccións de aprendizaxe" className="grid grid-cols-4 gap-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] font-bold uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                active
                  ? 'border-blue-400/60 bg-blue-500/25 text-blue-100'
                  : 'border-white/20 bg-white/8 text-white/75 hover:bg-white/15'
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'secuencia' && <GuidedPanel />}
        {tab === 'forestal' && <ForestryPanel />}
        {tab === 'proba' && <QuizPanel />}
        {tab === 'vocabulario' && <VocabularyPanel />}
      </div>
    </section>
  );
};
