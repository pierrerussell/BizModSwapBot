export interface ModuleCondensed {
    moduleCode: string;
    title: string;
}

export interface RawLesson {
    classNo: string;
    lessonType: string;
    day: string;
    startTime: string;
    endTime: string;
    venue?: string;
}

export interface SemesterData {
    semester: number;
    timetable: RawLesson[];
}

export interface NUSModsModuleResponse {
    moduleCode: string;
    semesterData?: SemesterData[];
}

export interface TimetableSlot extends RawLesson {
    moduleCode: string;
}

export interface DesiredSlot {
    moduleCode: string;
    classNo: string;
    label: string;
}

// src/types/swap.ts

export interface SwapRequestMatch {
    swapRequestId: string;
    moduleCode: string;
    classNo: string;
    telegramUserId: string;
    telegramUsername: string;
}

export interface SwapRequest {
    id: string; // Map from swapRequestId in backend
    telegramUserId: number;
    telegramUsername: string;
    acadYear: string;        // e.g. "2025-2026"
    semester: number;        // e.g. 1 or 2
    haveModuleCode: string;
    haveClassNo: string;
    haveDetails: string;
    wantSlots: DesiredSlot[]; // Note: Backend SwapRequestWithMatchesDto doesn't seem to return wantSlots, but we might still need them or the interface can keep them optional if it's for local use too. Actually, looking at SwapController.cs, SwapRequestWithMatchesDto does NOT include wantSlots.
    matches: SwapRequestMatch[];
    status?: string;
}

export interface SwapRequestWithMatchesDto {
    swapRequestId: string;
    telegramUserId: number;
    telegramUsername: string;
    acadYear: string;
    semester: number;
    haveModuleCode: string;
    haveClassNo: string;
    haveDetails: string;
    wantSlots: { moduleCode: string; classNo: string }[];
    matches: SwapRequestMatch[];
}

export interface CreateSwapRequestDto {
    telegramUserId: number;
    telegramUsername: string;
    acadYear: string;
    semester: number;
    haveModuleCode: string;
    haveClassNo: string;
    haveDetails: string;
    wantSlots: CreateDesiredSlotDto[];
}

export interface CreateDesiredSlotDto {
    moduleCode: string;
    classNo: string;
}