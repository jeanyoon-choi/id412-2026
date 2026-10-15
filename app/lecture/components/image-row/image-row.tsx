import styles from "./image-row.module.css";

type Item = { src: string; alt: string; caption?: string; href?: string };

/** A row of images with captions, for lecture pages. */
export function ImageRow({ items, wide = false }: { items: Item[]; wide?: boolean }) {
  return (
    <div className={styles.row}>
      {items.map((item) => (
        <figure key={item.src} className={wide ? styles.wide : styles.figure}>
          {item.href ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              <img src={item.src} alt={item.alt} className={styles.image} loading="lazy" />
            </a>
          ) : (
            <img src={item.src} alt={item.alt} className={styles.image} loading="lazy" />
          )}
          {item.caption ? <figcaption className={styles.caption}>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
