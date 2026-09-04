export default function SpecialtyTag({ specialtyKey, name }) {
  return (
    <span className="badge specialty-tag" data-specialty={specialtyKey}>
      {name}
    </span>
  );
}
