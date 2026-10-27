// Gera PDF de uma coluna, texto selecionável, sem gráficos. Fontes padrão (WinAnsi) suportam acentos do português.
export async function exportPdf(text: string, filename = "curriculo-ats.pdf") {
  const doc = await buildPdf(text);
  doc.save(filename);
}

export async function buildPdf(text: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - margin;
  const lh = 15;
  let y = margin;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  for (const raw of text.split("\n")) {
    const isHeader = raw.trim() !== "" && raw === raw.toUpperCase() && /\p{L}/u.test(raw) && raw.length < 70;
    doc.setFont("helvetica", isHeader ? "bold" : "normal");
    const parts = raw.trim() === "" ? [""] : (doc.splitTextToSize(raw, width) as string[]);
    for (const p of parts) {
      if (y + lh > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(p, margin, y);
      y += lh;
    }
  }
  return doc;
}
