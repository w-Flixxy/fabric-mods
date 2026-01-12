const modsListEl = document.getElementById("mods-list");
const downloadSelectedBtn = document.getElementById("download-selected");
const downloadAllBtn = document.getElementById("download-all");

let mods = [];
let selected = new Set();

fetch("mods.json")
  .then(res => res.json())
  .then(data => {
    mods = data;
    render();
  });

function render() {
  modsListEl.innerHTML = "";

  mods.forEach(mod => {
    const row = document.createElement("div");
    row.className = "mod-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selected.add(mod);
        row.classList.add("selected");
      } else {
        selected.delete(mod);
        row.classList.remove("selected");
      }
      downloadSelectedBtn.disabled = selected.size === 0;
    });

    const name = document.createElement("div");
    name.className = "mod-name";
    name.textContent = mod.name;

    const link = document.createElement("a");
    link.href = mod.url;
    link.download = mod.name;
    link.textContent = "Download";

    row.appendChild(checkbox);
    row.appendChild(name);
    row.appendChild(link);

    modsListEl.appendChild(row);
  });
}

downloadSelectedBtn.addEventListener("click", () => {
  zipAndDownload([...selected], "selected-mods.zip");
});

downloadAllBtn.addEventListener("click", () => {
  zipAndDownload(mods, "all-mods.zip");
});

async function zipAndDownload(modList, zipName) {
  const zip = new JSZip();

  for (const mod of modList) {
    const response = await fetch(mod.url);
    const blob = await response.blob();
    zip.file(mod.name, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}
