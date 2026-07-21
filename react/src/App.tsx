import { useEffect, useState } from 'react';
import {
    AppRoot,
    List,
    Section,
    Select,
    Cell,
    Button,
    Input,
    SegmentedControl,
    Badge,
    Chip
} from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

interface ModuleCondensed {
    moduleCode: string;
    title: string;
}

interface RawLesson {
    classNo: string;
    lessonType: string;
    day: string;
    startTime: string;
    endTime: string;
    venue?: string;
}

interface SemesterData {
    semester: number;
    timetable: RawLesson[];
}

interface NUSModsModuleResponse {
    moduleCode: string;
    semesterData?: SemesterData[];
}

interface TimetableSlot extends RawLesson {
    moduleCode: string;
}

interface DesiredSlot {
    moduleCode: string;
    classNo: string;
    label: string;
}

interface ActiveSwap {
    id: string;
    haveModuleCode: string;
    haveClassNo: string;
    haveDetails: string;
    wantSlots: DesiredSlot[];
    status: string;
}

export default function App() {
    const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

    // Term settings (NUSMods uses hyphenated "2025-2026")
    const [acadYear, setAcadYear] = useState('2025-2026');
    const [semester, setSemester] = useState<number>(1);

    // Search & Module Index
    const [allModules, setAllModules] = useState<ModuleCondensed[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ModuleCondensed[]>([]);

    // Selection state
    const [selectedModuleCode, setSelectedModuleCode] = useState<string>('');
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [haveSlot, setHaveSlot] = useState<TimetableSlot | null>(null);

    // Slots Data
    const [availableHaveSlots, setAvailableHaveSlots] = useState<TimetableSlot[]>([]);
    const [allVariantWantSlots, setAllVariantWantSlots] = useState<TimetableSlot[]>([]);
    const [selectedWantSlots, setSelectedWantSlots] = useState<DesiredSlot[]>([]);

    const [mySwaps, setMySwaps] = useState<ActiveSwap[]>([]);

    const getBaseCode = (code: string) => {
        const match = code.match(/^[A-Z]{2,4}\d{4}/);
        return match ? match[0] : code;
    };

    // 1. Fetch Module Index when term changes (keeping hyphen in acadYear)
    useEffect(() => {
        fetch(`https://api.nusmods.com/v2/${acadYear}/moduleList.json`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: ModuleCondensed[]) => {
                setAllModules(data);
                setFetchError(null);
            })
            .catch((err) => {
                console.error('Error fetching module list:', err);
                setFetchError(`Could not load modules for ${acadYear}. Try switching Academic Year.`);
            });
    }, [acadYear]);

    // Search Handler
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setSelectedModuleCode('');

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        const q = value.toUpperCase();
        const matches = allModules
            .filter((m) => m.moduleCode.includes(q) || m.title.toUpperCase().includes(q))
            .slice(0, 8);
        setSearchResults(matches);
    };

    // 2. Load Timetables for Selected Module & Sister Variants
    const handleSelectModule = async (mod: ModuleCondensed) => {
        const baseCode = getBaseCode(mod.moduleCode);
        setSelectedModuleCode(mod.moduleCode);
        setSearchQuery(`${mod.moduleCode}: ${mod.title}`);
        setSearchResults([]);
        setHaveSlot(null);
        setSelectedWantSlots([]);
        setFetchError(null);
        setIsLoadingSlots(true);

        // Fallback to selected module if allModules list isn't populated yet
        const sisterModules = allModules.length > 0
            ? allModules.filter((m) => getBaseCode(m.moduleCode) === baseCode)
            : [mod];

        const aggregatedWantSlots: TimetableSlot[] = [];
        const directHaveSlots: TimetableSlot[] = [];

        try {
            await Promise.all(
                sisterModules.map(async (sMod) => {
                    try {
                        const res = await fetch(
                            `https://api.nusmods.com/v2/${acadYear}/modules/${sMod.moduleCode}.json`
                        );
                        if (!res.ok) return;

                        const data: NUSModsModuleResponse = await res.json();
                        const semData = data.semesterData?.find((s) => s.semester === semester);

                        if (semData?.timetable) {
                            semData.timetable.forEach((t) => {
                                const slot: TimetableSlot = { ...t, moduleCode: sMod.moduleCode };
                                aggregatedWantSlots.push(slot);

                                if (sMod.moduleCode === mod.moduleCode) {
                                    directHaveSlots.push(slot);
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Failed loading ${sMod.moduleCode}`, e);
                    }
                })
            );

            setAvailableHaveSlots(directHaveSlots);
            setAllVariantWantSlots(aggregatedWantSlots);
        } catch (err) {
            console.error('Error loading module timetable:', err);
            setFetchError('Failed to retrieve class slots from NUSMods.');
        } finally {
            // Guaranteed execution so loading state is never locked
            setIsLoadingSlots(false);
        }
    };

    const toggleWantSlot = (slot: TimetableSlot) => {
        const key = `${slot.moduleCode}-${slot.classNo}`;
        const exists = selectedWantSlots.some((s) => `${s.moduleCode}-${s.classNo}` === key);

        if (exists) {
            setSelectedWantSlots(selectedWantSlots.filter((s) => `${s.moduleCode}-${s.classNo}` !== key));
        } else {
            setSelectedWantSlots([
                ...selectedWantSlots,
                {
                    moduleCode: slot.moduleCode,
                    classNo: slot.classNo,
                    label: `${slot.moduleCode} (${slot.classNo}) - ${slot.day} ${slot.startTime}-${slot.endTime}`
                }
            ]);
        }
    };

    const handleSubmit = () => {
        if (!haveSlot || selectedWantSlots.length === 0) {
            alert('Please select the slot you have and at least one slot you want!');
            return;
        }

        const newSwap: ActiveSwap = {
            id: Date.now().toString(),
            haveModuleCode: haveSlot.moduleCode,
            haveClassNo: haveSlot.classNo,
            haveDetails: `${haveSlot.day} ${haveSlot.startTime}-${haveSlot.endTime}`,
            wantSlots: selectedWantSlots,
            status: 'Searching...'
        };

        setMySwaps([newSwap, ...mySwaps]);

        // Reset Form
        setSelectedModuleCode('');
        setSearchQuery('');
        setHaveSlot(null);
        setSelectedWantSlots([]);
        setAvailableHaveSlots([]);
        setAllVariantWantSlots([]);
        setActiveTab('list');
    };

    return (
        <AppRoot style={{ padding: '12px 16px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Tab Switcher */}
            <SegmentedControl style={{ marginBottom: '20px' }}>
                <SegmentedControl.Item
                    selected={activeTab === 'create'}
                    onClick={() => setActiveTab('create')}
                >
                    ➕ New Swap
                </SegmentedControl.Item>
                <SegmentedControl.Item
                    selected={activeTab === 'list'}
                    onClick={() => setActiveTab('list')}
                >
                    📋 My Swaps ({mySwaps.length})
                </SegmentedControl.Item>
            </SegmentedControl>

            {activeTab === 'create' ? (
                <List>
                    {/* Side-by-side Term Selector */}
                    <Section header="1. ACADEMIC TERM">
                        <div style={{ display: 'flex', gap: '8px', padding: '0 8px 8px 8px' }}>
                            <div style={{ flex: 1 }}>
                                <Select
                                    header="Acad Year"
                                    value={acadYear}
                                    onChange={(e) => {
                                        setAcadYear(e.target.value);
                                        setSelectedModuleCode('');
                                        setSearchQuery('');
                                    }}
                                >
                                    <option value="2025-2026">2025/2026</option>
                                    <option value="2024-2025">2024/2025</option>
                                </Select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Select
                                    header="Semester"
                                    value={semester}
                                    onChange={(e) => {
                                        setSemester(Number(e.target.value));
                                        setSelectedModuleCode('');
                                        setSearchQuery('');
                                    }}
                                >
                                    <option value={1}>Semester 1</option>
                                    <option value={2}>Semester 2</option>
                                </Select>
                            </div>
                        </div>
                    </Section>

                    {/* Module Search */}
                    <Section header="2. SEARCH MODULE">
                        <Input
                            header="Module Code"
                            placeholder="e.g. MKT1705, DAO1704"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        {searchResults.length > 0 && (
                            <div
                                style={{
                                    background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
                                    borderRadius: '8px',
                                    margin: '8px 0',
                                    overflow: 'hidden'
                                }}
                            >
                                {searchResults.map((mod) => (
                                    <Cell
                                        key={mod.moduleCode}
                                        onClick={() => handleSelectModule(mod)}
                                        subtitle={mod.title}
                                    >
                                        <strong>{mod.moduleCode}</strong>
                                    </Cell>
                                ))}
                            </div>
                        )}
                        {fetchError && (
                            <Cell subtitle={fetchError}>
                                ⚠️ Network Error
                            </Cell>
                        )}
                    </Section>

                    {/* Loading Indicator */}
                    {isLoadingSlots && (
                        <Section>
                            <Cell subtitle="Querying NUSMods timetable data...">
                                ⏳ Loading class slots...
                            </Cell>
                        </Section>
                    )}

                    {/* Sections 3 & 4 */}
                    {selectedModuleCode && !isLoadingSlots && (
                        <>
                            <Section header="3. SLOT YOU HAVE">
                                {availableHaveSlots.length === 0 ? (
                                    <Cell subtitle={`No active classes found for ${selectedModuleCode} in ${acadYear} Sem ${semester}. Try changing semester or academic year.`}>
                                        ⚠️ No slots available for this term
                                    </Cell>
                                ) : (
                                    <Cell>
                                        <Select
                                            header="Your Current Class"
                                            value={haveSlot ? `${haveSlot.moduleCode}-${haveSlot.classNo}` : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const slot = availableHaveSlots.find(
                                                    (s) => `${s.moduleCode}-${s.classNo}` === val
                                                );
                                                setHaveSlot(slot || null);
                                            }}
                                        >
                                            <option value="">-- Choose Your Class --</option>
                                            {availableHaveSlots.map((s) => (
                                                <option
                                                    key={`${s.moduleCode}-${s.classNo}`}
                                                    value={`${s.moduleCode}-${s.classNo}`}
                                                >
                                                    Class {s.classNo} ({s.day} {s.startTime}-{s.endTime})
                                                </option>
                                            ))}
                                        </Select>
                                    </Cell>
                                )}
                            </Section>

                            {haveSlot && (
                                <Section header="4. SLOTS YOU WANT (Select all acceptable)">
                                    {allVariantWantSlots
                                        .filter(
                                            (s) =>
                                                !(s.moduleCode === haveSlot.moduleCode && s.classNo === haveSlot.classNo)
                                        )
                                        .map((s) => {
                                            const key = `${s.moduleCode}-${s.classNo}`;
                                            const isChecked = selectedWantSlots.some(
                                                (w) => `${w.moduleCode}-${w.classNo}` === key
                                            );
                                            return (
                                                <Cell
                                                    key={key}
                                                    onClick={() => toggleWantSlot(s)}
                                                    subtitle={`${s.day} ${s.startTime}-${s.endTime} (${s.venue || 'TBA'})`}
                                                    after={isChecked ? <Badge type="number">✓</Badge> : null}
                                                >
                                                    <strong>{s.moduleCode}</strong> - Class {s.classNo}
                                                </Cell>
                                            );
                                        })}
                                </Section>
                            )}

                            {haveSlot && selectedWantSlots.length > 0 && (
                                <div style={{ marginTop: '24px', marginBottom: '40px' }}>
                                    <Button size="l" stretched onClick={handleSubmit}>
                                        Submit Swap Request ({selectedWantSlots.length} desired)
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </List>
            ) : (
                /* My Swaps Tab */
                <List>
                    {mySwaps.length === 0 ? (
                        <Section>
                            <Cell subtitle="Tap 'New Swap' to submit your first request.">
                                No active swap requests.
                            </Cell>
                        </Section>
                    ) : (
                        mySwaps.map((swap) => (
                            <Section key={swap.id} header={swap.haveModuleCode}>
                                <Cell subtitle={swap.haveDetails}>
                                    <strong>Have: Class {swap.haveClassNo}</strong>
                                </Cell>
                                <Cell subtitle="Acceptable Swaps:">
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        {swap.wantSlots.map((w) => (
                                            <Chip key={`${w.moduleCode}-${w.classNo}`}>
                                                {w.moduleCode} ({w.classNo})
                                            </Chip>
                                        ))}
                                    </div>
                                </Cell>
                                <Cell
                                    after={
                                        <Button
                                            mode="plain"
                                            size="s"
                                            onClick={() => setMySwaps(mySwaps.filter((s) => s.id !== swap.id))}
                                        >
                                            Cancel
                                        </Button>
                                    }
                                >
                                    Status: <Badge type="dot">{swap.status}</Badge>
                                </Cell>
                            </Section>
                        ))
                    )}
                </List>
            )}
        </AppRoot>
    );
}