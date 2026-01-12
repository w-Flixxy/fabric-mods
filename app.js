const list = document.getElementById("mods-list");
const btnSelected = document.getElementById("download-selected");
const btnAll = document.getElementById("download-all");

let mods = [];
let selected = new Set();

fetch("mods.json")
  .then(r => r.json())
  .then(data => {
    mods = data;
    render();
  });

function render() {
  list.innerHTML = "";

  mods.forEach(mod => {
    const row = document.createElement("div");
    row.className = "mod-row";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.onchange = () => {
      cb.checked ? selected.add(mod) : selected.delete(mod);
      row.classList.toggle("selected", cb.checked);
      btnSelected.disabled = selected.size === 0;
    };

    const name = document.createElement("div");
    name.className = "mod-name";
    name.textContent = mod.name;

    const link = document.createElement("a");
    link.href = mod.url;
    link.textContent = "Download";

    row.append(cb, name, link);
    list.appendChild(row);
  });
}

btnSelected.onclick = () => zip([...selected], "selected-mods.zip");
btnAll.onclick = () => zip(mods, "all-mods.zip");

async function zip(items, filename) {
  const zip = new JSZip();
  for (const m of items) {
    const r = await fetch(m.url);
    zip.file(m.name, await r.blob());
  }
  saveAs(await zip.generateAsync({ type: "blob" }), filename);
}
