import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { analyze, buildResume, EXAMPLE_JOB, EXAMPLE_RESUME, type Analysis } from "@/lib/ats";
import { exportPdf } from "@/lib/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ByJohwGimenes MKT — Currículo ATS" },
      { name: "description", content: "Compare seu currículo com a vaga e monte uma versão ATS-friendly fiel aos seus dados, tudo no navegador." },
      { property: "og:title", content: "ByJohwGimenes MKT — Currículo ATS" },
      { property: "og:description", content: "Análise textual local de palavras-chave entre vaga e currículo, sem inventar experiências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Errors = { job?: string; resume?: string };

function Index() {
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Analysis | null>(null);
  const [confirmed, setConfirmed] = useState<Record<string, string | undefined>>({});
  const [output, setOutput] = useState("");
  const [structured, setStructured] = useState(true);
  const [status, setStatus] = useState("");

  const onAnalyze = () => {
    const e: Errors = {};
    if (!job.trim()) e.job = "Cole a descrição da vaga antes de analisar.";
    if (!resume.trim()) e.resume = "Cole o texto do seu currículo antes de analisar.";
    setErrors(e);
    if (e.job || e.resume) {
      document.getElementById(e.job ? "job" : "resume")?.focus();
      return;
    }
    const a = analyze(job, resume);
    setResult(a);
    setConfirmed({});
    const b = buildResume(resume, []);
    setOutput(b.text);
    setStructured(b.structured);
    setStatus(a.keywords.length ? "Análise concluída." : "Nenhuma palavra-chave relevante encontrada na vaga.");
  };

  const onClear = () => {
    setJob(""); setResume(""); setErrors({}); setResult(null); setConfirmed({}); setOutput(""); setStatus("Campos limpos.");
  };

  const regenerate = (c: Record<string, string | undefined>) => {
    const list = Object.entries(c)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => ({ label: result?.missing.find((m) => m.term === k)?.label ?? k, evidence: v ?? "" }));
    setOutput(buildResume(resume, list).text);
  };

  const toggle = (term: string, on: boolean) => {
    const c = { ...confirmed, [term]: on ? "" : undefined };
    if (!on) delete c[term];
    setConfirmed(c); regenerate(c);
  };
  const setEvidence = (term: string, v: string) => {
    const c = { ...confirmed, [term]: v };
    setConfirmed(c); regenerate(c);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(output); setStatus("Currículo copiado."); }
    catch { setStatus("Não foi possível copiar. Selecione o texto e copie manualmente."); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-primary bg-ink text-ink-foreground">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">ByJohwGimenes MKT</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Currículo ATS</h1>
          <p className="mt-2 max-w-2xl text-ink-foreground/80">Compare seu currículo com uma vaga e organize uma versão em texto simples. Análise textual por regras locais — não é IA generativa nem um ATS real.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <p role="note" className="rounded-md border-l-4 border-primary bg-highlight p-4 font-semibold">
          Esta ferramenta melhora a apresentação do seu currículo; nunca inventa experiências ou qualificações.
        </p>
        <p className="text-sm text-muted-foreground">Privacidade: tudo é processado no seu navegador. Nada é enviado, registrado ou salvo.</p>

        <div aria-live="polite" className="sr-only">{status}</div>

        <section className="grid gap-6 md:grid-cols-2" aria-label="Entrada">
          <Field id="job" label="Descrição da vaga" value={job} onChange={setJob} error={errors.job} />
          <Field id="resume" label="Seu currículo (texto)" value={resume} onChange={setResume} error={errors.resume} />
        </section>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" onClick={onAnalyze}>Analisar</button>
          <button className="btn-outline" onClick={onClear}>Limpar</button>
          <button className="btn-ghost" onClick={() => { setJob(EXAMPLE_JOB); setResume(EXAMPLE_RESUME); setErrors({}); setStatus("Exemplo fictício carregado. Clique em Analisar."); }}>
            Carregar exemplo fictício (marketing)
          </button>
        </div>

        {result && (
          <section aria-labelledby="res" className="space-y-6 rounded-lg border bg-card p-6">
            <h2 id="res" className="font-display text-2xl font-bold">Resultado da análise textual</h2>
            {result.keywords.length === 0 ? (
              <p>Não encontramos termos relevantes na vaga. Verifique se o texto foi colado corretamente.</p>
            ) : (
              <>
                <div>
                  <p className="text-4xl font-bold">≈ {result.percent}%</p>
                  <p className="text-sm text-muted-foreground">
                    Cálculo: {result.found.length} de {result.keywords.length} termos distintos da vaga aparecem no currículo
                    (comparação sem acentos e sem diferenciar maiúsculas, ignorando palavras comuns e termos com menos de 3 letras).
                    É uma estimativa aproximada — não é pontuação de ATS real, avaliação oficial nem garantia de entrevista.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">Encontradas ({result.found.length})</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">{result.found.map((k) => <li key={k.term} className="chip-found">{k.label}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Ausentes ({result.missing.length})</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">{result.missing.map((k) => <li key={k.term} className="chip-missing">{k.label}</li>)}</ul>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Limitações: podem ocorrer falsos positivos (a palavra aparece em outro contexto) e sinônimos não são detectados
                  (ex.: “mídia paga” x “tráfego pago”, “SEO” x “otimização para buscadores”). Termos compostos são avaliados palavra por palavra.
                </p>
                {result.missing.length > 0 && (
                  <fieldset className="space-y-3">
                    <legend className="font-semibold">Quais termos ausentes você realmente possui?</legend>
                    <p className="text-sm text-muted-foreground">Marque apenas o que for verdade e descreva onde/como usou. Termos não marcados nunca entram no currículo.</p>
                    {result.missing.map((k) => {
                      const on = confirmed[k.term] !== undefined;
                      return (
                        <div key={k.term} className="rounded border p-3">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="size-4 accent-primary" checked={on} onChange={(e) => toggle(k.term, e.target.checked)} />
                            Tenho experiência real com “{k.label}”
                          </label>
                          {on && (
                            <label className="mt-2 block text-sm">
                              Comprovação (onde, quando, como)
                              <input className="input mt-1" value={confirmed[k.term]} onChange={(e) => setEvidence(k.term, e.target.value)} placeholder="Ex.: usei em campanhas da empresa X em 2023" />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </fieldset>
                )}
              </>
            )}
          </section>
        )}

        {result && (
          <section aria-labelledby="out" className="space-y-4 rounded-lg border bg-card p-6">
            <h2 id="out" className="font-display text-2xl font-bold">Currículo ajustado (editável)</h2>
            {!structured && (
              <p role="status" className="rounded bg-highlight p-3 text-sm">Não identificamos seções de forma confiável; o texto original foi preservado. Edite livremente.</p>
            )}
            <div className="rounded border p-3 text-sm">
              <h3 className="font-semibold">Recomendações para você confirmar</h3>
              <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                <li>Confira se cargos, empresas e datas estão corretos e completos.</li>
                <li>Use títulos de seção simples (Resumo, Experiência, Formação, Competências).</li>
                <li>Se tiver resultados reais (números), acrescente-os você mesmo — a ferramenta não cria dados.</li>
                <li>Revise contato e dados pessoais; inclua apenas o necessário.</li>
              </ul>
            </div>
            <label htmlFor="output" className="block font-semibold">Texto final</label>
            <textarea id="output" className="input min-h-96 font-mono text-sm" value={output} onChange={(e) => setOutput(e.target.value)} />
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary" onClick={copy}>Copiar</button>
              <button className="btn-outline" onClick={async () => { await exportPdf(output); setStatus("PDF gerado."); }}>Exportar PDF</button>
            </div>
            <p className="text-xs text-muted-foreground">Nenhuma ferramenta garante compatibilidade com todos os sistemas ATS.</p>
          </section>
        )}
      </main>
    </div>
  );
}

function Field({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">{label}</label>
      <textarea id={id} className="input mt-2 min-h-72" value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}
