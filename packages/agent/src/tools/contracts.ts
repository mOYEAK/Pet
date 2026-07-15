export interface AgentToolContext {
  userId?: string;
  channel: "miniapp" | "admin";
}

export interface AgentService {
  id: string;
  name: string;
  category: string;
  petType: "CAT" | "DOG" | "OTHER";
  sizeType: "SMALL" | "MEDIUM" | "LARGE" | "UNKNOWN";
  basePrice: number;
  durationMinutes: number;
  description: string | null;
  notice: string | null;
}

export interface AgentPet {
  id: string;
  name: string;
  type: "CAT" | "DOG" | "OTHER";
  breed: string | null;
  notes: string | null;
}

export interface AgentKnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
}

export interface AvailableTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface BookingDraft {
  petId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  remark?: string;
}

export interface BookingDraftResult {
  valid: boolean;
  draft?: BookingDraft;
  errors: string[];
}

export interface AgentToolRegistry {
  queryKnowledgeBase(input: { query: string }, context: AgentToolContext): Promise<AgentKnowledgeItem[]>;
  getServiceList(
    input: { query?: string; petType?: AgentService["petType"]; sizeType?: AgentService["sizeType"] },
    context: AgentToolContext
  ): Promise<AgentService[]>;
  getServicePrice(input: { serviceId?: string; serviceName?: string }, context: AgentToolContext): Promise<AgentService[]>;
  getAvailableTimeSlots(
    input: { date: string; serviceId?: string },
    context: AgentToolContext
  ): Promise<AvailableTimeSlot[]>;
  getCustomerPets(context: AgentToolContext): Promise<AgentPet[]>;
  createBookingDraft(input: BookingDraft, context: AgentToolContext): Promise<BookingDraftResult>;
}

export interface AgentToolTrace {
  name: string;
  input: unknown;
  output: unknown;
}
