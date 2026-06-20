export interface AgentToolContext {
  userId?: string;
  channel: "miniapp" | "admin";
}

export interface AvailableTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export interface AgentToolRegistry {
  queryKnowledgeBase(query: string, context: AgentToolContext): Promise<string[]>;
  getServiceList(context: AgentToolContext): Promise<unknown[]>;
  getAvailableTimeSlots(serviceId: string, date: string, context: AgentToolContext): Promise<AvailableTimeSlot[]>;
  createBookingDraft(input: unknown, context: AgentToolContext): Promise<unknown>;
}
