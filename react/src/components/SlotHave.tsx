import { Section, Select, Cell } from '@telegram-apps/telegram-ui';
import type { TimetableSlot } from '../types/swap';

interface Props {
    slots: TimetableSlot[];
    selectedSlot: TimetableSlot | null;
    onSelect: (slot: TimetableSlot | null) => void;
}

export function SlotHave({ slots, selectedSlot, onSelect }: Props) {
    return (
        <Section header="3. SLOT YOU HAVE">
            {slots.length === 0 ? (
                <Cell subtitle="No active classes found for this term. Try changing the semester or academic year above.">
                    ⚠️ No slots available
                </Cell>
            ) : (
                <div style={{ padding: '0 16px' }}>
                    <Select
                        header="Your Current Class"
                        value={selectedSlot ? `${selectedSlot.moduleCode}-${selectedSlot.classNo}` : ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            const found = slots.find((s) => `${s.moduleCode}-${s.classNo}` === val);
                            onSelect(found || null);
                        }}
                    >
                        <option value="">-- Choose Your Class --</option>
                        {slots.map((s) => (
                            <option
                                key={`${s.moduleCode}-${s.classNo}`}
                                value={`${s.moduleCode}-${s.classNo}`}
                            >
                                Class {s.classNo} ({s.day} {s.startTime}-{s.endTime})
                            </option>
                        ))}
                    </Select>
                </div>
            )}
        </Section>
    );
}