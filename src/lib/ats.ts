// Análise textual local (regras determinísticas). Não é IA nem um ATS real.

const STOPWORDS = new Set(
  `a o as os um uma uns umas de do da dos das no na nos nas em por para pra com sem sob sobre entre ate e ou mas que se ao aos como mais menos muito muita muitos muitas seu sua seus suas nosso nossa nossos nossas voce voces ele ela eles elas isso isto esse essa este esta esses essas aquele aquela ser estar ter fazer sera serao sao foi era sera tem tera ha pelo pela pelos pelas cada todo toda todos todas outro outra outros outras ja nao sim tambem bem onde quando qual quais quem area vaga vagas empresa empresas buscamos procuramos busca procura profissional pessoa candidato candidata requisitos requisito desejavel desejaveis diferencial diferenciais obrigatorio atividades responsabilidades principais beneficios local horario experiencia conhecimento conhecimentos ano anos dia dias mes meses forma junto time equipe nivel trabalho trabalhar atuar atuacao vai sua seu nossa the and for with you our are will from this that have has job role etc dos`.split(
    /\s+/,
  ),
);

export function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function tokenize(text: string): string[] {
  return (normalize(text).match(/[a-z0-9][a-z0-9+#]*/g) ?? []).filter(
    (t) => t.length >= 3 && !STOPWORDS.has(t) && !/^\d+$/.test(t),
  );
}

export interface Keyword {
  term: string; // forma normalizada
  label: string; // primeira forma original vista na vaga
  count: number; // ocorrências na vaga
}

export function extractKeywords(job: string): Keyword[] {
  const map = new Map<string, Keyword>();
  const raw = job.match(/[\p{L}0-9][\p{L}0-9+#]*/gu) ?? [];
  for (const word of raw) {
    const [term] = tokenize(word);
    if (!term) continue;
    const k = map.get(term);
    if (k) k.count++;
    else map.set(term, { term, label: word.toLowerCase(), count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
}

export interface Analysis {
  keywords: Keyword[];
  found: Keyword[];
  missing: Keyword[];
  percent: number;
}

export function analyze(job: string, resume: string): Analysis {
  const keywords = extractKeywords(job);
  const resumeTokens = new Set(tokenize(resume));
  const found = keywords.filter((k) => resumeTokens.has(k.term));
  const missing = keywords.filter((k) => !resumeTokens.has(k.term));
  const percent = keywords.length ? Math.round((found.length / keywords.length) * 100) : 0;
  return { keywords, found, missing, percent };
}

const SECTION_PATTERNS: [RegExp, string][] = [
  [/^(resumo|perfil|objetivo|sobre( mim)?|resumo profissional)$/, "RESUMO"],
  [/^(experiencias?|experiencia profissional|historico profissional)$/, "EXPERIÊNCIA PROFISSIONAL"],
  [/^(formacao|formacao academica|educacao|escolaridade)$/, "FORMAÇÃO"],
  [/^(cursos?|certificacoes?|cursos e certificacoes|certificados?)$/, "CURSOS E CERTIFICAÇÕES"],
  [/^(competencias|habilidades|skills|competencias tecnicas|ferramentas)$/, "COMPETÊNCIAS"],
  [/^(idiomas?|linguas?)$/, "IDIOMAS"],
  [/^(contato|dados pessoais)$/, "CONTATO"],
  [/^(projetos?|portfolio)$/, "PROJETOS"],
];

function sectionOf(line: string): string | null {
  const n = normalize(line).replace(/[:\-–—*#•|]/g, "").trim();
  if (!n || n.length > 40) return null;
  for (const [re, name] of SECTION_PATTERNS) if (re.test(n)) return name;
  return null;
}

export interface Confirmed {
  label: string;
  evidence: string;
}

export interface BuiltResume {
  text: string;
  structured: boolean;
}

/**
 * Organiza o currículo em texto linear. Mantém TODAS as linhas originais
 * (apenas remove marcadores gráficos e espaços extras). Só adiciona termos
 * explicitamente confirmados pelo usuário, com a comprovação escrita por ele.
 */
export function buildResume(resume: string, confirmed: Confirmed[]): BuiltResume {
  const lines = resume.replace(/\r/g, "").split("\n").map((l) =>
    l.replace(/^[\s•●▪■◆►✓✔\-*]+/, (m) => (m.trim() ? "- " : "")).replace(/[ \t]+/g, " ").trimEnd(),
  );
  const headers = lines.filter((l) => sectionOf(l)).length;
  const structured = headers >= 2;
  let out: string[];
  if (structured) {
    out = lines.map((l) => sectionOf(l) ?? l);
  } else {
    out = lines;
  }
  let text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const valid = confirmed.filter((c) => c.label.trim());
  if (valid.length) {
    text +=
      "\n\nCOMPETÊNCIAS ADICIONAIS (CONFIRMADAS PELO CANDIDATO)\n" +
      valid.map((c) => `- ${c.label.trim()}${c.evidence.trim() ? `: ${c.evidence.trim()}` : ""}`).join("\n");
  }
  return { text, structured };
}

export const EXAMPLE_JOB = `[EXEMPLO FICTÍCIO] Analista de Marketing Digital Pleno
Buscamos profissional para planejar campanhas de mídia paga no Google Ads e Meta Ads, analisar métricas no Google Analytics, produzir relatórios de desempenho e otimizar SEO do site. Desejável experiência com e-mail marketing, CRM, automação de marketing e gestão de redes sociais. Conhecimento em Excel avançado e comunicação clara.`;

export const EXAMPLE_RESUME = `[EXEMPLO FICTÍCIO] Maria Exemplo da Silva
maria.exemplo@email-ficticio.com | São Paulo - SP

Resumo
Profissional de marketing com foco em redes sociais e criação de conteúdo.

Experiência
Assistente de Marketing — Empresa Fictícia Ltda. (2021 – atual)
• Gestão de redes sociais e calendário editorial
• Criação de campanhas no Meta Ads
• Elaboração de relatórios mensais em Excel

Formação
Bacharelado em Comunicação Social — Universidade Imaginária (2020)

Competências
Canva, Meta Ads, Excel, redação publicitária, comunicação`;
