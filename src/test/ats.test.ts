import { describe, expect, it } from "vitest";
import { analyze, buildResume, EXAMPLE_JOB, EXAMPLE_RESUME } from "@/lib/ats";
import { buildPdf } from "@/lib/pdf";

describe("análise", () => {
  it("ignora acentos e caixa", () => {
    const a = analyze("Comunicação e Gestão", "comunicacao, GESTAO");
    expect(a.found.map((k) => k.term).sort()).toEqual(["comunicacao", "gestao"]);
    expect(a.percent).toBe(100);
  });
  it("vaga sem correspondência dá 0%", () => {
    const a = analyze("Python Kubernetes", "Canva redação");
    expect(a.found).toHaveLength(0);
    expect(a.percent).toBe(0);
  });
  it("vaga vazia não gera termos", () => {
    expect(analyze("", "x").keywords).toHaveLength(0);
  });
  it("exemplo calcula ausentes", () => {
    const a = analyze(EXAMPLE_JOB, EXAMPLE_RESUME);
    expect(a.missing.map((k) => k.term)).toContain("seo");
    expect(a.found.map((k) => k.term)).toContain("excel");
  });
});

describe("currículo ajustado", () => {
  it("não inclui termos ausentes não confirmados e preserva o texto", () => {
    const out = buildResume(EXAMPLE_RESUME, []).text;
    expect(normalizeOut(out)).not.toContain("seo");
    for (const w of ["Empresa Fictícia Ltda.", "2021 – atual", "Universidade Imaginária (2020)", "Maria Exemplo da Silva"]) expect(out).toContain(w);
  });
  it("inclui só termos confirmados com comprovação", () => {
    const out = buildResume(EXAMPLE_RESUME, [{ label: "seo", evidence: "blog da empresa em 2023" }]).text;
    expect(out).toContain("- seo: blog da empresa em 2023");
  });
  it("sem seções reconhecidas preserva o original", () => {
    const r = buildResume("linha um\nlinha dois", []);
    expect(r.structured).toBe(false);
    expect(r.text).toBe("linha um\nlinha dois");
  });
});

describe("pdf", () => {
  it("pagina currículo longo com acentos", async () => {
    const long = Array.from({ length: 300 }, (_, i) => `Experiência ${i}: ação, gestão, comunicação — São Paulo`).join("\n");
    const doc = await buildPdf("EXPERIÊNCIA PROFISSIONAL\n" + long);
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
  });
});

function normalizeOut(s: string) { return s.toLowerCase(); }
