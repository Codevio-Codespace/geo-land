import { getPublicMilestones } from '@/lib/content';

export async function Milestones() {
  const milestones = await getPublicMilestones();
  return (
    <>
      {milestones.map((m) => (
        <li key={m.id}>
          <span className="mono">{m.year}</span>
          <p>{m.text}</p>
        </li>
      ))}
    </>
  );
}
