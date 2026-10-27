import { describe, expect, it } from "vitest";
import { buildPdf } from "@/lib/pdf";

describe("PDF typography", () => {
  it("embeds Unicode fonts and a text extraction map for Portuguese", async () => {
    const doc = await buildPdf("EXPERIÊNCIA\nJoão: ação, gestão, comunicação — São Paulo");
    const pdf = doc.output();
    expect(doc.getFont().encoding).toBe("Identity-H");
    expect(pdf).toContain("/FontFile2");
    expect(pdf).toContain("/ToUnicode");
    expect(pdf).toMatch(/\/BaseFont\s+\/ResumeSans/);
    expect(doc.getCharSpace()).toBe(0);
  });

  it("wraps using the embedded font without exceeding the printable width", async () => {
    const doc = await buildPdf("COMPETÊNCIAS\nGestão e comunicação");
    const width = doc.internal.pageSize.getWidth() - 112;
    for (const style of ["normal", "bold"]) {
      doc.setFont("ResumeSans", style);
      const lines = doc.splitTextToSize("Comunicação, ação e análise de campanhas. ".repeat(40), width);
      expect(lines.length).toBeGreaterThan(1);
      for (const line of lines) expect(doc.getTextWidth(line)).toBeLessThanOrEqual(width);
    }
  });
});