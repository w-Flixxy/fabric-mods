const list = document.getElementById("mods-list");
const btnSelected = document.getElementById("download-selected");
const btnAll = document.getElementById("download-all");

let mods = [];
let selected = new Set();

// Load mods.json
fetch("/mods.json")  // absolute path
  .then(r => r.json())
  .then(data => {
    mods = data;
    render();
  })
  .catch(err => console.error("Failed to load mods.json:", err));

function render() {
  list.innerHTML = "";

  mods.forEach(mod => {
    const row = document.createElement("div");
    row.className = "mod-row";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.onchange = () => {
      if (cb.checked) selected.add(mod);
      else selected.delete(mod);
      row.classList.toggle("selected", cb.checked);
      btnSelected.disabled = selected.size === 0;
    };

    const name = document.createElement("div");
    name.className = "mod-name";
    name.textContent = mod.name;

    const link = document.createElement("a");
    link.href = "/" + mod.url;  // absolute path
    link.download = mod.name;
    link.textContent = "Download";

    row.append(cb, name, link);
    list.appendChild(row);
  });
}

// Download selected mods
btnSelected.addEventListener("click", async () => {
  if (selected.size === 0) return;
  await zipAndDownload([...selected], "selected-mods.zip");
});

// Download all mods
btnAll.addEventListener("click", async () => {
  await zipAndDownload(mods, "all-mods.zip");
});

// ZIP generation
async function zipAndDownload(modList, zipName) {
  if (modList.length === 0) return;

  const zip = new JSZip();

  for (const mod of modList) {
    try {
      const response = await fetch("/" + mod.url); // absolute path
      if (!response.ok) {
        console.error("Failed to fetch", mod.url);
        continue;
      }
      const blob = await response.blob();
      zip.file(mod.name, blob);
    } catch (err) {
      console.error("Error fetching", mod.url, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}