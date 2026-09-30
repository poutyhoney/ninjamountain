type PerkListProps = {
  perks: string[];
  premium?: boolean;
};

export default function PerkList({ perks, premium = false }: PerkListProps) {
  const accentText = premium ? "text-nm-honey" : "text-nm-violet";

  return (
    <ul className="flex flex-col gap-2 text-nm-silver">
      {perks.map((perk) => (
        <li key={perk} className="flex gap-2">
          <span aria-hidden="true" className={accentText}>
            ✓
          </span>
          {perk}
        </li>
      ))}
    </ul>
  );
}