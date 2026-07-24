import { useState, useEffect } from 'react';
import { AppRoot, List, SegmentedControl, Section, Cell } from '@telegram-apps/telegram-ui';
import '@telegram-apps/telegram-ui/dist/styles.css';

import { useTelegram } from './hooks/useTelegram';
import { useSwapData } from './hooks/useSwapData';
import type { ModuleCondensed, TimetableSlot, DesiredSlot } from './types/swap';
import { fetchModuleList, fetchModuleTimetables } from './services/nusmods';

import { TermSelector } from './components/TermSelector';
import { ModuleSearch } from './components/ModuleSearch';
import { SlotHave } from './components/SlotHave';
import { SlotWant } from './components/SlotWant';
import { SwapList } from './components/SwapList';

export default function App() {
    const { user } = useTelegram();
    const { allSwapsPool, addSwap, cancelSwap, closeSwap, findMatches, fetchMySwaps, isLoadingSwaps } = useSwapData();
    const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
    const [error, setError] = useState<{ message: string; description?: string } | null>(null);

    const showNotification = (message: string, description?: string) => {
        setError({ message, description });
        // Auto-clear after some time if desired, or let user close it. 
        // For now let's just show it.
    };

    // Fetch user swaps on mount and when tab changes to 'list'
    useEffect(() => {
        if (activeTab === 'list') {
            fetchMySwaps().catch((err) => showNotification("Error", err.message));
        }
    }, [activeTab, fetchMySwaps]);

    // Term & Search State
    const [acadYear, setAcadYear] = useState('2026-2027');
    const [semester, setSemester] = useState(1);
    const [allModules, setAllModules] = useState<ModuleCondensed[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ModuleCondensed[]>([]);

    // Selection State
    const [selectedModule, setSelectedModule] = useState<ModuleCondensed | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [haveSlot, setHaveSlot] = useState<TimetableSlot | null>(null);
    const [availableHaveSlots, setAvailableHaveSlots] = useState<TimetableSlot[]>([]);
    const [allWantSlots, setAllWantSlots] = useState<TimetableSlot[]>([]);
    const [selectedWantSlots, setSelectedWantSlots] = useState<DesiredSlot[]>([]);

    // Fetch module list whenever academic year changes
    useEffect(() => {
        fetchModuleList(acadYear)
            .then(setAllModules)
            .catch((err) => console.error('Failed to load module list:', err));
    }, [acadYear]);

    // Handler when user chooses a module from search
    const handleSelectModule = async (mod: ModuleCondensed) => {
        setSelectedModule(mod);
        setSearchQuery(`${mod.moduleCode}: ${mod.title}`);
        setSearchResults([]);
        setHaveSlot(null);
        setSelectedWantSlots([]);
        setIsLoading(true);

        try {
            const { directHaveSlots, aggregatedWantSlots } = await fetchModuleTimetables(
                mod,
                allModules,
                acadYear,
                semester
            );
            setAvailableHaveSlots(directHaveSlots);
            setAllWantSlots(aggregatedWantSlots);
        } catch (e) {
            console.error('Error fetching module timetable:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for submitting a new swap request
    const handleSubmit = async () => {
        if (!haveSlot || selectedWantSlots.length === 0) return;

        const newSwap = {
            telegramUserId: user?.id || 99999,
            telegramUsername: user?.username || 'me_student',
            acadYear: acadYear,
            semester: semester,
            haveModuleCode: haveSlot.moduleCode,
            haveClassNo: haveSlot.classNo,
            haveDetails: `${haveSlot.day} ${haveSlot.startTime}-${haveSlot.endTime}`,
            wantSlots: selectedWantSlots.map(s => ({
                moduleCode: s.moduleCode,
                classNo: s.classNo
            }))
        };

        try {
            await addSwap(newSwap);

            // Reset form
            setSelectedModule(null);
            setSearchQuery('');
            setHaveSlot(null);
            setSelectedWantSlots([]);
            setAvailableHaveSlots([]);
            setAllWantSlots([]);

            setActiveTab('list');
        } catch (e: any) {
            console.error('Failed to submit swap:', e);
            showNotification("Submission Failed", e.message);
        }
    };

    // Toggle selection of desired slots in Step 4
    const handleToggleWantSlot = (slot: TimetableSlot) => {
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


    return (
        <AppRoot>
            <div style={{ 
                width: '90%', 
                margin: '0 auto', 
                maxWidth: '600px',
                padding: '0 0 40px',
                boxSizing: 'border-box'
            }}>
                {/* Error Display */}
                {error && (
                    <div style={{
                        background: '#fff5f5',
                        border: '1px solid #feb2b2',
                        color: '#c53030',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        position: 'relative'
                    }}>
                        <div style={{ fontWeight: 'bold' }}>{error.message}</div>
                        {error.description && <div style={{ marginTop: '4px' }}>{error.description}</div>}
                        <button 
                            onClick={() => setError(null)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                border: 'none',
                                background: 'none',
                                color: '#c53030',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Header Username Tag */}
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#888', padding: '12px 0 8px' }}>
                    User: <strong>@{user?.username || user?.first_name || 'Guest'}</strong>
                </div>

            {/* Tabs */}
            <div style={{ padding: '0' }}>
                <SegmentedControl style={{ marginBottom: '20px'}}>
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
                        📋 My Swaps
                    </SegmentedControl.Item>
                </SegmentedControl>
            </div>

            {/* Main Tab Content */}
            {activeTab === 'create' ? (
                <List style={{ width: '100%', margin: 0, padding: 0 }}>
                    <TermSelector
                        acadYear={acadYear}
                        semester={semester}
                        onYearChange={(yr) => {
                            setAcadYear(yr);
                            setSelectedModule(null);
                            setSearchQuery('');
                        }}
                        onSemChange={(sem) => {
                            setSemester(sem);
                            setSelectedModule(null);
                            setSearchQuery('');
                        }}
                    />

                    <ModuleSearch
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        allModules={allModules}
                        onSearchChange={setSearchQuery}
                        onSearchResultsChange={setSearchResults}
                        onSelect={handleSelectModule}
                    />

                    {isLoading && (
                        <Section style={{ margin: 0 }}>
                            <Cell subtitle="Fetching timetable data from NUSMods...">
                                ⏳ Loading class slots...
                            </Cell>
                        </Section>
                    )}

                    {selectedModule && !isLoading && (
                        <>
                            <SlotHave
                                slots={availableHaveSlots}
                                selectedSlot={haveSlot}
                                onSelect={setHaveSlot}
                            />

                            {haveSlot && (
                                <SlotWant
                                    allSlots={allWantSlots}
                                    haveSlot={haveSlot}
                                    selectedWantSlots={selectedWantSlots}
                                    onToggle={handleToggleWantSlot}
                                    onSubmit={handleSubmit}
                                />
                            )}
                        </>
                    )}
                </List>
            ) : (
                <>
                    {isLoadingSwaps && (
                        <Section style={{ margin: 0 }}>
                            <Cell subtitle="Refreshing your swap requests...">
                                ⏳ Loading...
                            </Cell>
                        </Section>
                    )}
                    <SwapList
                        mySwaps={allSwapsPool}
                        findMatches={findMatches}
                        onCancel={(id) => {
                            cancelSwap(id).catch((err) => showNotification("Cancel Failed", err.message));
                        }}
                        onClose={(id) => {
                            closeSwap(id).catch((err) => showNotification("Close Failed", err.message));
                        }}
                    />
                </>
            )}
            </div>
        </AppRoot>
    );
}