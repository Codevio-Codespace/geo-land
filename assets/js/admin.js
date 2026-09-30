/* ==========================================================================
   Geo&Land — Admin panel logic
   Two modes, chosen automatically:
     · Supabase mode — email/password login, projects + images in Supabase
       (configured via .env, see SUPABASE-SETUP.md)
     · Local mode    — passcode gate, projects in this browser's localStorage
       (used automatically until .env is filled in)
   ========================================================================== */

(function () {
  "use strict";

  var store = window.GeoLandStore;

  /* Local-mode access key — change if you like (Supabase mode uses real
     Supabase Auth users instead). */
  var ACCESS_KEY = "geoland-admin";
  var SESSION_KEY = "geoland.admin.session";

  var dbMode = store.dbMode();

  /* ---------- element cache ---------- */
  var gate = document.getElementById("gate");
  var admin = document.getElementById("admin");
  var gateForm = document.getElementById("gateForm");
  var gateEmailWrap = document.getElementById("gateEmailWrap");
  var gateEmail = document.getElementById("gateEmail");
  var gateKey = document.getElementById("gateKey");
  var gateKeyLabel = document.getElementById("gateKeyLabel");
  var gateSubmit = document.getElementById("gateSubmit");
  var gateError = document.getElementById("gateError");
  var gateNote = document.getElementById("gateNote");
  var modeBanner = document.getElementById("modeBanner");

  var listEl = document.getElementById("adminList");
  var form = document.getElementById("projectForm");
  var previewStage = document.getElementById("previewStage");
  var previewCat = document.getElementById("previewCat");
  var formMsg = document.getElementById("formMsg");
  var editorEyebrow = document.getElementById("editorEyebrow");
  var editorTitle = document.getElementById("editorTitle");
  var cancelBtn = document.getElementById("cancelEdit");
  var storageText = document.getElementById("storageText");
  var stateText = document.getElementById("stateText");

  var imagePreview = document.getElementById("imagePreview");
  var imageFile = document.getElementById("imageFile");
  var imageLibrary = document.getElementById("imageLibrary");
  var imagePath = document.getElementById("imagePath");

  var resetBtn = document.getElementById("resetData");

  /* ---------- state ---------- */
  var projects = [];
  var editingIndex = -1;
  var draftImage = "";
  var unlocked = false;

  /* ==================================================================
     Gate
  ================================================================== */
  function setGateMode() {
    if (dbMode) {
      gateEmailWrap.hidden = false;
      gateKeyLabel.textContent = "Password";
      gateSubmit.textContent = "Sign in";
      gateNote.innerHTML =
        "Secure sign-in with your Supabase account.<br>" +
        "Create admin users in Supabase → Authentication → Users.";
    } else {
      gateEmailWrap.hidden = true;
      gateKeyLabel.textContent = "Access key";
      gateSubmit.textContent = "Unlock";
      gateNote.innerHTML =
        "Supabase is not configured — running in local mode (data stays in this browser).<br>" +
        "Fill in <strong>.env</strong> and run <strong>node server.js</strong> to connect the database.<br>" +
        "Default key: <strong>geoland-admin</strong>";
    }
  }

  function showGate() {
    unlocked = false;
    gate.hidden = false;
    admin.hidden = true;
    setGateMode();
    gateError.hidden = true;
    gateKey.value = "";
    try { gateKey.focus(); } catch (e) {}
  }

  function enterPanel() {
    unlocked = true;
    gate.hidden = true;
    admin.hidden = false;
    init();
  }

  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    gateError.hidden = true;

    if (dbMode) {
      var email = gateEmail.value.trim();
      var password = gateKey.value;
      if (!email || !password) {
        gateError.textContent = "Enter your admin email and password.";
        gateError.hidden = false;
        return;
      }
      gateSubmit.disabled = true;
      gateSubmit.textContent = "Signing in…";
      store.signIn(email, password).then(function () {
        gateSubmit.disabled = false;
        gateSubmit.textContent = "Sign in";
        enterPanel();
      }).catch(function (err) {
        gateSubmit.disabled = false;
        gateSubmit.textContent = "Sign in";
        gateError.textContent = "Sign-in failed: " + (err && err.message ? err.message : "check your credentials");
        gateError.hidden = false;
      });
    } else {
      if (gateKey.value === ACCESS_KEY) {
        try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
        enterPanel();
      } else {
        gateError.textContent = "Incorrect access key. Try again.";
        gateError.hidden = false;
        gateKey.value = "";
        gateKey.focus();
      }
    }
  });

  document.getElementById("signOut").addEventListener("click", function () {
    if (dbMode) {
      store.signOutUser().then(function () { window.location.reload(); });
    } else {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
      window.location.reload();
    }
  });

  /* ==================================================================
     Toast
  ================================================================== */
  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "admin-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  /* ==================================================================
     Data loading (Supabase or local)
  ================================================================== */
  function setListMessage(text) {
    listEl.innerHTML = '<div class="admin-empty">' + store.esc(text) + "</div>";
  }

  function loadData() {
    if (dbMode) {
      setListMessage("Loading from database…");
      store.listAll().then(function (list) {
        projects = list;
        editingIndex = -1;
        renderList();
        updateStatus("Connected to Supabase");
      }).catch(function (err) {
        setListMessage("Could not load projects — " + (err && err.message ? err.message : "connection error") + " · press Reload");
        updateStatus("Connection error");
      });
    } else {
      projects = store.load();
      if (projects === null) projects = store.defaults();
      renderList();
      updateStatus();
    }
  }

  function updateStatus(note) {
    if (dbMode) {
      storageText.textContent = "Mode: Supabase database";
      stateText.textContent = "Status: " + (note || "connected") + " · " + projects.length + " projects";
    } else {
      var kb = Math.round(store.usageBytes() / 1024);
      storageText.textContent = "Mode: local (this browser only)" + (store.load() ? " · " + kb + " KB used" : "");
      stateText.textContent = "State: " + (store.load() ? "local edits" : "published defaults");
    }
  }

  /* ==================================================================
     List rendering
  ================================================================== */
  function renderList() {
    if (!projects.length) {
      listEl.innerHTML = '<div class="admin-empty">No projects — add the first one</div>';
      return;
    }

    listEl.innerHTML = projects
      .map(function (p, i) {
        var cats = (p.categories || [])
          .filter(function (c) { return store.CATEGORY_LABELS[c]; })
          .map(function (c) { return "<span>" + store.CATEGORY_LABELS[c] + "</span>"; })
          .join("");
        var featured = p.featured ? '<span class="is-featured">Featured</span>' : "";
        var draft = p.published === false ? '<span class="is-draft">Draft</span>' : "";
        var thumb = p.image
          ? '<img src="' + store.esc(p.image) + '" alt="">'
          : "<span>NO IMAGE</span>";

        return (
          '<div class="admin-item' + (i === editingIndex ? " is-editing" : "") + '" data-index="' + i + '">' +
          '<div class="admin-item__thumb">' + thumb + "</div>" +
          '<div class="admin-item__info">' +
          '<div class="admin-item__title">' + store.esc(p.title) + "</div>" +
          '<div class="admin-item__cats">' + featured + draft + cats + "</div>" +
          "</div>" +
          '<div class="admin-item__actions">' +
          '<button class="icon-btn" type="button" data-act="up" title="Move up" aria-label="Move up">↑</button>' +
          '<button class="icon-btn" type="button" data-act="down" title="Move down" aria-label="Move down">↓</button>' +
          '<button class="icon-btn" type="button" data-act="edit" title="Edit" aria-label="Edit">✎</button>' +
          '<button class="icon-btn icon-btn--danger" type="button" data-act="del" title="Delete" aria-label="Delete">✕</button>' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var row = btn.closest(".admin-item");
    var i = parseInt(row.getAttribute("data-index"), 10);
    var act = btn.getAttribute("data-act");

    if (act === "up" && i > 0) {
      move(i, i - 1);
    } else if (act === "down" && i < projects.length - 1) {
      move(i, i + 1);
    } else if (act === "edit") {
      loadIntoForm(i);
    } else if (act === "del") {
      if (!window.confirm('Delete project "' + projects[i].title + '"?')) return;
      removeAt(i);
    }
  });

  function move(from, to) {
    if (dbMode) {
      store.swapOrder(projects[from], projects[to]).then(function () {
        loadData();
      }).catch(function (err) {
        toast("Reorder failed: " + (err.message || "error"));
      });
    } else {
      var tmp = projects[to];
      projects[to] = projects[from];
      projects[from] = tmp;
      if (editingIndex === from) editingIndex = to;
      else if (editingIndex === to) editingIndex = from;
      persistLocal();
      renderList();
    }
  }

  function removeAt(i) {
    if (dbMode) {
      store.deleteProject(projects[i].id).then(function () {
        toast("Project deleted");
        if (editingIndex === i) resetForm();
        loadData();
      }).catch(function (err) {
        toast("Delete failed: " + (err.message || "error"));
      });
    } else {
      projects.splice(i, 1);
      if (editingIndex === i) resetForm();
      else if (editingIndex > i) editingIndex--;
      persistLocal();
      renderList();
      toast("Project deleted");
    }
  }

  function persistLocal() {
    try {
      store.save(projects);
      updateStatus();
      return true;
    } catch (e) {
      toast("Storage full — use image paths instead of large uploads");
      return false;
    }
  }

  /* ==================================================================
     Form <-> project
  ================================================================== */
  function catCheckboxes() {
    return document.querySelectorAll("#p-cats input[type=checkbox]");
  }

  function setCategories(cats) {
    catCheckboxes().forEach(function (cb) {
      cb.checked = (cats || []).indexOf(cb.value) !== -1;
    });
  }

  function checkedCategories() {
    var out = [];
    catCheckboxes().forEach(function (cb) {
      if (cb.checked) out.push(cb.value);
    });
    return out;
  }

  function loadIntoForm(i) {
    var p = projects[i];
    editingIndex = i;
    document.getElementById("p-title").value = p.title || "";
    setCategories(p.categories);
    document.getElementById("p-desc").value = p.description || "";
    document.getElementById("p-meta1").value = (p.meta && p.meta[0]) || "";
    document.getElementById("p-meta2").value = (p.meta && p.meta[1]) || "";
    document.getElementById("p-badge").value = p.badge || "";
    document.getElementById("p-featured").checked = !!p.featured;
    document.getElementById("p-published").checked = p.published !== false;

    draftImage = p.image || "";
    imageLibrary.value = draftImage.indexOf("assets/img/") === 0 ? draftImage : "";
    imagePath.value = draftImage.indexOf("assets/img/") !== 0 && draftImage.indexOf("data:") !== 0 && draftImage.indexOf("http") !== 0 ? draftImage : "";
    if (draftImage.indexOf("http") === 0) imagePath.value = draftImage;

    editorEyebrow.textContent = "Editing — " + (i + 1) + " / " + projects.length;
    editorTitle.textContent = "Update project";
    cancelBtn.hidden = false;

    updateImagePreview();
    updatePreview();
    renderList();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    editingIndex = -1;
    form.reset();
    setCategories([]);
    document.getElementById("p-published").checked = true;
    draftImage = "";
    imageLibrary.value = "";
    imagePath.value = "";
    editorEyebrow.textContent = "New project";
    editorTitle.textContent = "Add to the grid";
    cancelBtn.hidden = true;
    hideFormMsg();
    updateImagePreview();
    updatePreview();
    renderList();
  }

  cancelBtn.addEventListener("click", resetForm);

  /* ==================================================================
     Image handling
  ================================================================== */
  function updateImagePreview() {
    if (draftImage) {
      imagePreview.innerHTML = '<img src="' + store.esc(draftImage) + '" alt="">';
      var img = imagePreview.querySelector("img");
      img.addEventListener("error", function () {
        imagePreview.innerHTML = '<span class="mono">Image not found</span>';
      });
    } else {
      imagePreview.innerHTML = '<span class="mono">No image</span>';
    }
  }

  /* Compress to max 1400px JPEG; provides both dataURL (local mode) and blob (upload) */
  function compressImage(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var MAX = 1400;
        var scale = Math.min(1, MAX / img.width);
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        canvas.toBlob(function (blob) {
          done(dataUrl, blob);
        }, "image/jpeg", 0.82);
      };
      img.onerror = function () {
        toast("Could not read that image file");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  imageFile.addEventListener("change", function () {
    var file = imageFile.files && imageFile.files[0];
    if (!file) return;

    imagePreview.innerHTML = '<span class="mono">Processing…</span>';

    compressImage(file, function (dataUrl, blob) {
      if (dbMode) {
        imagePreview.innerHTML = '<span class="mono">Uploading…</span>';
        store.uploadImage(blob).then(function (url) {
          draftImage = url;
          imageLibrary.value = "";
          imagePath.value = url;
          updateImagePreview();
          updatePreview();
          toast("Image uploaded to Supabase Storage");
        }).catch(function (err) {
          updateImagePreview();
          toast("Upload failed: " + (err.message || "error"));
        });
      } else {
        draftImage = dataUrl;
        imageLibrary.value = "";
        imagePath.value = "";
        updateImagePreview();
        updatePreview();
        toast("Image attached (stored in this browser)");
      }
    });
  });

  imageLibrary.addEventListener("change", function () {
    if (!imageLibrary.value) return;
    draftImage = imageLibrary.value;
    imagePath.value = "";
    imageFile.value = "";
    updateImagePreview();
    updatePreview();
  });

  imagePath.addEventListener("input", function () {
    draftImage = imagePath.value.trim();
    if (draftImage) {
      imageLibrary.value = "";
      imageFile.value = "";
    }
    updateImagePreview();
    updatePreview();
  });

  /* ==================================================================
     Live preview
  ================================================================== */
  function draftProject() {
    var meta = [
      document.getElementById("p-meta1").value.trim(),
      document.getElementById("p-meta2").value.trim()
    ].filter(Boolean);

    return {
      title: document.getElementById("p-title").value.trim() || "(Untitled project)",
      categories: checkedCategories(),
      description: document.getElementById("p-desc").value.trim() || "Short description of the project will appear here.",
      meta: meta,
      image: draftImage,
      alt: document.getElementById("p-title").value.trim(),
      badge: document.getElementById("p-badge").value.trim(),
      featured: document.getElementById("p-featured").checked,
      published: document.getElementById("p-published").checked
    };
  }

  function updatePreview() {
    var p = draftProject();
    previewStage.innerHTML = store.cardHTML(p);
    previewCat.textContent = p.featured ? "Large card" : "Standard card";
  }

  form.addEventListener("input", updatePreview);
  form.addEventListener("change", updatePreview);

  /* ==================================================================
     Save
  ================================================================== */
  function hideFormMsg() {
    formMsg.hidden = true;
    formMsg.className = "admin-form__msg mono";
  }

  function showFormMsg(text, ok) {
    formMsg.textContent = text;
    formMsg.className = "admin-form__msg mono " + (ok ? "is-ok" : "is-error");
    formMsg.hidden = false;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var title = document.getElementById("p-title");
    var desc = document.getElementById("p-desc");
    var valid = true;

    if (!title.value.trim()) { title.classList.add("ainput--invalid"); valid = false; }
    else title.classList.remove("ainput--invalid");

    if (!desc.value.trim()) { desc.classList.add("ainput--invalid"); valid = false; }
    else desc.classList.remove("ainput--invalid");

    var cats = checkedCategories();
    if (!cats.length) valid = false;

    if (!valid) {
      showFormMsg("Title, description and at least one category are required.", false);
      return;
    }

    var d = draftProject();
    var saveBtn = document.getElementById("saveProject");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    function onDone(message) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save project";
      toast(message);
      resetForm();
      showFormMsg(message + " Open the site's Projects section to see it live.", true);
    }

    function onFail(err) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save project";
      showFormMsg("Save failed: " + (err && err.message ? err.message : "error"), false);
    }

    if (dbMode) {
      var promise = editingIndex >= 0
        ? store.updateProject(projects[editingIndex].id, d)
        : store.createProject(d);
      promise
        .then(function () {
          loadData();
          onDone(editingIndex >= 0 ? "Project updated." : "Project added.");
        })
        .catch(onFail);
    } else {
      var project = {
        id: editingIndex >= 0 && projects[editingIndex].id ? projects[editingIndex].id : "local-" + Date.now(),
        title: d.title,
        categories: d.categories,
        description: d.description,
        meta: d.meta,
        image: d.image,
        alt: d.alt,
        badge: d.badge,
        featured: d.featured,
        published: true
      };
      if (editingIndex >= 0) projects[editingIndex] = project;
      else projects.push(project);
      if (persistLocal()) onDone(editingIndex >= 0 ? "Project updated." : "Project added.");
      else {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save project";
      }
    }
  });

  /* ==================================================================
     Export / import / reset
  ================================================================== */
  function download(filename, text) {
    var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  document.getElementById("exportData").addEventListener("click", function () {
    var body =
      "/* Geo&Land — project dataset (backup export)\n" +
      "   In Supabase mode the database is the source of truth; this file is a\n" +
      "   static fallback used when Supabase is not configured. */\n\n" +
      "window.GEOLAND_PROJECTS = " +
      JSON.stringify(projects, null, 2) +
      ";\n";
    download("projects-data.js", body);
    toast("Exported projects-data.js");
  });

  document.getElementById("importData").addEventListener("click", function () {
    document.getElementById("importFile").click();
  });

  document.getElementById("importFile").addEventListener("change", function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try {
        var raw = String(reader.result);
        try { data = JSON.parse(raw); }
        catch (err) {
          var start = raw.indexOf("[");
          var end = raw.lastIndexOf("]");
          if (start === -1 || end === -1) throw err;
          data = JSON.parse(raw.slice(start, end + 1));
        }
        if (!Array.isArray(data)) throw new Error("not an array");
      } catch (err) {
        toast("Import failed — expected a project list (JSON)");
        e.target.value = "";
        return;
      }

      if (dbMode) {
        if (!window.confirm("Import " + data.length + " projects into the database?")) {
          e.target.value = "";
          return;
        }
        toast("Importing…");
        var chain = Promise.resolve();
        data.forEach(function (p) {
          chain = chain.then(function () { return store.createProject(p); });
        });
        chain.then(function () {
          toast("Imported " + data.length + " projects");
          loadData();
        }).catch(function (err) {
          toast("Import failed: " + (err.message || "error"));
          loadData();
        });
      } else {
        projects = data;
        if (persistLocal()) {
          renderList();
          resetForm();
          toast("Imported " + projects.length + " projects");
        }
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  });

  resetBtn.addEventListener("click", function () {
    if (dbMode) {
      loadData();
      toast("Reloaded from the database");
      return;
    }
    if (!window.confirm("Discard all local edits and restore the published project list?")) return;
    store.clear();
    projects = store.defaults();
    renderList();
    resetForm();
    updateStatus();
    toast("Restored published defaults");
  });

  /* ==================================================================
     Boot
  ================================================================== */
  function init() {
    if (dbMode) {
      modeBanner.hidden = true;
      resetBtn.textContent = "Reload";
      resetBtn.title = "Reload projects from the database";
    } else {
      modeBanner.hidden = false;
      if (store.configured()) {
        modeBanner.querySelector(".mono").innerHTML =
          "Supabase is configured in .env but the client library could not be loaded " +
          "(no internet access?). Working in local mode — data stays in this browser.";
      }
    }
    renderList();
    updateStatus();
    updateImagePreview();
    updatePreview();
    loadData();
  }

  if (dbMode) {
    /* Resume an existing Supabase session, otherwise show the gate */
    store.currentSession().then(function (session) {
      if (session) enterPanel();
      else showGate();
    }).catch(function () {
      showGate();
    });

    /* Keep the panel in sync with auth changes */
    store.onAuthChange(function (session) {
      if (!session && unlocked) showGate();
    });
  } else {
    if (sessionStorage.getItem(SESSION_KEY) === "1") enterPanel();
    else showGate();
  }
})();
