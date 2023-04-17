export interface EventWithWorkshops {
    id: number;
    name: string;
    createdAt: string;
    workshops: Workshop[];
  }
  
export interface Workshop {
    id: number;
    start: string;
    end: string;
    eventId: number;
    name: string;
    createdAt: string;
  }
  