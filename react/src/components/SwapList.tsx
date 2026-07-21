import { List, Section, Cell, Button, Badge, Chip } from '@telegram-apps/telegram-ui';
import type { SwapRequest } from '../types/swap';

interface Props {
    mySwaps: SwapRequest[];
    findMatches: (swap: SwapRequest) => SwapRequest[];
    onCancel: (id: string) => void;
}

export function SwapList({ mySwaps, findMatches, onCancel }: Props) {
    if (mySwaps.length === 0) {
        return (
            <List>
                <Section>
                    <Cell subtitle="Tap 'New Swap' to submit your first request.">
                No active swap requests.
        </Cell>
        </Section>
        </List>
    );
    }

    return (
        <List>
            {mySwaps.map((swap) => {
                        const matches = findMatches(swap);
                        return (
                            <Section
                                key={swap.id}
                                header={`${swap.haveModuleCode} - Class ${swap.haveClassNo} (${swap.acadYear} Sem ${swap.semester})`}
                            >
                        <Cell subtitle={swap.haveDetails}>
                            <strong>You Have: Class {swap.haveClassNo}</strong>
                        </Cell>
                        <Cell subtitle="Your Acceptable Options:">
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {swap.wantSlots.map((w) => (
                            <Chip key={`${w.moduleCode}-${w.classNo}`}>{w.moduleCode} ({w.classNo})</Chip>
                        ))}
                        </div>
                        </Cell>
                        <Cell header="MATCHES FOUND">
                            {matches.length === 0 ? (
                                <div style={{ color: '#888', fontSize: '13px', padding: '4px 0' }}>
                                    🔎 No direct matches found yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {matches.map((m) => (
                                        <div key={m.id} style={{
                                            background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <strong>🎯 @{m.telegramUsername}</strong>
                                                <Badge type="number">Match</Badge>
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                                                Has Class {m.haveClassNo} ({m.haveDetails})
                                            </div>
                                            <a href={`https://t.me/${m.telegramUsername}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                <Button size="s" stretched style={{ marginTop: '8px' }}>💬 DM User</Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Cell>
                        <Cell after={<Button mode="plain" size="s" onClick={() => onCancel(swap.id)}>Cancel</Button>}>
                        Status: <Badge type="number">{matches.length} Matches</Badge>
                        </Cell>
                        </Section>
                    );
                    })}
                    </List>
    );
}