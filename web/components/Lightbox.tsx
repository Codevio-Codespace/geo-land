export function Lightbox() {
  return (
    <dialog className="lightbox" aria-label="Image viewer">
      <button className="lightbox__close" data-lightbox-close type="button" aria-label="Close viewer">
        ✕
      </button>
      <div className="lightbox__nav lightbox__nav--prev">
        <button data-lightbox-prev type="button" aria-label="Previous image">
          ←
        </button>
      </div>
      <figure className="lightbox__figure">
        <img src="" alt="" />
        <figcaption className="lightbox__cap">
          <span data-lightbox-caption></span>
          <span>Esc to close · ← → to browse</span>
        </figcaption>
      </figure>
      <div className="lightbox__nav lightbox__nav--next">
        <button data-lightbox-next type="button" aria-label="Next image">
          →
        </button>
      </div>
    </dialog>
  );
}
