type BadgeProps = {
	children: React.ReactNode;
};

export default function Badge({ children }: BadgeProps) {
	return (
		<span className="rounded-full bg-nm-honey px-3 py-1 text-xs font-semibold text-nm-obsidian">
			{children}
		</span>
	);
}

