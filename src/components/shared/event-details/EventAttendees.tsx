export function EventAttendees({
  attendeesList,
  attendeesCount,
}: {
  attendeesList: any[];
  attendeesCount: number;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Who's going</h2>
      {attendeesList.length > 0 ? (
        <div className="mt-4">
          <div className="flex items-center -space-x-3 mb-3">
            {attendeesList.slice(0, 8).map((att: any, i: number) => {
              const avatarUrl = att.users?.profile || `https://i.pravatar.cc/100?img=${i + 20}`;
              return (
                <img
                  key={att.id || i}
                  src={avatarUrl}
                  className="h-10 w-10 rounded-full border-2 border-background object-cover"
                  alt={att.names || "Attendee"}
                />
              );
            })}
            {attendeesList.length > 8 && (
              <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold border-2 border-background">
                +{attendeesList.length - 8}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {attendeesList.slice(0, 8).map((att: any, i: number) => {
              const name = att.users?.handle ? `@${att.users.handle}` : att.names;
              if (!name) return null;
              return (
                <span
                  key={att.id || i}
                  className="text-xs bg-secondary/50 text-muted-foreground px-2.5 py-1 rounded-full border border-border/30 font-medium"
                >
                  {name}
                </span>
              );
            })}
            {attendeesList.length > 8 && (
              <span className="text-xs text-muted-foreground self-center ml-1">
                & {attendeesList.length - 8} more
              </span>
            )}
          </div>
        </div>
      ) : attendeesCount > 0 ? (
        <div className="mt-4 flex -space-x-3">
          {Array.from({ length: Math.min(attendeesCount || 8, 8) }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-full border-2 border-background"
              style={{ background: `oklch(${0.6 + (i % 3) * 0.1} 0.18 ${30 + i * 20})` }}
            />
          ))}
          {attendeesCount > 8 && (
            <div className="ml-3 grid h-10 place-items-center rounded-full bg-secondary px-3 text-xs font-medium">
              + {(attendeesCount - 8).toLocaleString()}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Be the first to join!</p>
      )}
    </div>
  );
}
