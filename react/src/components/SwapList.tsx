import {List, Section, Cell, Button, Badge, Chip} from '@telegram-apps/telegram-ui';
import type { SwapRequest, SwapRequestMatch } from '../types/swap';

interface Props {
    mySwaps: SwapRequest[];
    findMatches: (swap: SwapRequest) => SwapRequestMatch[];
    onCancel: (id: string) => void;
    onClose: (id: string) => void;
}

export function SwapList({ mySwaps, findMatches, onCancel, onClose }: Props) {
    const handleCancelClick = (id: string) => {
        const tg = window.Telegram?.WebApp;
        if (tg?.showConfirm) {
            tg.showConfirm(
                "Are you sure you want to cancel this swap request? If you found a swap, please press 'Found swap!' instead.",
                (ok: boolean) => {
                    if (ok) onCancel(id);
                }
            );
        } else {
            // Fallback for browsers
            if (window.confirm("Are you sure you want to cancel this swap request?")) {
                onCancel(id);
            }
        }
    };

    const handleCloseClick = (id: string) => {
        const tg = window.Telegram?.WebApp;
        if (tg?.showConfirm) {
            tg.showConfirm(
                "Did you find a match for this swap? This will close the request.",
                (ok: boolean) => {
                    if (ok) onClose(id);
                }
            );
        } else {
            // Fallback for browsers
            if (window.confirm("Did you find a match for this swap? This will close the request.")) {
                onClose(id);
            }
        }
    };

    if (mySwaps.length === 0) {
        return (
            <List style={{ width: '100%', margin: 0, padding: 0 }}>
                <Section style={{ margin: 0 }}>
                    <Cell subtitle="Tap 'New Swap' to submit your first request.">
                        No active swap requests.
                    </Cell>
                </Section>
            </List>
        );
    }

    return (
        <List style={{ width: '100%', margin: 0, padding: 0 }}>
            {mySwaps.map((swap) => {
                const matches = findMatches(swap);
                return (
                    <Section
                        key={swap.id}
                        style={{ 
                            marginBottom: '12px', 
                            borderBottom: '1px solid var(--tg-theme-hint-color, #e5e7eb)', 
                            paddingBottom: '12px' 
                        }}
                        header={<div style={{ whiteSpace: 'normal', wordBreak: 'break-word', padding: '0' }}>{swap.haveModuleCode} - Class {swap.haveClassNo} ({swap.acadYear} Sem {swap.semester})</div>}
                    >
                        <Cell subtitle={swap.haveDetails}>
                            <strong>You Have: Class {swap.haveClassNo}</strong>
                        </Cell>
                        <Section header={<div style={{ padding: '0' }}>Your Acceptable Options:</div>}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px', marginBottom: '4px' , padding: '0' }}>
                                {swap.wantSlots && swap.wantSlots.length > 0 ? (
                                    swap.wantSlots.map((w) => (
                                        <Chip key={`${w.moduleCode}-${w.classNo}`}>{w.moduleCode} ({w.classNo})</Chip>
                                    ))
                                ) : (
                                    <div style={{ color: '#888', fontSize: '13px' }}>Specified in request.</div>
                                )}
                            </div>
                        </Section>
                        <Section header={<div style={{ padding: '0' }}>MATCHES FOUND</div>}>
                            {matches.length === 0 ? (
                                <div style={{ color: '#888', fontSize: '13px', padding: '4px 0' }}>
                                    🔎 No direct matches found yet.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                                    {matches.map((m) => (
                                        <div key={m.swapRequestId} style={{
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
                                                Has Class {m.classNo} ({m.moduleCode})
                                            </div>
                                            <a href={`https://t.me/${m.telegramUsername}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                                <Button size="s" stretched style={{ marginTop: '8px' }}>💬 DM User</Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Section>
                        <Cell 
                            after={
                                swap.status === 'Closed' ? (
                                    <Badge type="number" style={{ background: '#888' }}>Closed</Badge>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <Button 
                                            size="s" 
                                            onClick={() => handleCloseClick(swap.id)}
                                            style={{ background: 'var(--tg-theme-button-color, #2481cc)' }}
                                        >
                                            Found swap!
                                        </Button>
                                        <Button 
                                            mode="plain" 
                                            size="s" 
                                            onClick={() => handleCancelClick(swap.id)}
                                            style={{ color: '#ff3b30' }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                )
                            }
                        >
                            Status: <Badge type="number">{matches.length} Matches</Badge>
                        </Cell>
                    </Section>
                );
            })}
        </List>
    );
}