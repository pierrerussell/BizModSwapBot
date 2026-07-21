import { Section, Cell, Badge, Button } from '@telegram-apps/telegram-ui';
import type { TimetableSlot, DesiredSlot } from '../types/swap';

interface Props {
    allSlots: TimetableSlot[];
    haveSlot: TimetableSlot;
    selectedWantSlots: DesiredSlot[];
    onToggle: (slot: TimetableSlot) => void;
    onSubmit: () => void;
}

export function SlotWant({
                             allSlots,
                             haveSlot,
                             selectedWantSlots,
                             onToggle,
                             onSubmit
                         }: Props) {
    // Exclude the class the user already holds from the desired list
    const availableWantSlots = allSlots.filter(
        (s) => !(s.moduleCode === haveSlot.moduleCode && s.classNo === haveSlot.classNo)
    );

    return (
        <>
            <Section header="4. SLOTS YOU WANT (Select all acceptable)">
                {availableWantSlots.map((s) => {
                    const key = `${s.moduleCode}-${s.classNo}`;
                    const isChecked = selectedWantSlots.some(
                        (w) => `${w.moduleCode}-${w.classNo}` === key
                    );

                    return (
                        <Cell
                            key={key}
                            onClick={() => onToggle(s)}
                            subtitle={`${s.day} ${s.startTime}-${s.endTime} (${s.venue || 'TBA'})`}
                            after={isChecked ? <Badge type="number">✓</Badge> : null}
                        >
                            <strong>{s.moduleCode}</strong> - Class {s.classNo}
                        </Cell>
                    );
                })}
            </Section>

            {selectedWantSlots.length > 0 && (
                <div style={{ marginTop: '24px', marginBottom: '40px', padding: '0' }}>
                    <Button size="l" stretched onClick={onSubmit}>
                        Submit Swap Request ({selectedWantSlots.length} selected)
                    </Button>
                </div>
            )}
        </>
    );
}