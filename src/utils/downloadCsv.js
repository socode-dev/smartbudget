export const downloadCsv = (csvData, filename) => {
  const blob = new Blob(["\uFEFF", csvData], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const temporaryLink = document.createElement("a");

  temporaryLink.href = url;
  temporaryLink.download = filename;
  temporaryLink.style.visibility = "hidden";
  document.body.appendChild(temporaryLink);
  temporaryLink.click();
  document.body.removeChild(temporaryLink);
  URL.revokeObjectURL(url);
};
