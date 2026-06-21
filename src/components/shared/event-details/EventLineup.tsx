import { Users } from "lucide-react";

export function EventLineup({
  staffList,
  isExperience,
}: {
  staffList: any[];
  isExperience: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isExperience ? "Who will help" : "Lineup & Guests"}
      </h2>
      {staffList.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {staffList.map((person: any, i: number) => (
            <div
              key={person.id || i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-3"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-border/60">
                {person.avatar || person.image ? (
                  <img
                    src={person.avatar || person.image}
                    alt={person.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-secondary/50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{person.name}</p>
                <p className="text-xs text-muted-foreground">{person.role}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No staff or lineup announced yet.</p>
        </div>
      )}
    </div>
  );
}
