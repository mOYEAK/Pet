import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { stepCountIs, tool, ToolLoopAgent, type ModelMessage } from "ai";
import { z } from "zod";
import { customerServiceSystemPrompt } from "./prompts/customer-service";
import type {
  AgentPet,
  AgentService,
  AgentToolContext,
  AgentToolRegistry,
  AgentToolTrace,
  AvailableTimeSlot,
  BookingDraft
} from "./tools/contracts";

export interface CustomerServiceAgentConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  timeoutMs?: number;
}

export interface CustomerServiceConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CustomerServiceAgentResult {
  answer: string;
  services: AgentService[];
  availableSlots: AvailableTimeSlot[];
  pets: AgentPet[];
  bookingDraft?: BookingDraft;
  toolCalls: AgentToolTrace[];
}

export async function runCustomerServiceAgent(
  config: CustomerServiceAgentConfig,
  registry: AgentToolRegistry,
  context: AgentToolContext,
  messages: CustomerServiceConversationMessage[]
): Promise<CustomerServiceAgentResult> {
  const services = new Map<string, AgentService>();
  const slots = new Map<string, AvailableTimeSlot>();
  const pets = new Map<string, AgentPet>();
  const toolCalls: AgentToolTrace[] = [];
  let bookingDraft: BookingDraft | undefined;

  async function executeTool<TInput, TOutput>(name: string, input: TInput, execute: () => Promise<TOutput>) {
    const output = await execute();
    toolCalls.push({ name, input, output });
    return output;
  }

  const provider = createOpenAICompatible({
    name: "petcare",
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });

  const agent = new ToolLoopAgent({
    model: provider(config.model),
    instructions: `${customerServiceSystemPrompt}\n当前日期（Asia/Shanghai）：${shanghaiDateKey(new Date())}`,
    stopWhen: stepCountIs(6),
    tools: {
      queryKnowledgeBase: tool({
        description: "查询门店预约规则、护理注意事项、套餐卡说明和活动等知识库内容。",
        inputSchema: z.object({ query: z.string().min(1).describe("用户想了解的主题或问题") }),
        execute: (input) => executeTool("queryKnowledgeBase", input, () => registry.queryKnowledgeBase(input, context))
      }),
      getServiceList: tool({
        description: "查询门店当前启用的服务，可按关键词、宠物类型或体型筛选。",
        inputSchema: z.object({
          query: z.string().optional().describe("服务名称、分类或描述关键词"),
          petType: z.enum(["CAT", "DOG", "OTHER"]).optional(),
          sizeType: z.enum(["SMALL", "MEDIUM", "LARGE", "UNKNOWN"]).optional()
        }),
        execute: async (input) => {
          const output = await executeTool("getServiceList", input, () => registry.getServiceList(input, context));
          output.forEach((service) => services.set(service.id, service));
          return output;
        }
      }),
      getServicePrice: tool({
        description: "按服务 ID 或名称查询准确价格、耗时和服务说明。",
        inputSchema: z
          .object({
            serviceId: z.string().optional(),
            serviceName: z.string().optional()
          })
          .refine((input) => Boolean(input.serviceId || input.serviceName), "serviceId 或 serviceName 至少提供一个"),
        execute: async (input) => {
          const output = await executeTool("getServicePrice", input, () => registry.getServicePrice(input, context));
          output.forEach((service) => services.set(service.id, service));
          return output;
        }
      }),
      getAvailableTimeSlots: tool({
        description: "查询指定日期仍可预约的门店固定时间段。日期必须是 YYYY-MM-DD。",
        inputSchema: z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          serviceId: z.string().optional()
        }),
        execute: async (input) => {
          const output = await executeTool("getAvailableTimeSlots", input, () => registry.getAvailableTimeSlots(input, context));
          output.forEach((slot) => slots.set(`${slot.date}-${slot.startTime}`, slot));
          return output;
        }
      }),
      getCustomerPets: tool({
        description: "查询当前登录客户名下的宠物档案，用于识别预约宠物。",
        inputSchema: z.object({}),
        execute: async (input) => {
          const output = await executeTool("getCustomerPets", input, () => registry.getCustomerPets(context));
          output.forEach((pet) => pets.set(pet.id, pet));
          return output;
        }
      }),
      createBookingDraft: tool({
        description: "校验并生成待客户确认的预约草案。此工具不会创建真实预约。",
        inputSchema: z.object({
          petId: z.string().min(1),
          serviceId: z.string().min(1),
          bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          remark: z.string().max(500).optional()
        }),
        execute: async (input) => {
          const output = await executeTool("createBookingDraft", input, () => registry.createBookingDraft(input, context));
          if (output.valid && output.draft) {
            bookingDraft = output.draft;
          }
          return output;
        }
      })
    }
  });

  const modelMessages: ModelMessage[] = messages.map((message) => ({
    role: message.role,
    content: message.content
  }));
  const result = await agent.generate({
    messages: modelMessages,
    timeout: { totalMs: config.timeoutMs ?? 15_000, stepMs: config.timeoutMs ?? 15_000 }
  });
  const answer = result.text.trim();

  if (!answer) {
    throw new Error("模型未返回客服回答");
  }

  return {
    answer,
    services: [...services.values()],
    availableSlots: [...slots.values()],
    pets: [...pets.values()],
    bookingDraft,
    toolCalls
  };
}

function shanghaiDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
