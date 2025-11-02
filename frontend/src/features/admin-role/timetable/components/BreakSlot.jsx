export default function BreakSlot({ displayChar }) {
  return (
    <div className="p-8 bg-muted text-muted-foreground h-full flex items-center justify-center rounded-md border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40">
      {displayChar}
    </div>
  );
}
