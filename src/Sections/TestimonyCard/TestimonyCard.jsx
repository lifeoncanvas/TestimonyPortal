import "./styles.css";

function TestimonyCard({
  title,
  category,
  author,
  image,
}) {
  return (
    <div className="testimony-card">

      <div className="card-image">
        <img
          src={
            image ||
            "https://picsum.photos/500/300"
          }
          alt={title}
        />
      </div>

      <div className="card-content">

        <span className="category-tag">
          {category}
        </span>

        <h3>{title}</h3>

        <p className="author">
          {author}
        </p>

      </div>

    </div>
  );
}

export default TestimonyCard;