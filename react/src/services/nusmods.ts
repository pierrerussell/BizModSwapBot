import type {ModuleCondensed, NUSModsModuleResponse, TimetableSlot} from '../types/swap';

export const getBaseCode = (code: string): string => {
    const match = code.match(/^[A-Z]{2,4}\d{4}/);
    return match ? match[0] : code;
};

export async function fetchModuleList(acadYear: string): Promise<ModuleCondensed[]> {
    const res = await fetch(`https://api.nusmods.com/v2/${acadYear}/moduleList.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

export async function fetchModuleTimetables(
    selectedMod: ModuleCondensed,
    allModules: ModuleCondensed[],
    acadYear: string,
    semester: number
): Promise<{ directHaveSlots: TimetableSlot[]; aggregatedWantSlots: TimetableSlot[] }> {
    const baseCode = getBaseCode(selectedMod.moduleCode);
    const sisterModules = allModules.length > 0
        ? allModules.filter((m) => getBaseCode(m.moduleCode) === baseCode)
        : [selectedMod];

    const aggregatedWantSlots: TimetableSlot[] = [];
    const directHaveSlots: TimetableSlot[] = [];

    await Promise.all(
        sisterModules.map(async (sMod) => {
            try {
                const res = await fetch(`https://api.nusmods.com/v2/${acadYear}/modules/${sMod.moduleCode}.json`);
                if (!res.ok) return;

                const data: NUSModsModuleResponse = await res.json();
                const semData = data.semesterData?.find((s) => s.semester === semester);

                if (semData?.timetable) {
                    semData.timetable.forEach((t) => {
                        const slot: TimetableSlot = { ...t, moduleCode: sMod.moduleCode };
                        aggregatedWantSlots.push(slot);
                        if (sMod.moduleCode === selectedMod.moduleCode) {
                            directHaveSlots.push(slot);
                        }
                    });
                }
            } catch (e) {
                console.error(`Failed loading ${sMod.moduleCode}`, e);
            }
        })
    );

    return { directHaveSlots, aggregatedWantSlots };
}