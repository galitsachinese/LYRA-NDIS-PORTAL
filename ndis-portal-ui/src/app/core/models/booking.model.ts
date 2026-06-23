export interface Booking {
  id: number;
  userId: number;
  serviceId: number;
  serviceName: string;
  serviceCategory?: string;
  participantName?: string;
  preferredDate: string;
  notes?: string;
  status: string;
  createdDate: string;
  modifiedDate: string;
}

export interface WorkerInfo {
  workerId: number;
  workerName: string;
  workerPhone: string;
  assignedServiceId: number;
  assignedServiceName: string;
  assignedDate: string;
}

export interface BookingViewModel {
  id: number;
  name?: string;
  service: string;
  category: string;
  date: string;
  status: string;
  notes?: string;
  rawData: Booking;
  workerInfo?: WorkerInfo;
}
