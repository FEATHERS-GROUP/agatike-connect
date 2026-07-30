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
          <div className="flex items-center -space-x-3 mt-1">
            {attendeesList.slice(0, 8).map((att: any, i: number) => {
              if (att.users?.profile) {
                return (
                  <img
                    key={att.id || i}
                    src={att.users.profile}
                    className="h-10 w-10 rounded-full border-2 border-background object-cover bg-secondary"
                    alt="Attendee"
                  />
                );
              } else {
                const initial = (att.names || "Guest").charAt(0).toUpperCase();
                return (
                  <div
                    key={att.id || i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-primary/20 text-primary flex items-center justify-center font-bold text-lg"
                  >
                    {initial}
                  </div>
                );
              }
            })}
            {attendeesList.length > 8 && (
              <div className="ml-4 flex items-center justify-center h-10 w-10 rounded-full bg-secondary text-xs font-bold border-2 border-background">
                +{attendeesList.length - 8}
              </div>
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
