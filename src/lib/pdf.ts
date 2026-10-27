// PDF local de uma coluna, com fontes Unicode incorporadas e texto selecionável.
export async function exportPdf(text: string, filename = "curriculo-ats.pdf") {
  const doc = await buildPdf(text);
  doc.save(filename);
}

export async function buildPdf(text: string) {
  const [{ jsPDF }, { regularFont, boldFont }] = await Promise.all([
    import("jspdf"),
    import("./pdf-fonts"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", regularFont);
  doc.addFileToVFS("DejaVuSans-Bold.ttf", boldFont);
  doc.addFont("DejaVuSans.ttf", "ResumeSans", "normal", "Identity-H");
  doc.addFont("DejaVuSans-Bold.ttf", "ResumeSans", "bold", "Identity-H");
  const margin = 56;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const bottom = doc.internal.pageSize.getHeight() - margin;
  const fontSize = 11;
  const lh = fontSize * 1.45;
  let y = margin;
  doc.setFontSize(fontSize);
  doc.setCharSpace(0);
  doc.setLineHeightFactor(1.45);
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const isHeader = raw.trim() !== "" && raw === raw.toUpperCase() && /\p{L}/u.test(raw) && raw.length < 70;
    // Measure and draw with the same embedded font, size and natural spacing.
    doc.setFont("ResumeSans", isHeader ? "bold" : "normal");
    const parts = raw.trim() === "" ? [""] : (doc.splitTextToSize(raw, width, {
      fontSize,
      charSpace: 0,
      doKerning: false,
    }) as string[]);
    for (const p of parts) {
      if (y + lh > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(p, margin, y, { align: "left", charSpace: 0, horizontalScale: 1 });
      y += lh;
    }
  }
  return doc;
}
