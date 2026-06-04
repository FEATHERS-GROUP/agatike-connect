# Canva-Style Venue Designer Architecture

To support a commercial ticketing platform with a Canva-style venue builder, the architecture must decouple the **Venue Geometry (Template)** from the **Event Inventory (Tickets)**.

## Core Architecture

1. **Venue Designer Canvas**: Organizers use a React-based SVG builder to drag, resize, and rotate sections. This generates a **Venue Template JSON**.
2. **Dynamic Seat Generation**: Instead of saving 20,000 individual `<circle>` elements in the SVG, the SVG only stores Section boundaries. The actual seats are generated dynamically based on `rows` and `seatsPerRow` metadata when an event is created.
3. **Event Instantiation**: When an organizer creates an event, they select a Venue Template. The system generates the actual database rows for the tickets based on the template's capacity settings.

---

## JSON Configuration Models

### 1. Venue Template JSON

This is the output of the Venue Designer. It represents the pure vector geometry and section definitions.

```json
{
  "venueId": "v-101",
  "name": "Eko Convention Centre",
  "canvas": { "width": 1000, "height": 1000 },
  "stage": { "width": 200, "height": 100, "label": "STAGE" },
  "sections": [
    {
      "id": "sec-101",
      "name": "Lower Bowl 101",
      "type": "reserved", // reserved, general_admission, vip
      "color": "#f97316",
      "priceZone": "A",
      "visible": true,

      // Dynamic Seat Generation
      "rows": 20,
      "seatsPerRow": 25,
      "capacity": 500,
      "seatPattern": "curved", // curved, linear

      // Geometry (SVG)
      "shape": "arc",
      "x": 0,
      "y": 0,
      "rotation": 0,
      "innerRadius": 100,
      "outerRadius": 250,
      "startAngle": -30,
      "endAngle": 30
    }
  ]
}
```

### 2. Section Metadata JSON (Event Level)

When an event is published, the template sections map to real inventory.

```json
{
  "eventId": "evt-001",
  "sections": {
    "sec-101": {
      "capacity": 500,
      "availableSeats": 327,
      "priceMin": 49.99,
      "priceMax": 99.99,
      "status": "available"
    }
  }
}
```

---

## Recommended PostgreSQL Schema

```sql
-- 1. Venue Templates (Created by the Canva-style Designer)
CREATE TABLE venue_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_json JSONB NOT NULL, -- Stores the entire Venue Template JSON (shapes, positions, rows, cols)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events (Specific performances)
CREATE TABLE events (
  id UUID PRIMARY KEY,
  venue_template_id UUID REFERENCES venue_templates(id),
  name VARCHAR(255) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL
);

-- 3. Seats (The actual generated inventory)
-- These rows are ONLY generated when the event is created, using the rows/cols from the template JSON.
CREATE TABLE event_seats (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  section_id VARCHAR(100) NOT NULL, -- Maps to "sec-101" from JSON
  row_label VARCHAR(10),
  seat_number VARCHAR(10),
  status VARCHAR(20) DEFAULT 'available', -- available, locked, sold
  price DECIMAL(10,2) NOT NULL,
  UNIQUE(event_id, section_id, row_label, seat_number)
);
```

## Designer Interactions Implementation

- **Drag & Drop**: Use React state to track `x` and `y`. Apply `onPointerDown`, `onPointerMove`, and `onPointerUp` to the SVG `<g>` elements. Update the `x` and `y` properties in real-time.
- **Selection**: Track `activeSectionId`. Apply stroke/glow filters to the selected `<g>` element.
- **Seat Generation**: Run a deterministic function `generateSeats(rows, seatsPerRow, pattern)` that spits out the grid coordinate layout when the user clicks "Edit Seats".
