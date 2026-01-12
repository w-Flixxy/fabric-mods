const list = document.getElementById("mods-list");
const btnSelected = document.getElementById("download-selected");
const btnAll = document.getElementById("download-all");
const btnSelectAll = document.getElementById("select-all"); // NEW

let mods = [];
let selected = new Set();
let allSelected = false; // track toggle state

// Load mods.json
fetch("/mods.json")
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

      // Update 'select all' button text
      allSelected = selected.size === mods.length;
      btnSelectAll.textContent = allSelected ? "Deselect All" : "Select All";
    };

    const name = document.createElement("div");
    name.className = "mod-name";
    name.textContent = mod.name;

    const link = document.createElement("a");
    link.href = "/" + mod.url;
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
      const response = await fetch("/" + mod.url);
      if (!response.ok) continue;
      const blob = await response.blob();
      zip.file(mod.name, blob);
    } catch (err) {
      console.error("Error fetching", mod.url, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}

// Select/Deselect all
btnSelectAll.addEventListener("click", () => {
  allSelected = !allSelected;
  selected.clear();

  list.querySelectorAll(".mod-row").forEach(row => {
    const checkbox = row.querySelector("input[type=checkbox]");
    checkbox.checked = allSelected;
    row.classList.toggle("selected", allSelected);

    // Add/remove mods from selected set
    const modName = row.querySelector(".mod-name").textContent;
    if (allSelected) {
      const modObj = mods.find(m => m.name === modName);
      selected.add(modObj);
    }
  });

  btnSelected.disabled = !allSelected;
  btnSelectAll.textContent = allSelected ? "Deselect All" : "Select All";
});