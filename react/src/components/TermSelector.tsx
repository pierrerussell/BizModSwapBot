import {Section, Select} from '@telegram-apps/telegram-ui';

interface Props {
    acadYear: string;
    semester: number;
    onYearChange: (yr: string) => void;
    onSemChange: (sem: number) => void;
}

export function TermSelector({ acadYear, semester, onYearChange, onSemChange }: Props) {
    return (
        <Section header="1. ACADEMIC TERM" style={{ margin: 0 }}>
            <div style={{ display: 'flex', padding: '0'}}>
                <div style={{ flex: 1.2 }}>
                    <Select
                        style={{ paddingLeft:'10px', paddingRight:'10px'}}
                        header="Acad Year"
                        value={acadYear}
                        onChange={(e) => onYearChange(e.target.value)}
                    >
                        <option value="2026-2027">2026/2027</option>
                        <option value="2025-2026">2025/2026</option>
                        <option value="2024-2025">2024/2025</option>
                    </Select>
                </div>
                <div style={{ flex: 1 }}>
                    <Select
                        style={{ paddingLeft:'10px', paddingRight:'10px'}}
                        header="Sem"
                        value={semester}
                        onChange={(e) => onSemChange(Number(e.target.value))}
                    >
                        <option value={1}>Sem 1</option>
                        <option value={2}>Sem 2</option>
                    </Select>
                </div>
            </div>
        </Section>
    );
}