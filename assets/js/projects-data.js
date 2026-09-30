/* ==========================================================================
   Geo&Land — default project dataset
   This file is the published source of truth for the Projects section.
   The admin panel (admin.html) can export an updated version of this file:
   replace this file with the exported one to publish new projects for all
   visitors. Per-browser edits live in localStorage (see projects-store.js).
   ========================================================================== */

window.GEOLAND_PROJECTS = [
  {
    id: "kfis",
    title: "Kosovo Forest Information System (KFIS)",
    categories: ["software", "forestry"],
    description:
      "Design, development, installation, delivery and after-sales service of a permanent IT system for forestry in Kosovo, in a project with the Food and Agriculture Organization of the United Nations.",
    meta: ["FAO", "Web-GIS · System"],
    image: "assets/img/projects/kfis.png",
    alt: "Kosovo Forest Information System interface with forest polygons over terrain",
    badge: "KFIS — System",
    featured: true
  },
  {
    id: "spfn",
    title: "National Farmer and Payment System (SPFN)",
    categories: ["software", "agriculture"],
    description:
      "Web-based application for farmer register and grant management of Kosovo, built on open standards — HTML5, JQuery, JQuery UI and jqGrid.",
    meta: ["Ministry of Agriculture"],
    image: "assets/img/projects/farmer-payment-system.jpg",
    alt: "Electronic Farmer Register and payment system screens",
    badge: "",
    featured: false
  },
  {
    id: "svv",
    title: "Kosovo Vineyard Cadastre & Wine Quality Control System (SVV v.1.3)",
    categories: ["software"],
    description:
      "A unique application for vineyards and wines, developed for the maintenance, expansion and enhancement of the vineyards and wine industry in the vineyard region of Kosovo.",
    meta: ["Ministry of Agriculture"],
    image: "assets/img/projects/kaveko.jpg",
    alt: "Kosovo Vineyard Cadastre and Wine Quality Control System interface",
    badge: "",
    featured: false
  },
  {
    id: "brezovica",
    title: "Expropriation Project for Brezovica Ski Resort",
    categories: ["cadastral"],
    description:
      "In July 2013, Geo&Land was contracted by Deloitte/USAID to implement the land expropriation process across 3,000 ha of the Brezovica Resort.",
    meta: ["Deloitte / USAID", "3,000 ha"],
    image: "assets/img/projects/brezovica.jpg",
    alt: "Expropriation map and property table for the Brezovica Ski Resort area",
    badge: "",
    featured: false
  },
  {
    id: "soil-map",
    title: "Creation of Soil Map",
    categories: ["agriculture"],
    description:
      "Geo&Land is part of a consortium for the creation of the soil map of the Municipality of Rahovec — a project in its initial phase.",
    meta: ["Municipality of Rahovec", "2018"],
    image: "assets/img/projects/soil-map.png",
    alt: "Soil profile photographs used in the Rahovec soil map",
    badge: "",
    featured: false
  },
  {
    id: "forest-plans",
    title: "Development of Management Plans for Forestry",
    categories: ["forestry"],
    description:
      "Research on existing forest plots and digitalisation of forest data, developing long-term management plans with the Kosovo Forest Agency.",
    meta: ["Kosovo Forest Agency"],
    image: "assets/img/projects/forest-management-plans.jpg",
    alt: "Forest management plan maps and forest inventory data",
    badge: "",
    featured: false
  },
  {
    id: "cadastre-reconstruction",
    title: "Cadastre Reconstruction",
    categories: ["cadastral"],
    description:
      "Updating the cadastral database with actual information regarding inventory and property across five cadastral zones.",
    meta: ["Cadastral zones · 5"],
    image: "assets/img/projects/cadastre-reconstruction.jpg",
    alt: "Cadastral reconstruction survey over a cadastral zone",
    badge: "",
    featured: false
  },
  {
    id: "digital-maps",
    title: "Creation of Digital Maps for GIS Advancement",
    categories: ["cadastral"],
    description:
      "Measuring all water meters through GPS technology and creating a digital map for GIS advancement.",
    meta: ["Municipal utilities"],
    image: "assets/img/projects/digital-maps.jpg",
    alt: "Digital map of water meters created through GPS measurement",
    badge: "",
    featured: false
  },
  {
    id: "urban-surveying",
    title: "Land Surveying for Urban Planning",
    categories: ["cadastral"],
    description:
      "Implementation of land surveying in urban zones of Prishtina, including data collection for infrastructure and digital mapping.",
    meta: ["Prishtina", "2017"],
    image: "assets/img/projects/urban-surveying.png",
    alt: "Land surveying for urban planning in Prishtina",
    badge: "",
    featured: false
  },
  {
    id: "municipal-gis",
    title: "Municipal GIS System",
    categories: ["software"],
    description:
      "One of the first municipal GIS systems in Kosovo — a database with geospatial and textual data presented together.",
    meta: ["Municipality of Peja"],
    image: "assets/img/projects/municipal-gis.jpg",
    alt: "Municipal GIS System for the Municipality of Peja",
    badge: "",
    featured: false
  }
];
