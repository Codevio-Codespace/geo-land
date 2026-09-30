/* ==========================================================================
   Geo&Land — shared data layer
   Supabase (database + storage + auth) when configured through .env;
   falls back to published defaults / localStorage when not configured.
   ========================================================================== */

window.GeoLandStore = (function () {
  "use strict";

  var LOCAL_KEY = "geoland.projects.v1";        /* local-mode edits            */
  var CACHE_KEY = "geoland.projects.cache.v1";  /* last DB fetch (fast paint)  */
  var BUCKET = "project-images";

  var CATEGORY_LABELS = {
    agriculture: "GIS & Agriculture",
    software: "Software Development",
    cadastral: "Geodetic & Cadastral Surveying",
    forestry: "Forestry"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function defaults() {
    return (window.GEOLAND_PROJECTS || []).slice();
  }

  /* ------------------------------------------------------------------
     Environment + Supabase client
  ------------------------------------------------------------------ */
  function env() { return window.GEOLAND_ENV || {}; }
  function configured() { return !!(env().SUPABASE_URL && env().SUPABASE_ANON_KEY); }
  function libReady() {
    return typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function";
  }

  var client = null;
  function sb() {
    if (!configured() || !libReady()) return null;
    if (!client) {
      client = window.supabase.createClient(env().SUPABASE_URL, env().SUPABASE_ANON_KEY);
    }
    return client;
  }

  /* true = backed by Supabase, false = local demo mode */
  function dbMode() { return !!sb(); }

  /* ------------------------------------------------------------------
     Local mode (fallback) + public cache
  ------------------------------------------------------------------ */
  function load() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return null;
      return arr;
    } catch (e) { return null; }
  }

  function save(list) { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); }

  function clear() {
    try { localStorage.removeItem(LOCAL_KEY); } catch (e) {}
  }

  function usageBytes() {
    try { return (localStorage.getItem(LOCAL_KEY) || "").length; } catch (e) { return 0; }
  }

  function cached() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr) || !arr.length) return null;
      return arr;
    } catch (e) { return null; }
  }

  function setCache(list) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  /* ------------------------------------------------------------------
     Row mapping — database row <-> card shape
  ------------------------------------------------------------------ */
  function fromRow(r) {
    return {
      id: r.id,
      title: r.title || "",
      categories: r.categories || [],
      description: r.description || "",
      meta: r.meta || [],
      image: r.image_url || "",
      alt: r.alt || r.title || "",
      badge: r.badge || "",
      featured: !!r.featured,
      published: r.published !== false,
      sort_order: typeof r.sort_order === "number" ? r.sort_order : 0
    };
  }

  function toRow(p) {
    return {
      title: p.title || "",
      categories: p.categories || [],
      description: p.description || "",
      meta: p.meta || [],
      image_url: p.image || "",
      alt: p.alt || p.title || "",
      badge: p.badge || "",
      featured: !!p.featured,
      published: p.published !== false
    };
  }

  function client_() {
    var c = sb();
    if (!c) throw new Error("Supabase is not configured");
    return c;
  }

  /* ------------------------------------------------------------------
     Database API (async)
  ------------------------------------------------------------------ */
  function listPublic() {
    return client_()
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        var out = (res.data || []).map(fromRow);
        setCache(out);
        return out;
      });
  }

  function listAll() {
    return client_()
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data || []).map(fromRow);
      });
  }

  function nextSortOrder() {
    return listAll().then(function (list) {
      return list.reduce(function (max, p) {
        return Math.max(max, p.sort_order || 0);
      }, -1) + 1;
    });
  }

  function createProject(p) {
    return nextSortOrder().then(function (order) {
      return client_()
        .from("projects")
        .insert(Object.assign(toRow(p), { sort_order: order }))
        .select()
        .single();
    }).then(function (res) {
      if (res.error) throw res.error;
      return fromRow(res.data);
    });
  }

  function updateProject(id, p) {
    return client_()
      .from("projects")
      .update(toRow(p))
      .eq("id", id)
      .select()
      .single()
      .then(function (res) {
        if (res.error) throw res.error;
        return fromRow(res.data);
      });
  }

  function deleteProject(id) {
    return client_()
      .from("projects")
      .delete()
      .eq("id", id)
      .then(function (res) {
        if (res.error) throw res.error;
      });
  }

  /* Swap the sort_order of two adjacent projects */
  function swapOrder(a, b) {
    var c = client_();
    return c
      .from("projects")
      .update({ sort_order: b.sort_order })
      .eq("id", a.id)
      .then(function (res) {
        if (res.error) throw res.error;
        return c.from("projects").update({ sort_order: a.sort_order }).eq("id", b.id);
      })
      .then(function (res) {
        if (res.error) throw res.error;
      });
  }

  /* Upload a compressed JPEG blob to Supabase Storage, return public URL */
  function uploadImage(blob) {
    var c = client_();
    var name =
      "projects/" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 8) + ".jpg";

    return c.storage
      .from(BUCKET)
      .upload(name, blob, { contentType: "image/jpeg", cacheControl: "31536000" })
      .then(function (res) {
        if (res.error) throw res.error;
        var pub = c.storage.from(BUCKET).getPublicUrl(name);
        return pub.data.publicUrl;
      });
  }

  /* ------------------------------------------------------------------
     Auth API (async)
  ------------------------------------------------------------------ */
  function signIn(email, password) {
    return client_().auth
      .signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data.session;
      });
  }

  function signOutUser() {
    var c = sb();
    if (!c) return Promise.resolve();
    return c.auth.signOut();
  }

  function currentSession() {
    var c = sb();
    if (!c) return Promise.resolve(null);
    return c.auth.getSession().then(function (res) {
      return (res.data && res.data.session) || null;
    });
  }

  function onAuthChange(cb) {
    var c = sb();
    if (c) {
      c.auth.onAuthStateChange(function (_event, session) {
        cb(session);
      });
    }
  }

  /* ------------------------------------------------------------------
     Card markup (shared by site + admin preview)
  ------------------------------------------------------------------ */
  function cardHTML(p) {
    var cats = (p.categories || []).filter(function (c) {
      return CATEGORY_LABELS[c];
    });
    var tags = cats
      .map(function (c) { return "<span>" + CATEGORY_LABELS[c] + "</span>"; })
      .join("");
    var meta = (p.meta || [])
      .filter(Boolean)
      .map(function (m) { return "<span>" + esc(m) + "</span>"; })
      .join("");
    var badge = p.badge
      ? '<figcaption class="media-panel__tag media-panel__tag--tl">' + esc(p.badge) + "</figcaption>"
      : "";
    var media = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.alt || p.title || "") + '" loading="lazy">'
      : '<span class="project__noimage mono">Geo&amp;Land</span>';

    return (
      '<article class="project' +
      (p.featured ? " project--feature" : "") +
      '" data-category="' + esc(cats.join(" ")) + '" data-reveal>' +
      '<figure class="project__media media-panel' + (p.image ? "" : " project__media--empty") + '">' +
      media + badge +
      "</figure>" +
      '<div class="project__body">' +
      '<div class="project__tags mono">' + tags + "</div>" +
      '<h3 class="project__title">' + esc(p.title) + "</h3>" +
      '<p class="project__text">' + esc(p.description) + "</p>" +
      '<div class="project__meta mono">' + meta + "</div>" +
      "</div></article>"
    );
  }

  return {
    /* environment */
    env: env,
    configured: configured,
    dbMode: dbMode,

    /* local mode */
    load: load,
    save: save,
    clear: clear,
    usageBytes: usageBytes,

    /* cache */
    cached: cached,
    setCache: setCache,

    /* database */
    listPublic: listPublic,
    listAll: listAll,
    createProject: createProject,
    updateProject: updateProject,
    deleteProject: deleteProject,
    swapOrder: swapOrder,
    uploadImage: uploadImage,

    /* auth */
    signIn: signIn,
    signOutUser: signOutUser,
    currentSession: currentSession,
    onAuthChange: onAuthChange,

    /* shared helpers */
    defaults: defaults,
    esc: esc,
    CATEGORY_LABELS: CATEGORY_LABELS,
    cardHTML: cardHTML
  };
})();
