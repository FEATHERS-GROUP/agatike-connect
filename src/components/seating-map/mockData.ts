export type SectionStatus = "available" | "sold_out" | "limited" | "disabled";

export interface SectionMetadata {
  sectionId: string;
  name: string;
  capacity: number;
  availableSeats: number;
  priceMin: number;
  priceMax: number;
  status: SectionStatus;
  isAccessible: boolean;
  isVIP: boolean;
}

export interface SeatInventory {
  row: string;
  seats: {
    number: string;
    status: "available" | "locked" | "sold" | "accessible";
    price: number;
  }[];
}

export interface SectionInventory {
  sectionId: string;
  rows: SeatInventory[];
}

// ---------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------

export const mockSectionMetadata: Record<string, SectionMetadata> = {
  "sec-101": {
    sectionId: "101",
    name: "Section 101",
    capacity: 200,
    availableSeats: 45,
    priceMin: 89.99,
    priceMax: 129.99,
    status: "available",
    isAccessible: true,
    isVIP: false,
  },
  "sec-102": {
    sectionId: "102",
    name: "Section 102",
    capacity: 200,
    availableSeats: 0,
    priceMin: 89.99,
    priceMax: 129.99,
    status: "sold_out",
    isAccessible: false,
    isVIP: false,
  },
  "sec-103": {
    sectionId: "103",
    name: "Section 103",
    capacity: 150,
    availableSeats: 5,
    priceMin: 99.99,
    priceMax: 149.99,
    status: "limited",
    isAccessible: false,
    isVIP: true,
  },
  "sec-201": {
    sectionId: "201",
    name: "Section 201",
    capacity: 400,
    availableSeats: 320,
    priceMin: 45.00,
    priceMax: 65.00,
    status: "available",
    isAccessible: false,
    isVIP: false,
  }
};

// Generates fake seat data for a section when clicked
export const getSectionInventory = (sectionId: string): SectionInventory => {
  const rows = ["A", "B", "C", "D", "E"].map((rowName) => {
    const seats = Array.from({ length: 15 }).map((_, i) => ({
      number: `${i + 1}`,
      status: Math.random() > 0.7 ? "sold" : "available" as const,
      price: mockSectionMetadata[sectionId]?.priceMin || 50,
    }));
    return { row: rowName, seats };
  });

  return { sectionId, rows };
};
