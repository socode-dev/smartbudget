export const pdfColors = {
  border: [218, 226, 236],
  headerText: [255, 255, 255],
  muted: [88, 112, 141],
  navy: [16, 47, 91],
  rowAlternate: [246, 249, 252],
  text: [31, 49, 72],
  blue: [11, 86, 184],
};

const svgToPngDataUrl = async (svg) => {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 360;
    canvas.getContext("2d").drawImage(image, 0, 0, 1200, 360);

    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const addPdfHeader = async (
  doc,
  title,
  description,
  fontName = "helvetica",
) => {
  let logoAdded = false;

  try {
    const response = await fetch("/assets/vydra-logo-monochrome.svg");

    if (response.ok) {
      const logoSvg = await response.text();
      const logoPng = await svgToPngDataUrl(logoSvg);
      doc.addImage(logoPng, "PNG", 15, 8, 42, 13);
      logoAdded = true;
    }
  } catch {
    // The text fallback below keeps the PDF usable if the logo cannot load.
  }

  if (!logoAdded) {
    doc.setTextColor(...pdfColors.navy);
    doc.setFont(fontName, "bold");
    doc.setFontSize(16);
    doc.text("Vydra", 15, 17);
  }

  doc.setTextColor(...pdfColors.navy);
  doc.setFont(fontName, "bold");
  doc.setFontSize(18);
  doc.text(title, 65, 16);

  doc.setTextColor(...pdfColors.muted);
  doc.setFont(fontName, "normal");
  doc.setFontSize(9);
  doc.text(description, 65, 22);

  doc.setDrawColor(...pdfColors.border);
  doc.setLineWidth(0.35);
  doc.line(15, 29, 195, 29);
};
