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

export interface SwapRequest {
    id: string;
    telegramUserId: number;
    telegramUsername: string;
    acadYear: string;        // e.g. "2025-2026"
    semester: number;        // e.g. 1 or 2
    haveModuleCode: string;
    haveClassNo: string;
    haveDetails: string;
    wantSlots: DesiredSlot[];
    status: string;
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