import { EmptyState } from "@/components/empty-state";
import type { CallSheetDto } from "@/lib/api-types";

interface CallSheetViewProps {
  callSheet: CallSheetDto;
}

export function CallSheetView(props: CallSheetViewProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Call sheet</p>
          <h2>{props.callSheet.date}</h2>
        </div>
        <span className="pill">call {props.callSheet.callTime}</span>
      </div>

      <div className="meta-grid">
        <div>
          <strong>Location</strong>
          <p>{props.callSheet.location}</p>
        </div>
        <div>
          <strong>Working window</strong>
          <p>
            {props.callSheet.startTime} - {props.callSheet.endTime}
          </p>
        </div>
      </div>

      {props.callSheet.notes ? (
        <div className="stack stack--tight">
          <strong>Notes</strong>
          <p>{props.callSheet.notes}</p>
        </div>
      ) : null}

      {props.callSheet.crew.length === 0 ? (
        <EmptyState
          title="No crew assigned"
          description="Assign crew to the shooting day to populate the call sheet."
        />
      ) : (
        <div className="stack">
          {props.callSheet.crew.map((entry) => (
            <div key={entry.assignmentId} className="list-card">
              <div>
                <strong>{entry.name}</strong>
                <p>
                  {entry.projectRole ?? "crew"} | {entry.accessRole}
                </p>
              </div>

              <span className="pill">{entry.callTime}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
